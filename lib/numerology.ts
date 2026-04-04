// src/lib/numerology.ts
// 수비학 계산 엔진 — 생명경로수 + 이름 분석

export interface LifePathInfo {
  number: number;
  name: string;
  personality: string;
  strength: string[];
  shadow: string[];
  is_master: boolean;
}

export const LIFE_PATH_DATA: Record<number, LifePathInfo> = {
  1: { number:1, name:"리더·개척자",
    personality:"독립적이고 창의적인 선구자. 새로운 길을 만드는 사람.",
    strength:["독립성","창의성","결단력","자기확신"],
    shadow:["고집","외로움","지배욕"], is_master:false },
  2: { number:2, name:"조화·협력자",
    personality:"관계와 균형의 달인. 보이지 않는 곳에서 모든 것을 연결한다.",
    strength:["외교력","공감","인내","직관"],
    shadow:["의존성","우유부단","과민"], is_master:false },
  3: { number:3, name:"표현·창작자",
    personality:"말과 예술로 세상을 물들이는 사람. 창조적 에너지가 넘친다.",
    strength:["표현력","낙관","사교성","창의성"],
    shadow:["산만함","과시","감정기복"], is_master:false },
  4: { number:4, name:"안정·건축가",
    personality:"체계와 질서를 세우는 건축가. 천천히 하지만 반드시 완성한다.",
    strength:["체계","인내","실용","성실"],
    shadow:["고지식","완고함","과로"], is_master:false },
  5: { number:5, name:"자유·모험가",
    personality:"변화와 경험을 갈망하는 모험가. 한 곳에 머물지 않는다.",
    strength:["적응력","호기심","자유","다재다능"],
    shadow:["충동","불안정","중독성"], is_master:false },
  6: { number:6, name:"책임·양육자",
    personality:"가정과 공동체를 돌보는 양육자. 아름다움과 조화를 추구한다.",
    strength:["책임감","헌신","심미안","치유"],
    shadow:["간섭","희생양","완벽주의"], is_master:false },
  7: { number:7, name:"탐구·분석가",
    personality:"진리를 추구하는 탐구자. 표면 너머를 파고드는 분석의 눈.",
    strength:["분석력","직관","집중","영성"],
    shadow:["고립","의심","냉소"], is_master:false },
  8: { number:8, name:"권력·성취자",
    personality:"물질과 정신의 균형을 이루는 성취자. 큰 것을 만들어낸다.",
    strength:["실행력","비전","조직력","리더십"],
    shadow:["물질집착","지배욕","무자비"], is_master:false },
  9: { number:9, name:"완성·봉사자",
    personality:"모든 숫자를 품은 완성의 수. 세상에 환원하는 봉사자.",
    strength:["관대함","지혜","이상주의","포용"],
    shadow:["자기부정","감정적","비현실적"], is_master:false },
  11: { number:11, name:"영감·선각자",
    personality:"높은 직관과 영감을 가진 마스터 넘버. 빛과 그림자를 동시에 안다.",
    strength:["영감","직관","카리스마","비전"],
    shadow:["불안","자기의심","극단"], is_master:true },
  22: { number:22, name:"거장·대건축가",
    personality:"가장 큰 꿈을 현실로 만드는 마스터 넘버. 세대를 바꾸는 비전.",
    strength:["거시적 비전","실현력","영향력","끈기"],
    shadow:["과대망상","통제욕","번아웃"], is_master:true },
  33: { number:33, name:"치유·대스승",
    personality:"무조건적 사랑과 치유의 마스터 넘버. 가장 드문 경로수.",
    strength:["무조건적 사랑","치유","영적 리더십","헌신"],
    shadow:["순교자","자기희생","현실부적응"], is_master:true },
};

// ━━━ 계산 함수 ━━━

/** 생명경로수 (Life Path Number) 계산 */
export function calcLifePath(year: number, month: number, day: number): number {
  const digits = `${year}${String(month).padStart(2,"0")}${String(day).padStart(2,"0")}`;
  let sum = digits.split("").reduce((a, b) => a + parseInt(b), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split("").reduce((a, b) => a + parseInt(b), 0);
  }
  return sum;
}

/** 이름 → 운명수 (Destiny Number) 계산 */
const LETTER_VALUES: Record<string, number> = {
  a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,
  j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,
  s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8
};

export function calcDestinyNumber(name: string): number {
  const letters = name.toLowerCase().replace(/[^a-z]/g, "");
  if (!letters) return 0;
  let sum = letters.split("").reduce((a, c) => a + (LETTER_VALUES[c] || 0), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split("").reduce((a, b) => a + parseInt(b), 0);
  }
  return sum;
}

/** 생명경로수 → 사주 천간 대응 */
export const LIFEPATH_TO_CHEONGAN: Record<number, string> = {
  1: "甲",  // 시작, 리더 → 갑목
  2: "己",  // 조화, 협력 → 기토
  3: "丙",  // 표현, 열정 → 병화
  4: "戊",  // 안정, 체계 → 무토
  5: "壬",  // 자유, 변화 → 임수
  6: "己",  // 양육, 책임 → 기토
  7: "辛",  // 분석, 탐구 → 신금
  8: "庚",  // 권력, 성취 → 경금
  9: "癸",  // 완성, 봉사 → 계수
  11: "丁", // 영감, 직관 → 정화
  22: "甲", // 거장, 건설 → 갑목
  33: "乙", // 치유, 사랑 → 을목
};

// ━━━ 결과 타입 ━━━
export interface NumerologyResult {
  lifePath: number;
  lifePathInfo: LifePathInfo;
  destinyNumber?: number;
  destinyInfo?: LifePathInfo;
}

export function analyzeNumerology(
  year: number, month: number, day: number,
  name?: string
): NumerologyResult {
  const lp = calcLifePath(year, month, day);
  const result: NumerologyResult = {
    lifePath: lp,
    lifePathInfo: LIFE_PATH_DATA[lp] || LIFE_PATH_DATA[9],
  };

  if (name) {
    const dn = calcDestinyNumber(name);
    if (dn > 0) {
      result.destinyNumber = dn;
      result.destinyInfo = LIFE_PATH_DATA[dn] || LIFE_PATH_DATA[9];
    }
  }

  return result;
}
