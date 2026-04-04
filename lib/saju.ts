// src/lib/saju.ts
// 사주 계산 엔진 — 연주(年柱) 기반 + 간이 일주(日柱) 추정

// ━━━ 천간 (天干) ━━━
export const CHEONGAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"] as const;
export type Cheongan = typeof CHEONGAN[number];

export const CHEONGAN_INFO: Record<Cheongan, {
  kr: string; nature: string; ohang: Ohang; yin_yang: "양" | "음";
  personality: string; trait: string[]; mbti_similar: string[];
  image: string;
}> = {
  "甲": { kr:"갑목", nature:"큰 나무", ohang:"木", yin_yang:"양",
    personality:"곧은 추진력의 리더. 한번 방향을 잡으면 꺾이지 않는다.",
    trait:["리더십","추진력","정직함","고집"], mbti_similar:["ENTJ","ESTJ"],
    image:"하늘을 향해 곧게 뻗은 소나무" },
  "乙": { kr:"을목", nature:"풀과 덩굴", ohang:"木", yin_yang:"음",
    personality:"유연하게 적응하는 관계의 달인. 어디든 스며들어 자란다.",
    trait:["유연함","적응력","외교력","의존성"], mbti_similar:["ENFP","INFP"],
    image:"담장을 타고 오르는 담쟁이덩굴" },
  "丙": { kr:"병화", nature:"태양", ohang:"火", yin_yang:"양",
    personality:"들어가면 분위기가 바뀌는 존재감. 에너지가 밖으로 터진다.",
    trait:["열정","활력","존재감","성급함"], mbti_similar:["ENFJ","ESFP"],
    image:"한낮의 태양" },
  "丁": { kr:"정화", nature:"촛불", ohang:"火", yin_yang:"음",
    personality:"조용히 주변을 밝히는 따뜻함. 섬세하고 통찰력이 깊다.",
    trait:["섬세함","통찰력","따뜻함","예민함"], mbti_similar:["INFJ","ISFJ"],
    image:"어둠 속 촛불 하나" },
  "戊": { kr:"무토", nature:"산", ohang:"土", yin_yang:"양",
    personality:"움직이지 않는 신뢰의 중심. 묵직하고 흔들리지 않는다.",
    trait:["안정감","신뢰","포용력","고지식"], mbti_similar:["ISTJ","ESTJ"],
    image:"구름 위로 솟은 산봉우리" },
  "己": { kr:"기토", nature:"들판", ohang:"土", yin_yang:"음",
    personality:"모든 것을 품는 대지. 현실적이고 양육하는 성격.",
    trait:["포용력","현실감각","양육","우유부단"], mbti_similar:["ISFJ","ESFJ"],
    image:"곡식이 자라는 너른 들판" },
  "庚": { kr:"경금", nature:"쇠·칼날", ohang:"金", yin_yang:"양",
    personality:"한 번에 잘라내는 결단력. 정의감이 강하고 날카롭다.",
    trait:["결단력","정의감","날카로움","무뚝뚝"], mbti_similar:["ENTJ","ISTP"],
    image:"대장간에서 벼려진 칼날" },
  "辛": { kr:"신금", nature:"보석", ohang:"金", yin_yang:"음",
    personality:"다듬어진 아름다움과 예민한 감각. 완벽주의 성향.",
    trait:["예민함","완벽주의","심미안","까다로움"], mbti_similar:["INTJ","INFJ"],
    image:"빛을 받아 빛나는 보석" },
  "壬": { kr:"임수", nature:"바다", ohang:"水", yin_yang:"양",
    personality:"어디든 흘러가는 자유로움. 큰 그릇에 지혜를 담는다.",
    trait:["자유","지혜","포용","방향상실"], mbti_similar:["ENTP","ESTP"],
    image:"끝없이 펼쳐진 바다" },
  "癸": { kr:"계수", nature:"빗물", ohang:"水", yin_yang:"음",
    personality:"조용히 스며드는 직관의 힘. 감성이 깊고 끈질기다.",
    trait:["직관","감성","끈기","우울"], mbti_similar:["INFP","INFJ"],
    image:"바위를 뚫는 빗물 한 방울" },
};

// ━━━ 지지 (地支) ━━━
export const JIJI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"] as const;
export type Jiji = typeof JIJI[number];

export const JIJI_INFO: Record<Jiji, {
  kr: string; animal: string; animal_kr: string; ohang: Ohang; time: string;
}> = {
  "子": { kr:"자", animal:"🐀", animal_kr:"쥐",    ohang:"水", time:"23~01시" },
  "丑": { kr:"축", animal:"🐂", animal_kr:"소",    ohang:"土", time:"01~03시" },
  "寅": { kr:"인", animal:"🐅", animal_kr:"호랑이", ohang:"木", time:"03~05시" },
  "卯": { kr:"묘", animal:"🐇", animal_kr:"토끼",  ohang:"木", time:"05~07시" },
  "辰": { kr:"진", animal:"🐉", animal_kr:"용",    ohang:"土", time:"07~09시" },
  "巳": { kr:"사", animal:"🐍", animal_kr:"뱀",    ohang:"火", time:"09~11시" },
  "午": { kr:"오", animal:"🐴", animal_kr:"말",    ohang:"火", time:"11~13시" },
  "未": { kr:"미", animal:"🐑", animal_kr:"양",    ohang:"土", time:"13~15시" },
  "申": { kr:"신", animal:"🐵", animal_kr:"원숭이", ohang:"金", time:"15~17시" },
  "酉": { kr:"유", animal:"🐔", animal_kr:"닭",    ohang:"金", time:"17~19시" },
  "戌": { kr:"술", animal:"🐶", animal_kr:"개",    ohang:"土", time:"19~21시" },
  "亥": { kr:"해", animal:"🐷", animal_kr:"돼지",  ohang:"水", time:"21~23시" },
};

