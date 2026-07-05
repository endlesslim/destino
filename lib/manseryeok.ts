// lib/manseryeok.ts
// 정통 만세력 계산 엔진 — 천문 계산(태양 황경) 기반
//
// 원칙:
// - 연주(年柱): 입춘(태양 황경 315°) 절입 시각 기준으로 해가 바뀜 (설날 기준 아님)
// - 월주(月柱): 12절기(節) 기준. 입춘=寅월, 경칩=卯월, 청명=辰월 … (음력 월 기준 아님)
// - 일주(日柱): 율리우스 적일(JDN) 기반 60갑자 순환 (검증 앵커: 2000-01-01 = 戊午일)
// - 시주(時柱): 시두법(五子元遁). 23시 출생은 다음 날 일주로 넘김(자시일변)
// - 시간대 보정: 서머타임(1948~60, 1987~88), UTC+8:30 시대(1954~61)를 IANA tzdata로 자동 보정
//
// 절기 시각 정확도: 태양 황경 계산(Meeus 근사식) 오차 ≈ ±0.01° ≈ ±15분.
// 검증 앵커(KASI 공표값): 입춘 2024-02-04 17:27 / 2025-02-03 22:10 / 2026-02-04 05:02 KST

export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

export interface Pillar {
  stem: (typeof STEMS)[number];
  branch: (typeof BRANCHES)[number];
  stemIdx: number;
  branchIdx: number;
}

export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour?: Pillar;
  /** 입춘 기준으로 조정된 사주 연도 (예: 1990-01-15 → 1989) */
  sajuYear: number;
  /** 시간대 보정 후 표준시(KST, UTC+9) 기준 시각 (분 단위 보정이 있었던 경우 참고용) */
  correctedMinutes?: number;
}

// ━━━ 율리우스 적일 (그레고리력) ━━━

/** 그레고리력 날짜 → 율리우스 적일 번호 (정오 기준 정수) */
export function jdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

/** UTC epoch ms → 율리우스일 (연속값) */
function jdFromUTCms(ms: number): number {
  return ms / 86400000 + 2440587.5;
}

// ━━━ 태양 황경 (Meeus 근사식) ━━━

const DEG = Math.PI / 180;

/**
 * 겉보기 태양 황경 (도, 0~360)
 * Jean Meeus, Astronomical Algorithms 25장 저정밀식 + 광행차/장동 보정. 오차 ≈ 0.01°
 */
export function solarLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * DEG) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M * DEG) +
    0.000289 * Math.sin(3 * M * DEG);
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const apparent = trueLong - 0.00569 - 0.00478 * Math.sin(omega * DEG);
  return ((apparent % 360) + 360) % 360;
}

/** ΔT(TT−UT) 근사값 (일 단위). 1900~2100 범위에서 오차 ±1분 이내 → 무시 가능 수준 */
function deltaTdays(year: number): number {
  // 대략적 값: 1900년 -3s → 2000년 64s → 2100년 ~200s 예측. 선형 근사로 충분.
  const t = (year - 2000) / 100;
  const seconds = 64 + 90 * t; // 1900≈-26s(실제 -3s), 2026≈87s(실제 ~74s) — 최대 오차 ~25s
  return seconds / 86400;
}

/**
 * 특정 연도에 태양 황경이 targetDeg를 지나는 순간 (UTC epoch ms)
 * @param approxMonth/approxDay 탐색 시작 근사 날짜 (해당 연도 내)
 */
export function solarTermUTCms(
  year: number,
  targetDeg: number,
  approxMonth: number,
  approxDay: number
): number {
  // 초기 추정: 해당 연도 근사 날짜 정오 UTC
  let ms = Date.UTC(year, approxMonth - 1, approxDay, 3, 0, 0); // 정오 KST ≈ 03시 UTC
  const dLdt = 360 / 365.2422; // °/day 평균
  for (let i = 0; i < 6; i++) {
    const jd = jdFromUTCms(ms) + deltaTdays(year);
    const lambda = solarLongitude(jd);
    let diff = targetDeg - lambda;
    diff = ((diff + 540) % 360) - 180; // -180~+180 정규화
    if (Math.abs(diff) < 1e-7) break;
    ms += (diff / dLdt) * 86400000;
  }
  return ms;
}

/** 해당 연도 입춘(황경 315°) 시각, UTC epoch ms */
export function ipchunUTCms(year: number): number {
  return solarTermUTCms(year, 315, 2, 4);
}

// ━━━ 시간대 보정 (Asia/Seoul 역사적 오프셋) ━━━

const seoulFmt =
  typeof Intl !== "undefined"
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : null;

/** 특정 UTC 순간의 서울 법정시 오프셋 (분). 서머타임 +600, UTC+8:30 시대 +510 등 */
function seoulOffsetMinutes(utcMs: number): number {
  if (!seoulFmt) return 540; // Intl 미지원 환경 폴백: UTC+9 고정
  const parts = seoulFmt.formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  let hour = get("hour");
  if (hour === 24) hour = 0;
  const asUTC = Date.UTC(get("year"), get("month") - 1, get("day"), hour, get("minute"), get("second"));
  return Math.round((asUTC - utcMs) / 60000);
}

/**
 * 출생 당시 벽시계(법정시) 기준 날짜/시각 → UTC epoch ms
 * 출생 기록은 당시 법정시(서머타임 포함) 기준이므로 역사적 오프셋으로 역산한다.
 */
