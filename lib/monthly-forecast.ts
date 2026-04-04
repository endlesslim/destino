// lib/monthly-forecast.ts
// 올해 월별 운세 — 생년월일 기반 결정론적 12개월 예측

import { analyzeSaju, type Ohang, OHANG_LIST, OHANG_INFO, SANGSAENG, SANGGEUK } from "./saju";
import { calcLifePath, LIFE_PATH_DATA } from "./numerology";

// ━━━ 타입 ━━━

export interface MonthlyForecast {
  year: number;
  months: {
    month: number;
    label: string;
    keyword: string;
    score: number;
    description: string;
    advice: string;
    luckyDay: number;
    category: {
      career: number;
      love: number;
      health: number;
      wealth: number;
    };
  }[];
  bestMonth: number;
  cautionMonth: number;
  yearSummary: string;
}

// ━━━ 키워드 풀 ━━━

const KEYWORDS = [
  "변화", "안정", "도전", "성장", "수확", "정리",
  "시작", "전환", "충전", "결실", "준비", "완성",
] as const;

// ━━━ 월별 오행 에너지 (음력 기반 계절 흐름) ━━━

const MONTH_OHANG: Ohang[] = [
  "土", // 1월 — 겨울→봄 환절기
  "木", // 2월 — 봄 시작 (입춘)
  "木", // 3월 — 봄
  "火", // 4월 — 늦봄→초여름
  "火", // 5월 — 여름
  "土", // 6월 — 여름→가을 환절기
  "金", // 7월 — 가을 시작
  "金", // 8월 — 가을
  "水", // 9월 — 늦가을→초겨울
  "水", // 10월 — 겨울
  "土", // 11월 — 겨울 환절기
  "木", // 12월 — 봄 준비
];

// ━━━ 시드 기반 결정론적 난수 ━━━

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function createSeed(year: number, month: number, day: number, extra: number): number {
  return (year * 10000 + month * 100 + day) * 13 + extra * 7;
}

// ━━━ 오행 상호작용 점수 ━━━

function ohangInteractionScore(personal: Ohang, monthly: Ohang): number {
  if (personal === monthly) return 7; // 비화 — 안정적
  if (SANGSAENG[personal] === monthly) return 9; // 내가 생하는 원소 — 에너지 발산
  if (SANGSAENG[monthly] === personal) return 8; // 나를 생해주는 원소 — 에너지 수급
  if (SANGGEUK[personal] === monthly) return 4; // 내가 극하는 원소 — 통제 소모
  if (SANGGEUK[monthly] === personal) return 3; // 나를 극하는 원소 — 압박
  return 6; // 중립
}

// ━━━ 개인 연도수 (Personal Year Number) ━━━

function calcPersonalYear(birthMonth: number, birthDay: number, currentYear: number): number {
  const digits = `${birthMonth}${birthDay}${currentYear}`;
  let sum = digits.split("").reduce((a, b) => a + parseInt(b), 0);
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum).split("").reduce((a, b) => a + parseInt(b), 0);
  }
  // 마스터 넘버를 기본수로 축소 (월별 운세에서는 1-9만 사용)
  if (sum === 11) return 2;
  if (sum === 22) return 4;
  return sum;
}

// ━━━ 설명 생성 ━━━

