import { NextRequest, NextResponse } from "next/server";

// ━━━ In-memory rate limiter (10 messages per hour per IP) ━━━
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

// ━━━ Local fallback when no API key ━━━
function generateFallbackResponse(
  message: string,
  context: {
    archetype: string;
    saju: string;
    zodiac: string;
    numerology: string;
    mbti: string;
    convergenceRate: number;
  }
): string {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("직업") || lowerMsg.includes("커리어") || lowerMsg.includes("일")) {
    return `${context.archetype} 아키타입인 당신은 ${context.saju} 일간의 에너지를 가지고 있습니다. ${context.mbti} 성향과 결합하면, 창의적이면서도 체계적인 분야에서 두각을 나타냅니다. 수렴률 ${context.convergenceRate}%로 이 방향성은 매우 확고합니다. 자신의 직관을 믿고 과감하게 도전하십시오.`;
  }

  if (lowerMsg.includes("연애") || lowerMsg.includes("사랑") || lowerMsg.includes("관계")) {
    return `${context.zodiac} 별자리와 ${context.saju} 일간이 만나 독특한 연애 패턴을 형성합니다. ${context.archetype} 유형은 깊은 감정적 유대를 중시하며, 표면적인 관계에 만족하지 않습니다. 경로수 ${context.numerology}의 에너지가 올해 중요한 만남의 계기를 제공합니다.`;
  }

  if (lowerMsg.includes("올해") || lowerMsg.includes("주의") || lowerMsg.includes("조심")) {
    return `${context.saju} 일간과 경로수 ${context.numerology}의 조합에서, 올해는 전환의 시기입니다. ${context.zodiac} 별자리의 영향으로 상반기에 중요한 결정의 순간이 옵니다. 수렴률 ${context.convergenceRate}%가 보여주듯 당신의 방향성은 이미 정해져 있으니, 흔들리지 마십시오.`;
  }

  return `${context.archetype} 아키타입을 가진 당신의 질문에 답합니다. ${context.saju} 일간, ${context.zodiac} 별자리, 경로수 ${context.numerology}, ${context.mbti} — 이 네 가지 체계가 수렴률 ${context.convergenceRate}%로 가리키는 방향은 명확합니다. 자신의 본질적 강점을 믿고 나아가십시오.`;
}

// ━━━ POST handler ━━━
export async function POST(request: NextRequest) {
  // Get client IP for rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";

  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "메시지 한도를 초과했습니다. 1시간 후 다시 시도해주세요.", remaining: 0 },
      { status: 429 }
    );
  }

  const { message, context } = await request.json();

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "메시지를 입력해주세요." }, { status: 400 });
  }

  if (!context) {
    return NextResponse.json({ error: "분석 컨텍스트가 필요합니다." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // No API key: return local fallback
  if (!apiKey) {
    const fallback = generateFallbackResponse(message, context);
    return NextResponse.json({ reply: fallback, remaining });
  }

  // Build system prompt with user's analysis context
  const systemPrompt = `당신은 DESTINO의 운명 분석 상담사입니다.
이 사용자의 분석 결과:
- 아키타입: ${context.archetype}
- 사주 일간: ${context.saju}
- 별자리: ${context.zodiac}
- 수비학 경로수: ${context.numerology}
- MBTI: ${context.mbti}
- 수렴률: ${context.convergenceRate}%

규칙:
- 이 사용자의 분석 결과를 기반으로 답변하세요
- 구체적이고 개인화된 답변을 하세요
- 확신에 찬 톤. "~일 수 있습니다" 금지, "~입니다" 사용
- 3-5문장으로 답변
- 한국어`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || "claude-sonnet-5",
        max_tokens: 500,
        thinking: { type: "disabled" },
        system: systemPrompt,
        messages: [{ role: "user", content: message.trim() }],
      }),
    });

    if (!response.ok) {
      const fallback = generateFallbackResponse(message, context);
      return NextResponse.json({ reply: fallback, remaining });
    }

    const data = await response.json();
    const text =
      data.content?.[0]?.text || "죄송합니다. 잠시 후 다시 시도해주세요.";

    return NextResponse.json({ reply: text, remaining });
  } catch {
    const fallback = generateFallbackResponse(message, context);
    return NextResponse.json({ reply: fallback, remaining });
  }
}
