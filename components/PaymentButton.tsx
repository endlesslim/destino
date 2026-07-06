"use client";

// components/PaymentButton.tsx
// PortOne (토스페이먼츠) 결제 버튼 — 전체 분석 리포트 구매

import { useState, useCallback, useRef, useEffect } from "react";
import {
  PAYMENT_CONFIG,
  PAYMENT_ENABLED,
  CONTACT_URL,
  generatePaymentId,
  type PaymentVerifyResponse,
} from "@/lib/payment";
import { track } from "@/lib/track";

/** 추천 유입 코드 localStorage 키 (?ref= 링크로 방문 시 저장됨) */
const REF_BY_KEY = "destino_ref_by";

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
  onPaymentComplete: (accessToken: string, referralCode?: string | null) => void;
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

  // ── 할인 (추천 유입 / 쿠폰) ──
  const [discountPct, setDiscountPct] = useState(0);
  const [discountLabel, setDiscountLabel] = useState("");
  const [appliedCode, setAppliedCode] = useState<{ coupon?: string; ref?: string }>({});
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  const finalPrice = Math.round((PAYMENT_CONFIG.price * (100 - discountPct)) / 100);

  // 추천 링크(?ref=)로 유입된 경우 자동 50% 할인 적용
  useEffect(() => {
    try {
      const refBy = localStorage.getItem(REF_BY_KEY);
      if (!refBy) return;
      fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: refBy }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.valid && data.kind === "referral") {
            setDiscountPct(data.discountPct);
            setDiscountLabel("친구 추천 할인");
            setAppliedCode({ ref: refBy });
          }
        })
        .catch(() => {});
    } catch {
      // localStorage 접근 불가 환경은 무시
    }
  }, []);

  /** 쿠폰/열람 코드 수동 적용 */
  const applyCoupon = useCallback(async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponMessage("");
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid && data.kind === "unlock") {
        // 열람 코드 — 결제 없이 즉시 잠금 해제 (1회용 소진)
        setCouponMessage("열람 코드 확인 중…");
        const redeemRes = await fetch("/api/coupon/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const redeem = await redeemRes.json();
        if (redeem.valid && redeem.accessToken) {
          track("payment_done");
          onPaymentComplete(redeem.accessToken, null);
        } else {
          setCouponMessage("이미 사용되었거나 유효하지 않은 코드입니다");
        }
        return;
      }
      if (data.valid) {
        setDiscountPct(data.discountPct);
        if (data.kind === "coupon") {
          setDiscountLabel("쿠폰 할인");
          setAppliedCode({ coupon: code });
        } else {
          setDiscountLabel("친구 추천 할인");
          setAppliedCode({ ref: code });
        }
        setCouponMessage(`${data.discountPct}% 할인이 적용되었습니다`);
      } else {
        setCouponMessage("유효하지 않은 코드입니다");
      }
    } catch {
      setCouponMessage("확인 중 오류가 발생했습니다");
    }
  }, [couponInput, onPaymentComplete]);

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

  /** 결제 프로세스 시작 — 카카오페이(간편결제) 우선, 카드 선택 가능 */
  const handlePayment = useCallback(async (method: "EASY_PAY" | "CARD" = "EASY_PAY") => {
    setErrorMessage("");
    track("payment_click");

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
        totalAmount: finalPrice,
        currency: PAYMENT_CONFIG.currency,
        payMethod: method,
        ...(method === "EASY_PAY" ? { easyPay: { easyPayProvider: "KAKAOPAY" } } : {}),
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
          couponCode: appliedCode.coupon,
          refCode: appliedCode.ref,
        }),
      });

      const verifyResult: PaymentVerifyResponse & { referralCode?: string | null } =
        await verifyResponse.json();

      if (!verifyResult.success || !verifyResult.accessToken) {
        throw new Error(verifyResult.error || "결제 검증에 실패했습니다.");
      }

      // 사용한 추천코드는 재사용 방지를 위해 제거
      if (appliedCode.ref) {
        try { localStorage.removeItem(REF_BY_KEY); } catch {}
      }

      // 4단계: 완료 콜백
      track("payment_done");
      onPaymentComplete(verifyResult.accessToken, verifyResult.referralCode);
      setStatus("idle");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      setErrorMessage(message);
      setStatus("error");
    }
  }, [loadPortOneSDK, onPaymentComplete, finalPrice, appliedCode]);

  const isProcessing =
    status === "loading-sdk" || status === "paying" || status === "verifying";

  const statusText: Record<string, string> = {
    "loading-sdk": "결제 준비 중...",
    paying: "결제 진행 중...",
    verifying: "결제 확인 중...",
  };

  // ── 수동 판매 모드 — PortOne 미설정 시 결제 버튼 대신 열람 코드 입력을 전면에 ──
  if (!PAYMENT_ENABLED) {
    return (
      <div className="flex flex-col items-center gap-3" style={{ width: "100%", maxWidth: "380px" }}>
        <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", textAlign: "center" }}>
          열람 코드를 받으셨나요?
        </p>
        <div style={{ display: "flex", gap: "6px", width: "100%" }}>
          <input
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
            placeholder="예: OPEN-3F7A2C"
            style={{
              flex: 1,
              padding: "14px 16px",
              fontSize: "16px",
              border: "2px solid var(--seal)",
              borderRadius: "12px",
              background: "var(--bg-white)",
              color: "var(--ink)",
              textAlign: "center",
              letterSpacing: "0.05em",
            }}
          />
          <button
            onClick={applyCoupon}
            className="btn-stamp"
            style={{
              padding: "14px 26px",
              fontSize: "16px",
              fontWeight: 800,
              border: "none",
              borderRadius: "12px",
              background: "var(--seal)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            열람
          </button>
        </div>
        {couponMessage && (
          <p style={{ fontSize: "13px", color: "var(--seal)", textAlign: "center" }}>{couponMessage}</p>
        )}
        {/* 구분선 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", margin: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--ink-ghost)" }} />
          <span style={{ fontSize: "11px", color: "var(--ink-light)", whiteSpace: "nowrap" }}>
            아직 코드가 없다면
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--ink-ghost)" }} />
        </div>

        {CONTACT_URL ? (
          <a
            href={CONTACT_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("payment_click")}
            style={{
              width: "100%",
              textAlign: "center",
              padding: "15px 0",
              fontSize: "15px",
              fontWeight: 800,
              borderRadius: "12px",
              border: "none",
              color: "#191919",
              textDecoration: "none",
              background: "#FAE100",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            💬 카카오톡으로 구매 문의하기
          </a>
        ) : (
          <div
            style={{
              width: "100%",
              padding: "13px 16px",
              fontSize: "13px",
              lineHeight: 1.65,
              borderRadius: "12px",
              border: "1.5px dashed var(--border-strong)",
              background: "var(--bg-paper)",
              color: "var(--ink-medium)",
              textAlign: "center",
            }}
          >
            <strong style={{ color: "var(--ink)" }}>구매를 원하시면</strong>
            <br />
            보고 계신 당근 채팅방에{" "}
            <strong style={{ color: "var(--seal)" }}>&ldquo;전체 리포트&rdquo;</strong>
            라고 보내주세요
            <br />
            <span style={{ fontSize: "12px", color: "var(--ink-light)" }}>
              입금 확인 즉시 열람 코드를 보내드립니다 (보통 10분 이내)
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* CTA 버튼 */}
      <button
        onClick={() => handlePayment("EASY_PAY")}
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
            {isProcessing ? (
              statusText[status]
            ) : discountPct > 0 ? (
              <>
                카카오페이로 리포트 받기 —{" "}
                <span style={{ textDecoration: "line-through", opacity: 0.6, fontWeight: 400 }}>
                  ₩{PAYMENT_CONFIG.price.toLocaleString()}
                </span>{" "}
                ₩{finalPrice.toLocaleString()}
              </>
            ) : (
              `카카오페이로 리포트 받기 — ₩${PAYMENT_CONFIG.price.toLocaleString()}`
            )}
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
            사주 · 별자리 · 수비학 · MBTI 교차 분석 + AI 해석
          </p>
        )}
      </button>

      {/* 카드 결제 대안 */}
      {!isProcessing && (
        <button
          onClick={() => handlePayment("CARD")}
          style={{
            background: "none",
            border: "none",
            color: "var(--ink-muted)",
            fontSize: "13px",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          신용·체크카드로 결제하기
        </button>
      )}

      {/* 할인 적용 뱃지 */}
      {discountPct > 0 && (
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--seal)",
            background: "var(--seal-bg)",
            padding: "4px 12px",
            borderRadius: "999px",
          }}
        >
          {discountLabel} {discountPct}% 적용됨
        </div>
      )}

      {/* 쿠폰 코드 입력 */}
      {discountPct === 0 && (
        <div style={{ width: "100%", maxWidth: "380px", textAlign: "center" }}>
          {!showCouponInput ? (
            <button
              onClick={() => setShowCouponInput(true)}
              style={{
                background: "none",
                border: "none",
                color: "var(--ink-light)",
                fontSize: "12px",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              구매하신 열람 코드나 쿠폰이 있으신가요?
            </button>
          ) : (
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                placeholder="예: OPEN-3F7A2C"
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  fontSize: "13px",
                  border: "1px solid var(--ink-ghost)",
                  borderRadius: "8px",
                  background: "var(--bg-white)",
                  color: "var(--ink)",
                }}
              />
              <button
                onClick={applyCoupon}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  borderRadius: "8px",
                  background: "var(--ink-medium)",
                  color: "var(--bg-white)",
                  cursor: "pointer",
                }}
              >
                적용
              </button>
            </div>
          )}
        </div>
      )}
      {couponMessage && (
        <p style={{ fontSize: "12px", color: discountPct > 0 ? "#2D5A27" : "var(--seal)" }}>
          {couponMessage}
        </p>
      )}

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
