"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import ScrollReveal from "@/components/ScrollReveal";
import Seal from "@/components/ui/Seal";
import { ServiceIcon } from "@/components/ui/SystemIcons";

/* ── Service data ──────────────────────────────────────────────── */

interface Service {
  name: string;
  desc: string;
  href: string;
  price: string;
  color: string;
  type: string;
}

const coreServices: Service[] = [
  { name: "교차 분석", desc: "동서양 4개 문명 교차 분석 리포트", href: "/analyze", price: "₩29,900", color: "var(--seal)", type: "default" },
  { name: "궁합 분석", desc: "두 사람의 교차점 비교", href: "/compatibility", price: "₩9,900", color: "var(--astro)", type: "compatibility" },
  { name: "결혼 궁합", desc: "결혼 5대 차원 심화 분석", href: "/marriage", price: "₩29,900", color: "var(--seal)", type: "marriage" },
];

const deepServices: Service[] = [
  { name: "커리어 심화", desc: "TOP 5 추천 직업 + 연대별 조언", href: "/career", price: "₩9,900", color: "var(--saju)", type: "career" },
  { name: "연애 심화", desc: "이상형 + 연애 패턴 + 인연 시기", href: "/love", price: "₩9,900", color: "var(--seal)", type: "love" },
  { name: "가족 분석", desc: "가족 구성원 관계 분석", href: "/family", price: "₩19,900", color: "var(--face)", type: "face" },
  { name: "이름 풀이", desc: "한글 이름 획수 + 오행 분석", href: "/name-analysis", price: "₩9,900", color: "var(--numero)", type: "default" },
];

const freeServices: Service[] = [
  { name: "오늘의 운세", desc: "매일 달라지는 오행의 기운", href: "/daily", price: "무료", color: "var(--astro)", type: "daily" },
  { name: "타로 리딩", desc: "탄생 카드 + 올해의 카드", href: "/tarot", price: "무료", color: "var(--tarot)", type: "tarot" },
  { name: "자미두수", desc: "명궁과 14주성이 그리는 명반", href: "/ziwei", price: "무료", color: "var(--saju)", type: "default" },
];

const sections = [
  { title: "핵심 분석", items: coreServices },
  { title: "심화 분석", items: deepServices },
  { title: "무료 서비스", items: freeServices },
];

/* ── Service Card ──────────────────────────────────────────────── */

function ServiceCard({ service }: { service: Service }) {
  const isFree = service.price === "무료";

  return (
    <Link
      href={service.href}
      className="group flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200"
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--border)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px var(--shadow-lift)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Left: icon + text */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="shrink-0 flex items-center justify-center" aria-hidden="true">
          <ServiceIcon type={service.type} color={service.color} />
        </span>
        <div className="min-w-0">
          <p
            className="text-[15px] font-bold leading-snug"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            {service.name}
          </p>
          <p
            className="text-[13px] leading-snug mt-0.5 truncate"
            style={{ color: "var(--ink-muted)" }}
          >
            {service.desc}
          </p>
        </div>
      </div>

      {/* Right: price + arrow */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className="text-[12px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
          style={{
            background: isFree ? "var(--seal-bg)" : "var(--bg-warm)",
            color: isFree ? "var(--seal)" : "var(--ink-medium)",
            fontFamily: "var(--font-display)",
          }}
        >
          {service.price}
        </span>
        <span
          className="text-[16px] transition-transform duration-200 group-hover:translate-x-0.5"
          style={{ color: "var(--ink-light)" }}
          aria-hidden="true"
        >
          &rarr;
        </span>
      </div>
    </Link>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function ServicesPage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--bg-paper)" }}
    >
      <Nav />

      <div className="max-w-[600px] mx-auto px-5 pt-28 pb-32">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <h1
                className="text-[28px] font-black tracking-tight"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                전체 서비스
              </h1>
              <Seal char="命" size="md" />
            </div>
            <p
              className="text-[14px]"
              style={{ color: "var(--ink-muted)" }}
            >
              DESTINO가 제공하는 모든 분석
            </p>
          </div>
        </ScrollReveal>

        {/* Sections */}
        {sections.map((section, si) => (
          <ScrollReveal key={section.title} delay={si * 0.1}>
            <section className="mb-10">
              <h2
                className="text-[13px] font-bold uppercase tracking-widest mb-4 px-1"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ink-light)",
                }}
              >
                {section.title}
              </h2>
              <div className="flex flex-col gap-3">
                {section.items.map((service) => (
                  <ServiceCard key={service.href} service={service} />
                ))}
              </div>
            </section>
          </ScrollReveal>
        ))}

        {/* Footer home link */}
        <ScrollReveal delay={0.3}>
          <div className="text-center pt-6 pb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[13px] font-medium transition-colors"
              style={{ color: "var(--ink-light)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--seal)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-light)")}
            >
              <span>&larr;</span>
              <span>홈으로 돌아가기</span>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
