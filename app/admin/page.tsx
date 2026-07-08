"use client";

// app/admin/page.tsx
// 관리자 대시보드 — 고객 만족도 + 유입 퍼널 + 판매 도구
// 접근: ADMIN_KEY 환경변수 값을 입력 (개발 환경에서는 키 없이 접근 가능)
//
// 디자인 시스템: 딥 네이비 B2B SaaS 톤 (고객 사이트의 한지 테마와 분리된 어드민 전용 팔레트)

import { useState, useEffect, useCallback } from "react";

interface Stats {
  source: "supabase" | "local";
  satisfaction: {
    total: number;
    accurate: number;
    inaccurate: number;
    accurateRate: number | null;
    comments: Array<{
      rating: string;
      comment: string;
      created_at: string;
      birth: string | null;
      archetype: string | null;
    }>;
  };
  funnel: Array<{ step: string; label: string; sessions: number }>;
  daily: Array<{ date: string; visits: number; analyzes: number; payments: number }>;
}

const KEY_STORAGE = "destino_admin_key";

// ━━━ 어드민 전용 디자인 토큰 ━━━
const C = {
  primary: "#0B4171",
  primaryHover: "#0D4D85",
  primarySoft: "rgba(11, 65, 113, 0.07)",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  border: "#E2E8F0",
  track: "#F1F5F9",
  ink900: "#0F172A",
  ink700: "#334155",
  ink500: "#64748B",
  ink400: "#94A3B8",
  emerald: "#10B981",
  emeraldSoft: "rgba(16, 185, 129, 0.1)",
  amber: "#F59E0B",
  rose: "#EF4444",
  roseSoft: "rgba(239, 68, 68, 0.08)",
} as const;

const cardShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.05)";

const cardStyle: React.CSSProperties = {
  background: C.card,
  borderRadius: 14,
  boxShadow: cardShadow,
  border: `1px solid ${C.border}`,
};

const inputStyle: React.CSSProperties = {
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 14,
  background: C.card,
  color: C.ink900,
  outline: "none",
  width: "100%",
};

const primaryBtnStyle: React.CSSProperties = {
  background: C.primary,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: cardShadow,
  transition: "background 0.15s",
};

const ghostBtnStyle: React.CSSProperties = {
  background: C.card,
  color: C.ink700,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "10px 16px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "background 0.15s",
};

/** 카드 섹션 헤더 */
function CardHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: C.ink900, letterSpacing: "-0.01em" }}>
        {title}
      </h2>
      {desc && (
        <p style={{ fontSize: 13, color: C.ink500, marginTop: 3, lineHeight: 1.6 }}>{desc}</p>
      )}
    </div>
  );
}

// ━━━ 고객 여정 흐름 그래프 (sankey식 SVG) ━━━
const JOURNEY_SHORT_LABELS: Record<string, string> = {
  visit_analyze: "방문",
  analyze_submit: "분석 실행",
  result_view: "결과 확인",
  paywall_view: "페이월 도달",
  payment_click: "구매 문의",
  payment_done: "결제 완료",
};

