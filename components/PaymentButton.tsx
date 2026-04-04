"use client";

// components/PaymentButton.tsx
// PortOne (토스페이먼츠) 결제 버튼 — 전체 분석 리포트 구매

import { useState, useCallback, useRef } from "react";
import {
  PAYMENT_CONFIG,
  generatePaymentId,
  type PaymentVerifyResponse,
} from "@/lib/payment";

// PortOne SDK 타입 (브라우저 전역)
declare global {
  interface Window {
    PortOne?: {
      requestPayment: (options: Record<string, unknown>) => Promise<{
        code?: string;
        message?: string;
        paymentId?: string;
        transactionType?: string;
      }>;
    };
  }
}

interface PaymentButtonProps {
  onPaymentComplete: (accessToken: string) => void;
}

/** 다이아몬드 아이콘 SVG (이모지 대신 인라인 SVG 사용) */
function DiamondIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 3h12l4 7-10 11L2 10l4-7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M2 10h20M8 3l-2 7 6 11 6-11-2-7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  );
}

/** 자물쇠 아이콘 (안전한 결제 뱃지용) */
function LockIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="7"
        width="10"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M5 7V5a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}

/** 로딩 스피너 */
function Spinner() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <circle
        cx="10"
        cy="10"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.25"
      />
      <path
        d="M10 2a8 8 0 0 1 8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

export default function PaymentButton({ onPaymentComplete }: PaymentButtonProps) {
  const [status, setStatus] = useState<
    "idle" | "loading-sdk" | "paying" | "verifying" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const sdkLoadedRef = useRef(false);

  /** PortOne SDK를 동적으로 로드 */
  const loadPortOneSDK = useCallback(async (): Promise<void> => {
    if (sdkLoadedRef.current && window.PortOne) return;

    return new Promise((resolve, reject) => {
      // 이미 로드된 스크립트가 있는지 확인
      const existing = document.querySelector(
        'script[src="https://cdn.portone.io/v2/browser-sdk.js"]',
      );
      if (existing && window.PortOne) {
        sdkLoadedRef.current = true;
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.portone.io/v2/browser-sdk.js";
      script.async = true;
      script.onload = () => {
        sdkLoadedRef.current = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error("결제 시스템을 불러올 수 없습니다."));
      };
      document.head.appendChild(script);
    });
  }, []);

  /** 결제 프로세스 시작 */
  const handlePayment = useCallback(async () => {
    setErrorMessage("");

    try {
      // 1단계: SDK 로드
      setStatus("loading-sdk");
      await loadPortOneSDK();

      if (!window.PortOne) {
        throw new Error("결제 시스템이 준비되지 않았습니다.");
      }

      // 2단계: 결제 요청
      setStatus("paying");
      const paymentId = generatePaymentId();

      const response = await window.PortOne.requestPayment({
        storeId: PAYMENT_CONFIG.storeId,
        channelKey: PAYMENT_CONFIG.channelKey,
        paymentId,
        orderName: PAYMENT_CONFIG.productName,
        totalAmount: PAYMENT_CONFIG.price,
        currency: PAYMENT_CONFIG.currency,
        payMethod: "CARD",
        /**
         * 프로덕션 설정:
         * customer: {
         *   email: userEmail,
         *   phoneNumber: userPhone,
         * },
         * redirectUrl: `${window.location.origin}/payment/complete`,
         */
      });

      // 결제 실패 또는 취소 처리
      if (response.code) {
        if (response.code === "USER_CANCEL" || response.code === "FAILURE_TYPE_PG") {
          setStatus("idle");
          return; // 사용자 취소는 에러 메시지 없이 복귀
        }
        throw new Error(response.message || "결제 처리에 실패했습니다.");
      }

      // 3단계: 서버 사이드 검증
      setStatus("verifying");
      const verifyResponse = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          orderName: PAYMENT_CONFIG.productName,
        }),
      });

      const verifyResult: PaymentVerifyResponse = await verifyResponse.json();

      if (!verifyResult.success || !verifyResult.accessToken) {
        throw new Error(verifyResult.error || "결제 검증에 실패했습니다.");
      }

      // 4단계: 완료 콜백
      onPaymentComplete(verifyResult.accessToken);
      setStatus("idle");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      setErrorMessage(message);
      setStatus("error");
    }
  }, [loadPortOneSDK, onPaymentComplete]);

  const isProcessing =
    status === "loading-sdk" || status === "paying" || status === "verifying";

  const statusText: Record<string, string> = {
    "loading-sdk": "결제 준비 중...",
    paying: "결제 진행 중...",
    verifying: "결제 확인 중...",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* CTA 버튼 */}
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        aria-label="전체 분석 리포트 결제하기"
        aria-busy={isProcessing}
        style={{
          background: isProcessing
            ? "var(--ink-light)"
            : "var(--seal)",
          color: "var(--bg-white)",
          border: "none",
          borderRadius: "14px",
          padding: "20px 36px",
          cursor: isProcessing ? "not-allowed" : "pointer",
          fontFamily: "var(--font-display)",
          width: "100%",
          maxWidth: "380px",
          transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: isProcessing
            ? "none"
            : "0 4px 20px var(--shadow-btn), 0 1px 3px rgba(0,0,0,0.1)",
          transform: isProcessing ? "scale(0.98)" : "scale(1)",
          opacity: isProcessing ? 0.85 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isProcessing) {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow =
              "0 6px 28px var(--shadow-btn), 0 2px 6px rgba(0,0,0,0.12)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isProcessing) {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 4px 20px var(--shadow-btn), 0 1px 3px rgba(0,0,0,0.1)";
          }
        }}
      >
        <div className="flex items-center justify-center gap-2.5">
          {isProcessing ? (
            <Spinner />
          ) : (
            <DiamondIcon size={20} />
          )}
          <span
            style={{
              fontSize: "17px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {isProcessing
              ? statusText[status]
              : `전체 분석 리포트 받기 — ₩${PAYMENT_CONFIG.price.toLocaleString()}`}
          </span>
        </div>
        {!isProcessing && (
          <p
            style={{
              fontSize: "12px",
              fontWeight: 400,
              opacity: 0.8,
              marginTop: "6px",
              fontFamily: "var(--font-body)",
              letterSpacing: "0.01em",
            }}
          >
            사주 · 별자리 · 수비학 교차 분석 + AI 해석
          </p>
        )}
      </button>

      {/* 안전한 결제 뱃지 */}
      <div
        className="flex items-center gap-1.5"
        style={{ color: "var(--ink-light)", fontSize: "12px" }}
      >
        <LockIcon size={13} />
        <span>안전한 결제 · 토스페이먼츠</span>
      </div>

      {/* 에러 메시지 */}
      {status === "error" && errorMessage && (
        <div
          role="alert"
          style={{
            color: "var(--seal)",
            fontSize: "13px",
            textAlign: "center",
            padding: "8px 16px",
            background: "var(--seal-bg)",
            borderRadius: "8px",
            maxWidth: "380px",
            width: "100%",
          }}
        >
          {errorMessage}
          <button
            onClick={() => setStatus("idle")}
            style={{
              display: "block",
              margin: "6px auto 0",
              color: "var(--seal-dark)",
              fontSize: "12px",
              fontWeight: 600,
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}
