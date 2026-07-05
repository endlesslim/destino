// scripts/verify-manseryeok.ts
// 만세력 엔진 검증 스위트 — `npx tsx scripts/verify-manseryeok.ts`
//
// 1. 일주: 1900-01-01 ~ 2050-12-31 전 날짜를 korean-lunar-calendar와 대조 (100% 일치 기대)
// 2. 절기 시각: KASI 공표 입춘 시각과 대조 (±15분 허용)
// 3. 입춘 경계: 절입 직전/직후 연주·월주 전환 확인
// 4. 시주: 시두법 매핑, 23시 자시일변, 1988 서머타임 보정
// 5. 회귀: 기존 코드 주석의 검증 케이스 재확인

import KoreanLunarCalendar from "korean-lunar-calendar";
import {
  getFourPillars,
  dayGanjiIndex,
  ipchunUTCms,
  solarTermUTCms,
  STEMS,
  BRANCHES,
} from "../lib/manseryeok";

let pass = 0;
let fail = 0;
const failures: string[] = [];

function check(name: string, cond: boolean | undefined, detail?: string) {
  if (cond) {
    pass++;
  } else {
    fail++;
    failures.push(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function ganji(idx: number): string {
  return STEMS[idx % 10] + BRANCHES[idx % 12];
}

function fmtKST(utcMs: number): string {
  return new Date(utcMs + 9 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 16) + " KST";
}

// ━━━ 1. 일주 전수 대조 (1900~2050) ━━━
{
  let mismatch = 0;
  let total = 0;
  const first: string[] = [];
  const cal = new KoreanLunarCalendar();
  const d = new Date(Date.UTC(1900, 0, 1));
  const end = Date.UTC(2050, 11, 31);
  while (d.getTime() <= end) {
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    cal.setSolarDate(y, m, day);
    const libDay = cal.getChineseGapja().day; // e.g. "戊午日"
    const mine = ganji(dayGanjiIndex(y, m, day));
    total++;
    if (libDay.slice(0, 2) !== mine) {
      mismatch++;
      if (first.length < 5) first.push(`${y}-${m}-${day}: lib=${libDay} mine=${mine}`);
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  check(
    `일주 전수 대조 1900~2050 (${total}일)`,
    mismatch === 0,
    `${mismatch}건 불일치: ${first.join(", ")}`
  );
  console.log(`[1] 일주 대조: ${total}일 중 불일치 ${mismatch}건`);
}

// ━━━ 2. 절기 시각 vs KASI 공표값 ━━━
{
  // KASI(한국천문연구원) 공표 입춘 절입시각
  const anchors: Array<[number, string]> = [
    [2024, "2024-02-04 17:27"],
    [2025, "2025-02-03 23:10"],
    [2026, "2026-02-04 05:02"],
  ];
  for (const [year, kstStr] of anchors) {
    const expectedUTC = new Date(kstStr.replace(" ", "T") + ":00+09:00").getTime();
    const gotUTC = ipchunUTCms(year);
    const diffMin = Math.abs(gotUTC - expectedUTC) / 60000;
    check(
      `입춘 ${year} 시각 (KASI ${kstStr})`,
      diffMin <= 15,
      `계산값 ${fmtKST(gotUTC)}, 오차 ${diffMin.toFixed(1)}분`
    );
    console.log(`[2] 입춘 ${year}: 계산 ${fmtKST(gotUTC)} / KASI ${kstStr} / 오차 ${diffMin.toFixed(1)}분`);
  }
  // 천문학적 앵커 (분점/지점, UTC 기준 공표값)
  const astro: Array<[string, number, number, number, string]> = [
    // [이름, 연도, 황경, 근사월일 표현용, 기대 UTC ISO]
    ["춘분 2024", 2024, 0, 3, "2024-03-20T03:06:00Z"],
    ["동지 2024", 2024, 270, 12, "2024-12-21T09:21:00Z"],
  ];
  for (const [name, year, deg, approxM, iso] of astro) {
    const expected = new Date(iso).getTime();
    const got = solarTermUTCms(year, deg, approxM, deg === 0 ? 20 : 21);
    const diffMin = Math.abs(got - expected) / 60000;
    check(`${name} (천문값 ${iso})`, diffMin <= 15, `오차 ${diffMin.toFixed(1)}분`);
    console.log(`[2] ${name}: 오차 ${diffMin.toFixed(1)}분`);
  }
}

// ━━━ 3. 입춘 경계 — 연주/월주 전환 ━━━
{
  // 2024 입춘 17:27 KST: 2/4 17:00 출생 → 癸卯년 乙丑월, 2/4 18:00 출생 → 甲辰년 丙寅월
  const before = getFourPillars(2024, 2, 4, 17);
  const after = getFourPillars(2024, 2, 4, 18);
  check("입춘 직전(2024-02-04 17시) 연주 = 癸卯", before.year.stem + before.year.branch === "癸卯",
    `got ${before.year.stem}${before.year.branch}`);
  check("입춘 직전 월주 = 乙丑", before.month.stem + before.month.branch === "乙丑",
    `got ${before.month.stem}${before.month.branch}`);
  check("입춘 직후(2024-02-04 18시) 연주 = 甲辰", after.year.stem + after.year.branch === "甲辰",
    `got ${after.year.stem}${after.year.branch}`);
  check("입춘 직후 월주 = 丙寅", after.month.stem + after.month.branch === "丙寅",
    `got ${after.month.stem}${after.month.branch}`);

  // 설날~입춘 사이 (구 라이브러리가 틀리던 구간): 1990-01-28 (설날 1/27, 입춘 2/4)
  // → 사주 연주는 여전히 전년도 己巳여야 함
  const gap = getFourPillars(1990, 1, 28, 12);
  check("설날~입춘 사이(1990-01-28) 연주 = 己巳(1989)", gap.year.stem + gap.year.branch === "己巳" && gap.sajuYear === 1989,
    `got ${gap.year.stem}${gap.year.branch} sajuYear=${gap.sajuYear}`);
  console.log(`[3] 입춘 경계: 17시 ${before.year.stem}${before.year.branch}/${before.month.stem}${before.month.branch} → 18시 ${after.year.stem}${after.year.branch}/${after.month.stem}${after.month.branch}, 1990-01-28 → ${gap.year.stem}${gap.year.branch}`);
}

// ━━━ 4. 시주 — 시두법·자시일변·서머타임 ━━━
{
  // 시두법: 甲子일 子시 = 甲子시. 2024-02-04는? 일주 확인 후 채택.
  // 고정 케이스: 2000-01-01(戊午일) 12시 → 午시, 戊癸일 → 子시=壬子 → 午시 stem = 壬+6 = 戊午시
  const noon = getFourPillars(2000, 1, 1, 12);
  check("2000-01-01 일주 = 戊午", noon.day.stem + noon.day.branch === "戊午",
    `got ${noon.day.stem}${noon.day.branch}`);
  check("2000-01-01 12시 시주 = 戊午", noon.hour && noon.hour.stem + noon.hour.branch === "戊午",
    `got ${noon.hour?.stem}${noon.hour?.branch}`);

  // 자시일변: 2000-01-01 23시 출생 → 일주는 다음 날 己未, 시주는 己未일 기준 子시(甲子... 己일 → 甲子시)
  const night = getFourPillars(2000, 1, 1, 23);
  check("2000-01-01 23시 → 일주 익일 己未", night.day.stem + night.day.branch === "己未",
    `got ${night.day.stem}${night.day.branch}`);
  check("2000-01-01 23시 → 시주 甲子", night.hour && night.hour.stem + night.hour.branch === "甲子",
    `got ${night.hour?.stem}${night.hour?.branch}`);

  // 00시 출생은 당일 일주 유지 + 子시
  const midnight = getFourPillars(2000, 1, 2, 0);
  check("2000-01-02 00시 → 일주 당일 己未 + 子시",
    midnight.day.stem + midnight.day.branch === "己未" && midnight.hour?.branch === "子",
    `got ${midnight.day.stem}${midnight.day.branch} ${midnight.hour?.branch}시`);

  // 서머타임: 1988-08-15는 DST(UTC+10). 벽시계 15시 = 표준시 14시 → 未시(13~15시)여야 함
  const dst = getFourPillars(1988, 8, 15, 15);
  check("1988-08-15 15시(서머타임) → 시지 未 (보정 후 14시)", dst.hour?.branch === "未",
    `got ${dst.hour?.branch}, correctedMinutes=${dst.correctedMinutes}`);

  // 비교: 서머타임 아닌 1989-08-15 15시 → 申시
  const noDst = getFourPillars(1989, 8, 15, 15);
  check("1989-08-15 15시(서머타임 없음) → 시지 申", noDst.hour?.branch === "申",
    `got ${noDst.hour?.branch}`);

  // UTC+8:30 시대 + 여름 서머타임 중첩(법정시 +9:30): 1958-06-01 12:00 벽시계 = 표준시 11:30 → 午시
  const era830dst = getFourPillars(1958, 6, 1, 12);
  check("1958-06-01 12시(+8:30 시대·서머타임 중첩) → 시지 午 (보정 후 11:30)",
    era830dst.hour?.branch === "午" && era830dst.correctedMinutes === 11 * 60 + 30,
    `got ${era830dst.hour?.branch}, correctedMinutes=${era830dst.correctedMinutes}`);

  // UTC+8:30 시대 겨울(서머타임 없음): 1958-01-15 12:00 벽시계 = 표준시 12:30 → 午시
  const era830 = getFourPillars(1958, 1, 15, 12);
  check("1958-01-15 12시(UTC+8:30 시대) → 시지 午 (보정 후 12:30)",
    era830.hour?.branch === "午" && era830.correctedMinutes === 12 * 60 + 30,
    `got ${era830.hour?.branch}, correctedMinutes=${era830.correctedMinutes}`);
  console.log(`[4] 시주: 자시일변/서머타임/8:30시대 케이스 완료 (1988 DST corrected=${dst.correctedMinutes}분, 1958 corrected=${era830.correctedMinutes}분)`);
}

// ━━━ 5. 회귀 케이스 (구 주석의 검증값 중 경계와 무관해 여전히 유효한 것) ━━━
{
  // 1990-01-15: 입춘 전 → 己巳년, 소한~입춘 사이 → 丑월(丁丑), 일주 庚辰
  const a = getFourPillars(1990, 1, 15, 12);
  check("1990-01-15 = 己巳년 丁丑월 庚辰일",
    a.year.stem + a.year.branch === "己巳" && a.month.stem + a.month.branch === "丁丑" && a.day.stem + a.day.branch === "庚辰",
    `got ${a.year.stem}${a.year.branch} ${a.month.stem}${a.month.branch} ${a.day.stem}${a.day.branch}`);

  // 1995-07-22: 소서(7/7)~입추(8/8) 사이 → 未월. 乙亥년 癸未월 甲寅일
  const b = getFourPillars(1995, 7, 22, 12);
  check("1995-07-22 = 乙亥년 癸未월 甲寅일",
    b.year.stem + b.year.branch === "乙亥" && b.month.stem + b.month.branch === "癸未" && b.day.stem + b.day.branch === "甲寅",
    `got ${b.year.stem}${b.year.branch} ${b.month.stem}${b.month.branch} ${b.day.stem}${b.day.branch}`);

  // 2000-01-01: 己卯년 丙子월 戊午일 (입춘 전 → 1999년 간지, 대설~소한 → 子월)
  const c = getFourPillars(2000, 1, 1, 12);
  check("2000-01-01 = 己卯년 丙子월 戊午일",
    c.year.stem + c.year.branch === "己卯" && c.month.stem + c.month.branch === "丙子" && c.day.stem + c.day.branch === "戊午",
    `got ${c.year.stem}${c.year.branch} ${c.month.stem}${c.month.branch} ${c.day.stem}${c.day.branch}`);
  console.log(`[5] 회귀 케이스 완료`);
}

// ━━━ 결과 ━━━
console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`PASS ${pass} / FAIL ${fail}`);
if (failures.length) {
  console.log(failures.join("\n"));
  process.exit(1);
} else {
  console.log("모든 검증 통과 ✓");
}
