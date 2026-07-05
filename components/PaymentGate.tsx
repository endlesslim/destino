"use client";

// components/PaymentGate.tsx
// 결제 게이트 — 미결제 시 블러 오버레이 + 결제 버튼, 결제 완료 시 전체 공개

import { useState, useEffect, useCallback, type ReactNode } from "react";
import PaymentButton from "./PaymentButton";
import { generateBirthHash, PAYMENT_ENABLED, type PaymentCheckResponse } from "@/lib/payment";
import { track } from "@/lib/track";

const MY_REF_KEY = "destino_my_refcode";

interface PaymentGateProps {
  /** CrosspointResult를 JSON 직렬화한 문자열 (생년월일 해시 추출용) */
  result: string;
  /** 전체 리포트 컨텐츠 */
  children: ReactNode;
}

type GateState = "preview" | "paying" | "unlocked";

/** result JSON에서 생년월일 정보를 추출하여 해시 생성 */
function extractBirthHash(resultJson: string): string {
  try {
    const parsed = JSON.parse(resultJson);
    // saju 결과에서 연주 정보 기반 해시 (year, month, day는 input에서 추출)
    const saju = parsed.saju;
    if (saju) {
      // 사주 연주의 천간+지지를 해시 키로 사용
      const key = `${saju.year?.cheongan || ""}${saju.year?.jiji || ""}_${saju.day?.cheongan || ""}${saju.day?.jiji || ""}`;
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        hash = ((hash << 5) - hash) + key.charCodeAt(i);
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    }
  } catch {
    // 파싱 실패 시 폴백
  }
  return "default";
}

/** localStorage 키 생성 */
function getStorageKey(hash: string): string {
  return `destino_paid_${hash}`;
}

