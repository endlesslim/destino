// src/lib/saju.ts
// 사주 계산 엔진 — 연주(年柱) 기반 + 간이 일주(日柱) 추정

// ━━━ 천간 (天干) ━━━
export const CHEONGAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"] as const;
export type Cheongan = typeof CHEONGAN[number];

export const CHEONGAN_INFO: Record<Cheongan, {
  kr: string; nature: string; ohang: Ohang; yin_yang: "양" | "음";
  personality: string; trait: string[]; mbti_similar: string[];
  image: string;
  detailed_personality: string;
  career: string[];
  relationship: string;
  weakness: string;
  advice: string;
  famous_match: string[];
}> = {
  "甲": { kr:"갑목", nature:"큰 나무", ohang:"木", yin_yang:"양",
    personality:"곧은 추진력의 리더. 한번 방향을 잡으면 꺾이지 않는다.",
    trait:["리더십","추진력","정직함","고집"], mbti_similar:["ENTJ","ESTJ"],
    image:"하늘을 향해 곧게 뻗은 소나무",
    detailed_personality:"갑목 일간은 거대한 나무와 같아서, 어떤 환경에서든 곧게 뻗어 올라가려는 본능적인 상승 의지를 지닌다. 주변 사람들은 이 사람 곁에 있으면 묘한 안정감과 동시에 경외심을 느끼는데, 그것은 갑목이 가진 천성적 위엄 때문이다. 한번 신념을 세우면 폭풍이 와도 뿌리를 내린 채 흔들리지 않으며, 그 고집스러운 일관성이 결국 주변 사람들의 신뢰를 얻는다. 다만 유연하게 구부릴 줄 모르면 부러질 수 있다는 것을 늘 기억해야 한다.",
    career:[
      "조직을 이끄는 CEO·창업가 — 큰 그림을 그리고 흔들림 없이 밀고 나가는 힘이 있다",
      "법조인·검사·판사 — 정의에 대한 곧은 신념과 원칙을 지키는 기질이 적합하다",
      "건축가·도시설계사 — 무에서 유를 만들고 오래 남을 구조물을 세우는 일에 탁월하다",
      "군 장교·외교관 — 명확한 위계와 사명감이 필요한 자리에서 빛을 발한다"
    ],
    relationship:"연인에게는 한없이 듬직한 보호자가 되지만, 자신의 방식을 상대에게도 기대하는 경향이 있다. 사랑할 때도 곧고 정직하여 거짓이 없으나, 감정 표현이 서툴러 상대가 답답해할 수 있다. 한번 마음을 준 사람에게는 평생을 걸 만큼 의리가 깊다.",
    weakness:"자신의 방식만이 옳다고 믿는 고집이 가장 큰 약점이다. 타인의 의견을 수용하지 못하면 주변이 점점 멀어지고, 혼자 무거운 짐을 지게 된다. 특히 실패를 인정하는 것을 극도로 꺼리는데, 이것이 더 큰 실패를 부르기도 한다.",
    advice:"때로는 바람에 흔들리는 것이 부러지지 않는 비결이다. 당신의 곧음은 장점이나, 구부릴 줄 아는 지혜를 함께 익히라.",
    famous_match:["혁명을 이끄는 지도자형","왕조를 세운 건국의 아버지형","한 분야를 개척한 선구자형"]
  },
  "乙": { kr:"을목", nature:"풀과 덩굴", ohang:"木", yin_yang:"음",
    personality:"유연하게 적응하는 관계의 달인. 어디든 스며들어 자란다.",
    trait:["유연함","적응력","외교력","의존성"], mbti_similar:["ENFP","INFP"],
    image:"담장을 타고 오르는 담쟁이덩굴",
    detailed_personality:"을목 일간은 부드러운 풀과 덩굴처럼 환경에 맞춰 자신을 변화시키는 천재적 적응력을 가졌다. 겉으로는 연약해 보이지만, 콘크리트 틈새에서도 자라나는 잡초처럼 어떤 상황에서도 살아남는 끈질긴 생명력이 숨어 있다. 사람들 사이에서 갈등을 중재하고 분위기를 부드럽게 만드는 능력이 탁월하며, 자신도 모르게 핵심 인맥의 중심에 서 있는 경우가 많다. 다만 자기 뿌리가 어디인지 잊지 않도록 스스로의 정체성을 단단히 세워야 한다.",
    career:[
      "상담사·코칭 전문가 — 상대의 마음에 스며들어 진심을 끌어내는 능력이 있다",
      "외교관·협상가 — 상충되는 이해관계를 유연하게 엮어내는 기질이 빛난다",
      "콘텐츠 크리에이터·작가 — 감성적 표현력과 트렌드를 읽는 감각이 뛰어나다",
      "원예·플로리스트·자연 관련 직종 — 생명을 다루는 섬세한 손길이 천직이다"
    ],
    relationship:"연인 관계에서 상대에게 맞춰주는 데 탁월하지만, 지나치게 맞추다 보면 자신을 잃을 위험이 있다. 사랑할 때 온 몸으로 감싸 안듯 깊이 빠져들며, 상대의 작은 감정 변화도 놓치지 않는다. 이별 후에도 미련이 오래 남는 편이라, 매듭을 깨끗이 짓는 연습이 필요하다.",
    weakness:"타인에 대한 의존성이 강해 혼자 결정을 내리는 것을 어려워한다. 모두에게 좋은 사람이 되려다 정작 자기 자신에게는 소홀해지기 쉽다. 갈등을 피하려는 성향이 지나치면 중요한 순간에 목소리를 내지 못하는 결과를 낳는다.",
    advice:"담쟁이도 결국 자기만의 줄기가 있어야 높이 오를 수 있다. 모든 사람의 기대에 부응하려 하지 말고, 당신만의 방향을 정하라.",
    famous_match:["뒤에서 조율하는 명재상형","사람의 마음을 움직이는 이야기꾼형","갈등을 봉합하는 평화주의자형"]
  },
  "丙": { kr:"병화", nature:"태양", ohang:"火", yin_yang:"양",
    personality:"들어가면 분위기가 바뀌는 존재감. 에너지가 밖으로 터진다.",
    trait:["열정","활력","존재감","성급함"], mbti_similar:["ENFJ","ESFP"],
    image:"한낮의 태양",
    detailed_personality:"병화 일간은 태양 그 자체로, 이 사람이 있는 곳은 자연스럽게 밝아지고 활기가 돈다. 숨기거나 꾸미는 것이 불가능한 성격이라, 좋든 싫든 감정이 곧바로 드러나며 그 솔직함이 오히려 사람들을 끌어들인다. 에너지가 넘쳐흘러 여러 일을 동시에 벌이는 경향이 있고, 주변에 온기를 나눠주는 것을 천성적으로 즐긴다. 그러나 태양도 지는 법이니, 자신의 에너지를 조절하지 못하면 번아웃이 빠르게 찾아온다.",
    career:[
      "무대 위의 엔터테이너·배우·MC — 시선을 끌고 분위기를 장악하는 능력이 타고났다",
      "마케팅·브랜딩 전문가 — 사람들의 관심을 모으고 열광시키는 에너지가 적합하다",
      "교육자·강연가 — 복잡한 것을 쉽고 열정적으로 전달하는 능력이 빛난다",
      "사회운동가·정치인 — 대의를 위해 앞장서는 용기와 카리스마가 있다"
    ],
    relationship:"사랑에 빠지면 온 세상에 알리고 싶어 하는 열정적인 연인이다. 상대를 태양처럼 따뜻하게 비추지만, 관심이 식으면 차가워지는 속도도 빠르다. 질투보다는 무관심이 이 사람의 적신호이며, 함께 성장하고 자극을 주는 관계에서 가장 행복하다.",
    weakness:"인내심이 부족하여 느리게 진행되는 일에 금세 흥미를 잃는다. 모든 곳에서 주인공이 되고 싶은 무의식적 욕구가 있어, 자신보다 빛나는 사람 곁에서는 불편함을 느끼기도 한다. 에너지를 무분별하게 쏟다가 정작 중요한 순간에 힘이 남아있지 않을 때가 있다.",
    advice:"태양도 밤이 있어야 다시 떠오를 수 있다. 쉬는 것이 게으름이 아니라 다음 빛을 위한 준비임을 기억하라.",
    famous_match:["무대 위의 타고난 엔터테이너형","군중을 열광시키는 연설가형","시대의 아이콘이 되는 스타형"]
  },
  "丁": { kr:"정화", nature:"촛불", ohang:"火", yin_yang:"음",
    personality:"조용히 주변을 밝히는 따뜻함. 섬세하고 통찰력이 깊다.",
    trait:["섬세함","통찰력","따뜻함","예민함"], mbti_similar:["INFJ","ISFJ"],
    image:"어둠 속 촛불 하나",
    detailed_personality:"정화 일간은 촛불의 성정을 타고나 화려하지는 않으나, 가장 어두운 곳을 정확히 비추는 힘을 가졌다. 사람의 속마음을 읽는 능력이 비범하여, 상대가 말하기 전에 이미 알아차리는 경우가 잦다. 겉으로는 조용하고 내향적으로 보이지만, 내면에는 꺼지지 않는 열정의 불씨를 품고 있다. 소수의 사람에게 깊은 영향을 미치는 타입으로, 넓은 무대보다 깊은 관계에서 진가가 드러난다.",
    career:[
      "심리상담사·정신과 전문의 — 사람의 내면을 읽고 치유하는 일에 천부적 재능이 있다",
      "연구원·학자 — 하나의 주제를 깊이 파고드는 집중력과 통찰력이 뛰어나다",
      "작가·시인·예술가 — 내면의 섬세한 감정을 작품으로 승화시키는 능력이 탁월하다",
      "종교인·명상 지도자 — 영적 깊이와 타인을 위로하는 따뜻함이 적합하다"
    ],
    relationship:"사랑할 때 말보다 행동으로 표현하며, 상대의 작은 변화에도 민감하게 반응한다. 깊고 의미 있는 관계를 원하기에 가벼운 만남에는 흥미를 느끼지 못한다. 상대에게 헌신적이나, 자신의 감정을 너무 오래 삼키면 갑자기 폭발할 수 있으니 적절한 표현이 중요하다.",
    weakness:"지나친 예민함으로 인해 타인의 말 한마디에 오래 상처받고, 그 상처를 혼자 곱씹는 경향이 있다. 완벽을 추구하다 시작조차 못하는 경우가 있으며, 자기 기준에 미치지 못하면 스스로를 가혹하게 몰아세운다. 세상의 어둠에 지나치게 공감하다 자신의 에너지가 소진되기 쉽다.",
    advice:"촛불은 자기를 태워 빛을 내지만, 때로는 유리 등(燈) 안에서 바람을 피해야 오래 탈 수 있다. 자신을 보호하는 법을 배우라.",
    famous_match:["시대를 꿰뚫는 사상가형","조용히 세상을 바꾸는 철학자형","깊은 작품을 남기는 예술가형"]
  },
  "戊": { kr:"무토", nature:"산", ohang:"土", yin_yang:"양",
    personality:"움직이지 않는 신뢰의 중심. 묵직하고 흔들리지 않는다.",
    trait:["안정감","신뢰","포용력","고지식"], mbti_similar:["ISTJ","ESTJ"],
    image:"구름 위로 솟은 산봉우리",
    detailed_personality:"무토 일간은 산(山)의 기운을 타고나 존재 자체가 무게감을 가진다. 이 사람 곁에 있으면 왠지 모를 안도감을 느끼게 되는데, 그것은 무토가 내뿜는 변하지 않는 신뢰의 기운 때문이다. 어떤 위기가 와도 동요하지 않는 침착함이 있어, 조직에서 자연스럽게 중심 역할을 맡게 된다. 다만 산이 스스로 움직이지 못하듯, 변화를 받아들이는 속도가 느려 시대에 뒤처질 위험이 있다.",
    career:[
      "금융·부동산 전문가 — 안정적 자산을 다루고 장기적 가치를 판단하는 눈이 뛰어나다",
      "공무원·행정가 — 체계적이고 흔들림 없는 업무 처리 능력이 적합하다",
      "CEO·조직 관리자 — 사람들이 자연스럽게 의지하는 신뢰감이 리더십의 근간이 된다",
      "의사·한의사 — 생명을 다루는 묵직한 책임감과 안정적인 판단력이 잘 맞는다"
    ],
    relationship:"연인에게 산처럼 듬직한 존재가 되지만, 감정 표현이 서투르고 로맨틱한 제스처에는 약하다. 한번 시작한 관계는 쉽게 포기하지 않는 의리가 있으나, 상대의 변화하는 요구에 민감하게 반응하지 못할 수 있다. 말보다 행동으로 사랑을 증명하는 타입이다.",
    weakness:"변화에 대한 저항이 심하여 새로운 환경이나 방식에 적응하는 데 오랜 시간이 걸린다. 자신의 경험과 기준만을 절대시하여 유연한 사고가 어렵고, 이것이 세대 갈등이나 소통의 벽을 만들기도 한다. 감정을 너무 깊이 묻어두면 어느 날 지진처럼 한꺼번에 터질 수 있다.",
    advice:"산도 계절마다 색을 바꾼다. 변하지 않는 것이 미덕이지만, 시대의 흐름을 읽는 유연함이 당신의 산을 더 높게 만들어줄 것이다.",
    famous_match:["흔들리지 않는 기둥 같은 정치가형","백년 기업을 세우는 경영자형","묵묵히 제자를 키우는 스승형"]
  },
  "己": { kr:"기토", nature:"들판", ohang:"土", yin_yang:"음",
    personality:"모든 것을 품는 대지. 현실적이고 양육하는 성격.",
    trait:["포용력","현실감각","양육","우유부단"], mbti_similar:["ISFJ","ESFJ"],
    image:"곡식이 자라는 너른 들판",
    detailed_personality:"기토 일간은 만물을 품어 기르는 대지의 성정을 가졌다. 누구든 이 사람 곁에 오면 편안함을 느끼며, 자연스럽게 자신의 이야기를 털어놓게 된다. 현실적이고 실용적인 감각이 뛰어나 뜬구름 잡는 일에는 관심이 없고, 눈앞의 사람과 일에 성실히 임한다. 그러나 모든 것을 받아들이려는 성향이 강해, 거절의 기술을 익히지 않으면 자기 자신이 메말라버릴 수 있다.",
    career:[
      "교육자·보육 전문가 — 사람을 키우고 성장시키는 일에 천생의 적성이 있다",
      "요식업·파티시에·셰프 — 먹이고 돌보는 것에서 행복을 느끼며 섬세한 손맛이 있다",
      "사회복지사·NGO 활동가 — 소외된 사람들을 향한 진심 어린 관심이 큰 힘이 된다",
      "인사·HR 전문가 — 사람의 잠재력을 알아보고 적재적소에 배치하는 눈이 있다"
    ],
    relationship:"연인에게 어머니 같은 따뜻함과 헌신을 보여주며, 상대의 일상을 세심하게 챙긴다. 그러나 지나치게 보살피려다 상대의 자율성을 침해할 위험이 있고, 자신의 욕구는 뒷전으로 미루는 습관이 관계의 불균형을 만들 수 있다. 감사받지 못할 때 내면에 서운함이 쌓인다.",
    weakness:"우유부단함이 가장 큰 약점으로, 여러 사람의 의견 사이에서 결정을 내리지 못해 기회를 놓치는 경우가 잦다. 자기 자신보다 타인을 우선시하는 습관이 결국 자기소실로 이어질 수 있다. 거절을 못하여 과도한 짐을 지고 결국 무너지는 패턴을 경계해야 한다.",
    advice:"들판은 모든 씨앗을 받아들이지만, 잡초를 골라내야 곡식이 자란다. 품되 가려서 품는 지혜가 당신에게 필요하다.",
    famous_match:["모든 이의 어머니 같은 양육자형","동네의 중심이 되는 인정 많은 이장형","조직의 숨은 공신인 살림꾼형"]
  },
  "庚": { kr:"경금", nature:"쇠·칼날", ohang:"金", yin_yang:"양",
    personality:"한 번에 잘라내는 결단력. 정의감이 강하고 날카롭다.",
    trait:["결단력","정의감","날카로움","무뚝뚝"], mbti_similar:["ENTJ","ISTP"],
    image:"대장간에서 벼려진 칼날",
    detailed_personality:"경금 일간은 벼려진 칼날처럼 날카로운 판단력과 결단력을 타고났다. 불의를 보면 참지 못하는 강직한 성품으로, 원칙과 정의에 대해서는 어떤 타협도 거부한다. 겉으로는 차갑고 무뚝뚝해 보이지만, 한번 인정한 사람에게는 놀라울 정도로 의리가 깊다. 불필요한 것을 과감히 잘라내는 능력이 있어 복잡한 상황을 명쾌하게 정리하지만, 그 날카로움이 때로는 주변 사람에게 상처가 된다.",
    career:[
      "외과의·치과의사 — 흔들림 없는 손과 냉철한 판단력이 생명을 살린다",
      "검사·수사관 — 진실을 파헤치고 정의를 세우려는 불굴의 의지가 적합하다",
      "엔지니어·기계공학자 — 정밀하고 체계적인 작업에 탁월한 집중력을 발휘한다",
      "군인·무술가 — 강인한 체력과 정신력, 그리고 명확한 위계를 따르는 기질이 맞는다"
    ],
    relationship:"사랑 표현이 직선적이고 과묵하여, 상대가 처음에는 차갑다고 느낄 수 있다. 그러나 일단 마음을 열면 어떤 상황에서도 연인을 지켜내는 강인한 보호자가 된다. 감정의 기복이 크지 않아 안정적이지만, 상대의 감정적 요구에 둔감한 면이 있어 세심한 소통 노력이 필요하다.",
    weakness:"너무 날카로운 말로 상대를 베어버리는 경향이 있다. 옳고 그름에 대한 기준이 지나치게 엄격하여 타인에게도 같은 잣대를 들이대면 관계가 피폐해진다. 자신의 약함을 보이는 것을 극도로 꺼려 도움이 필요할 때도 혼자 감당하려 한다.",
    advice:"칼이 예리할수록 칼집이 필요하다. 당신의 날카로움을 꺼내야 할 때와 거두어야 할 때를 분별하는 것이 진정한 강함이다.",
    famous_match:["칼 같은 결단으로 시대를 바꾼 개혁가형","무패의 전설을 쓴 전략가형","불의에 맞서는 의협심 강한 영웅형"]
  },
  "辛": { kr:"신금", nature:"보석", ohang:"金", yin_yang:"음",
    personality:"다듬어진 아름다움과 예민한 감각. 완벽주의 성향.",
    trait:["예민함","완벽주의","심미안","까다로움"], mbti_similar:["INTJ","INFJ"],
    image:"빛을 받아 빛나는 보석",
    detailed_personality:"신금 일간은 보석처럼 다듬어진 아름다움과 날카로운 심미안을 가졌다. 세상의 조잡함과 거친 것을 견디지 못하는 예민함이 있으나, 바로 그 예민함이 남들이 보지 못하는 아름다움을 포착하는 눈이 된다. 완벽을 향한 집요한 추구가 있어 자신이 하는 모든 일에 높은 기준을 적용하며, 타협하느니 차라리 포기하는 쪽을 택한다. 외면은 차갑고 도도해 보이나, 신뢰하는 소수에게는 놀라울 만큼 여린 속내를 드러낸다.",
    career:[
      "디자이너·스타일리스트 — 미적 감각이 뛰어나 아름다운 것을 창조하는 일에 적합하다",
      "감정사·큐레이터 — 진품을 가려내는 안목과 가치를 판단하는 능력이 탁월하다",
      "프로그래머·데이터 분석가 — 완벽한 구조와 정밀한 논리를 만들어내는 데 강하다",
      "주얼리 디자이너·시계장인 — 작고 정교한 것에 생명을 불어넣는 섬세함이 천직이다"
    ],
    relationship:"사랑에 있어서도 까다로운 기준이 있어 쉽게 마음을 열지 않는다. 그러나 한번 선택한 상대에게는 온전한 자신을 보여주며, 관계 안에서의 아름다움과 품격을 중시한다. 상대의 작은 결점이 눈에 들어오면 지적하고 싶은 충동을 느끼지만, 이것을 조절하는 것이 관계의 열쇠다.",
    weakness:"완벽주의가 지나쳐 시작을 두려워하거나, 이미 충분한 것을 부족하다고 느끼는 경향이 있다. 자기 자신에게 가장 가혹한 비평가가 되어 자존감이 바닥을 치는 시기가 주기적으로 찾아온다. 겉으로 보이는 강한 자존심 뒤에 '나는 부족하다'는 두려움이 숨어 있다.",
    advice:"보석은 원석일 때도 이미 보석이었다. 다듬는 과정을 즐기되, 지금의 당신도 이미 충분히 빛나고 있음을 잊지 마라.",
    famous_match:["시대를 초월한 미적 감각의 예술가형","한 분야의 장인으로 불리는 기술자형","까다로운 안목으로 시대를 정의한 비평가형"]
  },
  "壬": { kr:"임수", nature:"바다", ohang:"水", yin_yang:"양",
    personality:"어디든 흘러가는 자유로움. 큰 그릇에 지혜를 담는다.",
    trait:["자유","지혜","포용","방향상실"], mbti_similar:["ENTP","ESTP"],
    image:"끝없이 펼쳐진 바다",
    detailed_personality:"임수 일간은 바다의 기운을 타고나 무한한 포용력과 자유로운 영혼을 가졌다. 하나의 틀에 갇히는 것을 본능적으로 거부하며, 경계 없이 흘러가는 물처럼 다양한 경험과 지식을 탐닉한다. 지적 호기심이 끝이 없어 한 분야에 머물지 않고 여러 세계를 넘나들며, 그 과정에서 남다른 통합적 지혜를 쌓는다. 그러나 바다가 때로 방향을 잃듯, 너무 많은 가능성 앞에서 하나를 선택하지 못하는 것이 최대의 약점이다.",
    career:[
      "사업가·투자자 — 큰 흐름을 읽고 기회를 포착하는 거시적 안목이 있다",
      "여행 작가·다큐멘터리 감독 — 세상을 넓게 경험하고 그것을 이야기로 엮는 능력이 뛰어나다",
      "전략 컨설턴트 — 복잡한 상황을 높은 곳에서 조망하고 흐름을 예측하는 지혜가 있다",
      "무역·국제비즈니스 — 문화의 경계를 넘어 사람과 사람을 잇는 기질이 적합하다"
    ],
    relationship:"사랑에도 자유를 원하며, 구속당하는 느낌이 들면 본능적으로 멀어진다. 넓은 마음으로 상대의 모든 것을 받아들이는 포용력이 있으나, 깊이 파고드는 것보다 넓게 스치는 것에 더 익숙하다. 진정으로 마음을 준 사람에게는 바다처럼 끝없는 사랑을 주지만, 그 사람을 만나기까지 많은 파도를 겪을 수 있다.",
    weakness:"집중력이 분산되어 하나의 일을 끝까지 완수하는 데 어려움을 겪는다. 자유를 추구하다 보면 책임을 회피하는 것처럼 보일 수 있고, 주변의 기대를 저버리는 경우도 생긴다. 감정의 파도가 크게 일 때 자기파괴적인 행동에 빠질 위험이 있다.",
    advice:"바다도 해안이 있어야 아름답다. 무한한 가능성 중 하나를 택하여 깊이 파고드는 용기가 당신의 지혜를 완성시킨다.",
    famous_match:["대륙을 넘나드는 탐험가형","시대의 흐름을 꿰뚫는 전략가형","자유를 위해 싸운 혁명가형"]
  },
  "癸": { kr:"계수", nature:"빗물", ohang:"水", yin_yang:"음",
    personality:"조용히 스며드는 직관의 힘. 감성이 깊고 끈질기다.",
    trait:["직관","감성","끈기","우울"], mbti_similar:["INFP","INFJ"],
    image:"바위를 뚫는 빗물 한 방울",
    detailed_personality:"계수 일간은 빗물의 성정을 타고나 보이지 않는 곳에서 조용히, 그러나 끈질기게 스며드는 힘을 가졌다. 겉으로 드러나는 존재감은 크지 않으나, 시간이 지나면 바위도 뚫는 놀라운 집요함이 숨어 있다. 직관과 감성의 깊이가 남다르며, 논리로는 설명할 수 없는 예감이 놀랍도록 잘 맞는 사람이다. 내면에 깊은 우물 같은 감정 세계가 있어, 가끔 그 깊이에 자기 자신이 빠져버리기도 한다.",
    career:[
      "심리학자·상담사 — 인간 내면의 깊은 곳을 직관적으로 이해하는 능력이 있다",
      "작곡가·음악가 — 감성을 소리로 번역하는 천부적 재능이 있다",
      "연구원·과학자 — 한 방울 한 방울 쌓아가듯 꾸준히 진리를 탐구하는 끈기가 있다",
      "점술가·영성 안내자 — 보이지 않는 세계를 감지하는 비범한 직관력이 있다"
    ],
    relationship:"사랑에 있어 물처럼 상대에게 스며들며, 말하지 않아도 상대의 감정을 정확히 읽어낸다. 감정의 깊이가 깊어 사랑도 깊지만, 이별의 상처도 깊어 회복에 오랜 시간이 걸린다. 자신의 감정을 표현하는 것이 서툴러 오해를 사기 쉬우나, 진심을 알아주는 사람을 만나면 평생의 반려가 된다.",
    weakness:"감정의 늪에 빠지기 쉬워 우울과 무기력이 주기적으로 찾아온다. 자기 내면에 너무 깊이 빠져들면 현실과의 접점을 잃고 고립되기 쉽다. 타인의 부정적 감정을 스펀지처럼 흡수하는 체질이라, 에너지 관리를 의식적으로 해야 한다.",
    advice:"빗물은 결국 바다에 이른다. 조급해하지 말고, 한 방울 한 방울의 꾸준함을 믿어라. 당신의 깊이는 세상이 반드시 알아볼 것이다.",
    famous_match:["시대를 앞서 감지한 예언자형","감성으로 시대를 관통한 시인형","인간 내면을 탐험한 심리학의 거장형"]
  },
};

