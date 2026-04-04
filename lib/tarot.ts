// lib/tarot.ts
// 타로 메이저 아르카나 — 생년월일 기반 결정론적 리딩

export interface TarotCard {
  number: number;          // 0-21 (Major Arcana)
  name: string;            // "바보", "마법사", etc.
  nameEn: string;          // "The Fool", "The Magician"
  upright: string[];       // 정방향 키워드
  reversed: string[];      // 역방향 키워드
  description: string;     // 4-5 sentences interpretation
  advice: string;          // 2 sentences life advice
  element: string;         // 연결된 원소
  planet: string;          // 연결된 행성
  sajuConnection: string;  // How this card connects to saju reading
}

export interface TarotReading {
  birthCard: TarotCard;           // 생년월일 기반 탄생 카드
  yearCard: TarotCard;            // 올해의 카드
  crossMessage: string;           // How tarot confirms other systems
}

// ━━━ 22장 메이저 아르카나 ━━━

const MAJOR_ARCANA: TarotCard[] = [
  {
    number: 0,
    name: "바보",
    nameEn: "The Fool",
    upright: ["새로운 시작", "순수함", "모험", "자유로운 영혼"],
    reversed: ["무모함", "부주의", "방향 상실", "위험 무시"],
    description: "바보 카드는 무한한 가능성의 시작점을 상징합니다. 아직 아무것도 정해지지 않았기에 어디로든 갈 수 있는 자유를 가지고 있습니다. 세상에 대한 순수한 호기심과 두려움 없는 도전 정신이 이 카드의 핵심입니다. 때로는 무모해 보일 수 있지만, 그 안에는 우주를 신뢰하는 깊은 믿음이 있습니다.",
    advice: "새로운 도전을 두려워하지 마세요. 때로는 계획 없이 뛰어드는 것이 가장 큰 배움이 됩니다.",
    element: "공기",
    planet: "천왕성",
    sajuConnection: "사주의 편관(偏官)과 유사한 에너지로, 틀을 깨고 새로운 길을 개척하는 힘을 나타냅니다. 오행 중 木의 생장하는 기운과 맞닿아 있습니다.",
  },
  {
    number: 1,
    name: "마법사",
    nameEn: "The Magician",
    upright: ["의지력", "창조", "기술", "집중"],
    reversed: ["조작", "속임수", "미숙함", "의지 부족"],
    description: "마법사는 하늘과 땅을 연결하는 통로이자, 의지로 현실을 창조하는 힘을 상징합니다. 네 가지 원소를 모두 다루는 능력은 다재다능함과 무한한 잠재력을 의미합니다. 당신이 원하는 것을 이루기 위한 모든 도구가 이미 준비되어 있습니다. 필요한 것은 오직 집중된 의지와 행동뿐입니다.",
    advice: "당신에게는 이미 필요한 모든 능력이 있습니다. 흩어진 에너지를 하나의 목표에 집중하세요.",
    element: "공기",
    planet: "수성",
    sajuConnection: "사주의 식신(食神)과 연결되어, 재능을 표현하고 창조하는 능력을 나타냅니다. 천간의 甲(갑)처럼 시작하고 이끄는 리더십의 에너지입니다.",
  },
  {
    number: 2,
    name: "여사제",
    nameEn: "The High Priestess",
    upright: ["직관", "무의식", "신비", "내면의 지혜"],
    reversed: ["비밀", "단절", "표면적 판단", "직관 무시"],
    description: "여사제는 보이지 않는 세계의 지혜를 간직한 존재입니다. 논리와 이성 너머에 있는 직관의 영역을 관장하며, 내면의 목소리에 귀를 기울이라고 말합니다. 달빛 아래에서만 보이는 진실이 있듯이, 이 카드는 깊은 내면으로의 여행을 권합니다. 모든 답은 이미 당신 안에 있습니다.",
    advice: "논리적 판단만으로는 부족한 순간이 있습니다. 조용히 내면의 소리에 귀 기울여 보세요.",
    element: "물",
    planet: "달",
    sajuConnection: "사주의 인수(印綬)와 깊이 연결되어, 학문과 지혜를 추구하는 성향을 나타냅니다. 오행 중 水의 깊고 고요한 지혜와 공명합니다.",
  },
  {
    number: 3,
    name: "여황제",
    nameEn: "The Empress",
    upright: ["풍요", "모성", "자연", "창조적 에너지"],
    reversed: ["과보호", "의존", "창조 정체", "소유욕"],
    description: "여황제는 대지의 풍요로움과 생명을 낳는 창조적 에너지를 상징합니다. 감각적 즐거움과 아름다움을 추구하며, 주변을 돌보고 키우는 따뜻한 마음을 가지고 있습니다. 자연의 순환처럼 당신의 삶에도 풍성한 결실의 시기가 다가오고 있습니다. 사랑과 아름다움이 당신을 통해 세상에 흐릅니다.",
    advice: "삶의 아름다움을 충분히 느끼세요. 당신이 돌보는 것들은 반드시 풍성한 열매를 맺습니다.",
    element: "흙",
    planet: "금성",
    sajuConnection: "사주의 정재(正財)와 연결되어, 안정적인 풍요와 현실적 풍성함을 의미합니다. 오행 중 土의 만물을 품어 기르는 덕성과 일치합니다.",
  },
  {
    number: 4,
    name: "황제",
    nameEn: "The Emperor",
    upright: ["권위", "구조", "안정", "리더십"],
    reversed: ["독재", "경직", "과도한 통제", "유연성 부족"],
    description: "황제는 질서와 구조를 세우는 힘을 상징합니다. 혼돈 속에서 체계를 만들고, 확고한 기반 위에 제국을 건설하는 능력을 나타냅니다. 책임감과 리더십이 이 카드의 핵심이며, 합리적 판단으로 주변을 이끕니다. 안정된 기반이 있어야 더 높이 올라갈 수 있습니다.",
    advice: "지금은 구조와 계획을 세울 때입니다. 명확한 경계와 규칙이 오히려 자유를 만들어 줍니다.",
    element: "불",
    planet: "화성",
    sajuConnection: "사주의 비견(比肩)과 편관(偏官)의 결합된 에너지로, 강한 자아와 리더십을 나타냅니다. 천간의 庚(경)처럼 단호하고 결단력 있는 기운입니다.",
  },
  {
    number: 5,
    name: "교황",
    nameEn: "The Hierophant",
    upright: ["전통", "가르침", "신앙", "제도"],
    reversed: ["독단", "형식주의", "반항", "새로운 관점 필요"],
    description: "교황은 전통과 가르침의 가치를 상징합니다. 오랜 세월 검증된 지혜와 제도 속에서 의미를 찾는 카드입니다. 멘토나 스승의 역할이 중요한 시기이며, 배움을 통한 성장이 강조됩니다. 개인의 깨달음을 넘어 공동체와 함께 나누는 지혜가 진정한 가치입니다.",
    advice: "혼자만의 길을 고집하지 마세요. 경험 많은 이의 조언에서 뜻밖의 답을 찾을 수 있습니다.",
    element: "흙",
    planet: "금성",
    sajuConnection: "사주의 정인(正印)과 연결되어, 정통 학문과 전통적 가르침을 중시하는 성향입니다. 오행 중 土의 안정감과 포용력이 이 카드의 기반입니다.",
  },
  {
    number: 6,
    name: "연인",
    nameEn: "The Lovers",
    upright: ["사랑", "조화", "선택", "가치관"],
    reversed: ["불균형", "갈등", "가치관 충돌", "유혹"],
    description: "연인 카드는 단순한 연애를 넘어 인생의 중요한 선택과 가치관의 조화를 의미합니다. 두 가지 길 사이에서 진정한 자아에 맞는 선택을 하는 것이 핵심입니다. 관계 속에서 서로를 비추며 성장하는 상호 발전의 에너지가 흐릅니다. 마음이 이끄는 방향이 곧 올바른 길입니다.",
    advice: "머리가 아닌 가슴의 소리를 따르세요. 진정한 조화는 자신에게 솔직할 때 찾아옵니다.",
    element: "공기",
    planet: "수성",
    sajuConnection: "사주의 정관(正官)과 정재(正財)의 조화로운 관계와 닮아 있습니다. 음양의 균형과 조화가 이 카드의 핵심 메시지입니다.",
  },
  {
    number: 7,
    name: "전차",
    nameEn: "The Chariot",
    upright: ["승리", "의지", "결단", "전진"],
    reversed: ["방향 상실", "공격성", "좌절", "통제 불능"],
    description: "전차는 강력한 의지와 결단으로 앞으로 나아가는 힘을 상징합니다. 상반된 두 힘을 동시에 다루면서 목표를 향해 돌진하는 능력이 핵심입니다. 장애물을 극복하고 승리를 쟁취하는 에너지가 가득합니다. 지금은 멈출 때가 아니라 전진할 때입니다.",
    advice: "목표를 향해 흔들리지 않고 나아가세요. 내면의 갈등을 통합하면 어떤 장애물도 넘을 수 있습니다.",
    element: "물",
    planet: "달",
    sajuConnection: "사주의 편관(偏官)과 겁재(劫財)의 에너지로, 강한 추진력과 경쟁에서 승리하는 기운입니다. 오행 중 木의 곧게 뻗어나가는 힘과 일치합니다.",
  },
  {
    number: 8,
    name: "힘",
    nameEn: "Strength",
    upright: ["내면의 힘", "용기", "인내", "자비"],
    reversed: ["자기 의심", "나약함", "분노", "자제력 상실"],
    description: "힘 카드는 물리적 힘이 아닌 내면의 힘을 상징합니다. 분노와 두려움을 부드럽게 다스리는 지혜, 그리고 끝없는 인내와 용기가 핵심입니다. 사자를 길들이는 것은 폭력이 아닌 사랑과 자비의 힘입니다. 진정한 강함은 부드러움 속에 있습니다.",
    advice: "강한 것은 참는 것이 아니라 이해하는 것입니다. 자신의 어둠을 포용할 때 진정한 힘이 생깁니다.",
    element: "불",
    planet: "태양",
    sajuConnection: "사주의 정관(正官)과 인수(印綬)의 조화로, 부드러운 카리스마와 내면의 절제력을 나타냅니다. 오행 중 火의 따뜻하게 감싸는 에너지입니다.",
  },
  {
    number: 9,
    name: "은둔자",
    nameEn: "The Hermit",
    upright: ["내면 탐색", "고독", "지혜", "길 안내"],
    reversed: ["고립", "외로움", "현실 도피", "방향 상실"],
    description: "은둔자는 세상의 소음에서 벗어나 내면의 빛을 찾아 떠나는 여정을 상징합니다. 홀로 깊은 산에 올라 진리를 구하는 수행자의 모습이며, 고독 속에서 발견하는 지혜가 핵심입니다. 이 시기는 외부보다 내면을 돌아볼 때입니다. 등대의 빛은 먼저 자신을 비추고 나서 다른 이들의 길을 밝혀줍니다.",
    advice: "바쁜 일상에서 잠시 벗어나 자신만의 시간을 가지세요. 침묵 속에서 가장 큰 답이 들립니다.",
    element: "흙",
    planet: "수성",
    sajuConnection: "사주의 편인(偏印)과 깊이 공명하여, 독자적인 사유와 비전통적 지혜를 추구하는 성향입니다. 오행 중 水의 고요하고 깊은 지혜와 통합니다.",
  },
  {
    number: 10,
    name: "운명의 수레바퀴",
    nameEn: "Wheel of Fortune",
    upright: ["전환점", "운명", "순환", "기회"],
    reversed: ["저항", "불운", "통제 불능", "반복"],
    description: "운명의 수레바퀴는 삶의 끊임없는 순환과 변화를 상징합니다. 올라갈 때가 있으면 내려갈 때도 있고, 어둠 뒤에는 반드시 빛이 옵니다. 지금은 변화의 전환점에 서 있으며, 우주의 큰 흐름이 당신을 새로운 방향으로 이끌고 있습니다. 변화를 받아들이는 것이 곧 지혜입니다.",
    advice: "변화를 두려워하지 마세요. 지금의 전환은 더 높은 단계로 가기 위한 우주의 선물입니다.",
    element: "불",
    planet: "목성",
    sajuConnection: "사주의 대운(大運) 전환과 정확히 대응하는 카드로, 삶의 큰 흐름이 바뀌는 시기를 나타냅니다. 천간지지의 순환과 같은 우주적 리듬을 담고 있습니다.",
  },
  {
    number: 11,
    name: "정의",
    nameEn: "Justice",
    upright: ["공정", "진실", "균형", "책임"],
    reversed: ["불공정", "부정직", "불균형", "회피"],
    description: "정의 카드는 진실과 공정함의 가치를 상징합니다. 저울처럼 정확한 균형을 추구하며, 모든 행위에는 그에 상응하는 결과가 따른다는 인과의 법칙을 나타냅니다. 편견 없는 판단과 진실에 대한 용기가 필요한 시기입니다. 정직한 자기 성찰이 올바른 길을 열어줍니다.",
    advice: "진실을 직시하는 용기를 가지세요. 공정한 판단은 항상 장기적으로 최선의 결과를 가져옵니다.",
    element: "공기",
    planet: "금성",
    sajuConnection: "사주의 정관(正官)과 직접 연결되어, 바른 도리와 원칙을 중시하는 기운입니다. 오행 중 金의 결단력과 정의로움이 이 카드의 본질입니다.",
  },
  {
    number: 12,
    name: "매달린 사람",
    nameEn: "The Hanged Man",
    upright: ["희생", "새로운 관점", "인내", "내려놓음"],
    reversed: ["집착", "무의미한 희생", "지연", "답보"],
    description: "매달린 사람은 익숙한 관점을 뒤집어 새로운 시각을 얻는 것을 상징합니다. 물리적으로는 멈춰 있지만, 정신적으로는 가장 활발한 깨달음의 시기입니다. 세상이 거꾸로 보일 때 비로소 보이는 진실이 있습니다. 기꺼이 내려놓을 때 더 큰 것을 얻게 됩니다.",
    advice: "지금은 무리하게 밀어붙일 때가 아닙니다. 잠시 멈추고 다른 각도에서 상황을 바라보세요.",
    element: "물",
    planet: "해왕성",
    sajuConnection: "사주의 편인(偏印)과 상관(傷官)의 에너지로, 기존의 틀을 깨고 새로운 관점을 얻는 과정입니다. 오행의 상극 관계에서 변화가 일어나는 전환점과 같습니다.",
  },
  {
    number: 13,
    name: "죽음",
    nameEn: "Death",
    upright: ["변환", "끝과 시작", "전환", "해방"],
    reversed: ["저항", "변화 거부", "정체", "두려움"],
    description: "죽음 카드는 물리적 죽음이 아닌, 근본적인 변화와 전환을 의미합니다. 낡은 것이 끝나야 새로운 것이 시작될 수 있듯이, 지금은 과거를 정리하고 새 장을 열 시기입니다. 나비가 되기 위해 애벌레의 형태를 완전히 버려야 하는 것처럼, 깊은 변환이 일어나고 있습니다. 끝은 곧 시작입니다.",
    advice: "과거에 집착하지 마세요. 지금 일어나는 변화는 더 나은 자신으로 거듭나기 위한 필수 과정입니다.",
    element: "물",
    planet: "명왕성",
    sajuConnection: "사주의 대운 교체기와 대응하며, 기존 삶의 패턴이 근본적으로 변화하는 시기를 나타냅니다. 오행의 상극 관계에서 오는 파괴와 재생의 에너지입니다.",
  },
  {
    number: 14,
    name: "절제",
    nameEn: "Temperance",
    upright: ["균형", "조화", "인내", "중용"],
    reversed: ["과도함", "불균형", "조급함", "극단"],
    description: "절제는 상반된 것들의 완벽한 조화와 중용의 미덕을 상징합니다. 물과 불, 하늘과 땅 사이에서 균형을 잡는 천사의 모습처럼, 삶의 다양한 영역 사이에서 조화를 이루는 것이 중요합니다. 서두르지 않고 천천히, 그러나 꾸준히 나아가는 힘이 있습니다. 극단을 피하고 중심을 잡을 때 가장 큰 힘이 발휘됩니다.",
    advice: "모든 것에 적절한 때가 있습니다. 조급함을 내려놓고 균형 잡힌 시각으로 상황을 바라보세요.",
    element: "불",
    planet: "목성",
    sajuConnection: "사주에서 오행이 균형을 이루는 이상적인 상태와 같습니다. 음양의 조화가 잘 이루어질 때 나타나는 평화롭고 안정된 에너지입니다.",
  },
  {
    number: 15,
    name: "악마",
    nameEn: "The Devil",
    upright: ["속박", "그림자", "집착", "물질주의"],
    reversed: ["해방", "극복", "자각", "사슬 끊기"],
    description: "악마 카드는 우리를 속박하는 집착과 두려움의 그림자를 상징합니다. 실제로 사슬은 느슨하여 벗어날 수 있지만, 스스로 갇혀 있다고 믿는 환상이 진짜 감옥입니다. 물질적 욕망이나 관계에 대한 집착이 자유를 가로막고 있을 수 있습니다. 자신의 그림자를 직시하는 것이 해방의 첫 걸음입니다.",
    advice: "당신을 묶고 있는 것이 무엇인지 정직하게 마주하세요. 인식하는 순간 그 사슬은 풀리기 시작합니다.",
    element: "흙",
    planet: "토성",
    sajuConnection: "사주에서 기신(忌神)이 강하게 작용하는 시기와 같습니다. 오행의 불균형이 집착과 속박을 만들지만, 이를 인식하면 극복의 길이 열립니다.",
  },
  {
    number: 16,
    name: "탑",
    nameEn: "The Tower",
    upright: ["붕괴", "깨달음", "해방", "근본적 변화"],
    reversed: ["변화 회피", "재앙 연장", "내부 전환", "서서히 무너짐"],
    description: "탑 카드는 거짓된 기반 위에 세워진 것들이 무너지는 순간을 상징합니다. 벼락이 치는 순간은 고통스럽지만, 그것은 진실의 빛이기도 합니다. 거짓과 환상이 무너진 자리에 진짜를 세울 수 있습니다. 지금의 혼란은 더 단단한 기반을 만들기 위한 필수적 과정입니다.",
    advice: "무너지는 것을 붙잡으려 하지 마세요. 진짜가 아닌 것이 사라질 때 비로소 진짜를 세울 공간이 생깁니다.",
    element: "불",
    planet: "화성",
    sajuConnection: "사주에서 충(冲)이 일어나는 시기와 대응합니다. 기존 구조가 깨지면서 고통스럽지만, 이후 더 진실된 삶을 살 수 있는 계기가 됩니다.",
  },
  {
    number: 17,
    name: "별",
    nameEn: "The Star",
    upright: ["희망", "영감", "치유", "평온"],
    reversed: ["절망", "신뢰 상실", "연결 단절", "무감각"],
    description: "별 카드는 폭풍이 지나간 후 찾아오는 고요한 희망을 상징합니다. 밤하늘의 별처럼 어둠 속에서도 빛나는 내면의 빛이 있습니다. 상처를 치유하고 영혼을 회복하는 시기이며, 우주와의 깊은 연결을 느끼게 됩니다. 당신은 올바른 길 위에 있으며, 우주가 당신을 지지하고 있습니다.",
    advice: "폭풍 뒤의 고요함을 신뢰하세요. 지금 느끼는 평화는 앞으로 올 좋은 것들의 전주곡입니다.",
    element: "공기",
    planet: "천왕성",
    sajuConnection: "사주에서 용신(用神)이 힘을 얻는 시기와 같습니다. 오행의 균형이 회복되면서 자연스러운 행운과 기회가 찾아오는 에너지입니다.",
  },
  {
    number: 18,
    name: "달",
    nameEn: "The Moon",
    upright: ["무의식", "환상", "직관", "불안"],
    reversed: ["혼란 해소", "진실 발견", "두려움 극복", "명확함"],
    description: "달 카드는 무의식의 깊은 세계와 환상의 영역을 상징합니다. 달빛 아래에서는 모든 것이 불확실하게 보이며, 진짜와 가짜의 경계가 흐려집니다. 불안과 두려움이 있지만, 그 너머에는 깊은 직관의 메시지가 숨어 있습니다. 꿈과 직감에 주의를 기울여 보세요.",
    advice: "불확실함 속에서도 내면의 나침반을 신뢰하세요. 모든 것이 명확하지 않아도 길은 존재합니다.",
    element: "물",
    planet: "달",
    sajuConnection: "사주에서 편인(偏印)이 강할 때의 에너지와 유사합니다. 직관과 영감이 강해지지만, 현실과 환상의 구분이 중요한 시기입니다.",
  },
  {
    number: 19,
    name: "태양",
    nameEn: "The Sun",
    upright: ["활력", "성공", "기쁨", "명확함"],
    reversed: ["과신", "지연된 성공", "내면의 어린이 억압", "활력 저하"],
    description: "태양 카드는 가장 밝고 긍정적인 에너지를 상징합니다. 모든 것이 명확하게 보이며, 성공과 기쁨이 넘치는 시기입니다. 순수한 기쁨과 활력이 당신의 삶을 환하게 비추고 있습니다. 내면의 빛이 외부에도 밝게 빛나는 때이니, 자신감을 가지고 나아가세요.",
    advice: "지금은 당신이 빛나는 시기입니다. 그 빛을 주변과 나눌수록 더 풍성해집니다.",
    element: "불",
    planet: "태양",
    sajuConnection: "사주에서 일간(日干)이 강하고 용신(用神)이 활발한 상태와 같습니다. 오행 중 火의 밝고 따뜻한 에너지가 모든 영역에서 빛나는 시기입니다.",
  },
  {
    number: 20,
    name: "심판",
    nameEn: "Judgement",
    upright: ["부활", "각성", "소명", "자기 평가"],
    reversed: ["자기 비판", "후회", "소명 무시", "내면의 부름 거부"],
    description: "심판 카드는 과거를 돌아보고 새로운 차원으로 도약하는 각성의 순간을 상징합니다. 나팔 소리에 죽은 자가 일어나듯, 잠들어 있던 당신의 진정한 사명이 깨어납니다. 과거의 경험을 종합하여 더 높은 차원의 이해에 도달하는 시기입니다. 내면의 부름에 응답할 때입니다.",
    advice: "과거를 후회하기보다 그 경험에서 배운 것에 감사하세요. 진정한 사명이 당신을 부르고 있습니다.",
    element: "불",
    planet: "명왕성",
    sajuConnection: "사주의 대운 전환기에 해당하며, 과거 경험의 총체가 새로운 방향을 제시합니다. 오행의 순환이 한 바퀴를 돌아 새로운 차원으로 진입하는 에너지입니다.",
  },
  {
    number: 21,
    name: "세계",
    nameEn: "The World",
    upright: ["완성", "통합", "성취", "여행"],
    reversed: ["미완성", "정체", "완결 회피", "불완전"],
    description: "세계 카드는 여정의 완성과 통합을 상징하는, 메이저 아르카나의 마지막 카드입니다. 모든 경험이 하나로 합쳐져 완전한 이해에 도달한 상태입니다. 한 순환이 완성되면서 동시에 새로운 순환의 시작점에 서 있습니다. 지금까지의 여정을 축하하되, 더 큰 세계가 기다리고 있음을 기억하세요.",
    advice: "당신은 하나의 큰 순환을 완성했습니다. 성취를 충분히 즐긴 후 새로운 모험을 시작하세요.",
    element: "흙",
    planet: "토성",
    sajuConnection: "사주에서 오행이 완벽한 균형을 이루는 이상적 상태와 같습니다. 모든 체계가 하나의 결론으로 수렴하는 DESTINO의 교차점 분석과 같은 통합의 에너지입니다.",
  },
];