const CAREER_DESCRIPTIONS: Record<number, string[]> = {
  1: [
    "직장에서 새로운 프로젝트를 제안받을 가능성이 높습니다. 주도적으로 나서면 좋은 결과를 얻습니다.",
    "업무에서 리더십을 발휘할 기회가 옵니다. 동료들과의 협업보다 독자적 판단이 빛나는 시기입니다.",
  ],
  2: [
    "팀워크가 중요한 달입니다. 혼자 결정하기보다 동료의 의견을 경청하면 예상 밖의 해결책을 발견합니다.",
    "상사나 멘토와의 관계가 깊어지는 시기입니다. 조용히 지원하는 역할에서 신뢰를 쌓게 됩니다.",
  ],
  3: [
    "아이디어를 발표하거나 프레젠테이션할 기회가 생깁니다. 창의적 접근이 높이 평가받는 시기입니다.",
    "네트워킹이 커리어에 큰 도움이 되는 달입니다. 업계 행사나 모임에 적극 참여하세요.",
  ],
  4: [
    "기초를 다지는 데 집중하면 하반기에 큰 성과로 이어집니다. 서류 정리, 시스템 구축에 적합한 시기입니다.",
    "꾸준한 노력이 인정받는 달입니다. 눈에 띄는 성과보다 묵묵한 실행이 평가됩니다.",
  ],
  5: [
    "이직이나 부서 이동을 고려해볼 만한 시기입니다. 새로운 환경에서 적응력이 빛을 발합니다.",
    "출장이나 외근이 잦아지며, 이동 중에 좋은 아이디어를 얻게 됩니다.",
  ],
  6: [
    "후배를 멘토링하거나 팀을 돌보는 역할이 주어집니다. 이 경험이 향후 승진에 영향을 미칩니다.",
    "직장 내 인간관계에 신경 쓸 일이 생기지만, 성숙하게 대처하면 오히려 신뢰가 깊어집니다.",
  ],
  7: [
    "전문성을 깊이 파는 시기입니다. 온라인 강의나 자격증 준비를 시작하면 좋은 타이밍입니다.",
    "조용히 실력을 쌓는 달입니다. 당장의 성과보다 장기적 역량 강화에 투자하세요.",
  ],
  8: [
    "재정적 보상이나 승진 소식이 찾아올 수 있습니다. 연봉 협상에 유리한 시기입니다.",
    "큰 프로젝트의 결실을 거두는 달입니다. 그동안의 노력이 가시적 성과로 나타납니다.",
  ],
  9: [
    "하나의 업무 사이클이 마무리되는 시기입니다. 정리를 잘하면 다음 기회가 자연스럽게 열립니다.",
    "동료에게 지식을 나누거나 인수인계하는 일이 생깁니다. 후임에게 잘 넘기는 것도 능력입니다.",
  ],
};

const LOVE_DESCRIPTIONS: Record<number, string[]> = {
  1: [
    "새로운 만남의 기운이 강합니다. 평소 가지 않던 장소에서 인연을 만날 가능성이 있습니다.",
    "연인과의 관계에서 주도권을 잡게 됩니다. 데이트 계획을 직접 세워보세요.",
  ],
  2: [
    "기존 관계가 한층 깊어지는 달입니다. 상대의 작은 배려에 감사를 표현하면 관계가 따뜻해집니다.",
    "친구에서 연인으로 발전할 수 있는 관계가 눈에 들어옵니다. 신중하되 열린 마음을 유지하세요.",
  ],
  3: [
    "사교 활동이 활발해지면서 매력이 높아지는 시기입니다. 자기 자신을 솔직하게 표현하세요.",
    "연인과 함께 문화 활동을 즐기면 관계가 풍요로워집니다. 전시회, 공연, 여행을 계획하세요.",
  ],
  4: [
    "안정적인 관계를 원하게 되는 달입니다. 진지한 대화를 통해 서로의 미래를 확인하세요.",
    "결혼이나 동거를 고려 중이라면 현실적인 계획을 세우기 좋은 시기입니다.",
  ],
  5: [
    "예상치 못한 만남이 찾아옵니다. 첫인상과 다른 매력을 가진 사람에게 끌릴 수 있습니다.",
    "관계에 신선한 자극이 필요한 달입니다. 일상을 벗어난 데이트를 시도해보세요.",
  ],
  6: [
    "가족과 연인 사이에서 균형을 잡아야 하는 시기입니다. 양쪽 모두에게 진심을 보이세요.",
    "사랑하는 사람을 위해 무언가를 해주고 싶은 마음이 커집니다. 작은 서프라이즈가 큰 감동이 됩니다.",
  ],
  7: [
    "혼자만의 시간이 필요하다고 느껴도 괜찮습니다. 내면을 정리한 후 관계가 더 건강해집니다.",
    "깊은 대화를 통해 상대를 새롭게 발견하는 달입니다. 표면적인 소통을 넘어서세요.",
  ],
  8: [
    "관계에서 현실적인 결정을 내리는 시기입니다. 함께할 미래에 대한 구체적 계획이 필요합니다.",
    "파트너와 재정적 목표를 공유하면 유대감이 강해집니다.",
  ],
  9: [
    "더 이상 성장이 없는 관계라면 정리할 용기가 필요한 달입니다. 끝은 새로운 시작이기도 합니다.",
    "과거의 인연이 다시 연락해올 수 있습니다. 냉정하게 현재의 감정을 점검하세요.",
  ],
};

