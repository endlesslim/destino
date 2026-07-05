// lib/track.ts
// 퍼널 이벤트 트래킹 — 세션 ID 기반, fire-and-forget
//
// 퍼널 단계:
//   visit_analyze   → 분석 페이지 방문
//   analyze_submit  → 생년월일 입력 후 분석 실행
//   result_view     → 무료 결과 확인
//   paywall_view    → 프리미엄 페이월 노출
//   payment_click   → 결제 버튼 클릭
//   payment_done    → 결제 완료

export type FunnelStep =
  | "visit_analyze"
  | "analyze_submit"
  | "result_view"
  | "paywall_view"
  | "payment_click"
  | "payment_done";

const SESSION_KEY = "destino_sid";

/** 브라우저 세션 ID (localStorage 영속, 없으면 생성) */
export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `sid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "no-storage";
  }
}

// 같은 세션에서 같은 단계 중복 전송 방지 (페이지 생명주기 내)
const sent = new Set<string>();

/** 퍼널 이벤트 기록. 실패해도 UX에 영향 없음 (fire-and-forget) */
export function track(step: FunnelStep, meta?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const key = `${step}`;
  if (sent.has(key)) return;
  sent.add(key);
  try {
    const body = JSON.stringify({ sessionId: getSessionId(), step, meta });
    // sendBeacon 우선 (페이지 이탈 시에도 전송 보장)
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // 트래킹 실패는 무시
  }
}
