// src/lib/mbti.ts
// MBTI 분석 엔진 — 사주 일간 천간 기반 MBTI 매핑 + 16유형 프로필

import { CHEONGAN_INFO, type Cheongan } from "./saju";

// ━━━ MBTI 결과 타입 ━━━
export interface MBTIResult {
  primaryType: string;        // "ENTJ"
  secondaryType: string;      // "ESTJ" (alternative)
  description: string;        // 4-5 sentences
  strengths: string[];
  weaknesses: string[];
  career: string[];
  loveStyle: string;
  compatibility_best: string[];
  compatibility_worst: string[];
  // Cross-reference fields
  sajuAlignment: string;      // How MBTI aligns with saju reading
  zodiacAlignment: string;    // How MBTI aligns with zodiac
}

// ━━━ MBTI 유형별 상세 데이터 ━━━
export interface MBTIProfile {
  type: string;
  name_kr: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  career: string[];
  loveStyle: string;
  compatibility_best: string[];
  compatibility_worst: string[];
}

export const MBTI_DATA: Record<string, MBTIProfile> = {
  "ENTJ": {
    type: "ENTJ",
    name_kr: "대담한 통솔자",
    description: "ENTJ는 타고난 리더로, 비전을 세우고 사람들을 이끌어 목표를 달성하는 데 탁월하다. 논리적 사고와 전략적 판단으로 복잡한 상황에서도 명확한 방향을 제시하며, 비효율을 참지 못하는 추진력이 조직을 변화시킨다. 자신감이 넘치고 결단이 빠르지만, 때로는 타인의 감정보다 결과를 우선시하여 주변과 마찰이 생길 수 있다. 큰 그림을 그리는 능력이 뛰어나 장기적 비전을 현실로 만드는 사람이다.",
    strengths: ["전략적 사고", "리더십", "결단력", "효율성", "자신감"],
    weaknesses: ["감정 무시", "독단적", "참을성 부족", "지나친 통제"],
    career: ["CEO/경영자", "전략 컨설턴트", "변호사", "정치인", "군 장교"],
    loveStyle: "연애에서도 리더십을 발휘하며, 목표 지향적인 관계를 추구한다. 파트너에게 높은 기대를 걸지만, 한번 마음을 주면 강한 충성심을 보인다. 감정 표현보다 행동으로 사랑을 증명하는 타입.",
    compatibility_best: ["INFP", "INTP", "ENFP"],
    compatibility_worst: ["ISFP", "ESFP", "ISFJ"],
  },
  "ESTJ": {
    type: "ESTJ",
    name_kr: "엄격한 관리자",
    description: "ESTJ는 규칙과 질서를 중시하는 현실주의자로, 체계적이고 실용적인 접근으로 일을 처리한다. 책임감이 강하고 약속을 반드시 지키며, 조직의 기둥 역할을 자처한다. 전통과 규범을 존중하되 결과를 만들어내는 실행력이 탁월하며, 모호한 상황을 명확하게 정리하는 능력이 있다. 다만 변화에 저항하거나 자신의 방식만을 고집하는 경향이 있어, 유연성을 키우는 것이 성장의 열쇠다.",
    strengths: ["책임감", "조직력", "실행력", "성실함", "현실감각"],
    weaknesses: ["완고함", "변화 저항", "감정 표현 서투름", "권위주의"],
    career: ["공무원", "회계사", "프로젝트 매니저", "군인", "경영 관리자"],
    loveStyle: "안정적이고 헌신적인 파트너로, 약속을 지키고 실질적인 방법으로 사랑을 표현한다. 로맨틱한 제스처보다 일상의 안정감을 제공하는 것이 사랑의 방식.",
    compatibility_best: ["ISTJ", "ISFJ", "ENTJ"],
    compatibility_worst: ["INFP", "ENFP", "INTP"],
  },
  "INFP": {
    type: "INFP",
    name_kr: "열정적인 중재자",
    description: "INFP는 깊은 내면의 가치관을 지닌 이상주의자로, 세상의 진정한 의미를 찾아 끊임없이 탐구한다. 공감 능력이 뛰어나 타인의 감정을 깊이 이해하며, 예술적 감수성으로 평범한 일상에서도 아름다움을 발견한다. 겉으로는 조용하지만 내면에는 강렬한 열정과 확고한 신념이 흐르고 있으며, 자신의 가치가 침범당할 때는 놀랄 만큼 단호해진다. 상상력이 풍부하여 창조적 영역에서 독보적인 재능을 발휘한다.",
    strengths: ["공감력", "창의성", "깊은 감수성", "이상주의", "적응력"],
    weaknesses: ["비현실적", "자기비판", "결정 장애", "감정 기복"],
    career: ["작가/시인", "상담사", "예술가", "사회복지사", "콘텐츠 크리에이터"],
    loveStyle: "영혼의 반쪽을 찾는 로맨티스트로, 깊고 의미 있는 연결을 갈망한다. 상대의 내면을 탐구하고 진정한 이해를 추구하며, 사랑에 빠지면 헌신적이고 충성스럽다. 이상과 현실의 괴리에 상처받기 쉽다.",
    compatibility_best: ["ENFJ", "ENTJ", "INFJ"],
    compatibility_worst: ["ESTJ", "ESTP", "ISTJ"],
  },
  "ENFP": {
    type: "ENFP",
    name_kr: "재기발랄한 활동가",
    description: "ENFP는 열정과 창의력이 넘치는 자유로운 영혼으로, 새로운 가능성을 발견하는 데서 삶의 에너지를 얻는다. 사람들과의 깊은 연결을 중시하며, 진정성 있는 대화와 의미 있는 관계에서 행복을 느낀다. 아이디어가 샘솟듯 끊임없이 나오지만 마무리가 약한 것이 단점이며, 자유를 구속받으면 급격히 에너지를 잃는다. 낙관적이고 유머러스하여 어디서든 분위기를 밝히는 사람이다.",
    strengths: ["열정", "창의력", "사교성", "적응력", "영감"],
    weaknesses: ["산만함", "마무리 부족", "감정적 과몰입", "우유부단"],
    career: ["마케터", "크리에이티브 디렉터", "기자/저널리스트", "교사", "스타트업 창업가"],
    loveStyle: "연애의 시작은 불꽃처럼 뜨겁고, 상대의 잠재력을 발견하는 눈이 있다. 자유롭고 진정성 있는 관계를 원하며, 일상도 모험처럼 만들어가는 재주가 있다. 관심이 분산되기 쉬워 깊이를 유지하는 것이 과제.",
    compatibility_best: ["INFJ", "INTJ", "ENFJ"],
    compatibility_worst: ["ISTJ", "ESTJ", "ISTP"],
  },
  "INTJ": {
    type: "INTJ",
    name_kr: "용의주도한 전략가",
    description: "INTJ는 독립적이고 분석적인 전략가로, 복잡한 시스템을 이해하고 개선하는 데 탁월한 능력을 보인다. 높은 지적 기준을 가지고 있으며, 비효율적인 것을 견디지 못하고 항상 더 나은 방법을 모색한다. 내면의 비전이 명확하여 장기적 계획을 세우고 실행하는 데 뛰어나지만, 사회적 관습이나 감정적 교류에는 서투르다. 소수의 깊은 관계를 선호하며, 신뢰를 얻으면 놀라울 만큼 충성스럽다.",
    strengths: ["전략적 사고", "독립성", "분석력", "완벽주의", "결단력"],
    weaknesses: ["사회적 서투름", "오만함", "감정 무시", "과도한 비판"],
    career: ["연구원/과학자", "소프트웨어 아키텍트", "전략 기획", "투자 분석가", "교수"],
    loveStyle: "연애도 전략적으로 접근하며, 지적으로 자극을 주는 파트너를 원한다. 표면적 매력보다 깊이 있는 대화와 성장 가능성을 중시한다. 감정 표현은 서투르지만 행동으로 헌신을 증명하는 사람.",
    compatibility_best: ["ENFP", "ENTP", "INFJ"],
    compatibility_worst: ["ESFP", "ISFP", "ESFJ"],
  },
  "ISTP": {
    type: "ISTP",
    name_kr: "만능 재주꾼",
    description: "ISTP는 냉철한 분석가이자 행동파로, 문제가 생기면 즉각적으로 해결책을 찾아내는 실용적 천재다. 호기심이 강하여 사물의 작동 원리를 파악하는 것을 즐기며, 도구와 기술을 다루는 손재주가 뛰어나다. 과묵하고 독립적이지만 위기 상황에서는 누구보다 침착하게 대응하며, 불필요한 규칙이나 감정적 압박을 싫어한다. 자유를 사랑하며 자신만의 공간과 시간을 중요하게 여기는 사람이다.",
    strengths: ["문제 해결력", "적응력", "침착함", "실용성", "손재주"],
    weaknesses: ["감정 표현 부족", "무관심", "충동적", "약속 기피"],
    career: ["엔지니어", "정비사/기술자", "파일럿", "운동선수", "포렌식 분석가"],
    loveStyle: "행동으로 사랑을 표현하며, 말보다 함께하는 경험을 중시한다. 독립적이고 자유로운 관계를 원하며, 상대방의 공간도 존중한다. 감정 표현을 요구받으면 부담을 느끼는 편.",
    compatibility_best: ["ESTJ", "ENTJ", "ESTP"],
    compatibility_worst: ["ENFJ", "INFJ", "ENFP"],
  },
  "INFJ": {
    type: "INFJ",
    name_kr: "선의의 옹호자",
    description: "INFJ는 가장 희귀한 유형으로, 깊은 직관과 강한 이상주의를 겸비한 사람이다. 표면 아래 숨겨진 패턴을 읽어내는 능력이 탁월하며, 타인의 감정과 동기를 거의 본능적으로 파악한다. 조용하지만 내면에는 세상을 더 나은 곳으로 만들겠다는 불꽃이 타오르고 있으며, 자신의 가치를 위해서는 단호하게 행동할 수 있다. 완벽주의와 높은 이상이 때로는 스스로를 지치게 만들지만, 그 깊이가 주변 사람들에게 영감을 준다.",
    strengths: ["직관력", "공감", "통찰", "결단력", "이상주의"],
    weaknesses: ["완벽주의", "번아웃 취약", "비밀주의", "과도한 이상"],
    career: ["심리학자", "작가", "NPO 운영", "예술치료사", "종교/철학 지도자"],
    loveStyle: "깊고 의미 있는 영혼의 교감을 추구하며, 표면적 관계에는 관심이 없다. 상대의 성장을 위해 헌신하며 진정한 이해자가 되어주지만, 에너지 소진에 주의가 필요하다.",
    compatibility_best: ["ENFP", "ENTP", "INTJ"],
    compatibility_worst: ["ESTP", "ESFP", "ISTP"],
  },
  "ENFJ": {
    type: "ENFJ",
    name_kr: "정의로운 사회운동가",
    description: "ENFJ는 타인의 잠재력을 이끌어내는 카리스마 넘치는 리더로, 공감과 열정으로 사람들을 감화시킨다. 타인의 감정에 민감하게 반응하며 자연스럽게 멘토이자 조언자 역할을 맡게 되고, 집단의 조화를 위해 헌신한다. 대의를 위해 앞장서는 용기가 있으며, 말과 행동 모두에서 설득력이 뛰어나다. 다만 타인을 돌보느라 자신을 돌보지 못하는 경향이 있어, 경계 설정이 중요한 과제다.",
    strengths: ["카리스마", "공감력", "설득력", "헌신", "비전"],
    weaknesses: ["자기희생", "과간섭", "갈등 회피", "이상주의"],
    career: ["교육자/교수", "상담사", "HR 전문가", "사회운동가", "연출가/감독"],
    loveStyle: "온 마음을 다해 상대를 사랑하고 성장시키려 한다. 로맨틱하고 표현력이 풍부하며, 관계에서 깊은 감정적 교류를 추구한다. 때로 상대를 이상화하는 경향이 있어 현실과의 균형이 필요하다.",
    compatibility_best: ["INFP", "ISFP", "INFJ"],
    compatibility_worst: ["ISTP", "ESTP", "INTP"],
  },
  "ISTJ": {
    type: "ISTJ",
    name_kr: "청렴결백한 논리주의자",
    description: "ISTJ는 성실하고 책임감 있는 현실주의자로, 약속을 지키고 맡은 일을 끝까지 해내는 신뢰의 아이콘이다. 체계적이고 꼼꼼한 성격으로 세부사항을 놓치지 않으며, 사실과 데이터에 기반한 판단을 내린다. 말보다 행동으로 보여주는 사람이며, 전통과 규범을 중시하는 안정적인 기질을 지녔다. 변화가 많거나 즉흥적인 상황에서는 스트레스를 받을 수 있지만, 그 일관성이야말로 주변 사람들의 든든한 버팀목이 된다.",
    strengths: ["성실함", "신뢰성", "분석력", "인내", "체계성"],
    weaknesses: ["유연성 부족", "보수적", "감정 표현 서투름", "변화 기피"],
    career: ["법무사/회계사", "데이터 분석가", "공무원", "금융 관리자", "품질관리 전문가"],
    loveStyle: "말보다 행동으로 사랑을 증명하는 헌신적인 파트너다. 안정적이고 예측 가능한 관계를 선호하며, 약속과 의무를 철저히 지킨다. 로맨틱한 표현은 서투르지만 묵묵한 사랑의 깊이가 있다.",
    compatibility_best: ["ESTJ", "ISFJ", "ESFJ"],
    compatibility_worst: ["ENFP", "INFP", "ENTP"],
  },
  "ENTP": {
    type: "ENTP",
    name_kr: "뜨거운 논쟁가",
    description: "ENTP는 지적 호기심이 끝없는 혁신가로, 기존의 틀을 깨고 새로운 가능성을 탐구하는 데서 에너지를 얻는다. 논쟁과 토론을 즐기며, 상대의 논리에서 허점을 찾아내는 날카로운 사고력이 특징이다. 아이디어의 샘이라 불릴 만큼 창의적이지만, 하나에 집중하기보다 여러 가능성을 동시에 탐색하는 경향이 있다. 유머와 재치가 넘쳐 사교적이나, 감정적 깊이보다 지적 자극을 우선시한다.",
    strengths: ["창의력", "논리력", "적응력", "카리스마", "유머"],
    weaknesses: ["논쟁 과잉", "마무리 부족", "감정 경시", "산만함"],
    career: ["기업가", "변호사", "발명가", "전략 컨설턴트", "저널리스트"],
    loveStyle: "지적으로 대등한 파트너를 원하며, 지루한 관계는 견디지 못한다. 새롭고 자극적인 경험을 함께 즐기길 원하며, 유머로 관계를 활기차게 만든다.",
    compatibility_best: ["INFJ", "INTJ", "ENFJ"],
    compatibility_worst: ["ISFJ", "ISTJ", "ESFJ"],
  },
  "ESTP": {
    type: "ESTP",
    name_kr: "모험을 즐기는 사업가",
    description: "ESTP는 현재를 가장 강렬하게 사는 행동파로, 위험을 즐기고 즉각적인 결과를 만들어내는 데 탁월하다. 관찰력이 날카로워 상황을 빠르게 읽고, 순발력 있게 대응하는 능력이 뛰어나다. 사교적이고 에너지 넘치며, 모험과 스릴을 통해 삶의 활력을 느낀다. 장기 계획보다 즉흥적 행동을 선호하며, 규칙에 구속받는 것을 싫어한다.",
    strengths: ["순발력", "관찰력", "사교성", "실용성", "용기"],
    weaknesses: ["충동적", "장기 계획 부족", "감정 둔감", "위험 추구"],
    career: ["세일즈", "응급 구조대원", "운동선수", "기업가", "이벤트 기획"],
    loveStyle: "열정적이고 즉흥적인 연애를 즐기며, 함께 모험할 수 있는 파트너를 원한다. 자유롭고 구속 없는 관계를 선호하며, 행동으로 애정을 표현한다.",
    compatibility_best: ["ISTJ", "ISTP", "ENTJ"],
    compatibility_worst: ["INFJ", "INFP", "ENFJ"],
  },
  "ISFJ": {
    type: "ISFJ",
    name_kr: "용감한 수호자",
    description: "ISFJ는 조용하지만 강한 헌신으로 주변 사람들을 보살피는 수호자 타입이다. 세심한 관찰력으로 타인의 필요를 먼저 알아차리며, 묵묵히 뒤에서 지원하는 역할을 자처한다. 전통과 안정을 중시하고, 신뢰할 수 있는 환경에서 최고의 능력을 발휘한다. 자기 희생적인 성향이 강해 자신의 필요를 뒤로 미루는 경향이 있으며, 갈등 상황을 극도로 불편해한다.",
    strengths: ["헌신", "세심함", "인내", "신뢰성", "실용성"],
    weaknesses: ["자기희생", "변화 두려움", "과부하", "거절 어려움"],
    career: ["간호사", "교사", "사회복지사", "행정 관리자", "도서관 사서"],
    loveStyle: "헌신적이고 따뜻한 파트너로, 상대의 일상을 세심하게 챙긴다. 안정적인 관계를 원하며, 작은 행동으로 꾸준히 사랑을 표현하는 타입.",
    compatibility_best: ["ESFJ", "ISTJ", "ESTJ"],
    compatibility_worst: ["ENTP", "ESTP", "ENTJ"],
  },
  "ESFP": {
    type: "ESFP",
    name_kr: "자유로운 연예인",
    description: "ESFP는 무대 위에서 빛나는 타고난 엔터테이너로, 현재 순간을 최대한 즐기며 주변에 기쁨을 전파한다. 사교적이고 자발적이며, 사람들과 어울리는 것에서 에너지를 얻는다. 감각적 경험을 중시하고 미적 감각이 뛰어나며, 실용적인 문제 해결에도 능하다. 깊은 성찰이나 장기 계획에는 약하지만, 그 순수한 열정이 주변을 밝힌다.",
    strengths: ["사교성", "낙관", "감각", "적응력", "관대함"],
    weaknesses: ["산만함", "깊이 부족", "미래 계획 약함", "갈등 회피"],
    career: ["연예인/배우", "이벤트 기획자", "관광 가이드", "세일즈", "요리사/바텐더"],
    loveStyle: "즐겁고 자유로운 연애를 추구하며, 함께 웃고 경험을 나눌 수 있는 파트너를 원한다. 현재를 즐기는 데 집중하며, 무거운 미래 이야기보다 지금의 행복을 중시한다.",
    compatibility_best: ["ISFJ", "ISTJ", "ESFJ"],
    compatibility_worst: ["INTJ", "ENTJ", "INFJ"],
  },
  "ESFJ": {
    type: "ESFJ",
    name_kr: "사교적인 외교관",
    description: "ESFJ는 사람들의 필요를 세심하게 살피고 조화로운 환경을 만드는 데 탁월한 사회적 촉매제다. 따뜻하고 친절하며, 타인에게 인정받는 것에서 큰 만족을 느낀다. 조직의 분위기를 밝히고 갈등을 중재하는 능력이 뛰어나며, 전통과 관습을 소중히 여긴다. 비판에 민감하고 모든 사람을 만족시키려는 경향이 강점이자 약점이다.",
    strengths: ["친절함", "조직력", "사교성", "충성심", "실용성"],
    weaknesses: ["인정 욕구", "비판 민감", "변화 저항", "남의 시선 의식"],
    career: ["HR 매니저", "교사", "간호사", "이벤트 플래너", "영업 관리자"],
    loveStyle: "따뜻하고 헌신적인 파트너로, 기념일과 일상의 소소한 행복을 챙기는 데 탁월하다. 안정적이고 조화로운 관계를 추구하며, 상대의 인정과 감사 표현이 사랑의 연료.",
    compatibility_best: ["ISFJ", "ESTJ", "ESFP"],
    compatibility_worst: ["INTP", "ENTP", "INTJ"],
  },
  "INTP": {
    type: "INTP",
    name_kr: "논리적인 사색가",
    description: "INTP는 끝없는 지적 호기심으로 세상의 원리를 탐구하는 사색가다. 논리와 분석의 달인으로, 복잡한 문제를 이론적으로 풀어내는 능력이 탁월하다. 독창적인 사고방식으로 남들이 보지 못하는 연결고리를 발견하며, 지적 자유를 무엇보다 소중히 여긴다. 사회적 상황이나 감정적 교류에는 서투르지만, 신뢰하는 소수와는 깊은 지적 교감을 나눈다.",
    strengths: ["분석력", "독창성", "논리", "객관성", "호기심"],
    weaknesses: ["사회적 서투름", "우유부단", "현실 감각 부족", "감정 무시"],
    career: ["연구원", "프로그래머", "수학자/물리학자", "철학자", "데이터 사이언티스트"],
    loveStyle: "지적 교감이 가능한 파트너를 원하며, 깊은 대화와 함께 사색할 수 있는 관계를 이상으로 여긴다. 감정적 표현은 서투르지만 논리적이고 성실한 사랑을 한다.",
    compatibility_best: ["ENTJ", "ENTP", "INFJ"],
    compatibility_worst: ["ESFJ", "ISFJ", "ESFP"],
  },
  "ISFP": {
    type: "ISFP",
    name_kr: "호기심 많은 예술가",
    description: "ISFP는 감각적이고 예술적인 영혼으로, 자신만의 독특한 미적 세계를 탐구하며 살아간다. 조용하지만 내면에는 강렬한 감정이 흐르고 있으며, 자유와 자기표현을 무엇보다 소중히 여긴다. 현재 순간의 아름다움을 포착하는 눈이 탁월하고, 타인에게 자연스럽게 따뜻함을 전하는 사람이다. 갈등을 극도로 싫어하며 자신의 공간이 침범당하면 조용히 물러난다.",
    strengths: ["예술성", "감수성", "적응력", "따뜻함", "현재 집중"],
    weaknesses: ["계획성 부족", "갈등 회피", "자기주장 약함", "미래 불안"],
    career: ["디자이너", "사진작가", "음악가", "플로리스트", "요리사"],
    loveStyle: "말보다 감각적 경험으로 사랑을 표현하며, 함께 아름다운 순간을 공유하는 데서 행복을 느낀다. 자유롭고 구속 없는 관계를 원하며, 상대의 개성도 존중한다.",
    compatibility_best: ["ENFJ", "ESFJ", "ESTJ"],
    compatibility_worst: ["ENTJ", "INTJ", "ENTP"],
  },
};