function JourneyFlow({ funnel }: { funnel: Array<{ step: string; label: string; sessions: number }> }) {
  const W = 720;
  const H = 230;
  const PAD_X = 46;
  const CY = 92;
  const MAX_HALF = 58;
  const n = funnel.length;
  const max = Math.max(...funnel.map((f) => f.sessions));

  if (max === 0) {
    return (
      <p style={{ fontSize: 14, color: C.ink400 }}>
        아직 여정 데이터가 없습니다. 방문자가 생기면 흐름이 그려집니다.
      </p>
    );
  }

  const xAt = (i: number) => PAD_X + (i * (W - PAD_X * 2)) / (n - 1);
  const halfAt = (s: number) => (s <= 0 ? 1.5 : Math.max(4, (s / max) * MAX_HALF));

  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 560, display: "block" }}>
        {funnel.slice(0, -1).map((f, i) => {
          const next = funnel[i + 1];
          const x1 = xAt(i);
          const x2 = xAt(i + 1);
          const mx = (x1 + x2) / 2;
          const h1 = halfAt(f.sessions);
          const h2 = halfAt(next.sessions);
          const dropped = Math.max(0, f.sessions - next.sessions);
          const convRate = f.sessions > 0 ? Math.round((next.sessions / f.sessions) * 100) : 0;
          return (
            <g key={f.step}>
              <path
                d={`M ${x1} ${CY - h1} C ${mx} ${CY - h1}, ${mx} ${CY - h2}, ${x2} ${CY - h2} L ${x2} ${CY + h2} C ${mx} ${CY + h2}, ${mx} ${CY + h1}, ${x1} ${CY + h1} Z`}
                fill={C.primary}
                opacity={0.75 - i * 0.11}
              />
              <text
                x={mx}
                y={CY - Math.max(h1, h2) - 8}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="600"
                fill={C.ink500}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {convRate}%
              </text>
              {dropped > 0 && (
                <>
                  <path
                    d={`M ${mx - 4} ${CY + Math.max(h1, h2) + 6} L ${mx} ${CY + Math.max(h1, h2) + 13} L ${mx + 4} ${CY + Math.max(h1, h2) + 6}`}
                    fill="none"
                    stroke={C.rose}
                    strokeWidth="1.3"
                  />
                  <text
                    x={mx}
                    y={CY + Math.max(h1, h2) + 26}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill={C.rose}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    −{dropped} 이탈
                  </text>
                </>
              )}
            </g>
          );
        })}

        {funnel.map((f, i) => {
          const x = xAt(i);
          const h = halfAt(f.sessions);
          return (
            <g key={f.step}>
              <line x1={x} y1={CY - h - 3} x2={x} y2={CY + h + 3} stroke={C.ink900} strokeWidth="2.5" strokeLinecap="round" />
              <text
                x={x}
                y={CY - h - 24}
                textAnchor="middle"
                fontSize="16"
                fontWeight="700"
                fill={C.ink900}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {f.sessions}
              </text>
              <text x={x} y={H - 32} textAnchor="middle" fontSize="11" fontWeight="600" fill={C.ink700}>
                {JOURNEY_SHORT_LABELS[f.step] || f.label}
              </text>
              <text x={x} y={H - 18} textAnchor="middle" fontSize="9" fill={C.ink400}>
                {i + 1}단계
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * 열람 코드 일괄 생성 도구 — 판매 자동화의 기본 수단.
 * 미리 뽑아두고 입금 확인 시 목록에서 하나 복사해 보내면 끝.
 */
function UnlockCodesTool({ adminKey }: { adminKey: string }) {
  const [count, setCount] = useState("10");
  const [codes, setCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  async function issue() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/issue-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ count: Number(count) || 10 }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "발급 실패");
      else setCodes(data.codes || []);
    } catch {
      setError("네트워크 오류");
    } finally {
      setBusy(false);
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://destino-mocha.vercel.app";

  const customerMsg = (code: string) =>
    `입금 확인되었습니다. 감사합니다 🙏\n\n1) 아래 링크에서 생년월일을 입력해 무료 분석을 받아보세요\n${SITE_URL}/analyze\n\n2) 결과 하단의 "열람 코드를 받으셨나요?"에 아래 코드를 입력하시면 전체 리포트가 열립니다\n\n열람 코드: ${code}\n\n· 코드를 입력하신 순간부터 24시간 동안 보실 수 있어요\n· 리포트 하단의 "PDF로 저장"을 누르시면 평생 소장하실 수 있어요`;

  const compatMsg = (code: string) =>
    `입금 확인되었습니다. 감사합니다 🙏\n\n1) 아래 링크에서 두 분의 생년월일을 입력해 무료 궁합을 받아보세요\n${SITE_URL}/compatibility\n\n2) 결과 아래 "열람 코드를 받으셨나요?"에 아래 코드를 입력하시면 심층 리포트(타임라인·소통법·갈등 해법·AI 해석)가 열립니다\n\n열람 코드: ${code}\n\n· 코드를 입력하신 순간부터 24시간 동안 보실 수 있어요\n· 열람 후 "결혼 궁합 심화 분석"도 무료로 이용하실 수 있어요`;

  const chipBtn = (active: boolean): React.CSSProperties => ({
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 8,
    border: `1px solid ${active ? C.emerald : C.border}`,
    background: active ? C.emeraldSoft : C.card,
    color: active ? C.emerald : C.ink700,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
  });

  return (
    <section style={{ ...cardStyle, padding: 28 }}>
      <CardHeader
        title="열람 코드"
        desc="미리 뽑아두고 입금 확인 시 하나씩 보내세요. 고객이 직접 생년월일을 넣고 코드로 잠금 해제합니다 (1회용 · 입력 시점부터 24시간)"
      />
      <div style={{ display: "flex", gap: 10 }}>
        <select
          style={{ ...inputStyle, width: 110, cursor: "pointer" }}
          value={count}
          onChange={(e) => setCount(e.target.value)}
        >
          <option value="5">5개</option>
          <option value="10">10개</option>
          <option value="20">20개</option>
        </select>
        <button
          onClick={issue}
          disabled={busy}
          style={{ ...primaryBtnStyle, flex: 1, opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "생성 중…" : "코드 뭉치 생성"}
        </button>
      </div>
      {error && <p style={{ marginTop: 12, fontSize: 13, color: C.rose }}>{error}</p>}

      {codes.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontSize: 12, color: C.ink400 }}>
              생성된 코드 {codes.length}개 — 메모장에 붙여넣어 보관하세요
            </p>
            <button onClick={() => copy(codes.join("\n"), "all")} style={chipBtn(copied === "all")}>
              {copied === "all" ? "복사됨 ✓" : "전체 복사"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {codes.map((c) => (
              <div
                key={c}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  margin: "0 -12px",
                  borderRadius: 10,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <code
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: C.ink900,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {c}
                </code>
                <button onClick={() => copy(c, c)} style={chipBtn(copied === c)}>
                  {copied === c ? "✓" : "코드"}
                </button>
                <button onClick={() => copy(customerMsg(c), c + "-msg")} style={chipBtn(copied === c + "-msg")}>
                  {copied === c + "-msg" ? "✓" : "개인 문구"}
                </button>
                <button onClick={() => copy(compatMsg(c), c + "-cmsg")} style={chipBtn(copied === c + "-cmsg")}>
                  {copied === c + "-cmsg" ? "✓" : "궁합 문구"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** 수동 판매용 열람 링크 발급 도구 — 입금 확인 후 링크를 만들어 고객에게 전송 */
function IssueLinkTool({ adminKey }: { adminKey: string }) {
  const [form, setForm] = useState({ name: "", year: "", month: "", day: "", hour: "", mbti: "", days: "1" });
  const [issued, setIssued] = useState<{ url: string; openBy: number; validDays: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"url" | "msg" | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function issue() {
    setError("");
    setIssued(null);
    if (!form.year || !form.month || !form.day) {
      setError("생년월일을 입력하세요");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/issue-link", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({
          year: Number(form.year), month: Number(form.month), day: Number(form.day),
          hour: form.hour === "" ? undefined : Number(form.hour),
          name: form.name || undefined,
          mbti: form.mbti || undefined,
          days: Number(form.days) || 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "발급 실패");
      else setIssued({ url: data.url, openBy: data.openBy, validDays: data.validDays });
    } catch {
      setError("네트워크 오류");
    } finally {
      setBusy(false);
    }
  }

  const openByStr = issued ? new Date(issued.openBy).toLocaleDateString("ko-KR", { month: "long", day: "numeric" }) : "";
  const viewLabel = issued ? (issued.validDays === 1 ? "24시간" : `${issued.validDays}일`) : "";
  const kakaoMsg = issued
    ? `${form.name ? form.name + "님, " : ""}입금 확인되었습니다. 감사합니다 🙏\n\n아래 링크를 누르시면 ${form.name ? form.name + "님만을 위한 " : ""}전체 교차 분석 리포트가 자동으로 열립니다.\n\n${issued.url}\n\n· 링크를 여신 순간부터 ${viewLabel} 동안 보실 수 있어요\n· 리포트 하단의 "PDF로 저장"을 누르시면 평생 소장하실 수 있어요\n· 보시고 "정확해요" 버튼 한 번 눌러주시면 큰 힘이 됩니다!`
    : "";

  function copy(text: string, which: "url" | "msg") {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <section style={{ ...cardStyle, padding: 28 }}>
      <CardHeader
        title="판매 링크"
        desc="입금 확인 후 고객 정보를 입력하면 페이월 없이 전체 리포트가 열리는 링크가 만들어집니다"
      />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 0.7fr 0.7fr", gap: 10, marginBottom: 10 }}>
        <input style={inputStyle} placeholder="이름 (선택)" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <input style={inputStyle} placeholder="1990" inputMode="numeric" value={form.year} onChange={(e) => set("year", e.target.value.replace(/\D/g, "").slice(0, 4))} />
        <input style={inputStyle} placeholder="월" inputMode="numeric" value={form.month} onChange={(e) => set("month", e.target.value.replace(/\D/g, "").slice(0, 2))} />
        <input style={inputStyle} placeholder="일" inputMode="numeric" value={form.day} onChange={(e) => set("day", e.target.value.replace(/\D/g, "").slice(0, 2))} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 10, marginBottom: 16 }}>
        <input style={inputStyle} placeholder="시 0~23 (선택)" inputMode="numeric" value={form.hour} onChange={(e) => set("hour", e.target.value.replace(/\D/g, "").slice(0, 2))} />
        <input style={inputStyle} placeholder="MBTI (선택)" value={form.mbti} onChange={(e) => set("mbti", e.target.value.toUpperCase().slice(0, 4))} />
        <select style={{ ...inputStyle, cursor: "pointer" }} value={form.days} onChange={(e) => set("days", e.target.value)}>
          <option value="1">개봉 후 1일</option>
          <option value="3">개봉 후 3일</option>
          <option value="7">개봉 후 7일</option>
        </select>
      </div>
      <button onClick={issue} disabled={busy} style={{ ...primaryBtnStyle, width: "100%", opacity: busy ? 0.6 : 1 }}>
        {busy ? "발급 중…" : "열람 링크 만들기"}
      </button>
      {error && <p style={{ marginTop: 12, fontSize: 13, color: C.rose }}>{error}</p>}

      {issued && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <code
              style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 12,
                background: C.bg,
                color: C.ink700,
              }}
            >
              {issued.url}
            </code>
            <button
              onClick={() => copy(issued.url, "url")}
              style={{
                ...ghostBtnStyle,
                flexShrink: 0,
                borderColor: copied === "url" ? C.emerald : C.border,
                color: copied === "url" ? C.emerald : C.ink700,
              }}
            >
              {copied === "url" ? "복사됨 ✓" : "링크 복사"}
            </button>
          </div>
          <button
            onClick={() => copy(kakaoMsg, "msg")}
            style={{
              ...ghostBtnStyle,
              width: "100%",
              borderColor: copied === "msg" ? C.emerald : C.border,
              color: copied === "msg" ? C.emerald : C.ink700,
            }}
          >
            {copied === "msg" ? "복사됨 ✓ 카톡에 붙여넣으세요" : "카톡 발송용 안내 메시지 복사 (링크 포함)"}
          </button>
          <p style={{ fontSize: 12, color: C.ink400, lineHeight: 1.6 }}>
            고객이 처음 여는 순간부터 {viewLabel} 열람 · 개봉 기한 {openByStr}까지 · 연 기기에서는 기간 내 재방문 가능
          </p>
        </div>
      )}
    </section>
  );
}

/** KPI 스탯 카드 */
function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{ ...cardStyle, padding: "22px 24px" }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: C.ink500, letterSpacing: "0.02em", marginBottom: 8 }}>
        {label}
      </p>
      <p
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: accent || C.ink900,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async (key: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { "x-admin-key": key },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "조회 실패");
        setStats(null);
      } else {
        setStats(data);
        sessionStorage.setItem(KEY_STORAGE, key);
      }
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(KEY_STORAGE) || "";
    setAdminKey(saved);
    fetchStats(saved);
  }, [fetchStats]);

  const maxFunnel = stats ? Math.max(1, ...stats.funnel.map((f) => f.sessions)) : 1;
  const maxDaily = stats ? Math.max(1, ...stats.daily.map((d) => d.visits)) : 1;

  const todayVisits = stats?.daily.length ? stats.daily[stats.daily.length - 1].visits : 0;
  const paymentsDone = stats?.funnel.find((f) => f.step === "payment_done")?.sessions ?? 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "var(--font-body)",
        color: C.ink900,
        padding: "40px 20px 80px",
      }}
    >
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        {/* ── 헤더 ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: C.primary,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              D
            </span>
            <div>
              <h1 style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                DESTINO Admin
              </h1>
              <p style={{ fontSize: 12.5, color: C.ink500, marginTop: 2 }}>판매 · 만족도 · 유입 현황</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {stats && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  background: stats.source === "supabase" ? C.emeraldSoft : C.roseSoft,
                  color: stats.source === "supabase" ? C.emerald : C.rose,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "currentColor",
                  }}
                />
                {stats.source === "supabase" ? "Supabase 연결됨" : "로컬 (유실 위험)"}
              </span>
            )}
            {stats && (
              <button onClick={() => fetchStats(adminKey)} style={ghostBtnStyle}>
                새로고침
              </button>
            )}
          </div>
        </div>

        {/* ── 키 입력 ── */}
        {(error || !stats) && !loading && (
          <div style={{ ...cardStyle, padding: 32, maxWidth: 440, margin: "60px auto" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>관리자 인증</h2>
            <p style={{ fontSize: 13, color: C.ink500, marginBottom: 20 }}>
              ADMIN_KEY 환경변수 값을 입력하세요
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchStats(keyInput)}
                style={inputStyle}
                placeholder="관리자 키"
              />
              <button
                onClick={() => { setAdminKey(keyInput); fetchStats(keyInput); }}
                style={{ ...primaryBtnStyle, flexShrink: 0 }}
              >
                확인
              </button>
            </div>
            {error && <p style={{ marginTop: 14, fontSize: 13, color: C.rose }}>{error}</p>}
          </div>
        )}

        {loading && <p style={{ color: C.ink500, fontSize: 14 }}>불러오는 중…</p>}

        {stats && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* ── KPI ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 16,
              }}
            >
              <StatCard label="전체 평가" value={stats.satisfaction.total} />
              <StatCard
                label="정확도"
                value={stats.satisfaction.accurateRate !== null ? `${stats.satisfaction.accurateRate}%` : "—"}
                accent={C.emerald}
              />
              <StatCard label="오늘 방문" value={todayVisits} />
              <StatCard label="결제 완료" value={paymentsDone} accent={C.primary} />
            </div>

            {/* ── 판매 도구 ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 24,
                alignItems: "start",
              }}
            >
              <UnlockCodesTool adminKey={adminKey} />
              <IssueLinkTool adminKey={adminKey} />
            </div>

            {/* ── 고객 여정 ── */}
            <section style={{ ...cardStyle, padding: 28 }}>
              <CardHeader
                title="고객 여정"
                desc="방문부터 결제까지의 흐름 — 밴드가 좁아지는 곳이 이탈 지점입니다"
              />
              <JourneyFlow funnel={stats.funnel} />
            </section>

            {/* ── 퍼널 + 추이 ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 24,
                alignItems: "start",
              }}
            >
              <section style={{ ...cardStyle, padding: 28 }}>
                <CardHeader title="유입 퍼널" desc="단계별 고유 방문자 수" />
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {stats.funnel.map((f, i) => {
                    const prev = i > 0 ? stats.funnel[i - 1].sessions : f.sessions;
                    const convRate = i > 0 && prev > 0 ? Math.round((f.sessions / prev) * 100) : null;
                    return (
                      <div key={f.step} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 128, flexShrink: 0, textAlign: "right", fontSize: 12.5, color: C.ink500 }}>
                          {f.label}
                        </div>
                        <div style={{ height: 26, flex: 1, overflow: "hidden", borderRadius: 7, background: C.track }}>
                          <div
                            style={{
                              display: "flex",
                              height: "100%",
                              alignItems: "center",
                              borderRadius: 7,
                              paddingLeft: 8,
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#fff",
                              fontVariantNumeric: "tabular-nums",
                              width: `${Math.max(f.sessions > 0 ? 8 : 0, (f.sessions / maxFunnel) * 100)}%`,
                              background: C.primary,
                              opacity: 1 - i * 0.09,
                              transition: "width 0.4s",
                            }}
                          >
                            {f.sessions > 0 && f.sessions}
                          </div>
                        </div>
                        <div
                          style={{
                            width: 42,
                            flexShrink: 0,
                            fontSize: 12,
                            color: C.ink400,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {convRate !== null ? `${convRate}%` : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section style={{ ...cardStyle, padding: 28 }}>
                <CardHeader title="최근 14일 추이" />
                {stats.daily.length === 0 ? (
                  <p style={{ fontSize: 14, color: C.ink400 }}>아직 데이터가 없습니다.</p>
                ) : (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 130 }}>
                    {stats.daily.map((d) => (
                      <div
                        key={d.date}
                        style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", gap: 6 }}
                        title={`${d.date}: 방문 ${d.visits}, 분석 ${d.analyzes}, 결제 ${d.payments}`}
                      >
                        <div style={{ display: "flex", width: "100%", alignItems: "flex-end", justifyContent: "center", gap: 2, height: 104 }}>
                          <div style={{ width: 8, borderRadius: "3px 3px 0 0", height: `${(d.visits / maxDaily) * 100}%`, background: "#CBD5E1" }} />
                          <div style={{ width: 8, borderRadius: "3px 3px 0 0", height: `${(d.analyzes / maxDaily) * 100}%`, background: C.ink500 }} />
                          <div style={{ width: 8, borderRadius: "3px 3px 0 0", height: `${(d.payments / maxDaily) * 100}%`, background: C.primary }} />
                        </div>
                        <span style={{ fontSize: 9.5, color: C.ink400, fontVariantNumeric: "tabular-nums" }}>
                          {d.date.slice(5)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 14, display: "flex", gap: 18, fontSize: 12, color: C.ink500 }}>
                  {[
                    { label: "방문", color: "#CBD5E1" },
                    { label: "분석", color: C.ink500 },
                    { label: "결제", color: C.primary },
                  ].map((l) => (
                    <span key={l.label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: l.color, display: "inline-block" }} />
                      {l.label}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {/* ── 만족도 코멘트 ── */}
            <section style={{ ...cardStyle, padding: 28 }}>
              <CardHeader title="고객 피드백" desc="결과 페이지의 '정확해요 / 아니에요' 평가와 코멘트" />
              {stats.satisfaction.comments.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {stats.satisfaction.comments.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        padding: "14px 12px",
                        margin: "0 -12px",
                        borderRadius: 10,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: C.ink400 }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "3px 10px",
                            borderRadius: 999,
                            fontWeight: 600,
                            fontSize: 11.5,
                            background: c.rating === "accurate" ? C.emeraldSoft : C.roseSoft,
                            color: c.rating === "accurate" ? C.emerald : C.rose,
                          }}
                        >
                          {c.rating === "accurate" ? "정확해요" : "아니에요"}
                        </span>
                        {c.birth && <span>{c.birth}생</span>}
                        {c.archetype && <span>{c.archetype}</span>}
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>{c.created_at.slice(0, 10)}</span>
                      </div>
                      <p style={{ fontSize: 14, color: C.ink700, lineHeight: 1.6 }}>{c.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 14, color: C.ink400 }}>아직 수집된 피드백이 없습니다.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