/** 결제 완료자용 추천 배너 — 내 추천코드 공유 + 보상 쿠폰 확인 */
function ReferralBanner() {
  const [refCode, setRefCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [rewards, setRewards] = useState<Array<{ code: string; discountPct: number; used: boolean }>>([]);

  useEffect(() => {
    try {
      const code = localStorage.getItem(MY_REF_KEY);
      if (!code) return;
      setRefCode(code);
      fetch(`/api/coupon/mine?ref=${encodeURIComponent(code)}`)
        .then((r) => r.json())
        .then((data) => setRewards(data.coupons || []))
        .catch(() => {});
    } catch {}
  }, []);

  if (!refCode) return null;

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/analyze?ref=${refCode}`;
  const unusedRewards = rewards.filter((r) => !r.used);

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "16px 20px",
        borderRadius: "14px",
        border: "1px solid var(--ink-ghost)",
        background: "var(--bg-white)",
      }}
    >
      <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", marginBottom: "4px" }}>
        친구에게 추천하고 두 분 모두 50% 할인받으세요
      </p>
      <p style={{ fontSize: "12px", color: "var(--ink-muted)", marginBottom: "10px" }}>
        이 링크로 친구가 결제하면 친구는 50% 할인, 당신에게는 50% 쿠폰이 발급됩니다.
      </p>
      <div style={{ display: "flex", gap: "6px" }}>
        <code
          style={{
            flex: 1,
            padding: "8px 12px",
            fontSize: "12px",
            borderRadius: "8px",
            background: "var(--bg-warm)",
            color: "var(--ink-medium)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {shareUrl}
        </code>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(shareUrl).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
          style={{
            padding: "8px 14px",
            fontSize: "12px",
            fontWeight: 600,
            border: "none",
            borderRadius: "8px",
            background: copied ? "#2D5A27" : "var(--seal)",
            color: "var(--bg-white)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {copied ? "복사됨 ✓" : "링크 복사"}
        </button>
      </div>
      {unusedRewards.length > 0 && (
        <p style={{ fontSize: "12px", color: "var(--seal)", marginTop: "10px", fontWeight: 600 }}>
          🎁 추천 성공! 보유 쿠폰: {unusedRewards.map((r) => `${r.code} (${r.discountPct}%)`).join(", ")}
        </p>
      )}
    </div>
  );
}

export default function PaymentGate({ result, children }: PaymentGateProps) {
  const [state, setState] = useState<GateState>("preview");
  const [isChecking, setIsChecking] = useState(true);
  const [revealProgress, setRevealProgress] = useState(0);

  const birthHash = extractBirthHash(result);
  const storageKey = getStorageKey(birthHash);

  // 기존 토큰 확인 (마운트 시)
  // 1) 이 기기에 저장된 열람 토큰 → /check로 검증
  // 2) 판매 링크의 개봉 대기 토큰 → /activate로 교환 (첫 개봉 시점부터 유효기간 시작)
  useEffect(() => {
    async function checkExistingToken() {
      try {
        const savedToken = localStorage.getItem(storageKey);
        const linkToken = localStorage.getItem("destino_link_token");

        if (savedToken) {
          const response = await fetch("/api/payment/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: savedToken }),
          });
          const data: PaymentCheckResponse = await response.json();
          if (data.valid) {
            setState("unlocked");
            setIsChecking(false);
            return;
          }
          localStorage.removeItem(storageKey);
        }

        if (linkToken) {
          // 판매 링크 첫 개봉 — 지금부터 열람 기간이 시작되는 토큰으로 교환
          const response = await fetch("/api/payment/activate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: linkToken }),
          });
          const data: { valid: boolean; accessToken?: string } = await response.json();
          if (data.valid && data.accessToken) {
            localStorage.setItem(storageKey, data.accessToken);
            localStorage.removeItem("destino_link_token");
            setState("unlocked");
          } else {
            localStorage.removeItem("destino_link_token");
          }
        }
      } catch {
        // 네트워크 오류 시 로컬 토큰 기반 폴백 검증
        const savedToken = localStorage.getItem(storageKey);
        if (savedToken) {
          try {
            const decoded = JSON.parse(atob(savedToken));
            if (decoded.expiresAt && Date.now() < decoded.expiresAt) {
              setState("unlocked");
            } else {
              localStorage.removeItem(storageKey);
            }
          } catch {
            localStorage.removeItem(storageKey);
          }
        }
      } finally {
        setIsChecking(false);
      }
    }

    checkExistingToken();
  }, [storageKey]);

  // 리포트 공개 애니메이션
  useEffect(() => {
    if (state !== "unlocked") return;
    if (revealProgress >= 100) return;

    const start = performance.now();
    const duration = 800; // 0.8초 애니메이션

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = 1 - Math.pow(1 - progress, 4);
      setRevealProgress(eased * 100);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [state, revealProgress]);

  // 페이월 노출 트래킹
  useEffect(() => {
    if (!isChecking && state === "preview") {
      track("paywall_view");
    }
  }, [isChecking, state]);

  /** 결제 완료 핸들러 */
  const handlePaymentComplete = useCallback(
    (accessToken: string, referralCode?: string | null) => {
      // 토큰 저장
      localStorage.setItem(storageKey, accessToken);
      // 내 추천코드 저장 (공유용)
      if (referralCode) {
        try { localStorage.setItem(MY_REF_KEY, referralCode); } catch {}
      }
      // 상태 전환
      setState("unlocked");
    },
    [storageKey],
  );

  // 초기 로딩 중
  if (isChecking) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 0",
          color: "var(--ink-light)",
          fontSize: "14px",
        }}
      >
        확인 중...
      </div>
    );
  }

  // 잠금 해제됨 — 전체 리포트 공개
  if (state === "unlocked") {
    return (
      <div
        style={{
          opacity: revealProgress / 100,
          transform: `translateY(${(1 - revealProgress / 100) * 8}px)`,
          transition: "opacity 0.1s, transform 0.1s",
        }}
      >
        <ReferralBanner />
        {children}
      </div>
    );
  }

  // 프리뷰 모드 — 실제 콘텐츠 블러(봉인) + 결제 버튼
  return (
    <div style={{ position: "relative" }}>
      {/* 실제 리포트를 블러 처리해 "봉인된 문서"로 보여줌 — 실루엣이 비쳐야 가치가 전달됨 */}
      <div
        aria-hidden="true"
        style={{
          maxHeight: "400px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          data-gated="true"
          style={{
            filter: "blur(7px)",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {children}
        </div>

        {/* 페이드 그라디언트 오버레이 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 260,
            background: "linear-gradient(transparent, var(--bg-paper) 85%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* 결제 CTA 영역 */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          marginTop: "-100px",
          padding: "40px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* 가격 블록 — 앵커링 + 포함 내역 */}
        <div
          style={{
            width: "100%",
            maxWidth: "380px",
            background: "var(--bg-white)",
            border: "1.5px solid var(--ink-ghost)",
            borderRadius: 14,
            padding: "20px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              fontWeight: 800,
              color: "var(--ink)",
              letterSpacing: "-0.03em",
              marginBottom: "4px",
            }}
          >
            봉인을 해제하고 전체 리포트를 받으세요
          </p>
          <p style={{ fontSize: "12px", color: "var(--ink-light)", marginBottom: "12px" }}>
            사주카페 1회 상담 ₩100,000+ · 같은 깊이를 이 가격에
            {!PAYMENT_ENABLED && (
              <>
                <br />
                입금 확인 후 카카오톡으로 열람 코드를 보내드려요
              </>
            )}
          </p>
          <div>
            <span style={{ fontSize: "14px", color: "var(--ink-faint)", textDecoration: "line-through", marginRight: 8 }}>
              ₩19,800
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 900, color: "var(--seal)" }}>
              ₩16,500
            </span>
            <span style={{ fontSize: "12px", color: "var(--ink-muted)", marginLeft: 6 }}>첫 분석가</span>
          </div>
        </div>

        {/* 결제 버튼을 가격 바로 아래로 — 포함 내역은 버튼 뒤에 배치 */}
        <PaymentButton onPaymentComplete={handlePaymentComplete} />

        <ul
          style={{
            width: "100%",
            maxWidth: "380px",
            textAlign: "left",
            fontSize: "13px",
            color: "var(--ink-muted)",
            lineHeight: 2,
            listStyle: "none",
            padding: "14px 18px",
            margin: 0,
            background: "var(--bg-white)",
            border: "1px solid var(--ink-ghost)",
            borderRadius: 12,
          }}
        >
          {[
            "아키타입 상세 — 나를 규정하는 교차점 해석",
            "직업·진로 교차점 — 4개 체계가 가리키는 방향",
            "연애·관계 교차점 — 이상형과 관계 패턴",
            "사주 명식 + 오행 균형 리포트",
            "인생 조언 & AI 맞춤 해석",
            PAYMENT_ENABLED ? "결제 후 24시간 무제한 열람" : "코드 입력 후 24시간 무제한 열람",
          ].map((item) => (
            <li key={item}>
              <span style={{ color: "var(--seal)", marginRight: 6 }}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