// ━━━ 디짓 합산 & 축소 ━━━

function sumDigits(n: number): number {
  return String(Math.abs(n))
    .split("")
    .reduce((sum, d) => sum + parseInt(d, 10), 0);
}

function reduceToArcana(total: number): number {
  // 1-22 범위로 축소, 그 후 0-21로 매핑
  let n = total;
  while (n > 22) {
    n = sumDigits(n);
  }
  if (n === 0) n = 22; // 22 = The Fool variant, map to 0
  // map 1-22 → 0-21
  return n === 22 ? 0 : n - 1;
}

// ━━━ 탄생 카드 계산 ━━━

export function calculateBirthCard(year: number, month: number, day: number): TarotCard {
  const total = sumDigits(year) + sumDigits(month) + sumDigits(day);
  const index = reduceToArcana(total);
  return MAJOR_ARCANA[index];
}

// ━━━ 연간 카드 계산 ━━━

export function calculateYearCard(
  year: number,
  month: number,
  day: number,
  currentYear: number = new Date().getFullYear()
): TarotCard {
  const birthDigits = sumDigits(year) + sumDigits(month) + sumDigits(day);
  const yearDigits = sumDigits(currentYear);
  const total = birthDigits + yearDigits;
  const index = reduceToArcana(total);
  return MAJOR_ARCANA[index];
}

