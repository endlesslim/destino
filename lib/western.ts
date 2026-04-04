// src/lib/western.ts
// 서양 점성술 계산 엔진 — 태양궁(Sun Sign) + 원소 + 모달리티

export const ELEMENTS = ["Fire","Earth","Air","Water"] as const;
export type WesternElement = typeof ELEMENTS[number];

export const MODALITIES = ["Cardinal","Fixed","Mutable"] as const;
export type Modality = typeof MODALITIES[number];

export interface ZodiacSign {
  name: string;
  en: string;
  symbol: string;
  element: WesternElement;
  element_kr: string;
  modality: Modality;
  modality_kr: string;
  ruler: string;
  ruler_kr: string;
  house: number;
  date_range: string;
  trait: string[];
  personality: string;
  color: string;
}

export const ZODIAC: ZodiacSign[] = [
  {
    name:"양자리", en:"Aries", symbol:"♈", element:"Fire", element_kr:"화",
    modality:"Cardinal", modality_kr:"활동궁", ruler:"Mars", ruler_kr:"화성",
    house:1, date_range:"3/21~4/19",
    trait:["용기","주도력","열정","성급함"],
    personality:"시작하는 불. 두려움 없이 돌진하는 개척자.",
    color:"#C53D43"
  },
  {
    name:"황소자리", en:"Taurus", symbol:"♉", element:"Earth", element_kr:"토",
    modality:"Fixed", modality_kr:"고정궁", ruler:"Venus", ruler_kr:"금성",
    house:2, date_range:"4/20~5/20",
    trait:["인내","감각","소유욕","완고함"],
    personality:"뿌리 내린 대지. 한번 잡으면 절대 놓지 않는 끈기.",
    color:"#2D5A27"
  },
  {
    name:"쌍둥이자리", en:"Gemini", symbol:"♊", element:"Air", element_kr:"풍",
    modality:"Mutable", modality_kr:"변통궁", ruler:"Mercury", ruler_kr:"수성",
    house:3, date_range:"5/21~6/20",
    trait:["소통","호기심","다재다능","산만함"],
    personality:"두 개의 마음. 끊임없이 정보를 흡수하고 연결하는 지성.",
    color:"#8B6914"
  },
  {
    name:"게자리", en:"Cancer", symbol:"♋", element:"Water", element_kr:"수",
    modality:"Cardinal", modality_kr:"활동궁", ruler:"Moon", ruler_kr:"달",
    house:4, date_range:"6/21~7/22",
    trait:["양육","보호","감성","방어적"],
    personality:"감정의 바다. 단단한 껍질 안에 가장 부드러운 마음.",
    color:"#1E3A5F"
  },
  {
    name:"사자자리", en:"Leo", symbol:"♌", element:"Fire", element_kr:"화",
    modality:"Fixed", modality_kr:"고정궁", ruler:"Sun", ruler_kr:"태양",
    house:5, date_range:"7/23~8/22",
    trait:["자존감","창의력","관대함","오만함"],
    personality:"빛나는 태양. 무대 위에서 가장 자연스러운 사람.",
    color:"#C53D43"
  },
  {
    name:"처녀자리", en:"Virgo", symbol:"♍", element:"Earth", element_kr:"토",
    modality:"Mutable", modality_kr:"변통궁", ruler:"Mercury", ruler_kr:"수성",
    house:6, date_range:"8/23~9/22",
    trait:["분석력","봉사","완벽주의","비판적"],
    personality:"정밀한 대지. 흐트러진 것을 바로잡는 장인의 눈.",
    color:"#2D5A27"
  },
  {
    name:"천칭자리", en:"Libra", symbol:"♎", element:"Air", element_kr:"풍",
    modality:"Cardinal", modality_kr:"활동궁", ruler:"Venus", ruler_kr:"금성",
    house:7, date_range:"9/23~10/22",
    trait:["조화","공정","매력","우유부단"],
    personality:"균형의 바람. 관계 속에서 자신을 찾는 외교관.",
    color:"#5B3E8A"
  },
  {
    name:"전갈자리", en:"Scorpio", symbol:"♏", element:"Water", element_kr:"수",
    modality:"Fixed", modality_kr:"고정궁", ruler:"Pluto", ruler_kr:"명왕성",
    house:8, date_range:"10/23~11/21",
    trait:["통찰","집념","변환","집착"],
    personality:"심연의 물. 표면 아래에서 모든 것을 꿰뚫는 눈.",
    color:"#1E3A5F"
  },
  {
    name:"사수자리", en:"Sagittarius", symbol:"♐", element:"Fire", element_kr:"화",
    modality:"Mutable", modality_kr:"변통궁", ruler:"Jupiter", ruler_kr:"목성",
    house:9, date_range:"11/22~12/21",
    trait:["자유","탐험","철학","무책임"],
    personality:"퍼져나가는 불. 진실을 찾아 끝없이 달리는 탐험가.",
    color:"#C53D43"
  },
  {
    name:"염소자리", en:"Capricorn", symbol:"♑", element:"Earth", element_kr:"토",
    modality:"Cardinal", modality_kr:"활동궁", ruler:"Saturn", ruler_kr:"토성",
    house:10, date_range:"12/22~1/19",
    trait:["야망","책임감","인내","냉정함"],
    personality:"꼭대기를 향한 대지. 천천히, 하지만 반드시 올라간다.",
    color:"#2D5A27"
  },
  {
    name:"물병자리", en:"Aquarius", symbol:"♒", element:"Air", element_kr:"풍",
    modality:"Fixed", modality_kr:"고정궁", ruler:"Uranus", ruler_kr:"천왕성",
    house:11, date_range:"1/20~2/18",
    trait:["혁신","독립","인도주의","냉담"],
    personality:"자유로운 바람. 시대를 앞서가는 고독한 혁명가.",
    color:"#1A4A4A"
  },
  {
    name:"물고기자리", en:"Pisces", symbol:"♓", element:"Water", element_kr:"수",
    modality:"Mutable", modality_kr:"변통궁", ruler:"Neptune", ruler_kr:"해왕성",
    house:12, date_range:"2/19~3/20",
    trait:["공감","직관","예술성","도피"],
    personality:"경계 없는 물. 모든 감정을 흡수하는 우주적 공감.",
    color:"#5B3E8A"
  },
];