// ━━━ 지지 (地支) ━━━
export const JIJI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"] as const;
export type Jiji = typeof JIJI[number];

export const JIJI_INFO: Record<Jiji, {
  kr: string; animal: string; animal_kr: string; ohang: Ohang; time: string;
  personality: string;
  compatibility_best: string[];
  compatibility_worst: string[];
  year_trait: string;
}> = {
  "子": { kr:"자", animal:"🐀", animal_kr:"쥐", ohang:"水", time:"23~01시",
    personality:"쥐띠는 영리하고 재치가 넘치며, 어떤 상황에서도 살아남는 적응력의 달인이다. 첫인상은 온순해 보이지만 내면에는 날카로운 관찰력과 야심이 숨어 있다. 재물운이 강하여 돈이 모이는 체질이나, 지나친 계산은 진심 어린 관계를 멀리할 수 있다. 밤의 시작인 자시(子時)에 해당하여 어둠 속에서 기회를 포착하는 본능이 있다.",
    compatibility_best:["辰","申","丑"],
    compatibility_worst:["午","卯","未"],
    year_trait:"자(子)년생은 새로운 12년 주기의 시작을 여는 해에 태어났기에, 무언가를 시작하고 씨앗을 뿌리는 역할을 천성적으로 부여받았다. 위기 속에서 기회를 찾는 선천적 감각이 있다."
  },
  "丑": { kr:"축", animal:"🐂", animal_kr:"소", ohang:"土", time:"01~03시",
    personality:"소띠는 묵묵히 걷는 인내의 화신이다. 느리지만 꾸준하고, 한번 시작한 일은 끝까지 해내는 우직한 성품을 지녔다. 신뢰감이 두터워 주변 사람들이 자연스럽게 의지하지만, 속마음을 좀처럼 드러내지 않아 오해를 사기도 한다. 이른 새벽 축시(丑時)에 해당하여 남들이 잠든 사이에 묵묵히 준비하는 저력이 있다.",
    compatibility_best:["巳","酉","子"],
    compatibility_worst:["未","午","戌"],
    year_trait:"축(丑)년생은 인내와 끈기의 해에 태어나, 단기간의 성과보다 장기적 축적으로 성공하는 운명을 타고났다. 늦게 피는 꽃이 오래 가듯, 40대 이후에 본격적으로 빛나는 경우가 많다."
  },
  "寅": { kr:"인", animal:"🐅", animal_kr:"호랑이", ohang:"木", time:"03~05시",
    personality:"호랑이띠는 용감하고 카리스마가 넘치며, 태어날 때부터 사람을 이끄는 기운을 타고났다. 정의감이 강하여 불의를 보면 참지 못하고, 어떤 도전 앞에서도 물러서지 않는 배짱이 있다. 그러나 자존심이 세고 권위적인 면이 있어, 자신보다 강한 상대를 인정하기 어려워한다. 새벽녘 인시(寅時)에 해당하여 어둠을 깨고 새 시대를 여는 기상이 있다.",
    compatibility_best:["午","戌","亥"],
    compatibility_worst:["申","巳","寅"],
    year_trait:"인(寅)년생은 변혁의 해에 태어나 기존 질서에 도전하고 새로운 판을 짜는 기질을 타고났다. 평범한 삶보다는 파란만장한 인생을 살 가능성이 높으며, 그 안에서 진가가 드러난다."
  },
  "卯": { kr:"묘", animal:"🐇", animal_kr:"토끼", ohang:"木", time:"05~07시",
    personality:"토끼띠는 우아하고 감각적이며, 사교적 매력이 넘친다. 갈등을 싫어하여 항상 조화로운 관계를 추구하고, 예술적 감수성이 풍부하다. 겉으로는 부드럽고 순한 인상이나, 위험을 감지하면 누구보다 빠르게 도망치는 생존 본능이 있다. 해가 떠오르는 묘시(卯時)에 해당하여 아침의 싱그러운 에너지와 새로운 시작의 기운을 품었다.",
    compatibility_best:["未","亥","戌"],
    compatibility_worst:["酉","子","辰"],
    year_trait:"묘(卯)년생은 평화와 예술의 해에 태어나, 아름다움을 추구하고 문화적 감수성이 뛰어난 운명을 타고났다. 전쟁보다 외교로, 힘보다 지혜로 세상을 바꾸는 타입이다."
  },
  "辰": { kr:"진", animal:"🐉", animal_kr:"용", ohang:"土", time:"07~09시",
    personality:"용띠는 12지지 중 유일한 상상의 동물답게, 현실에 없는 것을 만들어내는 창조적 기운을 타고났다. 자존심이 하늘을 찌르고 야망이 크며, 평범한 삶에 만족하지 못한다. 카리스마와 운이 강하여 자연스럽게 주목받지만, 현실감각이 부족하면 꿈에서 헤어나오지 못할 수 있다. 아침 진시(辰時)에 해당하여 하루가 본격적으로 시작되는 왕성한 에너지를 품었다.",
    compatibility_best:["子","申","酉"],
    compatibility_worst:["戌","卯","辰"],
    year_trait:"진(辰)년생은 용의 해에 태어나 크게 성공하거나 크게 실패하는 극적인 운명을 타고났다. 평범함을 거부하는 DNA가 있어, 스케일이 큰 도전을 할수록 운이 따른다."
  },
  "巳": { kr:"사", animal:"🐍", animal_kr:"뱀", ohang:"火", time:"09~11시",
    personality:"뱀띠는 지혜롭고 신비로우며, 직관력이 비범하다. 겉으로 드러내지 않지만 속으로는 치밀하게 계산하고 있으며, 한 번 목표를 정하면 조용히 조여오는 집요함이 있다. 미적 감각이 뛰어나고 우아한 분위기를 풍기지만, 의심이 많아 타인을 쉽게 신뢰하지 못한다. 오전 사시(巳時)에 해당하여 태양이 본격적으로 빛나기 직전의 잠재된 힘을 품었다.",
    compatibility_best:["丑","酉","申"],
    compatibility_worst:["亥","寅","申"],
    year_trait:"사(巳)년생은 지혜와 변환의 해에 태어나, 허물을 벗듯 인생에서 여러 번의 큰 변신을 거치는 운명이다. 겉모습에 속지 않는 통찰력이 있어, 본질을 꿰뚫는 안목이 뛰어나다."
  },
  "午": { kr:"오", animal:"🐴", animal_kr:"말", ohang:"火", time:"11~13시",
    personality:"말띠는 활력이 넘치고 자유로운 영혼을 가졌다. 한 곳에 머무르는 것을 견디지 못하며, 넓은 세상을 질주하듯 살아간다. 정열적이고 사교적이어서 어디서든 인기가 있으나, 인내심이 부족하고 충동적인 결정을 내리기 쉽다. 정오 오시(午時)에 해당하여 태양이 가장 높이 뜬 시각의 최고조 에너지를 상징한다.",
    compatibility_best:["寅","戌","未"],
    compatibility_worst:["子","丑","午"],
    year_trait:"오(午)년생은 열정과 자유의 해에 태어나, 속도감 있는 삶을 살도록 운명 지어졌다. 젊은 시절에 일찍 빛나는 경우가 많으며, 에너지를 어디에 쓰느냐가 인생의 관건이다."
  },
  "未": { kr:"미", animal:"🐑", animal_kr:"양", ohang:"土", time:"13~15시",
    personality:"양띠는 온화하고 예술적이며, 평화를 사랑하는 감성의 소유자이다. 사람들에게 편안함을 주는 부드러운 기운이 있으나, 결단력이 부족하고 남에게 의존하는 경향이 있다. 창의적 감각이 뛰어나 예술, 디자인, 패션 분야에서 두각을 나타내기 쉽다. 오후 미시(未時)에 해당하여 한낮의 열기가 부드럽게 누그러지는 따뜻하고 포근한 에너지를 품었다.",
    compatibility_best:["卯","亥","午"],
    compatibility_worst:["丑","子","戌"],
    year_trait:"미(未)년생은 예술과 감성의 해에 태어나, 아름다움을 통해 세상에 기여하는 운명이다. 물질적 성공보다 정신적 풍요로움에서 삶의 의미를 찾는 경향이 강하다."
  },
  "申": { kr:"신", animal:"🐵", animal_kr:"원숭이", ohang:"金", time:"15~17시",
    personality:"원숭이띠는 영리하고 재치가 넘치며, 어떤 문제든 창의적으로 해결하는 능력이 탁월하다. 호기심이 끝이 없어 다방면에 손을 대지만, 그만큼 쉽게 싫증을 내기도 한다. 유머 감각이 뛰어나 사교적이지만, 속내를 쉽게 보여주지 않는 교활한 면도 있다. 오후 신시(申時)에 해당하여 하루의 절정을 지나 지혜가 익어가는 시간의 에너지를 품었다.",
    compatibility_best:["子","辰","巳"],
    compatibility_worst:["寅","亥","巳"],
    year_trait:"신(申)년생은 지혜와 재치의 해에 태어나, 머리를 쓰는 일에서 성공하는 운명이다. 어떤 위기에서도 탈출구를 찾아내는 임기응변의 달인으로, 변화무쌍한 시대에 적합한 인재이다."
  },
  "酉": { kr:"유", animal:"🐔", animal_kr:"닭", ohang:"金", time:"17~19시",
    personality:"닭띠는 정확하고 관찰력이 뛰어나며, 세밀한 계획을 세우는 데 능하다. 외모와 품위에 신경을 많이 쓰고, 자기 표현에 적극적이다. 직설적이고 솔직한 성격이라 할 말은 반드시 하지만, 그로 인해 갈등을 빚기도 한다. 해질녘 유시(酉時)에 해당하여 하루를 정리하고 결산하는 꼼꼼한 에너지를 상징한다.",
    compatibility_best:["丑","巳","辰"],
    compatibility_worst:["卯","戌","酉"],
    year_trait:"유(酉)년생은 정밀함과 자기표현의 해에 태어나, 자신의 개성을 당당히 드러내며 사는 운명이다. 남의 시선을 의식하기보다 자신만의 기준을 세우는 것이 성공의 열쇠이다."
  },
  "戌": { kr:"술", animal:"🐶", animal_kr:"개", ohang:"土", time:"19~21시",
    personality:"개띠는 충직하고 의리가 깊으며, 한번 믿은 사람을 끝까지 지키는 수호자의 기질을 타고났다. 정의감이 강하고 불평등에 민감하여 약자의 편에 서는 경향이 있다. 경계심이 강해 새로운 사람을 쉽게 받아들이지 못하지만, 일단 마음의 문을 열면 그 누구보다 깊은 충성을 보인다. 저녁 술시(戌時)에 해당하여 집과 가족을 지키는 보호의 에너지를 품었다.",
    compatibility_best:["寅","午","卯"],
    compatibility_worst:["辰","酉","丑"],
    year_trait:"술(戌)년생은 충성과 정의의 해에 태어나, 자신이 믿는 가치를 위해 헌신하는 운명이다. 배신을 가장 용서하지 못하며, 신뢰를 쌓는 데 시간이 걸리지만 한번 쌓은 관계는 평생 간다."
  },
  "亥": { kr:"해", animal:"🐷", animal_kr:"돼지", ohang:"水", time:"21~23시",
    personality:"돼지띠는 너그럽고 순수하며, 물질적으로나 정서적으로나 풍요로움을 추구한다. 인정이 많아 베풀기를 좋아하고, 솔직담백한 성격이라 거짓이 없다. 겉으로는 순해 보이지만 한번 화가 나면 걷잡을 수 없는 폭발력이 있으며, 쾌락에 약하여 자기 관리가 과제이다. 밤 해시(亥時)에 해당하여 하루를 마무리하고 내일을 위해 에너지를 모으는 축적의 기운을 품었다.",
    compatibility_best:["卯","未","寅"],
    compatibility_worst:["巳","申","亥"],
    year_trait:"해(亥)년생은 풍요와 순수의 해에 태어나, 물질적 복이 따르는 운명이지만 그 복을 어떻게 나누느냐가 인생의 과제이다. 12지지의 마지막으로서 한 주기를 완성하고 새로운 시작을 준비하는 역할을 맡았다."
  },
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

// ━━━ 시주 (時柱) 계산 ━━━

/** 시지 (時支) — 태어난 시간에 해당하는 지지 */
export function getHourJiji(hour: number): Jiji {
  // 23:00-01:00 → 子, 01:00-03:00 → 丑, ...
  const hourBranches: Jiji[] = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  // 23시는 子시 (다음날의 시작)
  const idx = hour === 23 ? 0 : Math.floor((hour + 1) / 2);
  return hourBranches[idx];
}

/** 시간 (時干) — 일간(日干)과 태어난 시간으로 결정 (오자연원법) */
export function getHourCheongan(dayCheongan: Cheongan, hour: number): Cheongan {
  const dcIdx = CHEONGAN.indexOf(dayCheongan);
  // 甲己일 → 子시=甲(0), 乙庚일 → 子시=丙(2), 丙辛일 → 子시=戊(4), 丁壬일 → 子시=庚(6), 戊癸일 → 子시=壬(8)
  const startMap: Record<number, number> = {
    0: 0, 5: 0,  // 甲己 → 甲
    1: 2, 6: 2,  // 乙庚 → 丙
    2: 4, 7: 4,  // 丙辛 → 戊
    3: 6, 8: 6,  // 丁壬 → 庚
    4: 8, 9: 8,  // 戊癸 → 壬
  };
  const startIdx = startMap[dcIdx] ?? 0;
  const hourJiji = getHourJiji(hour);
  const jijiIdx = JIJI.indexOf(hourJiji);
  return CHEONGAN[(startIdx + jijiIdx) % 10];
}

// 시주 내면 성격 설명 생성
function generateHourPersonality(hourCheongan: Cheongan, hourJiji: Jiji, hourOhang: Ohang): string {
  const info = CHEONGAN_INFO[hourCheongan];
  const jijiInfo = JIJI_INFO[hourJiji];
  const ohangInfo = OHANG_INFO[hourOhang];
  return `시주는 내면의 자아를 나타냅니다. ${hourCheongan}${hourJiji}(${ohangInfo.kr})는 겉으로 드러나지 않는 당신의 깊은 내면에 ${info.nature}의 기운이 흐르고 있음을 뜻합니다. ${info.personality} 이는 가장 가까운 사람에게만 보이는 당신의 숨겨진 모습입니다.`;
}

// ━━━ 결과 타입 ━━━
export interface SajuResult {
  year: { cheongan: Cheongan; jiji: Jiji; ohang: Ohang };
  day: { cheongan: Cheongan; jiji: Jiji; ohang: Ohang };
  hour?: { cheongan: Cheongan; jiji: Jiji; ohang: Ohang };
  hourPersonality?: string;
  personality: typeof CHEONGAN_INFO[Cheongan];
  animal: typeof JIJI_INFO[Jiji];
  ohang_balance: Record<Ohang, number>;
}

/** 사주 종합 분석 */
export function analyzeSaju(year: number, month: number, day: number, hour?: number): SajuResult {
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

  // 시주 (時柱) 계산 — hour가 제공된 경우
  let hourPillar: { cheongan: Cheongan; jiji: Jiji; ohang: Ohang } | undefined;
  let hourPersonality: string | undefined;

  if (hour !== undefined && hour >= 0 && hour <= 23) {
    const hJj = getHourJiji(hour);
    const hCg = getHourCheongan(dCg, hour);
    const hOh = OHANG_LIST[Math.floor(CHEONGAN.indexOf(hCg) / 2)];
    hourPillar = { cheongan: hCg, jiji: hJj, ohang: hOh };

    // 시주 오행도 밸런스에 추가
    balance[hOh] += 1;
    balance[JIJI_INFO[hJj].ohang] += 1;

    hourPersonality = generateHourPersonality(hCg, hJj, hOh);
  }

  return {
    year: { cheongan: yCg, jiji: yJj, ohang: yOh },
    day: { cheongan: dCg, jiji: dJj, ohang: dOh },
    hour: hourPillar,
    hourPersonality,
    personality: CHEONGAN_INFO[dCg], // 일간 기준 성격
    animal: JIJI_INFO[yJj],
    ohang_balance: balance,
  };
}
