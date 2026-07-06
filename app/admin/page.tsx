"use client";

// app/admin/page.tsx
// 관리자 대시보드 — 고객 만족도 + 유입 퍼널
// 접근: ADMIN_KEY 환경변수 값을 입력 (개발 환경에서는 키 없이 접근 가능)

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
  const CY = 92; // 밴드 중심선
  const MAX_HALF = 58; // 최대 밴드 반높이
  const n = funnel.length;
  const max = Math.max(...funnel.map((f) => f.sessions));

  if (max === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
        아직 여정 데이터가 없습니다. 방문자가 생기면 흐름이 그려집니다.
      </p>
    );
  }

  const xAt = (i: number) => PAD_X + (i * (W - PAD_X * 2)) / (n - 1);
  const halfAt = (s: number) => (s <= 0 ? 1.5 : Math.max(4, (s / max) * MAX_HALF));

  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 560, display: "block" }}>
        {/* 흐름 밴드 */}
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
                fill="var(--seal)"
                opacity={0.78 - i * 0.11}
              />
              {/* 전환율 (밴드 위) */}
              <text
                x={mx}
                y={CY - Math.max(h1, h2) - 8}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="700"
                fill="var(--ink-muted)"
              >
                {convRate}%
              </text>
              {/* 이탈 (밴드 아래) */}
              {dropped > 0 && (
                <>
                  <path
                    d={`M ${mx - 4} ${CY + Math.max(h1, h2) + 6} L ${mx} ${CY + Math.max(h1, h2) + 13} L ${mx + 4} ${CY + Math.max(h1, h2) + 6}`}
                    fill="none"
                    stroke="#C0392B"
                    strokeWidth="1.3"
                  />
                  <text
                    x={mx}
                    y={CY + Math.max(h1, h2) + 26}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="#C0392B"
                  >
                    −{dropped} 이탈
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* 단계 노드 */}
        {funnel.map((f, i) => {
          const x = xAt(i);
          const h = halfAt(f.sessions);
          return (
            <g key={f.step}>
              <line x1={x} y1={CY - h - 3} x2={x} y2={CY + h + 3} stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
              <text x={x} y={CY - h - 24} textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--ink)" fontFamily="var(--font-display)">
                {f.sessions}
              </text>
              <text x={x} y={H - 32} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink-medium)">
                {JOURNEY_SHORT_LABELS[f.step] || f.label}
              </text>
              <text x={x} y={H - 18} textAnchor="middle" fontSize="9" fill="var(--ink-faint)">
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
 * 고객이 사이트에서 직접 생년월일을 입력하고 페이월의 코드 입력창에 넣으면
 * 결제 없이 잠금 해제 (1회용 · 입력 시점부터 24시간).
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

  const customerMsg = (code: string) =>
    `입금 확인되었습니다. 감사합니다 🙏\n\n1) destino에서 생년월일을 입력해 무료 분석을 받아보세요\n2) 결과 하단의 "구매하신 열람 코드나 쿠폰이 있으신가요?"에 아래 코드를 입력하시면 전체 리포트가 열립니다\n\n열람 코드: ${code}\n\n· 코드를 입력하신 순간부터 24시간 동안 보실 수 있어요\n· 리포트 하단의 "PDF로 저장"을 누르시면 평생 소장하실 수 있어요`;

  return (
    <section className="mb-10">
      <h2 className="mb-1 text-lg font-bold" style={{ color: "var(--ink)" }}>열람 코드 만들기 (추천)</h2>
      <p className="mb-4 text-xs" style={{ color: "var(--ink-faint)" }}>
        미리 뽑아두고 입금 확인 시 하나씩 보내세요 — 고객 정보를 입력할 필요가 없습니다.
        고객이 직접 생년월일을 넣고 코드로 잠금 해제합니다 (1회용 · 입력 시점부터 24시간)
      </p>
      <div className="rounded-lg border p-4" style={{ background: "var(--bg-white)", borderColor: "var(--ink-ghost)" }}>
        <div className="flex gap-2">
          <select
            className="rounded border px-3 py-2 text-sm"
            style={{ borderColor: "var(--ink-ghost)", background: "var(--bg-white)", color: "var(--ink)" }}
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
            className="flex-1 rounded px-4 py-2 text-sm font-bold text-white"
            style={{ background: busy ? "var(--ink-light)" : "var(--seal)" }}
          >
            {busy ? "생성 중…" : "코드 뭉치 생성"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm" style={{ color: "var(--seal)" }}>{error}</p>}

        {codes.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px]" style={{ color: "var(--ink-faint)" }}>
                생성된 코드 {codes.length}개 — 메모장에 붙여넣어 보관하세요
              </p>
              <button
                onClick={() => copy(codes.join("\n"), "all")}
                className="rounded px-2 py-1 text-[11px] font-bold"
                style={{ color: copied === "all" ? "#2D5A27" : "var(--ink-medium)", background: "var(--bg-warm)" }}
              >
                {copied === "all" ? "복사됨 ✓" : "전체 복사"}
              </button>
            </div>
            {codes.map((c) => (
              <div key={c} className="flex items-center gap-2">
                <code
                  className="flex-1 rounded px-3 py-1.5 text-xs font-bold tracking-wider"
                  style={{ background: "var(--bg-warm)", color: "var(--ink)" }}
                >
                  {c}
                </code>
                <button
                  onClick={() => copy(c, c)}
                  className="rounded px-2.5 py-1.5 text-[11px] font-bold text-white"
                  style={{ background: copied === c ? "#2D5A27" : "var(--ink-medium)" }}
                >
                  {copied === c ? "✓" : "코드"}
                </button>
                <button
                  onClick={() => copy(customerMsg(c), c + "-msg")}
                  className="rounded border px-2.5 py-1.5 text-[11px] font-bold"
                  style={{
                    borderColor: copied === c + "-msg" ? "#2D5A27" : "var(--ink-ghost)",
                    color: copied === c + "-msg" ? "#2D5A27" : "var(--ink-medium)",
                    background: "var(--bg-white)",
                  }}
                >
                  {copied === c + "-msg" ? "✓" : "카톡 문구"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
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

  const inputCls = "rounded border px-3 py-2 text-sm";
  const inputStyle = { borderColor: "var(--ink-ghost)", background: "var(--bg-white)", color: "var(--ink)" } as const;

  return (
    <section className="mb-10">
      <h2 className="mb-1 text-lg font-bold" style={{ color: "var(--ink)" }}>판매 링크 발급</h2>
      <p className="mb-4 text-xs" style={{ color: "var(--ink-faint)" }}>
        입금 확인 후 고객 정보를 입력하면 페이월 없이 전체 리포트가 열리는 링크가 만들어집니다
      </p>
      <div className="rounded-lg border p-4" style={{ background: "var(--bg-white)", borderColor: "var(--ink-ghost)" }}>
        <div className="mb-2 grid grid-cols-4 gap-2">
          <input className={inputCls} style={inputStyle} placeholder="이름 (선택)" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <input className={inputCls} style={inputStyle} placeholder="1990" inputMode="numeric" value={form.year} onChange={(e) => set("year", e.target.value.replace(/\D/g, "").slice(0, 4))} />
          <input className={inputCls} style={inputStyle} placeholder="월" inputMode="numeric" value={form.month} onChange={(e) => set("month", e.target.value.replace(/\D/g, "").slice(0, 2))} />
          <input className={inputCls} style={inputStyle} placeholder="일" inputMode="numeric" value={form.day} onChange={(e) => set("day", e.target.value.replace(/\D/g, "").slice(0, 2))} />
        </div>
        <div className="mb-3 grid grid-cols-3 gap-2">
          <input className={inputCls} style={inputStyle} placeholder="시 0~23 (선택)" inputMode="numeric" value={form.hour} onChange={(e) => set("hour", e.target.value.replace(/\D/g, "").slice(0, 2))} />
          <input className={inputCls} style={inputStyle} placeholder="MBTI (선택)" value={form.mbti} onChange={(e) => set("mbti", e.target.value.toUpperCase().slice(0, 4))} />
          <select className={inputCls} style={inputStyle} value={form.days} onChange={(e) => set("days", e.target.value)}>
            <option value="1">개봉 후 1일</option>
            <option value="3">개봉 후 3일</option>
            <option value="7">개봉 후 7일</option>
          </select>
        </div>
        <button
          onClick={issue}
          disabled={busy}
          className="w-full rounded px-4 py-2.5 text-sm font-bold text-white"
          style={{ background: busy ? "var(--ink-light)" : "var(--seal)" }}
        >
          {busy ? "발급 중…" : "열람 링크 만들기"}
        </button>
        {error && <p className="mt-2 text-sm" style={{ color: "var(--seal)" }}>{error}</p>}

        {issued && (
          <div className="mt-4 space-y-2">
            <div className="flex gap-2">
              <code
                className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded px-3 py-2 text-xs"
                style={{ background: "var(--bg-warm)", color: "var(--ink-medium)" }}
              >
                {issued.url}
              </code>
              <button
                onClick={() => copy(issued.url, "url")}
                className="shrink-0 rounded px-3 py-2 text-xs font-bold text-white"
                style={{ background: copied === "url" ? "#2D5A27" : "var(--ink-medium)" }}
              >
                {copied === "url" ? "복사됨 ✓" : "링크 복사"}
              </button>
            </div>
            <button
              onClick={() => copy(kakaoMsg, "msg")}
              className="w-full rounded border px-3 py-2 text-xs font-bold"
              style={{
                borderColor: copied === "msg" ? "#2D5A27" : "var(--ink-ghost)",
                color: copied === "msg" ? "#2D5A27" : "var(--ink-medium)",
                background: "var(--bg-white)",
              }}
            >
              {copied === "msg" ? "복사됨 ✓ 카톡에 붙여넣으세요" : "카톡 발송용 안내 메시지 복사 (링크 포함)"}
            </button>
            <p className="text-[11px]" style={{ color: "var(--ink-faint)" }}>
              고객이 처음 여는 순간부터 {viewLabel} 열람 · 개봉 기한 {openByStr}까지 · 연 기기에서는 기간 내 재방문 가능
            </p>
          </div>
        )}
      </div>
    </section>
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

  return (
    <main className="min-h-screen px-5 py-10 md:px-10" style={{ background: "var(--bg-paper)" }}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-baseline justify-between">
          <h1 className="text-2xl font-bold" style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}>
            管 관리자 대시보드
          </h1>
          {stats && (
            <span className="text-xs" style={{ color: "var(--ink-faint)" }}>
              데이터: {stats.source === "supabase" ? "Supabase" : "로컬(/tmp — 배포 시 유실됨)"}
            </span>
          )}
        </div>

        {/* 키 입력 */}
        {(error || !stats) && (
          <div className="mb-8 rounded-lg border p-5" style={{ background: "var(--bg-white)", borderColor: "var(--ink-ghost)" }}>
            <p className="mb-3 text-sm" style={{ color: "var(--ink-muted)" }}>
              관리자 키를 입력하세요 (ADMIN_KEY 환경변수)
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchStats(keyInput)}
                className="flex-1 rounded border px-3 py-2 text-sm"
                style={{ borderColor: "var(--ink-ghost)", background: "var(--bg-white)", color: "var(--ink)" }}
                placeholder="관리자 키"
              />
              <button
                onClick={() => { setAdminKey(keyInput); fetchStats(keyInput); }}
                className="rounded px-4 py-2 text-sm font-medium text-white"
                style={{ background: "var(--seal)" }}
              >
                확인
              </button>
            </div>
            {error && <p className="mt-3 text-sm" style={{ color: "var(--seal)" }}>{error}</p>}
          </div>
        )}

        {loading && <p style={{ color: "var(--ink-muted)" }}>불러오는 중…</p>}

        {stats && <UnlockCodesTool adminKey={adminKey} />}

        {stats && <IssueLinkTool adminKey={adminKey} />}

        {stats && (
          <>
            {/* ── 만족도 ── */}
            <section className="mb-10">
              <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--ink)" }}>고객 만족도</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "전체 평가", value: stats.satisfaction.total },
                  { label: "정확해요", value: stats.satisfaction.accurate },
                  { label: "정확도", value: stats.satisfaction.accurateRate !== null ? `${stats.satisfaction.accurateRate}%` : "—" },
                ].map((c) => (
                  <div key={c.label} className="rounded-lg border p-4 text-center" style={{ background: "var(--bg-white)", borderColor: "var(--ink-ghost)" }}>
                    <div className="text-2xl font-bold" style={{ color: "var(--seal)", fontFamily: "var(--font-display)" }}>{c.value}</div>
                    <div className="mt-1 text-xs" style={{ color: "var(--ink-light)" }}>{c.label}</div>
                  </div>
                ))}
              </div>
              {stats.satisfaction.comments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {stats.satisfaction.comments.map((c, i) => (
                    <div key={i} className="rounded-lg border p-3 text-sm" style={{ background: "var(--bg-white)", borderColor: "var(--ink-ghost)" }}>
                      <div className="mb-1 flex items-center gap-2 text-xs" style={{ color: "var(--ink-faint)" }}>
                        <span style={{ color: c.rating === "accurate" ? "#2D5A27" : "var(--seal)" }}>
                          {c.rating === "accurate" ? "✓ 정확" : "✗ 부정확"}
                        </span>
                        {c.birth && <span>{c.birth}생</span>}
                        {c.archetype && <span>{c.archetype}</span>}
                        <span>{c.created_at.slice(0, 10)}</span>
                      </div>
                      <p style={{ color: "var(--ink-medium)" }}>{c.comment}</p>
                    </div>
                  ))}
                </div>
              )}
              {stats.satisfaction.total === 0 && (
                <p className="mt-3 text-sm" style={{ color: "var(--ink-faint)" }}>아직 수집된 피드백이 없습니다.</p>
              )}
            </section>

            {/* ── 고객 여정 흐름 ── */}
            <section className="mb-10">
              <h2 className="mb-1 text-lg font-bold" style={{ color: "var(--ink)" }}>고객 여정</h2>
              <p className="mb-4 text-xs" style={{ color: "var(--ink-faint)" }}>
                방문부터 결제까지의 흐름 — 밴드가 좁아지는 곳이 이탈 지점입니다
              </p>
              <div
                className="rounded-[12px] p-4"
                style={{ background: "var(--bg-white)", border: "1px solid var(--border)" }}
              >
                <JourneyFlow funnel={stats.funnel} />
              </div>
            </section>

            {/* ── 퍼널 ── */}
            <section className="mb-10">
              <h2 className="mb-1 text-lg font-bold" style={{ color: "var(--ink)" }}>유입 퍼널</h2>
              <p className="mb-4 text-xs" style={{ color: "var(--ink-faint)" }}>단계별 고유 방문자 수 — 어디서 이탈하는지 확인하세요</p>
              <div className="space-y-2">
                {stats.funnel.map((f, i) => {
                  const prev = i > 0 ? stats.funnel[i - 1].sessions : f.sessions;
                  const convRate = i > 0 && prev > 0 ? Math.round((f.sessions / prev) * 100) : null;
                  return (
                    <div key={f.step} className="flex items-center gap-3">
                      <div className="w-40 shrink-0 text-right text-xs" style={{ color: "var(--ink-muted)" }}>{f.label}</div>
                      <div className="h-6 flex-1 overflow-hidden rounded" style={{ background: "var(--bg-warm)" }}>
                        <div
                          className="flex h-full items-center rounded px-2 text-xs font-medium text-white transition-all"
                          style={{
                            width: `${Math.max(f.sessions > 0 ? 8 : 0, (f.sessions / maxFunnel) * 100)}%`,
                            background: "var(--seal)",
                            opacity: 1 - i * 0.08,
                          }}
                        >
                          {f.sessions > 0 && f.sessions}
                        </div>
                      </div>
                      <div className="w-12 shrink-0 text-xs" style={{ color: "var(--ink-faint)" }}>
                        {convRate !== null ? `${convRate}%` : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── 일별 추이 ── */}
            <section className="mb-10">
              <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--ink)" }}>최근 14일 추이</h2>
              {stats.daily.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--ink-faint)" }}>아직 데이터가 없습니다.</p>
              ) : (
                <div className="flex items-end gap-1" style={{ height: 120 }}>
                  {stats.daily.map((d) => (
                    <div key={d.date} className="flex flex-1 flex-col items-center gap-1" title={`${d.date}: 방문 ${d.visits}, 분석 ${d.analyzes}, 결제 ${d.payments}`}>
                      <div className="flex w-full items-end justify-center gap-px" style={{ height: 100 }}>
                        <div className="w-2 rounded-t" style={{ height: `${(d.visits / maxDaily) * 100}%`, background: "var(--ink-ghost)" }} />
                        <div className="w-2 rounded-t" style={{ height: `${(d.analyzes / maxDaily) * 100}%`, background: "var(--ink-light)" }} />
                        <div className="w-2 rounded-t" style={{ height: `${(d.payments / maxDaily) * 100}%`, background: "var(--seal)" }} />
                      </div>
                      <span className="text-[9px]" style={{ color: "var(--ink-faint)" }}>{d.date.slice(5)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 flex gap-4 text-xs" style={{ color: "var(--ink-faint)" }}>
                <span><span className="mr-1 inline-block h-2 w-2 rounded-sm" style={{ background: "var(--ink-ghost)" }} />방문</span>
                <span><span className="mr-1 inline-block h-2 w-2 rounded-sm" style={{ background: "var(--ink-light)" }} />분석</span>
                <span><span className="mr-1 inline-block h-2 w-2 rounded-sm" style={{ background: "var(--seal)" }} />결제</span>
              </div>
            </section>

            <button
              onClick={() => fetchStats(adminKey)}
              className="rounded border px-4 py-2 text-sm"
              style={{ borderColor: "var(--ink-ghost)", color: "var(--ink-muted)", background: "var(--bg-white)" }}
            >
              새로고침
            </button>
          </>
        )}
      </div>
    </main>
  );
}
