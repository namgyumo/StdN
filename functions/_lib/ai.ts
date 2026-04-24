// Google AI Studio (Gemini) API 래퍼.
// Workers fetch 로 직접 호출. API 키는 절대 클라이언트로 안 나감.

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.0-flash';

interface GeminiPart {
  text: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }>;
  error?: { message: string };
  promptFeedback?: unknown;
}

export async function callGemini({
  apiKey,
  prompt,
  systemInstruction,
  model = DEFAULT_MODEL,
  temperature = 0.7,
  maxOutputTokens = 2048,
}: {
  apiKey: string;
  prompt: string;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<{ ok: true; text: string } | { ok: false; error: string; status: number }> {
  const url = `${ENDPOINT}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature, maxOutputTokens },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: GeminiResponse;
  try {
    data = JSON.parse(text) as GeminiResponse;
  } catch {
    return { ok: false, error: `invalid_json: ${text.slice(0, 200)}`, status: res.status };
  }

  if (!res.ok || data.error) {
    return { ok: false, error: data.error?.message ?? `http_${res.status}`, status: res.status };
  }

  const out = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return { ok: true, text: out };
}

// ── 프롬프트 프리셋 ──────────────────────────────────────────────────────

export const SYSTEM_PROMPT_KO = `당신은 한국어 기술 블로그 글쓰기 어시스턴트입니다.
- 사용자가 쓰는 글의 톤과 어휘를 유지합니다.
- Markdown 문법을 존중합니다 (## 제목, \`code\`, - 리스트, etc).
- 추가 설명, 사과, 메타 코멘트("알겠습니다", "다음과 같이 작성했습니다")를 절대 쓰지 않습니다.
- 요청받은 그 글 자체만 반환합니다.
- 한국어 조사, 어순, 간결성을 우선합니다.`;

export function buildCompletePrompt(before: string, after: string): string {
  return `다음은 Markdown 블로그 글의 일부입니다. 커서 위치(<CURSOR/>)에 이어질 1~3문장을 생성하세요. 맥락이 없으면 단 한 문장만. 코드 블록 안이면 해당 언어의 적절한 다음 줄을 제안하세요.

<글>
${before}<CURSOR/>${after}
</글>

<커서 위치에 들어갈 텍스트만 출력>`;
}

export function buildRewritePrompt(selection: string, context: string): string {
  return `아래 선택한 구절을 더 자연스럽고 매끄러운 한국어로 다듬어 주세요. 의미는 동일하게 유지하고, 길이도 비슷하게, Markdown 문법 존중. 원문의 체(반말/존댓말)와 톤을 유지하세요.

<주변 문맥>
${context}
</주변 문맥>

<다듬을 구절>
${selection}
</다듬을 구절>

<다듬은 구절만 출력 — 주변 문맥은 복사하지 말 것>`;
}

export function buildFixPrompt(selection: string, context: string): string {
  return `아래 선택한 구절에서 사실 오류, 오타, 문법 오류, 어색한 부분을 고쳐주세요. 필요 없으면 원문 그대로. Markdown 문법 존중. 고치는 이유를 설명하지 말고 결과만 출력.

<주변 문맥>
${context}
</주변 문맥>

<수정할 구절>
${selection}
</수정할 구절>

<수정한 구절만 출력>`;
}
