// lib/career-analysis.ts
// 커리어 심화 분석 엔진 — 사주/별자리/수비학/MBTI 데이터를 기반으로 구체적 직업 추천

import { analyzeSaju, type SajuResult, CHEONGAN_INFO, OHANG_INFO, OHANG_LIST, type Ohang } from "./saju";
import { analyzeWestern, type WesternResult } from "./western";
import { analyzeNumerology, type NumerologyResult } from "./numerology";
import { analyzeMBTI, type MBTIResult } from "./mbti";

// ━━━ 타입 정의 ━━━

export interface CareerAnalysis {
  careerType: string;
  careerTypeDesc: string;

  top5Careers: {
    rank: number;
    title: string;
    fit: number;
    reason: string;
    fromSystem: string;
  }[];

  workStyle: {
    strengths: string[];
    weaknesses: string[];
    idealEnvironment: string;
    leadershipStyle: string;
    teamRole: string;
  };

  careerTimeline: {
    phase: string;
    advice: string;
  }[];

  currentYearCareer: string;
  bestCareerMonths: number[];
}

// ━━━ 커리어 유형 데이터 ━━━

interface CareerTypeProfile {
  type: string;
  desc: string;
  keywords: string[];
  careers: { title: string; baseFit: number; reason: string }[];
  workStyle: CareerAnalysis["workStyle"];
}