// ━━━ 천간 → MBTI 매핑 ━━━
// CHEONGAN_INFO.mbti_similar를 활용한 매핑
const CHEONGAN_MBTI_MAP: Record<Cheongan, { primary: string; secondary: string }> = {
  "甲": { primary: "ENTJ", secondary: "ESTJ" },   // 큰 나무 — 리더, 추진력
  "乙": { primary: "ENFP", secondary: "INFP" },   // 풀/덩굴 — 유연함, 적응력
  "丙": { primary: "ENFJ", secondary: "ESFP" },   // 태양 — 열정, 존재감
  "丁": { primary: "INFJ", secondary: "ISFJ" },   // 촛불 — 섬세함, 통찰
  "戊": { primary: "ISTJ", secondary: "ESTJ" },   // 큰 산 — 안정감, 신뢰
  "己": { primary: "ISFJ", secondary: "ESFJ" },   // 밭 — 포용력, 양육
  "庚": { primary: "ENTJ", secondary: "ISTP" },   // 바위/칼 — 결단력, 정의감
  "辛": { primary: "INTJ", secondary: "INFJ" },   // 보석 — 완벽주의, 심미안
  "壬": { primary: "ENTP", secondary: "ESTP" },   // 큰 바다 — 자유, 포용
  "癸": { primary: "INFP", secondary: "INFJ" },   // 이슬/빗물 — 직관, 감성
};