export function wallClockSeoulToUTCms(
  y: number,
  m: number,
  d: number,
  hour: number,
  minute: number
): number {
  let guess = Date.UTC(y, m - 1, d, hour, minute) - 540 * 60000; // UTC+9 가정으로 시작
  for (let i = 0; i < 3; i++) {
    const off = seoulOffsetMinutes(guess);
    guess = Date.UTC(y, m - 1, d, hour, minute) - off * 60000;
  }
  return guess;
}

// ━━━ 사주 기둥 계산 ━━━

/** 일주 60갑자 인덱스 (0=甲子). 앵커: 2000-01-01 = 戊午(54), 1900-01-01 = 甲戌(10) */
export function dayGanjiIndex(y: number, m: number, d: number): number {
  return (((jdn(y, m, d) + 49) % 60) + 60) % 60;
}

function pillarFromIndex(sexagenaryIdx: number): Pillar {
  const s = sexagenaryIdx % 10;
  const b = sexagenaryIdx % 12;
  return { stem: STEMS[s], branch: BRANCHES[b], stemIdx: s, branchIdx: b };
}

function pillarFromStemBranch(stemIdx: number, branchIdx: number): Pillar {
  return { stem: STEMS[stemIdx], branch: BRANCHES[branchIdx], stemIdx, branchIdx };
}

/** 오호둔월(五虎遁月): 연간 → 寅월의 천간 인덱스 */
const MONTH_STEM_START: Record<number, number> = {
  0: 2, 5: 2, // 甲己 → 丙寅
  1: 4, 6: 4, // 乙庚 → 戊寅
  2: 6, 7: 6, // 丙辛 → 庚寅
  3: 8, 8: 8, // 丁壬 → 壬寅
  4: 0, 9: 0, // 戊癸 → 甲寅
};

/** 시두법(五子元遁): 일간 → 子시의 천간 인덱스 */
const HOUR_STEM_START: Record<number, number> = {
  0: 0, 5: 0, // 甲己 → 甲子
  1: 2, 6: 2, // 乙庚 → 丙子
  2: 4, 7: 4, // 丙辛 → 戊子
  3: 6, 8: 6, // 丁壬 → 庚子
  4: 8, 9: 8, // 戊癸 → 壬子
};

/**
 * 사주 사기둥 계산.
 * @param hour 0~23 (출생 당시 벽시계 기준 시). 미제공 시 정오로 간주(연/월주 절기 판정용), 시주는 생략
 * @param minute 0~59 (기본 0)
 */
export function getFourPillars(
  y: number,
  m: number,
  d: number,
  hour?: number,
  minute: number = 0
): FourPillars {
  const hasHour = hour !== undefined && hour >= 0 && hour <= 23;
  const h = hasHour ? hour : 12;
  const min = hasHour ? minute : 0;

  // 1) 벽시계 → UTC → 표준시(KST, UTC+9)로 정규화 (서머타임/8:30 시대 자동 보정)
  const utcMs = wallClockSeoulToUTCms(y, m, d, h, min);
  const kstMs = utcMs + 540 * 60000;
  const kst = new Date(kstMs);
  const ky = kst.getUTCFullYear();
  const km = kst.getUTCMonth() + 1;
  const kd = kst.getUTCDate();
  const kh = kst.getUTCHours();
  const kmin = kst.getUTCMinutes();

  // 2) 일주 — 23시 이후 출생은 다음 날 일주 (자시일변)
  let dayY = ky, dayM = km, dayD = kd;
  if (hasHour && kh === 23) {
    const next = new Date(Date.UTC(ky, km - 1, kd) + 86400000);
    dayY = next.getUTCFullYear();
    dayM = next.getUTCMonth() + 1;
    dayD = next.getUTCDate();
  }
  const dayIdx = dayGanjiIndex(dayY, dayM, dayD);
  const dayPillar = pillarFromIndex(dayIdx);

  // 3) 연주 — 입춘 기준
  const sajuYear = utcMs >= ipchunUTCms(ky) ? ky : ky - 1;
  const yearStem = (((sajuYear - 4) % 10) + 10) % 10;
  const yearBranch = (((sajuYear - 4) % 12) + 12) % 12;
  const yearPillar = pillarFromStemBranch(yearStem, yearBranch);

  // 4) 월주 — 출생 순간의 태양 황경으로 절기 월 결정 (입춘 315°=寅월)
  const lambda = solarLongitude(jdFromUTCms(utcMs) + deltaTdays(ky));
  const monthIdx0 = Math.floor((((lambda - 315) % 360) + 360) % 360 / 30); // 0=寅 … 11=丑
  const monthStem = (MONTH_STEM_START[yearStem] + monthIdx0) % 10;
  const monthBranch = (2 + monthIdx0) % 12;
  const monthPillar = pillarFromStemBranch(monthStem, monthBranch);

  // 5) 시주 — 시두법 (일주가 이미 자시일변 반영된 상태)
  let hourPillar: Pillar | undefined;
  if (hasHour) {
    const minutesOfDay = kh * 60 + kmin;
    const hourBranchIdx = Math.floor(((minutesOfDay + 60) % 1440) / 120); // 23:00~00:59 = 子
    const hourStemIdx = (HOUR_STEM_START[dayIdx % 10] + hourBranchIdx) % 10;
    hourPillar = pillarFromStemBranch(hourStemIdx, hourBranchIdx);
  }

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    sajuYear,
    correctedMinutes: hasHour ? kh * 60 + kmin : undefined,
  };
}
