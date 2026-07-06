"use client";

// components/CompatGate.tsx
// 궁합 심층 리포트 게이트 — 미해제 시 블러 봉인 + 열람 코드 입력, 해제 시 전체 공개
// PaymentGate(개인 리포트)와 열람 코드 풀을 공유하되 저장 키는 분리 —
// 코드 1개 = 상품 1개 해제 (단일 사용 소진)

import { useState, useEffect, useCallback, type ReactNode } from "react";
import PaymentButton from "./PaymentButton";
import { type PaymentCheckResponse } from "@/lib/payment";
import { track } from "@/lib/track";

interface CompatGateProps {
  /** 두 사람 생년월일 조합 해시 — 커플별 열람 상태 분리 */
  pairKey: string;
  /** 페이월 헤드라인 개인화 */
  p1Name?: string;
  p2Name?: string;
  archetype?: string;
  children: ReactNode;
}

type GateState = "preview" | "unlocked";

function getStorageKey(pairKey: string): string {
  return `destino_compat_paid_${pairKey}`;
}

export default function CompatGate({ pairKey, p1Name, p2Name, archetype, children }: CompatGateProps) {
  const [state, setState] = useState<GateState>("preview");
  const [isChecking, setIsChecking] = useState(true);
  const [revealProgress, setRevealProgress] = useState(0);

  const storageKey = getStorageKey(pairKey);

  // 저장된 열람 토큰 검증
  useEffect(() => {
    async function checkExistingToken() {
      try {
        const savedToken = localStorage.getItem(storageKey);
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
      } catch {
        // 네트워크 오류 시 로컬 만료시각 기반 폴백
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

  // 공개 애니메이션
  useEffect(() => {
    if (state !== "unlocked" || revealProgress >= 100) return;
    const start = performance.now();
    const duration = 800;
    function animate(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      setRevealProgress((1 - Math.pow(1 - progress, 4)) * 100);
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [state, revealProgress]);

  // 페이월 노출 트래킹
  useEffect(() => {
    if (!isChecking && state === "preview") track("paywall_view");
  }, [isChecking, state]);

  const handlePaymentComplete = useCallback(
    (accessToken: string) => {
      localStorage.setItem(storageKey, accessToken);
      setState("unlocked");
    },
    [storageKey],
  );

  if (isChecking) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "40px 0", color: "var(--ink-light)", fontSize: 14 }}>
        확인 중...
      </div>
    );
  }

  if (state === "unlocked") {
    return (
      <div
        style={{
          opacity: revealProgress / 100,
          transform: `translateY(${(1 - revealProgress / 100) * 8}px)`,
          transition: "opacity 0.1s, transform 0.1s",
        }}
      >
        {children}
      </div>
    );
  }

  const coupleLabel =
    p1Name && p2Name ? `${p1Name} ♥ ${p2Name}` : "두 사람";

  return (
    <div style={{ position: "relative" }}>
      {/* 봉인된 심층 리포트 실루엣 */}
      <div aria-hidden="true" style={{ maxHeight: "380px", overflow: "hidden", position: "relative" }}>
        <div data-gated="true" style={{ filter: "blur(7px)", userSelect: "none", pointerEvents: "none" }}>
          {children}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 240,
            background: "linear-gradient(transparent, var(--bg-paper) 85%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* CTA */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          marginTop: "-90px",
          padding: "40px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
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
            {archetype
              ? `${coupleLabel}, '${archetype}' 심층 리포트가 준비되었습니다`
              : `${coupleLabel}의 심층 궁합이 준비되었습니다`}
          </p>
          <p style={{ fontSize: "12px", color: "var(--ink-light)", marginBottom: "12px" }}>
            타임라인·소통법·갈등 해법까지 — 점집 궁합 상담과 같은 깊이
            <br />
            입금 확인 후 카카오톡으로 열람 코드를 보내드립니다
          </p>
          <div>
            <span style={{ fontSize: "14px", color: "var(--ink-faint)", textDecoration: "line-through", marginRight: 8 }}>
              ₩12,900
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 900, color: "var(--seal)" }}>
              ₩9,900
            </span>
            <span style={{ fontSize: "12px", color: "var(--ink-muted)", marginLeft: 6 }}>첫 궁합가</span>
          </div>
        </div>

        <PaymentButton onPaymentComplete={handlePaymentComplete} productLabel="궁합 리포트" />

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
            "관계 타임라인 — 다섯 단계별 필요한 지혜",
            "소통 스타일 — 서로 다르게 말하는 방식과 연결법",
            "갈등 패턴 — 무엇이 충돌을 만들고 어떻게 푸는가",
            "특성 분석 — 공유·보완·긴장 포인트",
            "4개 체계의 관계 조언 + AI 맞춤 궁합 해석",
            "코드 입력 후 24시간 무제한 열람",
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
