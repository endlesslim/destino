"use client";

// components/PaymentGate.tsx
// 결제 게이트 — 미결제 시 블러 오버레이 + 결제 버튼, 결제 완료 시 전체 공개

import { useState, useEffect, useCallback, type ReactNode } from "react";
import PaymentButton from "./PaymentButton";
import { generateBirthHash, type PaymentCheckResponse } from "@/lib/payment";

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

export default function PaymentGate({ result, children }: PaymentGateProps) {
  const [state, setState] = useState<GateState>("preview");
  const [isChecking, setIsChecking] = useState(true);
  const [revealProgress, setRevealProgress] = useState(0);

  const birthHash = extractBirthHash(result);
  const storageKey = getStorageKey(birthHash);

  // 기존 토큰 확인 (마운트 시)
  useEffect(() => {
    async function checkExistingToken() {
      try {
        const savedToken = localStorage.getItem(storageKey);
        if (!savedToken) {
          setIsChecking(false);
          return;
        }

        // 서버에서 토큰 유효성 검증
        const response = await fetch("/api/payment/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: savedToken }),
        });

        const data: PaymentCheckResponse = await response.json();

        if (data.valid) {
          setState("unlocked");
        } else {
          // 만료된 토큰 제거
          localStorage.removeItem(storageKey);
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

  /** 결제 완료 핸들러 */
  const handlePaymentComplete = useCallback(
    (accessToken: string) => {
      // 토큰 저장
      localStorage.setItem(storageKey, accessToken);
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
        {children}
      </div>
    );
  }

  // 프리뷰 모드 — 블러 오버레이 + 결제 버튼
  return (
    <div style={{ position: "relative" }}>
      {/* 콘텐츠 프리뷰 (블러 + 페이드) */}
      <div
        aria-hidden="true"
        style={{
          maxHeight: "600px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Skeleton blocks that look like content but contain no real data */}
        <div style={{ height: 200, background: "var(--bg-warm)", borderRadius: 14, marginBottom: 14 }} />
        <div style={{ height: 150, background: "var(--bg-warm)", borderRadius: 14, marginBottom: 14 }} />
        <div style={{ height: 180, background: "var(--bg-warm)", borderRadius: 14, marginBottom: 14 }} />

        {/* 페이드 그라디언트 오버레이 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            background: "linear-gradient(transparent, var(--bg-paper))",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* 결제 CTA 영역 */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          marginTop: "-80px",
          padding: "40px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* 안내 텍스트 */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--ink)",
              letterSpacing: "-0.03em",
              marginBottom: "6px",
            }}
          >
            전체 교차 분석 결과를 확인하세요
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "var(--ink-muted)",
              lineHeight: 1.6,
            }}
          >
            3개 문명의 교차점 해석, 아키타입 분석,
            <br />
            오행 균형 리포트를 모두 포함합니다
          </p>
        </div>

        <PaymentButton onPaymentComplete={handlePaymentComplete} />
      </div>
    </div>
  );
}