const CAREER_TYPE_PROFILES: CareerTypeProfile[] = [
  {
    type: "전략적 리더형",
    desc: "조직의 비전을 설계하고 실행하는 데 탁월한 전략가입니다. 복잡한 상황에서도 명확한 방향을 제시하며, 사람들을 하나의 목표 아래 결집시키는 능력이 있습니다. 큰 그림을 그리면서도 핵심 디테일을 놓치지 않는 균형감각이 당신의 최대 무기이며, 위기 상황에서 오히려 빛을 발하는 유형입니다.",
    keywords: ["리더십", "추진력", "결단력", "CEO", "경영", "전략", "지휘", "주도"],
    careers: [
      { title: "스타트업 CEO", baseFit: 92, reason: "비전을 세우고 팀을 이끌어 새로운 시장을 개척하는 능력이 탁월합니다. 불확실성 속에서도 방향을 잃지 않는 추진력이 창업에 최적화되어 있습니다." },
      { title: "경영 컨설턴트", baseFit: 88, reason: "복잡한 조직 문제를 구조화하고 해결 방안을 제시하는 분석적 리더십이 적합합니다. 다양한 산업을 넘나들며 전략적 통찰을 제공할 수 있습니다." },
      { title: "투자은행 애널리스트", baseFit: 85, reason: "빠른 판단력과 데이터 기반 의사결정 능력이 금융 분야에서 큰 강점이 됩니다. 시장의 흐름을 읽고 과감한 결정을 내리는 기질이 맞습니다." },
      { title: "프로덕트 매니저(PM)", baseFit: 82, reason: "기술과 비즈니스의 교차점에서 방향을 설정하고, 다양한 이해관계자를 조율하는 역할에 적합합니다." },
      { title: "정치인/정책 기획자", baseFit: 78, reason: "대중을 설득하고 큰 방향을 제시하는 능력이 공공 영역에서 큰 영향력을 발휘할 수 있습니다." },
      { title: "법조인(검사/변호사)", baseFit: 76, reason: "정의감과 논리적 사고, 원칙을 지키려는 기질이 법률 분야에서 빛을 발합니다." },
    ],
    workStyle: {
      strengths: ["빠른 의사결정과 실행력", "복잡한 상황 정리 능력", "팀 동기부여와 목표 설정", "위기 상황에서의 침착함"],
      weaknesses: ["세부 사항에 대한 인내심 부족", "타인의 감정 간과 경향", "위임보다 직접 처리하려는 성향"],
      idealEnvironment: "빠르게 변화하는 환경에서 자율적으로 의사결정할 수 있는 조직. 명확한 목표와 성과 중심의 문화가 있되, 혁신을 두려워하지 않는 곳.",
      leadershipStyle: "비전 제시형 리더. 큰 그림을 그리고 핵심 전략을 수립한 뒤, 팀원에게 실행의 자율성을 부여하는 스타일.",
      teamRole: "방향을 설정하는 총사령관. 팀이 길을 잃을 때 나침반이 되어주는 존재.",
    },
  },
  {
    type: "창의적 혁신가형",
    desc: "기존의 틀을 부수고 새로운 가능성을 여는 창조자입니다. 남들이 보지 못하는 연결고리를 발견하고, 전혀 다른 분야의 아이디어를 융합하여 혁신을 만들어냅니다. 규칙보다 영감에 이끌리며, 자유로운 환경에서 최고의 결과물을 내는 유형입니다. 일상적인 업무보다 프로젝트 기반의 창의적 도전에서 에너지를 얻습니다.",
    keywords: ["창의", "혁신", "예술", "디자인", "크리에이터", "작가", "자유", "직관", "감성"],
    careers: [
      { title: "UX/UI 디자이너", baseFit: 91, reason: "사용자의 감성을 읽고 직관적 경험을 설계하는 능력이 탁월합니다. 미적 감각과 논리적 구조화 능력이 디지털 제품 설계에 최적화되어 있습니다." },
      { title: "콘텐츠 크리에이터/유튜버", baseFit: 89, reason: "독특한 시각과 표현력으로 대중의 공감을 이끌어내는 능력이 있습니다. 트렌드를 읽으면서도 자신만의 색깔을 유지하는 균형감이 강점입니다." },
      { title: "브랜드 전략가", baseFit: 86, reason: "감성과 전략을 융합하여 브랜드의 정체성을 구축하는 데 뛰어난 감각을 보입니다." },
      { title: "게임 기획자", baseFit: 83, reason: "상상력과 시스템적 사고가 결합되어, 몰입감 있는 경험을 설계하는 역할에 적합합니다." },
      { title: "건축가/인테리어 디자이너", baseFit: 80, reason: "공간에 대한 감각과 미적 비전을 현실로 구현하는 능력이 이 분야에서 큰 차별화 요소가 됩니다." },
      { title: "영화감독/프로듀서", baseFit: 77, reason: "스토리텔링 능력과 비주얼 감각이 결합되어 영상 매체에서 강한 표현력을 발휘할 수 있습니다." },
    ],
    workStyle: {
      strengths: ["독창적 아이디어 발상", "트렌드 감지 능력", "시각적/감각적 표현력", "몰입 집중력"],
      weaknesses: ["반복적 업무에 대한 낮은 흥미", "마감 시간 관리 어려움", "완벽주의로 인한 번아웃"],
      idealEnvironment: "창의적 자유가 보장되는 플랫 조직. 실험과 실패가 허용되고, 다양한 배경의 사람들과 자극적인 대화가 오가는 곳.",
      leadershipStyle: "영감 제공형 리더. 비전을 시각화하여 팀원의 창의성을 자극하고, 자유로운 분위기에서 최고의 결과물을 이끌어내는 스타일.",
      teamRole: "아이디어 발전소. 브레인스토밍의 핵심이자, 프로젝트에 새로운 방향을 제시하는 촉매.",
    },
  },
  {
    type: "분석적 전문가형",
    desc: "깊이 있는 전문성으로 문제의 본질을 파고드는 탐구자입니다. 데이터와 논리를 기반으로 정확한 판단을 내리며, 하나의 분야에서 최고 수준의 역량을 쌓아가는 장인 정신이 있습니다. 표면적인 현상보다 근본 원인에 관심을 가지며, 복잡한 문제를 체계적으로 분해하여 해결하는 능력이 탁월합니다.",
    keywords: ["분석", "연구", "통찰", "지혜", "완벽주의", "학자", "과학", "엔지니어", "시스템"],
    careers: [
      { title: "데이터 사이언티스트", baseFit: 93, reason: "데이터에서 패턴을 발견하고 의미 있는 인사이트를 도출하는 분석적 사고가 탁월합니다. 복잡한 데이터셋을 다루는 인내심과 정확성이 강점입니다." },
      { title: "연구원/R&D 엔지니어", baseFit: 90, reason: "미지의 영역을 탐구하고 새로운 지식을 체계화하는 학자적 기질이 연구 분야에 최적화되어 있습니다." },
      { title: "백엔드 소프트웨어 엔지니어", baseFit: 87, reason: "복잡한 시스템의 구조를 설계하고 최적화하는 논리적 사고가 뛰어납니다." },
      { title: "의료진(전문의/약사)", baseFit: 84, reason: "정밀한 분석과 체계적 판단이 요구되는 의료 분야에서 신뢰감을 주는 전문가가 될 수 있습니다." },
      { title: "특허 변리사", baseFit: 80, reason: "기술적 깊이와 법률적 논리를 결합하는 능력이 이 분야에서 독보적 경쟁력이 됩니다." },
      { title: "금융공학 전문가(퀀트)", baseFit: 78, reason: "수리적 사고와 시장 분석 능력이 결합되어 금융 모델링에 적합합니다." },
    ],
    workStyle: {
      strengths: ["깊이 있는 분석과 문제 해결", "데이터 기반 의사결정", "체계적 업무 프로세스 구축", "높은 정확도와 품질 의식"],
      weaknesses: ["분석 마비(overthinking)", "대인 관계에서의 소통 부족", "변화에 대한 저항감"],
      idealEnvironment: "전문성이 존중받는 깊이 있는 조직. 충분한 학습 시간과 자원이 제공되고, 결과의 질이 양보다 중시되는 곳.",
      leadershipStyle: "전문가형 리더. 깊은 지식과 정확한 판단으로 팀의 신뢰를 얻으며, 데이터 기반으로 방향을 제시하는 스타일.",
      teamRole: "기술적 판관. 팀의 의사결정에 근거와 논리를 부여하는 지적 기둥.",
    },
  },
  {
    type: "공감적 치유자형",
    desc: "사람의 마음을 읽고 치유하는 타고난 상담가입니다. 섬세한 감수성으로 타인의 고통을 자신의 것처럼 느끼며, 그 공감 능력이 주변 사람들에게 위안과 용기를 줍니다. 돌봄과 양육의 에너지가 강해, 사람을 성장시키는 일에서 깊은 보람을 느끼는 유형입니다. 조용하지만 깊은 영향력을 발휘합니다.",
    keywords: ["공감", "치유", "상담", "돌봄", "포용", "섬세", "양육", "따뜻", "감성"],
    careers: [
      { title: "심리상담사/코칭 전문가", baseFit: 94, reason: "타인의 내면을 읽고 진심으로 공감하는 능력이 상담 분야에서 독보적입니다. 깊은 경청과 통찰로 내담자의 근본적 변화를 이끌어냅니다." },
      { title: "교육자/교수", baseFit: 88, reason: "지식 전달을 넘어 학생의 성장을 돕는 멘토 역할에 탁월합니다. 개인의 특성을 파악하고 맞춤형 지도를 하는 능력이 있습니다." },
      { title: "사회복지사", baseFit: 85, reason: "사회적 약자에 대한 깊은 이해와 체계적 지원 능력이 복지 분야에서 큰 가치를 발휘합니다." },
      { title: "간호사/의료 코디네이터", baseFit: 83, reason: "환자의 신체적/정서적 필요를 동시에 돌보는 세심한 관찰력과 공감 능력이 의료 현장에서 빛납니다." },
      { title: "HR 매니저/조직문화 전문가", baseFit: 80, reason: "조직 내 사람들의 감정과 동기를 이해하고, 건강한 업무 환경을 설계하는 역할에 적합합니다." },
      { title: "아동발달 전문가", baseFit: 77, reason: "성장 과정에 있는 아이들의 미세한 변화를 감지하고 적절한 자극을 제공하는 섬세함이 있습니다." },
    ],
    workStyle: {
      strengths: ["깊은 경청과 공감 능력", "갈등 중재와 화합 유도", "개인 맞춤형 접근", "신뢰 관계 구축"],
      weaknesses: ["감정적 소진(번아웃) 위험", "거절하지 못하는 성향", "객관적 거리두기 어려움"],
      idealEnvironment: "사람 중심의 따뜻한 조직 문화. 개인의 성장이 조직의 성과와 연결되고, 협력과 소통이 중시되는 곳.",
      leadershipStyle: "서번트 리더. 팀원 한 사람 한 사람의 성장에 관심을 가지며, 섬기는 자세로 조직을 이끄는 스타일.",
      teamRole: "팀의 감정 온도계. 분위기를 읽고 조율하며, 갈등이 생기기 전에 예방하는 화합의 중심.",
    },
  },
  {
    type: "안정적 실행가형",
    desc: "계획을 세우고 꾸준히 실행하여 확실한 결과를 만들어내는 실행가입니다. 혼란 속에서도 체계를 세우는 능력이 있으며, 약속한 것은 반드시 지키는 신뢰감이 당신의 가장 큰 자산입니다. 화려한 시작보다 완벽한 마무리를 중시하며, 꾸준한 노력이 결국 승리한다는 것을 행동으로 증명하는 유형입니다.",
    keywords: ["안정", "신뢰", "현실감각", "성실", "체계", "실용", "관리", "회계", "책임"],
    careers: [
      { title: "프로젝트 매니저(PjM)", baseFit: 91, reason: "복잡한 프로젝트를 체계적으로 관리하고 일정 내에 완료하는 실행력이 탁월합니다. 리스크를 예측하고 선제 대응하는 능력이 있습니다." },
      { title: "공인회계사(CPA)", baseFit: 88, reason: "정확성과 체계적 사고가 요구되는 회계 분야에서 높은 신뢰를 받을 수 있습니다." },
      { title: "공무원/공공기관 관리자", baseFit: 85, reason: "규정과 절차를 준수하면서도 효율적으로 업무를 처리하는 능력이 공공 부문에 적합합니다." },
      { title: "물류/공급망 관리자", baseFit: 83, reason: "복잡한 프로세스를 최적화하고 안정적으로 운영하는 체계적 사고가 물류 분야에서 강점입니다." },
      { title: "부동산 자산관리사", baseFit: 80, reason: "장기적 관점에서 자산의 가치를 관리하고 안정적 수익을 창출하는 현실감각이 뛰어납니다." },
      { title: "품질관리(QA) 엔지니어", baseFit: 77, reason: "세밀한 검증과 체계적 테스트를 통해 품질을 보장하는 꼼꼼함이 이 역할에 최적화되어 있습니다." },
    ],
    workStyle: {
      strengths: ["체계적 계획 수립과 실행", "마감 준수와 약속 이행", "리스크 관리와 예방", "안정적 성과 창출"],
      weaknesses: ["급격한 변화에 대한 불안감", "창의적 도전보다 안전한 선택 선호", "과도한 계획으로 인한 유연성 부족"],
      idealEnvironment: "명확한 역할과 책임이 있는 체계적 조직. 꾸준한 노력이 공정하게 보상되고, 장기적 성장 경로가 보이는 곳.",
      leadershipStyle: "관리형 리더. 체계적 프로세스를 구축하고, 팀원의 역할을 명확히 하여 효율적으로 목표를 달성하는 스타일.",
      teamRole: "팀의 닻. 혼란 속에서도 흔들리지 않고 계획을 유지하며, 팀이 궤도를 벗어나지 않도록 지탱하는 존재.",
    },
  },
  {
    type: "자유로운 탐험가형",
    desc: "정해진 틀에 갇히지 않고 새로운 경험과 가능성을 탐색하는 모험가입니다. 다양한 분야에 관심을 가지며, 여러 역할을 동시에 수행하는 멀티 플레이어 기질이 있습니다. 변화를 두려워하지 않고 오히려 그 속에서 에너지를 얻으며, 자유와 독립을 최우선으로 여기는 유형입니다.",
    keywords: ["자유", "탐험", "모험", "적응", "독립", "다재다능", "여행", "유연", "변화"],
    careers: [
      { title: "프리랜서 컨설턴트", baseFit: 92, reason: "다양한 프로젝트를 자유롭게 선택하며 자신의 전문성을 발휘할 수 있습니다. 독립적 업무 스타일과 적응력이 프리랜서 생활에 최적화되어 있습니다." },
      { title: "저널리스트/PD", baseFit: 88, reason: "새로운 이야기와 현장을 끊임없이 탐색하는 호기심이 미디어 분야에서 강한 동기가 됩니다." },
      { title: "해외영업/글로벌 비즈니스", baseFit: 85, reason: "다문화 환경에서의 적응력과 소통 능력이 국제 비즈니스에서 큰 강점이 됩니다." },
      { title: "여행 콘텐츠 기획자", baseFit: 83, reason: "새로운 경험에 대한 열정과 이를 매력적으로 전달하는 표현력이 결합된 이상적인 역할입니다." },
      { title: "벤처캐피탈리스트(VC)", baseFit: 80, reason: "다양한 산업과 스타트업을 탐색하고 가능성을 발견하는 안목이 투자 분야에 적합합니다." },
      { title: "외교관/국제기구 전문가", baseFit: 78, reason: "다양한 문화와 환경을 넘나드는 유연성과 글로벌 시야이 국제 무대에서 빛을 발합니다." },
    ],
    workStyle: {
      strengths: ["빠른 적응력과 유연성", "다양한 분야에 대한 폭넓은 이해", "새로운 환경에서의 네트워킹", "변화 속 기회 포착"],
      weaknesses: ["한 분야에 대한 깊이 부족", "장기적 프로젝트에 대한 인내심 부족", "안정보다 자극을 추구하는 불안정성"],
      idealEnvironment: "자율성이 높고 다양한 프로젝트를 경험할 수 있는 곳. 글로벌 환경이나 빈번한 출장이 있는 역동적인 조직.",
      leadershipStyle: "탐색형 리더. 새로운 기회를 발굴하고, 다양한 관점을 팀에 가져오며, 변화를 선도하는 스타일.",
      teamRole: "팀의 정찰병. 외부의 새로운 정보와 기회를 팀에 전달하고, 고정관념을 깨는 역할.",
    },
  },
];

