// Cloudflare Pages Function — POST /api/contact
// Contact 폼 제출을 Resend 로 이메일 전송합니다.
// 활성화하려면:
//   1. https://resend.com 계정 생성 및 도메인 인증
//   2. Cloudflare Pages → Settings → Environment variables 에
//      RESEND_API_KEY 및 CONTACT_TO_EMAIL 을 등록
//   3. (선택) 별도 CONTACT_FROM_EMAIL 설정 — 기본 onboarding@resend.dev

interface Env {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
}

interface ContactBody {
  name?: string;
  email?: string;
  message?: string;
}

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: ContactBody;
  const contentType = request.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const form = await request.formData();
      body = {
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        message: String(form.get('message') ?? ''),
      };
    }
  } catch {
    return json({ ok: false, error: 'invalid_body' }, 400);
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();

  if (!name || !email || !message) {
    return json({ ok: false, error: 'missing_fields' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }
  if (message.length > 5000) {
    return json({ ok: false, error: 'message_too_long' }, 400);
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL) {
    // 아직 환경변수가 세팅되지 않은 경우 — 개발 중이거나 초기 배포
    console.log('[contact] submission', { name, email, len: message.length });
    return json({ ok: true, mode: 'logged', note: 'RESEND_API_KEY unset' });
  }

  const from = env.CONTACT_FROM_EMAIL ?? 'std::N <onboarding@resend.dev>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [env.CONTACT_TO_EMAIL],
      reply_to: email,
      subject: `[std::N] ${name} 님의 연락`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return json({ ok: false, error: 'send_failed', detail: text }, 502);
  }

  return json({ ok: true });
};

export const onRequest: PagesFunction<Env> = async () =>
  json({ ok: false, error: 'method_not_allowed' }, 405);