// ━━━ 사주 정렬 메시지 생성 ━━━
function generateSajuAlignment(cheongan: Cheongan, mbtiType: string): string {
  const info = CHEONGAN_INFO[cheongan];
  const mbtiProfile = MBTI_DATA[mbtiType];
  if (!mbtiProfile) return `사주의 ${info.kr} 기질이 MBTI에서 ${mbtiType}으로 나타납니다.`;

  const alignments: Record<string, string> = {
    "甲": `사주의 甲木이 가리키는 곧은 추진력과 리더십이 MBTI에서도 ${mbtiType}(${mbtiProfile.name_kr})로 나타납니다. '큰 나무'처럼 흔들리지 않는 방향성이 동서양 체계 모두에서 확인됩니다.`,
    "乙": `사주의 乙木이 보여주는 유연한 적응력과 관계 감각이 MBTI에서도 ${mbtiType}(${mbtiProfile.name_kr})로 수렴합니다. '담쟁이덩굴'처럼 환경에 스며드는 능력이 양 체계에서 공명합니다.`,
    "丙": `사주의 丙火가 가진 태양 같은 열정과 존재감이 MBTI에서도 ${mbtiType}(${mbtiProfile.name_kr})로 드러납니다. 주변을 밝히는 카리스마가 동서양을 관통하는 핵심 기질입니다.`,
    "丁": `사주의 丁火가 품은 촛불 같은 섬세한 통찰력이 MBTI에서도 ${mbtiType}(${mbtiProfile.name_kr})로 나타납니다. 깊은 내면의 빛이 양 체계에서 같은 패턴으로 포착됩니다.`,
    "戊": `사주의 戊土가 상징하는 산처럼 든든한 안정감과 신뢰가 MBTI에서도 ${mbtiType}(${mbtiProfile.name_kr})로 확인됩니다. 흔들림 없는 기반이 동서양 체계 모두의 핵심 키워드입니다.`,
    "己": `사주의 己土가 나타내는 밭처럼 따뜻한 포용력과 양육의 기질이 MBTI에서도 ${mbtiType}(${mbtiProfile.name_kr})로 수렴합니다. 모든 것을 품고 키워내는 능력이 교차점을 이룹니다.`,
    "庚": `사주의 庚金이 드러내는 바위 같은 결단력과 정의감이 MBTI에서도 ${mbtiType}(${mbtiProfile.name_kr})로 나타납니다. 날카로운 판단력이 동서양 분석에서 공통으로 확인됩니다.`,
    "辛": `사주의 辛金이 가진 보석 같은 완벽주의와 심미안이 MBTI에서도 ${mbtiType}(${mbtiProfile.name_kr})로 수렴합니다. 본질을 꿰뚫는 예리한 눈이 양 체계에서 같은 답을 내립니다.`,
    "壬": `사주의 壬水가 상징하는 바다 같은 자유로움과 포용력이 MBTI에서도 ${mbtiType}(${mbtiProfile.name_kr})로 나타납니다. 경계 없이 흐르는 에너지가 동서양 체계의 교차점입니다.`,
    "癸": `사주의 癸水가 품은 이슬 같은 직관과 섬세한 감성이 MBTI에서도 ${mbtiType}(${mbtiProfile.name_kr})로 수렴합니다. 보이지 않는 것을 느끼는 능력이 양 체계에서 공명합니다.`,
  };

  return alignments[cheongan] || `사주의 ${info.kr} 기질이 MBTI에서 ${mbtiType}으로 나타납니다.`;
}