// ━━━ 오행→커리어 성향 매핑 ━━━

const OHANG_CAREER_TENDENCY: Record<Ohang, string[]> = {
  "木": ["리더십", "추진력", "개척", "성장", "교육"],
  "火": ["열정", "표현", "창의", "마케팅", "엔터테인먼트"],
  "土": ["안정", "관리", "부동산", "농업", "신뢰"],
  "金": ["정밀", "분석", "법률", "금융", "기술"],
  "水": ["지혜", "연구", "외교", "유통", "커뮤니케이션"],
};

// ━━━ 커리어 유형 결정 ━━━

function determineCareerType(
  saju: SajuResult,
  western: WesternResult,
  numerology: NumerologyResult,
  mbti: MBTIResult,
): CareerTypeProfile {
  const scores = new Map<string, number>();

  for (const profile of CAREER_TYPE_PROFILES) {
    let score = 0;

    // 1. 사주 일간 천간에서 커리어/trait 키워드 매칭
    const dayInfo = CHEONGAN_INFO[saju.day.cheongan];
    const sajuText = [...dayInfo.career, ...dayInfo.trait, dayInfo.personality].join(" ");
    score += profile.keywords.filter(kw => sajuText.includes(kw)).length * 3;

    // 2. 오행 성향 매칭
    const ohangTendency = OHANG_CAREER_TENDENCY[saju.day.ohang] || [];
    score += profile.keywords.filter(kw => ohangTendency.includes(kw)).length * 2;

    // 3. 서양 점성술 커리어 키워드 매칭
    const westernText = [...western.sunSign.career_strengths, ...western.sunSign.trait].join(" ");
    score += profile.keywords.filter(kw => westernText.includes(kw)).length * 2;

    // 4. 수비학 strength/career 매칭
    const numText = [...numerology.lifePathInfo.strength, ...numerology.lifePathInfo.career_paths].join(" ");
    score += profile.keywords.filter(kw => numText.includes(kw)).length * 2;

    // 5. MBTI 커리어/strengths 매칭
    const mbtiText = [...mbti.career, ...mbti.strengths].join(" ");
    score += profile.keywords.filter(kw => mbtiText.includes(kw)).length * 2;

    scores.set(profile.type, score);
  }

  let bestProfile = CAREER_TYPE_PROFILES[0];
  let bestScore = 0;
  for (const profile of CAREER_TYPE_PROFILES) {
    const s = scores.get(profile.type) || 0;
    if (s > bestScore) {
      bestScore = s;
      bestProfile = profile;
    }
  }

  return bestProfile;
}

