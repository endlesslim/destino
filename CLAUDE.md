# DESTINO — 프로젝트 컨텍스트 & 브랜딩 가이드

## 프로젝트 개요
"6개 문명이 내린 같은 답" — 사주, 서양 점성술, MBTI, 관상, 수비학, 타로를 교차 분석해서 같은 결론이 나오는 지점("교차점")을 찾아주는 서비스.

## 기술 스택
- Next.js (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Claude API (Sonnet) — 해석 텍스트 생성
- Vercel 배포

## 페이지 구조
```
/                → 랜딩 페이지 (웨이트리스트 수집)
/analyze         → 미니 도구 (사주×별자리×수비학×띠 교차 카드)
/cards/[id]      → Threads 카드 이미지 (OG 이미지 생성용)
```

---

## 브랜딩 시스템

### 컨셉
"인장(印章)" — 동양 전통 도장과 한지, 먹의 질감을 현대 에디토리얼로.
점술 앱 시장의 어두운 우주 그라디언트와 정반대. 밝고 따뜻하고 무게감 있는 방향.

### 절대 하지 말 것
- 어두운 배경 + 금색/보라색 그라디언트 (전형적 AI 점술 앱 디자인)
- 반짝이는 별, 코스믹 파티클 애니메이션
- 네온/글로우 효과
- 둥글둥글한 캐주얼 UI (점신, 포스텔러 스타일)
- 이모지를 장식으로 남용
- Inter, Roboto, Arial 같은 범용 폰트

### 컬러 토큰

```css
:root {
  /* 배경 */
  --bg-paper: #F5F0E8;        /* 한지색. 메인 배경 */
  --bg-white: #FFFDF7;        /* 카드, 입력 필드 배경 */
  --bg-warm: #EDE8DE;          /* 섹션 구분 배경 */

  /* 텍스트 */
  --ink: #1C1917;              /* 본문. 순수 검정 아닌 먹색 */
  --ink-medium: #3D3229;       /* 중간 강조 */
  --ink-muted: #6B5E53;        /* 설명 텍스트 */
  --ink-light: #8B7E74;        /* 부제, 레이블 */
  --ink-faint: #B8AFA4;        /* 힌트, 비활성 */
  --ink-ghost: #D6CFC4;        /* 구분선, 비활성 보더 */

  /* 악센트 — 주홍 (인장 컬러) */
  --seal: #C53D43;             /* 주 악센트. 인장, CTA, 교차점 강조 */
  --seal-light: #E8565C;       /* 호버 */
  --seal-dark: #9E2F34;        /* 액티브 */
  --seal-bg: #FDF0F0;          /* 주홍 배경 (매우 연한) */

  /* 보더 */
  --border: #E8E2D8;           /* 기본 보더 */
  --border-strong: #D6CFC4;    /* 강조 보더 */

  /* 체계별 컬러 (교차 분석 카드에서 사용) */
  --saju: #2D5A27;             /* 사주 — 소나무 초록 */
  --astro: #1E3A5F;            /* 점성술 — 깊은 남색 */
  --mbti: #5B3E8A;             /* MBTI — 자주색 */
  --face: #8B6914;             /* 관상 — 황토색 */
  --numero: #6B3A2A;           /* 수비학 — 적갈색 */
  --tarot: #1A4A4A;            /* 타로 — 청록 */
}
```

### 타이포그래피

```css
/* 제목 — Noto Serif KR (명조체 계열) */
--font-display: 'Noto Serif KR', 'Batang', Georgia, serif;

/* 본문/UI — Pretendard (고딕 계열) */
--font-body: 'Pretendard Variable', 'Pretendard', -apple-system, system-ui, sans-serif;

/* 한자/인장 — Noto Serif KR Black */
--font-seal: 'Noto Serif KR', serif; /* weight: 900 */
```

#### 폰트 사이즈 체계
```
Display:  32~40px / Noto Serif KR / 900 / letter-spacing: -0.02em / line-height: 1.2
H1:       24~28px / Noto Serif KR / 900 / letter-spacing: -0.01em / line-height: 1.3
H2:       20px    / Noto Serif KR / 700 / line-height: 1.4
H3:       16px    / Noto Serif KR / 700 / line-height: 1.5
Body:     14~15px / Pretendard   / 400 / line-height: 1.7~1.8
Caption:  12~13px / Pretendard   / 400 / line-height: 1.5
Label:    10~11px / Pretendard   / 500 / letter-spacing: 0.05~0.1em
Micro:    9px     / Pretendard   / 400 / letter-spacing: 0.1em
```

#### 가독성 규칙
- 본문 최소 14px. 13px 미만 금지 (caption/label 제외)
- 명조체(Noto Serif KR)는 제목에만. 본문은 반드시 Pretendard
- 색상 대비: ink(#1C1917) on paper(#F5F0E8) = 명암비 약 10:1. 이 이하로 떨어지지 말 것
- ink-muted(#6B5E53) on paper(#F5F0E8) = 명암비 약 4.5:1. 보조 텍스트의 최저선
- ink-light(#8B7E74) on white(#FFFDF7)는 레이블/힌트에만. 본문에 쓰지 말 것

### 핵심 컴포넌트

#### 인장 (Seal) — 로고이자 배지
```tsx
function Seal({ size = "md", char = "命" }) {
  const sizes = { sm: "w-5 h-5 text-[10px]", md: "w-8 h-8 text-base", lg: "w-16 h-16 text-[28px]" };
  return (
    <div className={`${sizes[size]} inline-flex items-center justify-center
      border-2 border-[--seal] text-[--seal] font-black rounded-[3px]
      -rotate-[3deg] font-display`}>
      {char}
    </div>
  );
}
```

#### 텍스트 배지 (Seal Text)
```tsx
<div className="inline-block px-3 py-1 border-2 border-[--seal] text-[--seal]
  text-xs font-black rounded-[3px] -rotate-[2deg] tracking-wide font-display">
  교차점
</div>
```

#### 점선 구분선 (Divider)
```tsx
<div className="h-px opacity-15"
  style={{ background: "repeating-linear-gradient(90deg, #1C1917 0, #1C1917 4px, transparent 4px, transparent 8px)" }}
/>
```

### 레이아웃 규칙
- 최대 너비: 440px (모바일 퍼스트)
- 좌우 패딩: 24~28px
- 섹션 간격: 40~56px
- 카드 그리드: 2열 (gap: 10~12px)

### 애니메이션
- 최소한으로. 느려야 고급스럽다
- 페이지 전환: fadeUp 0.4s ease
- 카드 등장: 순차 등장 stagger 0.05s
- 호버: opacity 0.15s, border-color 0.2s
- 로딩: "분석 중 ···" 텍스트만 (파티클/스피너 금지)
- 인장 등장: scale 0 → 1 (0.3s, spring ease)

---

## 작업 모드

### /build
MVP 개발 모드. Next.js 페이지 구현, 컴포넌트 개발, API 연동.

### /design
디자인 수정 모드. 브라우저에서 확인하면서 반복 수정. `next dev` 실행 상태 전제.

### /content
콘텐츠 제작 모드. Threads 포스트, 랜딩 카피, 운세 해석 텍스트 작성.

---

## 파일 구조 (목표)
```
destino/
├── app/
│   ├── layout.tsx          # 글로벌 레이아웃 + 폰트 로드
│   ├── page.tsx            # 랜딩 페이지
│   ├── analyze/
│   │   └── page.tsx        # 교차 카드 미니 도구
│   └── cards/
│       └── [id]/
│           └── page.tsx    # OG 이미지 생성용 카드
├── components/
│   ├── ui/
│   │   ├── Seal.tsx
│   │   ├── Divider.tsx
│   │   ├── Cell.tsx
│   │   └── Button.tsx
│   ├── CrossCard.tsx
│   ├── SystemGrid.tsx
│   └── WaitlistForm.tsx
├── lib/
│   ├── saju.ts
│   ├── western.ts
│   ├── numerology.ts
│   ├── cross-engine.ts
│   └── claude.ts
├── styles/
│   └── globals.css
└── CLAUDE.md               # ← 이 파일
```

---

## 참고: 기존 산출물
- `destino-cross-card-v2.jsx` → `/app/analyze/page.tsx`로 마이그레이션
- `destino-landing-v2.jsx` → `/app/page.tsx`로 마이그레이션
- `destino-threads-cards-v2.jsx` → `/app/cards/[id]/page.tsx`로 마이그레이션

## 응답 스타일
- 한국어 사용
- 간결하게. 불필요한 설명 생략
- 코드 먼저, 설명은 뒤에
- 사실 기반으로만 답변. 더 나은 방안이 있으면 근거와 함께 즉시 제안
