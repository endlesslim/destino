import Link from "next/link";

export default function Footer() {
  return (
    <footer className="text-center py-8 mt-8" style={{ color: "var(--ink-light)" }}>
      <p
        className="text-[12px] font-bold tracking-widest mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        DESTINO
      </p>
      <div
        className="flex justify-center gap-4 text-[12px] mb-3"
        style={{ color: "var(--ink-light)" }}
      >
        <Link href="/" className="hover:underline">홈</Link>
        <span style={{ color: "var(--border)" }}>|</span>
        <Link href="/analyze" className="hover:underline">교차 분석</Link>
        <span style={{ color: "var(--border)" }}>|</span>
        <Link href="/compatibility" className="hover:underline">궁합 분석</Link>
      </div>
      <p className="text-[11px]" style={{ color: "var(--ink-faint)" }}>
        &copy; {new Date().getFullYear()} DESTINO
      </p>
    </footer>
  );
}