// ━━━ 계산 함수 ━━━

/** 태양궁(Sun Sign) 계산 */
export function getSunSign(month: number, day: number): ZodiacSign {
  const dateRanges: [number, number, number][] = [
    // [startMonth, startDay, zodiacIndex]
    [1, 20, 10],  // 물병 Aquarius
    [2, 19, 11],  // 물고기 Pisces
    [3, 21, 0],   // 양자리 Aries
    [4, 20, 1],   // 황소 Taurus
    [5, 21, 2],   // 쌍둥이 Gemini
    [6, 21, 3],   // 게 Cancer
    [7, 23, 4],   // 사자 Leo
    [8, 23, 5],   // 처녀 Virgo
    [9, 23, 6],   // 천칭 Libra
    [10, 23, 7],  // 전갈 Scorpio
    [11, 22, 8],  // 사수 Sagittarius
    [12, 22, 9],  // 염소 Capricorn
  ];

  let signIdx = 9; // default: Capricorn (12/22~1/19)
  for (const [sm, sd, idx] of dateRanges) {
    if (month === sm && day >= sd) signIdx = idx;
    else if (month === sm + 1 && day < dateRanges[dateRanges.indexOf([sm,sd,idx]) + 1]?.[1]) signIdx = idx;
  }

  // 더 정확한 방법
  const md = month * 100 + day;
  if (md >= 321 && md <= 419) signIdx = 0;
  else if (md >= 420 && md <= 520) signIdx = 1;
  else if (md >= 521 && md <= 620) signIdx = 2;
  else if (md >= 621 && md <= 722) signIdx = 3;
  else if (md >= 723 && md <= 822) signIdx = 4;
  else if (md >= 823 && md <= 922) signIdx = 5;
  else if (md >= 923 && md <= 1022) signIdx = 6;
  else if (md >= 1023 && md <= 1121) signIdx = 7;
  else if (md >= 1122 && md <= 1221) signIdx = 8;
  else if (md >= 1222 || md <= 119) signIdx = 9;
  else if (md >= 120 && md <= 218) signIdx = 10;
  else if (md >= 219 && md <= 320) signIdx = 11;

  return ZODIAC[signIdx];
}

/** 원소 한글명 */
export const ELEMENT_KR: Record<WesternElement, string> = {
  Fire: "화(불)", Earth: "토(흙)", Air: "풍(바람)", Water: "수(물)"
};

/** 서양 원소 → 사주 오행 대응표 */
export const ELEMENT_TO_OHANG: Record<WesternElement, string[]> = {
  Fire: ["火","木"],     // 불 + 나무 (나무는 불을 생함)
  Earth: ["土","金"],    // 흙 + 쇠
  Air: ["木","水"],      // 바람 ≈ 나무(성장) + 물(흐름)
  Water: ["水","金"],    // 물 + 쇠 (쇠는 물을 생함)
};

// ━━━ 결과 타입 ━━━
export interface WesternResult {
  sunSign: ZodiacSign;
  element: WesternElement;
  modality: Modality;
}

export function analyzeWestern(month: number, day: number): WesternResult {
  const sign = getSunSign(month, day);
  return {
    sunSign: sign,
    element: sign.element,
    modality: sign.modality,
  };
}
