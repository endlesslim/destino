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
  detailed_personality: string;
  love_style: string;
  career_strengths: string[];
  shadow_side: string;
  compatibility_best: string[];
  compatibility_worst: string[];
  life_lesson: string;
}

export const ZODIAC: ZodiacSign[] = [
  {
    name:"양자리", en:"Aries", symbol:"♈", element:"Fire", element_kr:"화",
    modality:"Cardinal", modality_kr:"활동궁", ruler:"Mars", ruler_kr:"화성",
    house:1, date_range:"3/21~4/19",
    trait:["용기","주도력","열정","성급함"],
    personality:"시작하는 불. 두려움 없이 돌진하는 개척자.",
    color:"#C53D43",
    detailed_personality:"양자리는 황도대의 첫 번째 별자리로서, 태어나는 순간부터 '최초'가 되려는 본능을 가진다. 화성의 지배를 받아 행동이 사고보다 먼저 나가며, 그 즉각적인 추진력이 주변을 압도한다. 두려움이라는 감정이 거의 없어 남들이 주저하는 곳에 가장 먼저 뛰어들지만, 같은 이유로 위험을 과소평가하는 경향이 있다. 패배해도 금세 털고 일어나는 회복력이 비범하며, 인생을 전장으로 여기는 전사의 기질이 있다. 어린아이 같은 순수함과 전사의 용맹이 공존하는 독특한 조합이다.",
    love_style:"사랑에 빠지면 온 세상이 멈추는 것처럼 전력으로 돌진한다. 추격하는 과정 자체에 희열을 느끼기에, 너무 쉽게 손에 넣은 사랑에는 금세 흥미를 잃을 수 있다. 연인에게 강렬한 열정을 보여주지만, 일상적 안정보다 새로운 자극을 원하는 마음이 늘 공존한다.",
    career_strengths:["창업·스타트업 — 무에서 유를 만드는 개척력","스포츠·경쟁 분야 — 승부욕과 체력이 무기","소방관·응급구조 — 위기 상황에서 빛나는 즉각적 판단력","세일즈·영업 — 거절에 굴하지 않는 추진력"],
    shadow_side:"인내심의 부재가 가장 큰 그림자이다. 시작은 화려하지만 마무리가 허술하고, 충동적 결정이 후회로 이어지는 패턴이 반복된다. 자기중심적 사고에 빠지면 주변의 감정을 무시하는 '불도저'가 될 수 있으며, 분노 조절이 평생의 과제이다.",
    compatibility_best:["사자자리","사수자리","쌍둥이자리"],
    compatibility_worst:["게자리","염소자리","천칭자리"],
    life_lesson:"진정한 용기는 돌진하는 것이 아니라, 멈출 줄 아는 것이다. 속도를 늦추는 법을 배울 때 당신의 불꽃은 더 오래, 더 밝게 탄다."
  },
  {
    name:"황소자리", en:"Taurus", symbol:"♉", element:"Earth", element_kr:"토",
    modality:"Fixed", modality_kr:"고정궁", ruler:"Venus", ruler_kr:"금성",
    house:2, date_range:"4/20~5/20",
    trait:["인내","감각","소유욕","완고함"],
    personality:"뿌리 내린 대지. 한번 잡으면 절대 놓지 않는 끈기.",
    color:"#2D5A27",
    detailed_personality:"황소자리는 금성의 지배를 받아 아름다움과 쾌락에 대한 감각이 타고났다. 오감이 예민하여 좋은 음식, 아름다운 음악, 부드러운 감촉에서 깊은 행복을 느끼며, 이 감각적 경험이 삶의 원동력이 된다. 한번 자리를 잡으면 뿌리를 깊이 내려 좀처럼 움직이지 않는 불변의 에너지가 있으며, 이것이 놀라운 인내력의 근원이다. 물질적 안정을 중시하여 재산을 모으는 능력이 뛰어나고, 소유한 것에 대한 애착이 강하다. 느리지만 확실한, 그것이 황소자리의 전략이다.",
    love_style:"사랑할 때 온 감각을 동원하여 상대를 느끼며, 스킨십과 물질적 표현으로 애정을 보여준다. 한번 마음을 준 상대에게는 끝없이 충실하지만, 소유욕이 질투로 변하면 관계가 질식할 수 있다. 안정적이고 예측 가능한 사랑을 원하며, 갑작스러운 변화나 불확실성에 극도로 불안해한다.",
    career_strengths:["금융·자산관리 — 돈의 흐름을 읽고 불리는 감각","요리사·소믈리에 — 미각과 후각의 천부적 재능","부동산·건축 — 공간과 가치에 대한 직관","음악가·성악가 — 금성이 부여한 소리의 감각"],
    shadow_side:"변화를 극도로 두려워하여 이미 끝난 관계나 상황에 매달리는 경우가 있다. 물질에 대한 집착이 탐욕으로 변하면 인간관계가 피폐해지고, 완고함이 지나치면 스스로의 성장마저 가로막는다. 분노가 느리게 쌓이지만 한번 폭발하면 통제 불능이 된다.",
    compatibility_best:["처녀자리","염소자리","게자리"],
    compatibility_worst:["물병자리","사자자리","전갈자리"],
    life_lesson:"잡고 있는 것을 놓아야 새로운 것이 들어올 수 있다. 소유가 아닌 경험에서 진정한 풍요를 찾을 때, 당신의 대지는 더 넓어진다."
  },
  {
    name:"쌍둥이자리", en:"Gemini", symbol:"♊", element:"Air", element_kr:"풍",
    modality:"Mutable", modality_kr:"변통궁", ruler:"Mercury", ruler_kr:"수성",
    house:3, date_range:"5/21~6/20",
    trait:["소통","호기심","다재다능","산만함"],
    personality:"두 개의 마음. 끊임없이 정보를 흡수하고 연결하는 지성.",
    color:"#8B6914",
    detailed_personality:"쌍둥이자리는 수성의 지배를 받아 커뮤니케이션과 정보 처리에 있어 12궁 중 가장 뛰어난 능력을 보인다. 하나의 자아에 두 개 이상의 인격이 공존하는 듯, 상황에 따라 전혀 다른 모습을 보여 주변을 놀라게 한다. 호기심이 끝없어 한 가지 주제에 몰두하기 어렵지만, 바로 그 다양성이 분야를 넘나드는 창의적 연결을 가능하게 한다. 말과 글에 천부적 재능이 있어 복잡한 개념을 쉽게 전달하며, 사교적 매력으로 어떤 모임에서든 분위기를 살린다. 그러나 깊이보다 넓이를 추구하는 성향이 관계와 전문성 모두에서 '얕음'이라는 약점이 될 수 있다.",
    love_style:"지적인 대화가 가능한 상대에게 끌리며, 머리가 먼저 사랑에 빠진다. 연애에서도 새로움과 자극을 끊임없이 원하기에, 대화가 끊긴 관계에서 가장 먼저 떠나는 별자리이다. 가볍고 유쾌한 연애를 선호하지만, 진정으로 깊은 감정을 느끼면 자기 자신도 당황하는 경우가 있다.",
    career_strengths:["저널리스트·작가 — 정보를 모으고 전달하는 천부적 능력","마케터·SNS 전문가 — 트렌드를 읽고 말로 풀어내는 감각","통역·번역가 — 언어에 대한 비범한 감각","교사·강사 — 어려운 것을 쉽게 설명하는 재주"],
    shadow_side:"진정한 감정적 깊이를 회피하는 경향이 있어, 표면적 관계만 맺다가 외로움에 시달릴 수 있다. 말이 너무 많아 비밀을 지키지 못하거나 과장하는 습관이 신뢰를 해칠 수 있다. 약속을 가볍게 여기고 변덕이 심해 '믿을 수 없는 사람'이라는 인상을 주기 쉽다.",
    compatibility_best:["천칭자리","물병자리","양자리"],
    compatibility_worst:["처녀자리","물고기자리","사수자리"],
    life_lesson:"백 가지를 맛보는 것보다 하나를 깊이 음미하는 것이 진정한 앎이다. 깊이 내려가는 법을 배울 때, 당신의 지성은 지혜로 성숙한다."
  },
  {
    name:"게자리", en:"Cancer", symbol:"♋", element:"Water", element_kr:"수",
    modality:"Cardinal", modality_kr:"활동궁", ruler:"Moon", ruler_kr:"달",
    house:4, date_range:"6/21~7/22",
    trait:["양육","보호","감성","방어적"],
    personality:"감정의 바다. 단단한 껍질 안에 가장 부드러운 마음.",
    color:"#1E3A5F",
    detailed_personality:"게자리는 달의 지배를 받아 감정의 흐름에 극도로 민감하며, 달이 차고 기울듯 기분의 변화가 주기적으로 찾아온다. 가족과 가정에 대한 본능적 애착이 깊어, 사랑하는 사람들을 위해서라면 어떤 희생도 마다하지 않는다. 겉으로는 단단한 껍질을 두르고 있어 냉정해 보이지만, 그 안에는 12궁 중 가장 부드럽고 여린 감성이 숨어 있다. 과거에 대한 향수가 강하고 추억을 소중히 간직하며, 어린 시절의 경험이 평생의 성격을 좌우한다. 직관력이 뛰어나 분위기를 읽는 능력이 탁월하고, 타인의 감정을 마치 자기 것처럼 느끼는 공감 능력의 소유자이다.",
    love_style:"사랑할 때 온전히 상대를 감싸 안으며, 모성적(또는 부성적) 돌봄으로 연인을 보살핀다. 안전하고 안정적인 관계를 갈망하며, 작은 배신에도 깊은 상처를 받아 오랜 시간 회복이 필요하다. 집이라는 공간에서 함께 시간을 보내는 것을 가장 행복하게 느끼며, 가정을 꾸리려는 욕구가 강하다.",
    career_strengths:["간호사·의료인 — 환자를 돌보는 천성적 양육 능력","요리사·제빵사 — 먹이고 돌보는 것에서 오는 행복감","교육자·보육교사 — 아이들의 감정을 읽고 키우는 능력","부동산·인테리어 — 집과 공간에 대한 직관적 감각"],
    shadow_side:"감정에 휘둘리면 객관적 판단이 흐려지고, 과거의 상처에 집착하여 현재를 놓치기 쉽다. 보호 본능이 지나치면 상대의 자율성을 침해하는 통제로 변질되고, 피해의식에 빠지면 '나만 희생한다'는 감정이 주변을 힘들게 한다. 변화에 대한 두려움이 성장의 기회를 가로막을 수 있다.",
    compatibility_best:["전갈자리","물고기자리","황소자리"],
    compatibility_worst:["양자리","천칭자리","물병자리"],
    life_lesson:"껍질은 보호하기 위한 것이지, 세상을 차단하기 위한 것이 아니다. 상처받을 용기를 낼 때, 당신의 사랑은 더 깊고 넓어진다."
  },
  {
    name:"사자자리", en:"Leo", symbol:"♌", element:"Fire", element_kr:"화",
    modality:"Fixed", modality_kr:"고정궁", ruler:"Sun", ruler_kr:"태양",
    house:5, date_range:"7/23~8/22",
    trait:["자존감","창의력","관대함","오만함"],
    personality:"빛나는 태양. 무대 위에서 가장 자연스러운 사람.",
    color:"#C53D43",
    detailed_personality:"사자자리는 태양의 지배를 받아 존재 자체가 빛을 발하며, 어디에 있든 자연스럽게 시선의 중심이 된다. 자존감과 자기 확신이 강하여 자신만의 왕국을 건설하려는 본능이 있고, 그 왕국 안의 사람들에게는 한없이 관대하다. 창의적 표현에 대한 욕구가 강해 예술, 공연, 리더십 등 자신을 드러낼 수 있는 분야에서 빛을 발한다. 충성스러운 사람에게는 왕 같은 보상을 내리지만, 자신의 권위에 도전하는 사람에게는 사자의 발톱을 보여준다. 따뜻하고 너그러운 태양이 되느냐, 모든 것을 태우는 불덩어리가 되느냐는 자기 인식에 달려 있다.",
    love_style:"사랑할 때 왕자(공주)처럼 대접받기를 원하며, 동시에 상대를 자신의 왕국의 보석처럼 아낀다. 로맨틱한 제스처와 드라마틱한 표현을 즐기며, 사랑받고 있다는 확인을 끊임없이 필요로 한다. 칭찬과 인정이 사랑의 언어이며, 이것이 없으면 관계에서 빠르게 시들어간다.",
    career_strengths:["배우·감독·연출가 — 무대 위에서 가장 자연스러운 존재","CEO·조직 리더 — 사람들에게 비전을 제시하는 카리스마","이벤트 기획자 — 화려한 경험을 만들어내는 창의력","패션·럭셔리 산업 — 품격과 아름다움에 대한 감각"],
    shadow_side:"자존감의 이면에 인정 욕구가 숨어 있어, 칭찬받지 못하면 극도로 불안해진다. 자기중심적 세계관에 갇히면 타인의 빛을 질투하거나 억누르려 하고, 비판을 수용하지 못하여 성장이 멈출 수 있다. '내가 항상 옳다'는 믿음이 오만함으로 변질되면 왕좌에서 내려오게 된다.",
    compatibility_best:["양자리","사수자리","쌍둥이자리"],
    compatibility_worst:["전갈자리","황소자리","물병자리"],
    life_lesson:"왕관의 무게는 혼자 지는 것이 아니다. 다른 사람도 빛날 수 있게 비켜설 줄 아는 것이 진정한 왕의 품격이다."
  },
  {
    name:"처녀자리", en:"Virgo", symbol:"♍", element:"Earth", element_kr:"토",
    modality:"Mutable", modality_kr:"변통궁", ruler:"Mercury", ruler_kr:"수성",
    house:6, date_range:"8/23~9/22",
    trait:["분석력","봉사","완벽주의","비판적"],
    personality:"정밀한 대지. 흐트러진 것을 바로잡는 장인의 눈.",
    color:"#2D5A27",
    detailed_personality:"처녀자리는 수성의 지배를 받되 쌍둥이자리와 달리 정보를 '분석하고 정리'하는 방향으로 에너지를 사용한다. 세상의 불완전함을 본능적으로 감지하고 그것을 바로잡으려는 충동이 있으며, 이것이 봉사와 헌신의 원동력이 된다. 디테일에 대한 집착이 놀라워 남들이 놓치는 오류를 즉각 발견하고, 시스템을 개선하는 데 탁월한 능력을 보인다. 겉으로는 차분하고 절제되어 보이지만, 내면에서는 끊임없이 자기 자신을 검증하고 채찍질하는 비평가가 살고 있다. 실용적이고 현실적이어서 뜬구름 잡는 이야기를 경멸하며, 모든 것에 쓸모와 이유가 있어야 직성이 풀린다.",
    love_style:"사랑을 행동으로 증명하는 타입으로, 연인의 건강을 챙기고 일상을 정리해주는 것이 애정 표현이다. 감정을 말로 표현하는 것은 서툴지만, 상대를 위해 묵묵히 헌신하는 모습에서 깊은 사랑이 묻어난다. 상대의 결점을 지적하는 것이 '사랑이기에 하는 조언'이라고 생각하지만, 이것이 관계의 독이 될 수 있음을 알아야 한다.",
    career_strengths:["의사·약사·영양사 — 건강과 치유에 대한 관심과 정밀함","편집자·교정자 — 오류를 잡아내는 날카로운 눈","데이터 분석가·연구원 — 방대한 정보를 정리하는 능력","회계사·감사 — 숫자의 불일치를 놓치지 않는 꼼꼼함"],
    shadow_side:"완벽주의가 심해지면 시작 자체를 두려워하는 분석 마비에 빠진다. 자기 자신에 대한 기준이 가혹할 정도로 높아 만성적 자기비하에 시달릴 수 있으며, 그 비판의 칼날을 타인에게도 들이대면 '잔소리꾼'이라는 딱지가 붙는다. 통제할 수 없는 상황에서 극심한 불안을 느낀다.",
    compatibility_best:["황소자리","염소자리","게자리"],
    compatibility_worst:["사수자리","쌍둥이자리","물고기자리"],
    life_lesson:"완벽함은 도달할 곳이 아니라 추구하는 과정에 있다. '충분히 좋은' 것을 받아들이는 법을 배울 때 비로소 마음의 평화가 온다."
  },
  {
    name:"천칭자리", en:"Libra", symbol:"♎", element:"Air", element_kr:"풍",
    modality:"Cardinal", modality_kr:"활동궁", ruler:"Venus", ruler_kr:"금성",
    house:7, date_range:"9/23~10/22",
    trait:["조화","공정","매력","우유부단"],
    personality:"균형의 바람. 관계 속에서 자신을 찾는 외교관.",
    color:"#5B3E8A",
    detailed_personality:"천칭자리는 금성의 지배를 받아 아름다움과 조화에 대한 본능적 감각을 가졌다. 12궁 중 유일하게 무생물(저울)을 상징으로 가지고 있어, 객관성과 공정함에 대한 집착이 남다르다. 관계 지향적 성격이 강하여 혼자 있는 것을 견디기 어려워하고, 타인과의 관계 속에서 자신의 정체성을 확인한다. 우아하고 세련된 외모와 매너를 가져 사교계의 총아가 되기 쉬우며, 갈등을 본능적으로 회피하여 평화를 유지하려 한다. 그러나 모든 면을 균형 있게 보려는 노력이 결정의 지연으로 이어지고, 갈등 회피가 문제의 축적으로 이어지는 역설을 안고 산다.",
    love_style:"사랑 그 자체를 사랑하며, 로맨틱한 관계 안에서 가장 행복하다. 공평하고 균형 잡힌 파트너십을 추구하며, 상대와 자신이 동등한 위치에 있기를 원한다. 갈등이 생기면 정면 대결보다 회피를 택하는데, 해결되지 않은 문제가 쌓여 어느 날 관계가 무너지는 패턴을 경계해야 한다.",
    career_strengths:["변호사·판사 — 공정함에 대한 본능적 감각","외교관·중재자 — 갈등 상황에서 균형점을 찾는 능력","인테리어·패션 디자이너 — 금성이 부여한 미적 감각","이벤트 플래너·웨딩 전문가 — 아름다운 경험을 설계하는 능력"],
    shadow_side:"결정을 내리지 못하는 것이 가장 큰 약점으로, 중요한 순간에 기회를 놓치기 일쑤다. 다른 사람의 눈치를 지나치게 보아 자기 자신의 진심을 잃어버리기 쉽고, 갈등을 회피하다 보면 정작 해결해야 할 문제가 곪아터진다. 표면적 평화를 위해 자신의 감정을 억누르는 습관이 내면의 분노를 키운다.",
    compatibility_best:["쌍둥이자리","물병자리","사수자리"],
    compatibility_worst:["게자리","염소자리","양자리"],
    life_lesson:"균형을 잡으려면 때로는 한쪽으로 기울어져 봐야 한다. 모두를 만족시키려는 시도를 내려놓을 때, 진정한 조화를 찾게 된다."
  },
  {
    name:"전갈자리", en:"Scorpio", symbol:"♏", element:"Water", element_kr:"수",
    modality:"Fixed", modality_kr:"고정궁", ruler:"Pluto", ruler_kr:"명왕성",
    house:8, date_range:"10/23~11/21",
    trait:["통찰","집념","변환","집착"],
    personality:"심연의 물. 표면 아래에서 모든 것을 꿰뚫는 눈.",
    color:"#1E3A5F",
    detailed_personality:"전갈자리는 명왕성의 지배를 받아 파괴와 재생, 죽음과 부활의 에너지를 타고났다. 세상의 표면에 머무르는 법이 없어, 모든 것의 이면과 심층을 파헤치려는 본능적 욕구가 있다. 감정의 깊이가 12궁 중 가장 깊어 한번 빠지면 헤어 나오기 어렵지만, 바로 그 깊이가 타인이 도달할 수 없는 통찰을 가능하게 한다. 배신을 결코 용서하지 않는 전갈의 독침을 가졌으나, 진심으로 신뢰하는 사람에게는 목숨까지 걸 수 있는 극단적 충성심을 보인다. 삶에서 여러 번의 '죽음과 부활'을 경험하며, 그때마다 더 강하게 다시 태어나는 불사조의 기질을 가졌다.",
    love_style:"사랑에 있어 '전부 아니면 전무'의 극단적 태도를 보인다. 상대의 영혼까지 소유하고 싶은 강렬한 욕구가 있으며, 표면적인 관계에는 전혀 흥미가 없다. 성적 매력과 정서적 깊이가 결합된 강렬한 연애를 하지만, 질투와 집착이 지나치면 상대를 질식시킬 수 있다.",
    career_strengths:["심리학자·프로파일러 — 인간 심리의 어둠을 두려워하지 않는 통찰력","외과의·병리학자 — 생사의 경계에서 흔들리지 않는 냉철함","수사관·탐정 — 진실을 끝까지 파헤치는 집요함","위기관리 전문가 — 극한 상황에서 빛나는 냉정한 판단력"],
    shadow_side:"집착과 통제욕이 가장 큰 그림자이다. 상처를 절대 잊지 않고 복수심을 품는 경향이 있으며, 자기파괴적 성향이 극한으로 치달으면 주변까지 함께 파괴할 수 있다. 타인을 조종하려는 무의식적 욕구가 있고, 비밀주의가 지나치면 고립된다.",
    compatibility_best:["게자리","물고기자리","처녀자리"],
    compatibility_worst:["사자자리","물병자리","황소자리"],
    life_lesson:"진정한 힘은 통제가 아니라 신뢰에서 온다. 상처받을 수 있는 자리에 자신을 내어놓는 것이 가장 강한 전갈의 용기이다."
  },
  {
    name:"사수자리", en:"Sagittarius", symbol:"♐", element:"Fire", element_kr:"화",
    modality:"Mutable", modality_kr:"변통궁", ruler:"Jupiter", ruler_kr:"목성",
    house:9, date_range:"11/22~12/21",
    trait:["자유","탐험","철학","무책임"],
    personality:"퍼져나가는 불. 진실을 찾아 끝없이 달리는 탐험가.",
    color:"#C53D43",
    detailed_personality:"사수자리는 목성의 지배를 받아 확장과 성장에 대한 끝없는 갈망을 가졌다. 반인반마(半人半馬) 켄타우로스가 상징하듯, 동물적 본능과 인간적 지성이 공존하며 이 둘 사이의 균형을 찾는 것이 평생의 과제이다. 진실과 의미를 추구하는 철학적 성향이 강하여 삶의 큰 질문에 매료되고, 다양한 문화와 사상을 경험하며 자신만의 세계관을 구축한다. 유머 감각이 뛰어나고 낙관적이어서 주변 사람들에게 희망을 주지만, 현실적 책임을 회피하는 경향이 있다. 자유를 제한하는 모든 것에 본능적 반발을 느끼며, 울타리 너머의 세상을 향해 끊임없이 달린다.",
    love_style:"사랑도 모험의 일부로 여기며, 함께 세상을 탐험할 수 있는 파트너를 원한다. 구속을 극도로 싫어하여 관계 안에서도 개인의 자유를 포기하지 않으며, 이것이 때로는 상대에게 '진지하지 않다'는 인상을 준다. 정직하고 솔직한 소통을 중시하며, 위선이나 가식이 있는 관계에서는 즉시 등을 돌린다.",
    career_strengths:["교수·철학자 — 지식을 탐구하고 전파하는 천성적 역할","여행 전문가·탐험가 — 세상의 경계를 넓히는 모험 정신","출판·미디어 — 이야기를 발견하고 퍼뜨리는 능력","국제기구·NGO — 문화를 초월한 비전과 이상주의"],
    shadow_side:"약속을 가볍게 여기고 책임을 회피하는 경향이 가장 큰 약점이다. 지나친 낙관주의가 현실의 위험을 무시하게 만들고, '풀은 항상 저쪽이 더 푸르다'는 환상에 빠져 눈앞의 축복을 놓치기 쉽다. 솔직함이 지나쳐 무신경한 말로 타인에게 상처를 준다.",
    compatibility_best:["양자리","사자자리","천칭자리"],
    compatibility_worst:["처녀자리","물고기자리","쌍둥이자리"],
    life_lesson:"어디론가 달려가는 것이 아니라, 지금 여기에 머무르는 법을 배우는 것이 진정한 탐험이다. 깊이 없는 넓이는 결국 공허함으로 돌아온다."
  },
  {
    name:"염소자리", en:"Capricorn", symbol:"♑", element:"Earth", element_kr:"토",
    modality:"Cardinal", modality_kr:"활동궁", ruler:"Saturn", ruler_kr:"토성",
    house:10, date_range:"12/22~1/19",
    trait:["야망","책임감","인내","냉정함"],
    personality:"꼭대기를 향한 대지. 천천히, 하지만 반드시 올라간다.",
    color:"#2D5A27",
    detailed_personality:"염소자리는 토성의 지배를 받아 제한과 구조, 시간과 책임의 에너지를 타고났다. 어린 시절부터 또래보다 성숙하고 진지한 분위기를 풍기며, 인생을 산을 오르는 것처럼 체계적으로 계획하고 실행한다. 사회적 지위와 성취에 대한 야망이 강하여 목표를 향해 묵묵히 걸어가는 인내력이 12궁 중 가장 뛰어나다. 겉으로는 냉정하고 계산적으로 보이지만, 신뢰를 쌓은 소수에게는 놀라울 만큼 따뜻한 속내를 보여준다. 역설적으로 나이가 들수록 젊어지는 별자리로, 40~50대에 인생의 황금기를 맞는 경우가 많다.",
    love_style:"사랑에도 신중하고 계획적으로 접근하며, 장기적으로 함께할 수 있는 파트너를 찾는다. 로맨틱한 말보다 안정적 미래를 설계하는 것이 이 별자리의 사랑 표현이다. 감정을 쉽게 드러내지 않아 상대가 차갑다고 느낄 수 있으나, 세월이 지나면 그 변하지 않는 성실함이 가장 든든한 사랑임을 알게 된다.",
    career_strengths:["경영자·CEO — 장기적 비전과 체계적 실행력","정치가·고위 공무원 — 권력 구조를 이해하는 본능","건축·토목 — 오래 남을 것을 짓는 끈기와 정밀함","법조인·세무사 — 규칙과 제도를 다루는 능력"],
    shadow_side:"일 중독에 빠져 인생의 다른 영역을 놓치기 쉽다. 감정을 억누르고 오직 성과만 추구하다 보면 인간관계가 메마르고, 지위와 권력에 집착하면 수단과 방법을 가리지 않는 냉혹한 면이 드러난다. '충분히 해냈다'는 만족감을 느끼지 못하여 끝없는 피로감에 시달린다.",
    compatibility_best:["황소자리","처녀자리","물고기자리"],
    compatibility_worst:["양자리","천칭자리","게자리"],
    life_lesson:"산 정상에 도착했을 때 함께 나눌 사람이 없다면, 그 성공은 공허하다. 올라가는 과정에서 곁의 사람들을 돌보는 법을 잊지 마라."
  },
  {
    name:"물병자리", en:"Aquarius", symbol:"♒", element:"Air", element_kr:"풍",
    modality:"Fixed", modality_kr:"고정궁", ruler:"Uranus", ruler_kr:"천왕성",
    house:11, date_range:"1/20~2/18",
    trait:["혁신","독립","인도주의","냉담"],
    personality:"자유로운 바람. 시대를 앞서가는 고독한 혁명가.",
    color:"#1A4A4A",
    detailed_personality:"물병자리는 천왕성의 지배를 받아 기존의 틀을 깨고 새로운 패러다임을 여는 혁신의 에너지를 타고났다. 인류 전체를 사랑하지만 특정 개인과 깊은 감정적 유대를 맺는 것에는 어려움을 겪는, 역설적인 인도주의자이다. 독특한 사고방식과 독립적인 성향으로 '별난 사람'이라는 평가를 자주 듣지만, 10~20년 후 그 생각이 시대의 주류가 되는 경우가 많다. 집단에 속하면서도 늘 관찰자의 위치에 서며, 동조 압력에 절대 굴하지 않는 강철 같은 독립심이 있다. 감정보다 이성을 신뢰하며, 논리적이고 객관적인 세계에서 가장 편안함을 느낀다.",
    love_style:"전통적인 연애 방식에 쉽게 맞춰지지 않으며, 자신만의 독특한 관계 형태를 추구한다. 지적 동지이자 친구 같은 연인을 원하며, 감정적 무거움이나 의존성에 질색한다. 자유를 존중해주는 파트너와 함께할 때 역설적으로 가장 깊은 유대를 형성하며, 구속하려 할수록 멀어지는 별자리이다.",
    career_strengths:["기술 혁신가·개발자 — 미래를 앞당기는 기술적 비전","사회활동가·인권운동가 — 인류의 진보를 위한 헌신","과학자·천문학자 — 미지의 영역을 탐구하는 지적 호기심","스타트업 창업가 — 기존 시장을 뒤엎는 파괴적 혁신"],
    shadow_side:"감정적 교류를 지적 교류로 대체하려는 경향이 있어 가까운 사람이 외로움을 느끼기 쉽다. 자신의 독창성에 대한 고집이 지나치면 타인의 의견을 무시하는 독선이 되고, '나는 특별하다'는 의식이 우월감으로 변질될 수 있다. 감정을 부정하다 보면 내면에 해소되지 않은 감정이 쌓여 폭발하기도 한다.",
    compatibility_best:["쌍둥이자리","천칭자리","사수자리"],
    compatibility_worst:["황소자리","전갈자리","사자자리"],
    life_lesson:"인류를 사랑하면서 바로 곁의 한 사람을 놓치지 마라. 머리로 이해하는 것과 마음으로 느끼는 것은 다르며, 둘 다 필요하다."
  },
  {
    name:"물고기자리", en:"Pisces", symbol:"♓", element:"Water", element_kr:"수",
    modality:"Mutable", modality_kr:"변통궁", ruler:"Neptune", ruler_kr:"해왕성",
    house:12, date_range:"2/19~3/20",
    trait:["공감","직관","예술성","도피"],
    personality:"경계 없는 물. 모든 감정을 흡수하는 우주적 공감.",
    color:"#5B3E8A",
    detailed_personality:"물고기자리는 해왕성의 지배를 받아 현실과 환상의 경계가 가장 흐릿한 별자리이다. 12궁의 마지막 별자리로서 앞선 11개 별자리의 모든 경험을 품고 있어, 인간 존재의 희로애락을 본능적으로 이해한다. 공감 능력이 12궁 중 가장 뛰어나 타인의 고통을 자기 것처럼 느끼며, 이것이 예술적 영감의 원천이자 정서적 취약성의 원인이 된다. 현실의 거칠고 날카로운 모서리를 견디기 어려워 꿈, 예술, 영성 등 초월적 세계로 도피하려는 경향이 있다. 경계가 없는 물처럼 형체를 자유롭게 바꾸며, 카멜레온처럼 환경에 녹아들지만 '진짜 나는 누구인가'라는 질문에 평생 시달린다.",
    love_style:"사랑할 때 자아의 경계가 녹아 상대와 하나가 되려 한다. 이상적 사랑에 대한 환상이 강하여 현실의 연인에게 동화 속 왕자(공주)를 투영하기 쉽고, 환상이 깨지면 깊은 환멸에 빠진다. 무조건적 사랑과 희생을 미덕으로 여기지만, 그것이 자기파괴로 이어지지 않도록 경계가 필요하다.",
    career_strengths:["예술가·화가·사진작가 — 보이지 않는 것을 포착하는 감각","음악가·작곡가 — 감정을 소리로 번역하는 천부적 재능","간호사·치유사 — 고통받는 이를 향한 무한한 공감","영화감독·시나리오 작가 — 현실과 환상을 넘나드는 상상력"],
    shadow_side:"현실 도피 경향이 가장 큰 약점으로, 음주나 공상에 빠져 현실의 문제를 직면하지 못할 수 있다. 경계가 없어 타인의 감정과 에너지에 쉽게 잠식당하고, 자신이 원하는 것과 타인이 원하는 것을 구분하지 못한다. '착한 사람 콤플렉스'에 빠져 이용당하는 관계를 반복할 위험이 있다.",
    compatibility_best:["게자리","전갈자리","염소자리"],
    compatibility_worst:["쌍둥이자리","사수자리","처녀자리"],
    life_lesson:"꿈을 꾸되 발은 땅에 딛고 있어야 한다. 현실을 피하지 않고 그 안에서 아름다움을 찾을 때, 당신의 예술은 세상을 치유한다."
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

// ━━━ 정밀 분석 — 태양궁 + 달별자리 + 상승궁 (Big 3) ━━━
// 달·상승궁 천문 계산은 lib/lunar-astro.ts (Meeus ELP-2000 축약 급수, 삭·망 40케이스 검증 통과)

import {
  getMoonSignIndex,
  getRisingSignIndex,
  MOON_SIGN_INFO,
  RISING_SIGN_INFO,
  type MoonSignInfo,
  type RisingSignInfo,
} from "./lunar-astro";

export interface WesternFullResult extends WesternResult {
  /** 달별자리 — 감정·내면 (황도 12궁 기준) */
  moonSign: ZodiacSign;
  moonInfo: MoonSignInfo;
  /** 상승궁 — 첫인상·페르소나. 출생 시각 미제공 시 undefined */
  risingSign?: ZodiacSign;
  risingInfo?: RisingSignInfo;
  /** 출생 시각 없이 정오 가정으로 달별자리를 계산했는지 여부 */
  moonHourAssumed: boolean;
}

/**
 * Co-Star급 Big 3 분석. 상승궁은 출생 시각(hour)이 있어야 계산됩니다.
 * 달별자리는 시각 미제공 시 정오 가정 (달은 하루 ~13° 이동, 경계일 출생만 영향)
 */
export function analyzeWesternFull(
  year: number,
  month: number,
  day: number,
  hour?: number,
): WesternFullResult {
  const base = analyzeWestern(month, day);
  const hasHour = hour !== undefined && hour >= 0 && hour <= 23;

  const moonIdx = getMoonSignIndex(year, month, day, hasHour ? hour : undefined);
  const moonSign = ZODIAC[moonIdx];
  const moonInfo = MOON_SIGN_INFO[moonIdx];

  let risingSign: ZodiacSign | undefined;
  let risingInfo: RisingSignInfo | undefined;
  if (hasHour) {
    const risingIdx = getRisingSignIndex(year, month, day, hour!);
    risingSign = ZODIAC[risingIdx];
    risingInfo = RISING_SIGN_INFO[risingIdx];
  }

  return {
    ...base,
    moonSign,
    moonInfo,
    risingSign,
    risingInfo,
    moonHourAssumed: !hasHour,
  };
}