const HEALTH_DESCRIPTIONS: Record<number, string[]> = {
  1: [
    "새로운 운동을 시작하기 좋은 타이밍입니다. 러닝, 수영 등 개인 운동이 잘 맞습니다.",
    "에너지가 높은 달이지만 무리하면 근육 부상 위험이 있습니다. 스트레칭을 철저히 하세요.",
  ],
  2: [
    "수면의 질이 건강을 좌우하는 달입니다. 취침 전 스크린 타임을 줄이세요.",
    "짝과 함께하는 운동(테니스, 배드민턴)이 체력과 관계 모두에 도움이 됩니다.",
  ],
  3: [
    "스트레스가 목과 어깨에 쌓이기 쉬운 시기입니다. 마사지나 요가로 풀어주세요.",
    "사교 활동이 많아지면서 음주량이 늘 수 있습니다. 절제가 필요합니다.",
  ],
  4: [
    "규칙적인 생활 패턴이 건강의 열쇠입니다. 기상·취침 시간을 일정하게 유지하세요.",
    "허리와 관절을 주의하세요. 오래 앉아 있는 습관이 있다면 스탠딩 데스크를 고려하세요.",
  ],
  5: [
    "야외 활동이 심신에 활력을 줍니다. 하이킹이나 자전거 타기를 추천합니다.",
    "소화 기관이 민감해지는 시기입니다. 자극적인 음식을 줄이고 따뜻한 음식 위주로 드세요.",
  ],
  6: [
    "정기 검진을 받기 좋은 달입니다. 미루고 있던 건강 체크를 이번 달에 하세요.",
    "가족의 건강에도 신경을 쓸 일이 생깁니다. 함께 건강한 식단을 계획하세요.",
  ],
  7: [
    "명상이나 호흡 운동이 큰 도움이 되는 시기입니다. 하루 10분 마음 챙김을 실천하세요.",
    "눈의 피로가 쌓이기 쉽습니다. 안과 검진이나 블루라이트 차단 안경을 고려하세요.",
  ],
  8: [
    "체력이 좋은 달입니다. 고강도 운동이나 대회 참가에 적합한 시기입니다.",
    "성취욕이 높아지면서 과로하기 쉽습니다. 일과 휴식의 균형을 의식적으로 지키세요.",
  ],
  9: [
    "해독과 정화에 좋은 달입니다. 가벼운 단식이나 디지털 디톡스를 시도해보세요.",
    "면역력이 떨어질 수 있는 시기입니다. 비타민 보충과 충분한 수면에 신경 쓰세요.",
  ],
};

const WEALTH_DESCRIPTIONS: Record<number, string[]> = {
  1: [
    "새로운 수입원이 열릴 가능성이 있습니다. 부업이나 투자 기회를 눈여겨보세요.",
    "자기 투자에 돈을 쓰면 장기적으로 몇 배의 수익으로 돌아옵니다.",
  ],
  2: [
    "공동 투자나 파트너십에서 좋은 기회가 옵니다. 신뢰할 수 있는 사람과 함께하세요.",
    "절약이 미덕인 달입니다. 고정 지출을 점검하고 불필요한 구독을 정리하세요.",
  ],
  3: [
    "충동 구매를 조심하세요. 기분에 따른 소비가 늘어나기 쉬운 달입니다.",
    "창의적인 아이디어로 수입을 올릴 수 있습니다. 콘텐츠 제작이나 프리랜서 활동을 고려하세요.",
  ],
  4: [
    "저축을 시작하거나 재무 계획을 세우기 좋은 달입니다. 스프레드시트를 만들어보세요.",
    "부동산이나 보험 관련 결정에 적합한 시기입니다. 전문가 상담을 받으세요.",
  ],
  5: [
    "예상치 못한 지출이 발생할 수 있습니다. 비상금을 넉넉히 확보해두세요.",
    "환율 변동이나 해외 거래에서 이득을 볼 수 있는 달입니다.",
  ],
  6: [
    "가족 관련 지출이 늘어나는 시기입니다. 미리 예산을 잡아두면 부담이 줄어듭니다.",
    "장기 저축 상품에 가입하기 좋은 타이밍입니다. 적금이나 연금을 시작하세요.",
  ],
  7: [
    "투자 결정을 내리기 전에 충분히 공부하세요. 직감보다 데이터를 신뢰하는 것이 유리합니다.",
    "불필요한 물건을 정리하고 중고로 판매하면 의외의 수입이 됩니다.",
  ],
  8: [
    "재정적 보상이 찾아오는 달입니다. 보너스, 인센티브, 배당 등의 소식이 있을 수 있습니다.",
    "큰 금액의 투자나 구매를 결정하기에 적합한 시기입니다. 자신감을 가지세요.",
  ],
  9: [
    "빚이 있다면 갚기 시작하기 좋은 달입니다. 재정적 짐을 덜면 마음이 가벼워집니다.",
    "기부나 후원에 마음이 열리는 시기입니다. 나눌수록 돌아오는 에너지가 있습니다.",
  ],
};