// ━━━ 별자리 정렬 메시지 생성 ━━━
function generateZodiacAlignment(mbtiType: string, zodiacName: string, zodiacElement: string): string {
  const mbtiProfile = MBTI_DATA[mbtiType];
  if (!mbtiProfile) return `${zodiacName}의 특성이 MBTI ${mbtiType}과 교차합니다.`;

  // MBTI 유형의 E/I와 별자리 원소의 상관관계
  const isExtrovert = mbtiType.startsWith("E");
  const elementAlignment: Record<string, string> = {
    "Fire": isExtrovert
      ? `${zodiacName}의 불의 원소가 가진 열정과 행동력이 ${mbtiType}의 외향적 에너지와 강하게 공명합니다. 두 체계 모두 당신을 능동적이고 영향력 있는 존재로 봅니다.`
      : `${zodiacName}의 불의 원소는 밖으로 타오르지만, ${mbtiType}의 내향적 깊이와 만나 내면에서 조용히 연소하는 독특한 조합을 만듭니다. 겉은 차분하지만 속에는 강렬한 열정이 흐릅니다.`,
    "Earth": `${zodiacName}의 땅의 원소가 상징하는 안정감과 실용성이 ${mbtiType}의 성격 특성과 교차합니다. 현실에 발을 딛고 꾸준히 쌓아가는 능력이 두 체계의 공통 진단입니다.`,
    "Air": `${zodiacName}의 바람의 원소가 가진 지적 호기심과 소통 능력이 ${mbtiType}의 사고 패턴과 맞닿아 있습니다. 아이디어를 자유롭게 탐구하는 기질이 두 체계에서 같은 방향을 가리킵니다.`,
    "Water": `${zodiacName}의 물의 원소가 품은 감성과 직관이 ${mbtiType}의 내면 세계와 깊이 연결됩니다. 표면 아래를 읽는 능력이 두 분석 체계에서 공통으로 포착됩니다.`,
  };

  return elementAlignment[zodiacElement] || `${zodiacName}의 특성이 MBTI ${mbtiType}의 성격과 교차하는 지점이 발견됩니다.`;
}