// ━━━ 교차 메시지 생성 ━━━

const CROSS_TEMPLATES = [
  (birth: TarotCard, yr: TarotCard) =>
    `탄생 카드 "${birth.name}"의 ${birth.element} 에너지가 올해 "${yr.name}" 카드의 흐름과 만나, ${birth.upright[0]}과(와) ${yr.upright[0]}이(가) 교차하는 시기입니다. 사주 분석에서도 비슷한 전환의 기운이 감지됩니다.`,
  (birth: TarotCard, yr: TarotCard) =>
    `"${birth.name}"이(가) 당신의 본질이라면, "${yr.name}"은(는) 올해의 과제입니다. ${birth.sajuConnection.split(".")[0]}. 이 두 에너지의 합류점에서 성장의 기회를 찾으세요.`,
  (birth: TarotCard, yr: TarotCard) =>
    `${birth.element}의 기운을 타고난 당신에게 올해는 ${yr.element}의 에너지가 강하게 작용합니다. "${birth.name}"의 ${birth.upright[1]}과(와) "${yr.name}"의 ${yr.upright[1]}이(가) 만나는 교차점에서, 사주와 수비학 분석에서도 확인되는 중요한 전환이 일어납니다.`,
];

function generateCrossMessage(birthCard: TarotCard, yearCard: TarotCard): string {
  // 결정론적 선택: 두 카드 번호의 합으로 템플릿 선택
  const templateIndex = (birthCard.number + yearCard.number) % CROSS_TEMPLATES.length;
  return CROSS_TEMPLATES[templateIndex](birthCard, yearCard);
}

// ━━━ 타로 리딩 생성 ━━━

export function generateTarotReading(
  year: number,
  month: number,
  day: number,
  currentYear: number = new Date().getFullYear()
): TarotReading {
  const birthCard = calculateBirthCard(year, month, day);
  const yearCard = calculateYearCard(year, month, day, currentYear);
  const crossMessage = generateCrossMessage(birthCard, yearCard);

  return { birthCard, yearCard, crossMessage };
}

// ━━━ 카드 로마 숫자 ━━━

const ROMAN_NUMERALS = [
  "0", "I", "II", "III", "IV", "V", "VI", "VII",
  "VIII", "IX", "X", "XI", "XII", "XIII", "XIV",
  "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI",
];

export function toRomanNumeral(n: number): string {
  return ROMAN_NUMERALS[n] ?? String(n);
}