const GENERAL_DESCRIPTIONS: Record<number, string[]> = {
  1: [
    "이 달은 새로운 시작의 에너지가 강합니다. 미루어온 계획을 실행에 옮기면 빠르게 궤도에 오릅니다. 주변 사람들이 당신의 결단력에 자극을 받을 것입니다.",
    "독립적인 판단이 빛을 발하는 시기입니다. 다른 사람의 의견에 흔들리지 말고 자신의 직감을 따르세요. 용기 있는 한 걸음이 새로운 길을 열어줍니다.",
  ],
  2: [
    "인내가 필요한 달입니다. 조급하게 결과를 요구하기보다 흐름에 맡기면 자연스럽게 좋은 결과가 찾아옵니다. 주변 사람들과의 협력이 예상 밖의 기회를 만듭니다.",
    "세심한 배려가 큰 변화를 만드는 시기입니다. 작은 친절이 예상치 못한 인연으로 돌아올 수 있습니다. 경청의 힘을 활용하세요.",
  ],
  3: [
    "표현력이 극대화되는 달입니다. 글쓰기, 말하기, 창작 활동에서 평소보다 뛰어난 결과물을 만들 수 있습니다. SNS 활동이 좋은 기회를 가져옵니다.",
    "사교적인 에너지가 넘치는 시기입니다. 새로운 사람을 만나면 예상 밖의 시너지가 생깁니다. 유쾌한 에너지를 나누세요.",
  ],
  4: [
    "꾸준함이 가장 큰 무기인 달입니다. 화려한 성과보다 기초를 단단히 다지는 데 집중하면 장기적으로 큰 차이를 만듭니다. 계획표를 만들고 실행하세요.",
    "정리와 체계화에 적합한 시기입니다. 어수선한 환경(집, 사무실, 디지털 파일)을 정돈하면 머릿속도 맑아집니다.",
  ],
  5: [
    "예상치 못한 변화가 찾아오는 달입니다. 변화를 두려워하지 마세요. 유연하게 대응하면 오히려 더 좋은 방향으로 흘러갑니다. 여행이나 새로운 경험이 큰 영감을 줍니다.",
    "호기심을 따라가면 좋은 일이 생기는 시기입니다. 평소 관심 없던 분야에 도전해보세요. 뜻밖의 재능이나 열정을 발견할 수 있습니다.",
  ],
  6: [
    "가까운 사람들과의 관계가 중심이 되는 달입니다. 가족이나 오랜 친구에게 연락하면 마음이 따뜻해지고 에너지를 얻습니다. 돌봄의 기쁨을 경험하세요.",
    "책임감이 커지는 시기이지만, 그만큼 보람도 큽니다. 주변을 챙기는 과정에서 자신도 성장합니다. 균형 잡힌 헌신이 핵심입니다.",
  ],
  7: [
    "내면을 들여다보기 좋은 달입니다. 명상, 독서, 일기 쓰기 등 혼자만의 시간이 깊은 통찰을 가져옵니다. 외부 활동보다 내적 성장에 집중하세요.",
    "배움의 에너지가 강한 시기입니다. 관심 있는 주제를 깊이 파고들면 전문성이 한 단계 올라갑니다. 질보다 양, 속도보다 깊이를 택하세요.",
  ],
  8: [
    "성취의 에너지가 강한 달입니다. 목표를 향해 집중적으로 달려가면 기대 이상의 결과를 얻습니다. 자신감을 가지고 큰 그림을 그리세요.",
    "그동안의 노력이 보상으로 돌아오는 시기입니다. 겸손하되 당당하게 결과를 받아들이세요. 성공의 경험이 다음 도전의 발판이 됩니다.",
  ],
  9: [
    "하나의 사이클이 마무리되는 달입니다. 완료하지 못한 일을 정리하고 불필요한 것을 놓아보내세요. 비움이 새로운 것을 채울 공간을 만듭니다.",
    "지나온 길을 돌아보며 감사할 것들을 발견하는 시기입니다. 과거에 대한 미련을 내려놓으면 다음 단계의 문이 열립니다.",
  ],
};