// ━━━ 오행 (五行) ━━━
export const OHANG_LIST = ["木","火","土","金","水"] as const;
export type Ohang = typeof OHANG_LIST[number];

export const OHANG_INFO: Record<Ohang, {
  kr: string; en: string; color: string; season: string;
  direction: string; emotion: string; organ: string;
}> = {
  "木": { kr:"나무", en:"Wood",  color:"#2D5A27", season:"봄",   direction:"동", emotion:"분노", organ:"간" },
  "火": { kr:"불",   en:"Fire",  color:"#C53D43", season:"여름", direction:"남", emotion:"기쁨", organ:"심장" },
  "土": { kr:"흙",   en:"Earth", color:"#8B6914", season:"환절기", direction:"중앙", emotion:"사려", organ:"비장" },
  "金": { kr:"쇠",   en:"Metal", color:"#6B6B6B", season:"가을", direction:"서", emotion:"슬픔", organ:"폐" },
  "水": { kr:"물",   en:"Water", color:"#1E3A5F", season:"겨울", direction:"북", emotion:"공포", organ:"신장" },
};

// 상생 관계
export const SANGSAENG: Record<Ohang, Ohang> = {
  "木":"火", "火":"土", "土":"金", "金":"水", "水":"木"
};

// 상극 관계
export const SANGGEUK: Record<Ohang, Ohang> = {
  "木":"土", "火":"金", "土":"水", "金":"木", "水":"火"
};

// ━━━ 계산 함수 ━━━

/** 연주 (年柱) 천간 계산 */
export function getYearCheongan(year: number): Cheongan {
  return CHEONGAN[(year - 4) % 10];
}

/** 연주 (年柱) 지지 계산 */
export function getYearJiji(year: number): Jiji {
  return JIJI[(year - 4) % 12];
}

/** 연주 오행 */
export function getYearOhang(year: number): Ohang {
  const cgIdx = (year - 4) % 10;
  return OHANG_LIST[Math.floor(cgIdx / 2)];
}

/** 간이 일주 (日柱) 추정 — 정확한 만세력 대체용 */
export function estimateDayCheongan(year: number, month: number, day: number): Cheongan {
  // 기준일: 1900년 1월 1일 = 甲子일 (갑자일)
  // 이후 60일 주기로 순환
  const base = new Date(1900, 0, 1);
  const target = new Date(year, month - 1, day);
  const diffDays = Math.floor((target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
  // 1900.1.1은 甲(0)子(0)일
  const cgIdx = ((diffDays % 10) + 10) % 10;
  return CHEONGAN[cgIdx];
}

export function estimateDayJiji(year: number, month: number, day: number): Jiji {
  const base = new Date(1900, 0, 1);
  const target = new Date(year, month - 1, day);
  const diffDays = Math.floor((target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
  const jjIdx = ((diffDays % 12) + 12) % 12;
  return JIJI[jjIdx];
}

/** 월주 천간 추정 (연간 기준 오호연원법) */
export function getMonthCheongan(yearCheongan: Cheongan, lunarMonth: number): Cheongan {
  const ycIdx = CHEONGAN.indexOf(yearCheongan);
  // 갑기년 → 병인월 시작 (인덱스 2)
  const startMap: Record<number, number> = {
    0: 2, 5: 2,  // 甲己 → 丙
    1: 4, 6: 4,  // 乙庚 → 戊
    2: 6, 7: 6,  // 丙辛 → 庚
    3: 8, 8: 8,  // 丁壬 → 壬
    4: 0, 9: 0,  // 戊癸 → 甲
  };
  const startIdx = startMap[ycIdx] ?? 0;
  return CHEONGAN[(startIdx + (lunarMonth - 1)) % 10];
}

// ━━━ 결과 타입 ━━━
export interface SajuResult {
  year: { cheongan: Cheongan; jiji: Jiji; ohang: Ohang };
  day: { cheongan: Cheongan; jiji: Jiji; ohang: Ohang };
  personality: typeof CHEONGAN_INFO[Cheongan];
  animal: typeof JIJI_INFO[Jiji];
  ohang_balance: Record<Ohang, number>;
}

/** 사주 종합 분석 */
export function analyzeSaju(year: number, month: number, day: number): SajuResult {
  const yCg = getYearCheongan(year);
  const yJj = getYearJiji(year);
  const yOh = getYearOhang(year);
  const dCg = estimateDayCheongan(year, month, day);
  const dJj = estimateDayJiji(year, month, day);
  const dOh = OHANG_LIST[Math.floor(CHEONGAN.indexOf(dCg) / 2)];

  // 간이 오행 밸런스 (연주 + 일주 기준)
  const balance: Record<Ohang, number> = { "木":0, "火":0, "土":0, "金":0, "水":0 };
  balance[yOh] += 1;
  balance[dOh] += 1;
  balance[JIJI_INFO[yJj].ohang] += 1;
  balance[JIJI_INFO[dJj].ohang] += 1;

  return {
    year: { cheongan: yCg, jiji: yJj, ohang: yOh },
    day: { cheongan: dCg, jiji: dJj, ohang: dOh },
    personality: CHEONGAN_INFO[dCg], // 일간 기준 성격
    animal: JIJI_INFO[yJj],
    ohang_balance: balance,
  };
}