// ━━━ TOP 5 커리어 추천 (구체적) ━━━

function generateTop5(
  profile: CareerTypeProfile,
  saju: SajuResult,
  western: WesternResult,
  numerology: NumerologyResult,
  mbti: MBTIResult,
): CareerAnalysis["top5Careers"] {
  const dayInfo = CHEONGAN_INFO[saju.day.cheongan];

  // Combine all system career lists with source tags
  const allCareers: { title: string; reason: string; fit: number; from: string }[] = [];

  // From profile (base)
  for (const c of profile.careers) {
    allCareers.push({ title: c.title, reason: c.reason, fit: c.baseFit, from: "교차 분석" });
  }

  // Enrich from saju
  for (const c of dayInfo.career) {
    const parts = c.split(" — ");
    if (parts.length === 2) {
      const existing = allCareers.find(e => e.title.includes(parts[0].split("·")[0].trim()) || parts[0].includes(e.title.split("/")[0].trim()));
      if (existing) {
        existing.fit = Math.min(98, existing.fit + 3);
        existing.from = "사주 + " + existing.from;
      }
    }
  }

  // Enrich from western
  for (const c of western.sunSign.career_strengths) {
    const parts = c.split(" — ");
    if (parts.length === 2) {
      const existing = allCareers.find(e => parts[0].includes(e.title.split("/")[0].trim()));
      if (existing) {
        existing.fit = Math.min(98, existing.fit + 2);
        if (!existing.from.includes("별자리")) existing.from = "별자리 + " + existing.from;
      }
    }
  }

  // Sort by fit and take top 5
  allCareers.sort((a, b) => b.fit - a.fit);
  const unique = new Map<string, typeof allCareers[0]>();
  for (const c of allCareers) {
    if (!unique.has(c.title)) unique.set(c.title, c);
  }

  return Array.from(unique.values()).slice(0, 5).map((c, i) => ({
    rank: i + 1,
    title: c.title,
    fit: c.fit,
    reason: c.reason,
    fromSystem: c.from,
  }));
}

