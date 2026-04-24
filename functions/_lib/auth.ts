// Web Crypto 기반 인증 유틸.
// - PBKDF2 로 비밀번호 해시 검증
// - HMAC-SHA256 서명 쿠키로 세션 관리 (stateless)

const enc = new TextEncoder();
const dec = new TextDecoder();

// ── base64url ────────────────────────────────────────────────────────────
const b64url = {
  encode(buf: ArrayBuffer | Uint8Array): string {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let str = '';
    for (const b of bytes) str += String.fromCharCode(b);
    return btoa(str).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
  },
  decode(s: string): Uint8Array {
    const pad = s.length % 4 === 2 ? '==' : s.length % 4 === 3 ? '=' : '';
    const b64 = s.replaceAll('-', '+').replaceAll('_', '/') + pad;
    const str = atob(b64);
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) out[i] = str.charCodeAt(i);
    return out;
  },
};

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ── PBKDF2 password verify ───────────────────────────────────────────────
// ADMIN_PASSWORD_HASH 형식: "iterations:salt_hex:hash_hex"
// 생성 (Node) :
//   node -e "const c=require('crypto');const s=c.randomBytes(16).toString('hex');const it=100000;const h=c.pbkdf2Sync(process.argv[1],Buffer.from(s,'hex'),it,32,'sha256').toString('hex');console.log(`${it}:${s}:${h}`)" 'YOUR_PASSWORD'
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 3) return false;
  const iterations = parseInt(parts[0], 10);
  const salt = hexToBytes(parts[1]);
  const expected = hexToBytes(parts[2]);

  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const derivedBuf = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    expected.length * 8,
  );
  return constantTimeEqual(new Uint8Array(derivedBuf), expected);
}

// ── HMAC session cookie ──────────────────────────────────────────────────
const COOKIE_NAME = 'admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7일

interface SessionPayload {
  sub: string; // 'admin'
  iat: number;
  exp: number;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createSessionCookie(secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { sub: 'admin', iat: now, exp: now + SESSION_TTL_SECONDS };
  const payloadB64 = b64url.encode(enc.encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const token = `${payloadB64}.${b64url.encode(sig)}`;

  return [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ].join('; ');
}

export function clearSessionCookie(): string {
  return [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Max-Age=0',
  ].join('; ');
}

export async function verifySessionCookie(
  cookieHeader: string | null,
  secret: string,
): Promise<SessionPayload | null> {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  const token = match[1];
  const [payloadB64, sigB64] = token.split('.');
  if (!payloadB64 || !sigB64) return null;

  try {
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify(
      'HMAC',
      key,
      b64url.decode(sigB64),
      enc.encode(payloadB64),
    );
    if (!ok) return null;

    const payload = JSON.parse(dec.decode(b64url.decode(payloadB64))) as SessionPayload;
    if (Date.now() / 1000 >= payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// 헬퍼: Pages Function 내에서 인증 체크
export async function requireAdmin(
  request: Request,
  sessionSecret: string | undefined,
): Promise<SessionPayload | Response> {
  if (!sessionSecret) {
    return json({ ok: false, error: 'session_secret_not_configured' }, 503);
  }
  const session = await verifySessionCookie(request.headers.get('cookie'), sessionSecret);
  if (!session) return json({ ok: false, error: 'unauthorized' }, 401);
  return session;
}

export const json = (data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders,
    },
  });

export { bytesToHex, hexToBytes };
