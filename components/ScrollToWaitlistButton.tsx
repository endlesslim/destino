"use client";

export default function ScrollToWaitlistButton() {
  return (
    <button
      type="button"
      onClick={() => {
        const el = document.getElementById("waitlist");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }}
      className="w-fit rounded-md px-6 py-3 text-[14px] font-bold tracking-wider transition-all cursor-pointer hover:opacity-85 active:opacity-70"
      style={{
        background: "var(--ink)",
        color: "var(--bg-paper)",
        fontFamily: "var(--font-display)",
      }}
    >
      교차점 발견하기
    </button>
  );
}