// ━━━ 커리어 타임라인 ━━━

function generateTimeline(
  saju: SajuResult,
  western: WesternResult,
  numerology: NumerologyResult,
  profile: CareerTypeProfile,
): CareerAnalysis["careerTimeline"] {
  const dayInfo = CHEONGAN_INFO[saju.day.cheongan];
  const sign = western.sunSign;
  const ohangNature = OHANG_INFO[saju.day.ohang];

  const timelines: Record<string, { twenties: string; thirties: string; forties: string; fifties: string }> = {
    "전략적 리더형": {
      twenties: "다양한 조직에서 경험을 쌓되, 반드시 리더 역할을 맡아보세요. 작은 프로젝트라도 처음부터 끝까지 이끌어본 경험이 30대의 자산이 됩니다. 사업 관련 공부와 네트워킹을 병행하는 것이 중요합니다.",
      thirties: "핵심 전문 분야를 확립하고, 팀 또는 조직을 실질적으로 이끄는 경험을 쌓을 때입니다. 창업을 고려한다면 35세 전후가 적기이며, 실패를 두려워하지 마세요.",
      forties: "축적된 경험과 네트워크를 기반으로 영향력을 확장할 시기입니다. 멘토링이나 자문 역할을 통해 후배를 양성하면서, 더 큰 비전을 실현하세요.",
      fifties: "산업 전체에 기여하는 원로의 역할로 전환할 때입니다. 이사회, 자문위원, 또는 사회적 기업 운영을 통해 의미 있는 레거시를 남기세요.",
    },
    "창의적 혁신가형": {
      twenties: "가능한 한 다양한 창의적 경험을 시도하세요. 실패를 포트폴리오로 만드는 시기입니다. 자신만의 스타일을 찾기 위해 여러 매체와 분야를 실험하세요.",
      thirties: "20대의 실험에서 발견한 자신만의 강점에 집중할 때입니다. 하나의 시그니처 프로젝트를 만들어 시장에서의 위치를 확립하세요.",
      forties: "축적된 창의적 역량을 사업화하거나, 크리에이티브 디렉터로서 팀을 이끌 시기입니다. 후배 크리에이터를 육성하는 역할도 보람을 줍니다.",
      fifties: "인생 전체의 경험을 하나의 작품으로 승화시킬 때입니다. 교육, 저술, 또는 장기 프로젝트를 통해 다음 세대에 영감을 전달하세요.",
    },
    "분석적 전문가형": {
      twenties: "하나의 분야를 깊이 파는 시기입니다. 석사/박사 학위나 전문 자격증 취득을 적극 고려하세요. 기초를 탄탄히 하면 30대 이후의 성장 속도가 다릅니다.",
      thirties: "전문 분야에서 독보적 위치를 확립할 때입니다. 논문, 특허, 또는 프로젝트 실적으로 전문성을 증명하고, 업계 내 인지도를 쌓으세요.",
      forties: "깊은 전문성을 바탕으로 의사결정권이 있는 자리로 이동할 시기입니다. 기술 리더 또는 수석 전문가로서의 경력 경로를 설계하세요.",
      fifties: "축적된 지식을 체계화하여 후학을 양성할 때입니다. 저서, 강의, 자문을 통해 분야 전체의 수준을 높이는 데 기여하세요.",
    },
    "공감적 치유자형": {
      twenties: "사람을 직접 대면하는 현장 경험을 최대한 쌓으세요. 상담 수련이나 봉사 활동을 통해 공감 능력을 전문적 역량으로 전환하는 것이 중요합니다.",
      thirties: "전문 자격을 취득하고 자신만의 상담/교육 철학을 정립할 때입니다. 번아웃 예방을 위한 자기 관리 시스템도 이 시기에 확립하세요.",
      forties: "축적된 경험을 바탕으로 후배 양성, 프로그램 개발, 또는 기관 운영에 참여하세요. 개인 클라이언트에서 시스템 차원의 변화로 영향력을 확장할 시기입니다.",
      fifties: "인생 경험 전체가 누군가의 위안이 되는 시기입니다. 저술, 강연, 또는 비영리 활동을 통해 더 넓은 범위의 사람들에게 치유를 전달하세요.",
    },
    "안정적 실행가형": {
      twenties: "견고한 기초 역량을 쌓는 시기입니다. 자격증 취득, 체계적 업무 프로세스 학습, 그리고 신뢰할 수 있는 직업적 평판을 만드는 데 집중하세요.",
      thirties: "관리자 또는 전문가로서의 경력 트랙을 선택하고 깊이를 더할 때입니다. 재테크와 자산 관리에도 본격적으로 나서면 좋은 시기입니다.",
      forties: "오랜 경험에서 나오는 안정감을 바탕으로 조직의 핵심 역할을 수행할 시기입니다. 후배 멘토링과 조직 문화 개선에도 기여하세요.",
      fifties: "축적된 노하우와 네트워크를 활용하여 자문이나 독립적인 사업을 고려할 수 있습니다. 안정 속에서도 새로운 도전의 즐거움을 잊지 마세요.",
    },
    "자유로운 탐험가형": {
      twenties: "가능한 한 많은 경험을 하세요. 해외 경험, 다양한 직종 체험, 여행이 모두 미래의 자산이 됩니다. 단, 최소 1~2년은 한 곳에 집중하여 기본기를 쌓는 것이 중요합니다.",
      thirties: "20대의 다양한 경험을 하나의 정체성으로 묶을 때입니다. 여러 분야를 연결하는 고유한 전문성을 만들고, 프리랜서나 포트폴리오 커리어를 본격화하세요.",
      forties: "글로벌 네트워크와 다양한 경험을 기반으로, 컨설팅이나 플랫폼 비즈니스를 구축할 시기입니다. 경험의 깊이와 넓이를 모두 활용하세요.",
      fifties: "인생의 모든 경험을 콘텐츠로 만들거나, 다음 세대의 탐험가를 지원하는 역할로 전환하세요. 여행과 탐험은 멈추지 않되, 그 경험을 나누는 데 집중하세요.",
    },
  };

  const t = timelines[profile.type] || timelines["전략적 리더형"];

  return [
    { phase: "20대", advice: t.twenties },
    { phase: "30대", advice: t.thirties },
    { phase: "40대", advice: t.forties },
    { phase: "50대+", advice: t.fifties },
  ];
}