const ADVICE_POOL: Record<number, string[]> = {
  1: ["이번 달의 키워드는 '시작'입니다. 완벽을 기다리지 말고 일단 첫 발을 내딛으세요.", "주도적으로 행동하되 독선적이지 않도록 주의하세요."],
  2: ["급하게 밀어붙이기보다 한 걸음 물러서서 관찰하는 지혜가 필요합니다.", "믿을 수 있는 사람과 고민을 나누면 생각이 정리됩니다."],
  3: ["생각을 말이나 글로 표현하면 막힌 것이 풀립니다.", "유쾌한 에너지를 유지하되 가벼워지지 않도록 깊이를 더하세요."],
  4: ["계획을 세우고 하나씩 체크하는 성실함이 이번 달의 비밀 무기입니다.", "과정을 즐기세요. 목적지보다 여정이 중요한 달입니다."],
  5: ["변화가 와도 당황하지 마세요. 유연한 대응이 최선의 전략입니다.", "새로운 환경에 먼저 적응하면 주변이 따라옵니다."],
  6: ["가까운 사람에게 고마운 마음을 직접 전하세요.", "모든 것을 혼자 짊어지려 하지 말고 도움을 요청하는 것도 용기입니다."],
  7: ["혼자만의 시간을 확보하세요. 정돈된 내면이 올바른 결정을 이끕니다.", "직관이 말하는 것에 귀를 기울이되, 데이터로 검증하세요."],
  8: ["목표를 높게 잡되 실행은 구체적으로 하세요.", "돈과 관련된 결정은 감정이 아닌 숫자로 판단하세요."],
  9: ["더 이상 필요 없는 것을 과감히 정리하세요.", "마무리를 잘하면 다음 시작이 수월해집니다."],
};

// ━━━ 연도 요약 ━━━

const YEAR_SUMMARIES: Record<number, string> = {
  1: "올해는 새로운 9년 주기의 시작점입니다. 이 해에 뿌린 씨앗이 향후 9년의 방향을 결정합니다. 과감한 시작과 독자적 결단이 요구되는 해로, 남들의 시선보다 자신의 확신을 따르세요. 올해의 선택이 미래의 당신을 만듭니다.",
  2: "올해는 인내와 협력의 해입니다. 작년에 시작한 것들이 뿌리를 내리는 시기로, 조급하게 결과를 재촉하기보다 흐름에 맡기는 지혜가 필요합니다. 관계에 투자하면 예상 밖의 기회가 사람을 통해 찾아옵니다. 속도보다 방향이 중요한 해입니다.",
  3: "올해는 자기표현과 창조의 해입니다. 억눌렸던 아이디어와 감정을 세상에 내놓을 때가 왔습니다. 사교 활동이 기회를 가져오며, 당신의 말과 글이 예상보다 큰 영향력을 발휘합니다. 창의성에 제동을 걸지 마세요.",
  4: "올해는 기반을 다지는 해입니다. 화려한 성과보다 단단한 토대를 쌓는 데 집중하면 내년부터 큰 차이가 납니다. 지름길은 없지만 정도를 가면 무너지지 않습니다. 체계적으로 접근하는 것이 올해의 성공 공식입니다.",
  5: "올해는 변화와 자유의 해입니다. 예상치 못한 변화가 찾아오지만, 이 변화가 결국 더 나은 방향으로 이끕니다. 여행, 이직, 새로운 시도가 생각보다 좋은 결과를 가져옵니다. 유연하게 적응하는 것이 올해의 관건입니다.",
  6: "올해는 가정과 책임의 해입니다. 가족, 연인, 공동체에 대한 의무가 전면에 등장하며, 돌봄의 과정에서 깊은 보람을 느끼게 됩니다. 사랑과 헌신이 올해의 중심 테마이지만, 자기 자신도 돌보는 균형이 필요합니다.",
  7: "올해는 내면 탐구의 해입니다. 홀로 있는 시간이 필요하며, 공부, 명상, 자기성찰에 적합한 해입니다. 외부 활동을 줄이고 내적 성장에 집중하면, 인생의 다음 방향이 선명해집니다. 깊이가 깊을수록 높이도 높아집니다.",
  8: "올해는 성취와 보상의 해입니다. 지난 몇 년간의 노력이 가시적인 결실을 맺으며, 재정적 기회도 찾아옵니다. 성과를 거두되 겸손함을 잃지 마세요. 이 해의 성공이 다음 단계의 발판이 됩니다.",
  9: "올해는 완성과 정리의 해입니다. 낡은 것을 놓아보내고 새로운 9년 주기를 준비해야 합니다. 집착하면 다음 단계로 넘어가지 못합니다. 감사와 함께 마무리하면, 내년에 완전히 새로운 시작이 가능합니다.",
};