// ━━━ MBTI TraitAxis 매핑 (교차 분석용) ━━━
export const MBTI_TRAIT_MAP: Record<string, string[]> = {
  "ENTJ": ["리더십", "추진력", "결단력", "전략"],
  "ESTJ": ["안정감", "신뢰", "현실감각", "결단력"],
  "INFP": ["감성", "직관", "유연함", "적응력"],
  "ENFP": ["열정", "유연함", "적응력", "에너지"],
  "INTJ": ["통찰력", "완벽주의", "결단력", "지혜"],
  "ISTP": ["결단력", "현실감각", "적응력", "자유"],
  "INFJ": ["직관", "통찰력", "감성", "섬세함"],
  "ENFJ": ["리더십", "포용력", "열정", "감성"],
  "ISTJ": ["안정감", "신뢰", "현실감각", "완벽주의"],
  "ENTP": ["자유", "추진력", "적응력", "지혜"],
  "ESTP": ["에너지", "추진력", "현실감각", "자유"],
  "ISFJ": ["포용력", "안정감", "섬세함", "신뢰"],
  "ESFP": ["에너지", "열정", "적응력", "감성"],
  "ESFJ": ["포용력", "유연함", "신뢰", "안정감"],
  "INTP": ["통찰력", "지혜", "직관", "완벽주의"],
  "ISFP": ["감성", "섬세함", "적응력", "유연함"],
};

// ━━━ 메인 분석 함수 ━━━
export function analyzeMBTI(
  dayCheongan: Cheongan,
  zodiacName: string,
  zodiacElement: string,
): MBTIResult {
  const mapping = CHEONGAN_MBTI_MAP[dayCheongan];
  const primaryType = mapping.primary;
  const secondaryType = mapping.secondary;

  const profile = MBTI_DATA[primaryType] || MBTI_DATA["ENTJ"];

  return {
    primaryType,
    secondaryType,
    description: profile.description,
    strengths: profile.strengths,
    weaknesses: profile.weaknesses,
    career: profile.career,
    loveStyle: profile.loveStyle,
    compatibility_best: profile.compatibility_best,
    compatibility_worst: profile.compatibility_worst,
    sajuAlignment: generateSajuAlignment(dayCheongan, primaryType),
    zodiacAlignment: generateZodiacAlignment(primaryType, zodiacName, zodiacElement),
  };
}