// ━━━ 올해 직업운 & 좋은 달 ━━━

function generateCurrentYearCareer(
  saju: SajuResult,
  numerology: NumerologyResult,
  profile: CareerTypeProfile,
): { forecast: string; bestMonths: number[] } {
  const currentYear = new Date().getFullYear();
  const personalYear = numerology.personalYear;
  const pyMeaning = numerology.lifePathInfo.personal_year_meaning[personalYear] || "";
  const dayInfo = CHEONGAN_INFO[saju.day.cheongan];
  const dayOhang = saju.day.ohang;

  // 연도 오행 (간지 기반 간략화)
  const yearStemIdx = (currentYear - 4) % 10;
  const yearOhangMap: Ohang[] = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
  const yearOhang = yearOhangMap[yearStemIdx];

  const ohangRelation = yearOhang === dayOhang ? "비견" :
    (dayOhang === "木" && yearOhang === "水") || (dayOhang === "火" && yearOhang === "木") ||
    (dayOhang === "土" && yearOhang === "火") || (dayOhang === "金" && yearOhang === "土") ||
    (dayOhang === "水" && yearOhang === "金") ? "인성(도움)" :
    (dayOhang === "木" && yearOhang === "火") || (dayOhang === "火" && yearOhang === "土") ||
    (dayOhang === "土" && yearOhang === "金") || (dayOhang === "金" && yearOhang === "水") ||
    (dayOhang === "水" && yearOhang === "木") ? "식상(표현)" :
    (dayOhang === "木" && yearOhang === "土") || (dayOhang === "火" && yearOhang === "金") ||
    (dayOhang === "土" && yearOhang === "水") || (dayOhang === "金" && yearOhang === "木") ||
    (dayOhang === "水" && yearOhang === "火") ? "재성(성과)" : "관성(도전)";

  const forecasts: Record<string, string> = {
    "비견": `${currentYear}년은 같은 기운의 해로, 경쟁이 치열해지지만 동시에 동료와의 협력에서 기회가 열립니다. 독자적 프로젝트보다 파트너십을 통한 시너지를 추구하세요. 수비학의 개인년 ${personalYear}(${pyMeaning.split('.')[0]})의 에너지와 맞물려, 자신의 포지셔닝을 재정립하기 좋은 해입니다.`,
    "인성(도움)": `${currentYear}년은 학습과 성장의 해입니다. 새로운 자격증, 교육, 멘토와의 만남이 커리어의 질적 변화를 가져옵니다. ${dayInfo.nature}의 기질이 올해 ${OHANG_INFO[yearOhang].kr}의 기운을 받아 내면의 역량이 풍부해집니다. 수비학의 개인년 ${personalYear} 에너지가 이를 뒷받침합니다.`,
    "식상(표현)": `${currentYear}년은 표현과 창조의 해입니다. 그동안 축적해온 역량을 세상에 드러낼 최적의 시기입니다. 새로운 프로젝트 시작, 이직, 또는 부업 시도가 좋은 결과를 가져올 수 있습니다. ${OHANG_INFO[yearOhang].kr}의 에너지가 ${dayInfo.nature}의 기질을 확장시켜, 평소보다 적극적인 커리어 활동이 유리합니다.`,
    "재성(성과)": `${currentYear}년은 성과와 보상의 해입니다. 이전에 심어둔 씨앗이 열매를 맺는 시기로, 승진, 연봉 인상, 사업 확장에 유리합니다. ${dayInfo.nature}의 기질이 ${OHANG_INFO[yearOhang].kr}의 재물 에너지를 만나 물질적 성취가 기대됩니다. 수비학의 개인년 ${personalYear} 에너지도 실질적 성과를 가리킵니다.`,
    "관성(도전)": `${currentYear}년은 시련 속 성장의 해입니다. 직장에서의 압박이나 책임이 커지지만, 이를 잘 극복하면 한 단계 도약할 수 있습니다. ${dayInfo.nature}의 기질에 ${OHANG_INFO[yearOhang].kr}의 도전 에너지가 더해져, 인내와 전략이 필요한 해입니다. 무리한 이직이나 창업보다는 현재 위치에서의 역량 강화가 유리합니다.`,
  };

  // Best months based on ohang cycle
  const ohangMonthMap: Record<Ohang, number[]> = {
    "木": [2, 3, 11],
    "火": [5, 6, 2],
    "土": [3, 6, 9],
    "金": [8, 9, 4],
    "水": [11, 12, 8],
  };

  const bestMonths = ohangMonthMap[dayOhang] || [3, 6, 9];

  return {
    forecast: forecasts[ohangRelation] || forecasts["비견"],
    bestMonths,
  };
}

// ━━━ 메인 분석 함수 ━━━

export function analyzeCareer(
  year: number, month: number, day: number,
  name?: string, hour?: number
): CareerAnalysis {
  const saju = analyzeSaju(year, month, day, hour);
  const western = analyzeWestern(month, day);
  const numerology = analyzeNumerology(year, month, day, name);
  const mbti = analyzeMBTI(saju.day.cheongan, western.sunSign.name, western.element);

  const profile = determineCareerType(saju, western, numerology, mbti);
  const top5 = generateTop5(profile, saju, western, numerology, mbti);
  const timeline = generateTimeline(saju, western, numerology, profile);
  const { forecast, bestMonths } = generateCurrentYearCareer(saju, numerology, profile);

  return {
    careerType: profile.type,
    careerTypeDesc: profile.desc,
    top5Careers: top5,
    workStyle: profile.workStyle,
    careerTimeline: timeline,
    currentYearCareer: forecast,
    bestCareerMonths: bestMonths,
  };
}