// ━━━ 메인 함수 ━━━

export function generateMonthlyForecast(
  year: number,
  month: number,
  day: number,
  forecastYear: number = 2026,
): MonthlyForecast {
  const saju = analyzeSaju(year, month, day);
  const personalOhang = saju.day.ohang;
  const lifePath = calcLifePath(year, month, day);
  const personalYear = calcPersonalYear(month, day, forecastYear);

  const months: MonthlyForecast["months"] = [];
  let bestMonth = 1;
  let bestScore = 0;
  let cautionMonth = 1;
  let worstScore = 11;

  for (let m = 1; m <= 12; m++) {
    const rng = seededRandom(createSeed(year, month, day, m * 100 + forecastYear));

    // 월별 오행 에너지와 개인 오행 상호작용
    const monthOhang = MONTH_OHANG[m - 1];
    const baseOhangScore = ohangInteractionScore(personalOhang, monthOhang);

    // 개인 월 수 (Personal Month Number)
    const personalMonth = ((personalYear + m - 1) % 9) || 9;

    // 점수 계산: 오행 기반 + 수비학 변동 + 시드 미세 조정
    const numVariance = (rng() - 0.5) * 1.5;
    const lifePathBonus = (personalMonth === lifePath % 9 || personalMonth === lifePath) ? 0.5 : 0;
    const rawScore = baseOhangScore + numVariance + lifePathBonus;
    const score = Math.max(1, Math.min(10, Math.round(rawScore)));

    // 키워드 선택 (점수+개인월 기반)
    const keywordIdx = (personalMonth + score + Math.floor(rng() * 3)) % KEYWORDS.length;
    const keyword = KEYWORDS[keywordIdx];

    // 카테고리 점수 (1-5)
    const careerBase = Math.round((score / 10) * 5);
    const loveBase = Math.round(((score + (personalMonth % 3)) / 12) * 5);
    const healthBase = Math.round(((baseOhangScore + 1) / 10) * 5);
    const wealthBase = Math.round(((score + personalMonth) / 19) * 5);

    const category = {
      career: Math.max(1, Math.min(5, careerBase + (rng() > 0.7 ? 1 : 0))),
      love: Math.max(1, Math.min(5, loveBase + (rng() > 0.6 ? 1 : 0))),
      health: Math.max(1, Math.min(5, healthBase + (rng() > 0.5 ? 1 : 0))),
      wealth: Math.max(1, Math.min(5, wealthBase + (rng() > 0.65 ? 1 : 0))),
    };

    // 설명 생성 — 각 카테고리에서 시드 기반으로 선택
    const careerDesc = CAREER_DESCRIPTIONS[personalMonth][Math.floor(rng() * 2)] || CAREER_DESCRIPTIONS[personalMonth][0];
    const loveDesc = LOVE_DESCRIPTIONS[personalMonth][Math.floor(rng() * 2)] || LOVE_DESCRIPTIONS[personalMonth][0];
    const healthDesc = HEALTH_DESCRIPTIONS[personalMonth][Math.floor(rng() * 2)] || HEALTH_DESCRIPTIONS[personalMonth][0];
    const generalDesc = GENERAL_DESCRIPTIONS[personalMonth][Math.floor(rng() * 2)] || GENERAL_DESCRIPTIONS[personalMonth][0];

    // 3-4 문장 설명 조합
    const description = `${generalDesc} ${score >= 7 ? careerDesc : score >= 4 ? loveDesc : healthDesc}`;

    // 조언
    const adviceIdx = Math.floor(rng() * 2);
    const advice = ADVICE_POOL[personalMonth][adviceIdx] || ADVICE_POOL[personalMonth][0];

    // 행운의 날 (시드 기반)
    const luckyDay = Math.max(1, Math.min(28, Math.floor(rng() * 28) + 1));

    months.push({
      month: m,
      label: `${m}월`,
      keyword,
      score,
      description,
      advice,
      luckyDay,
      category,
    });

    if (score > bestScore) {
      bestScore = score;
      bestMonth = m;
    }
    if (score < worstScore) {
      worstScore = score;
      cautionMonth = m;
    }
  }

  const yearSummary = YEAR_SUMMARIES[personalYear] || YEAR_SUMMARIES[1];

  return {
    year: forecastYear,
    months,
    bestMonth,
    cautionMonth,
    yearSummary,
  };
}
