// lib/ziwei.ts
// 자미두수(紫微斗數) 계산 엔진 — 정통 안성(安星) 규칙 기반
//
// ━━━ 배반(排盤) 규칙 요약 (웹 교차 검증 완료) ━━━
// 1. 양력 → 음력 변환 (korean-lunar-calendar). 윤달은 해당 월로 귀속시켜 계산한다.
//    (유파에 따라 전월/익월 절충법도 있으나, 본 엔진은 "윤달 = 본월" 방식을 채택)
// 2. 시지(時支): 23~01시 = 子시. 23시 출생도 같은 날 子시로 처리한다(야자시 논쟁 단순화).
// 3. 명궁(命宮): 寅궁에서 정월을 일으켜 생월까지 순행 → 그 자리에서 子시를 일으켜
//    생시까지 역행. 즉 명궁 지지 index = (寅 + (생월-1) - 생시지) mod 12
// 4. 신궁(身宮): 같은 자리에서 생시만큼 순행. index = (寅 + (생월-1) + 생시지) mod 12
// 5. 명궁 천간: 오호둔(五虎遁) — 甲己년→丙寅월, 乙庚→戊寅, 丙辛→庚寅, 丁壬→壬寅,
//    戊癸→甲寅에서 시작해 寅부터 명궁 지지까지 천간을 순행 배포. (연간은 음력 연도 기준)
// 6. 오행국(五行局): 명궁 간지의 납음오행(六十甲子納音)으로 결정.
//    水二局(2) / 木三局(3) / 金四局(4) / 土五局(5) / 火六局(6)
// 7. 기자미(起紫微): 국수(B)로 음력 생일(D)을 나눈다. D가 B로 나누어떨어지도록
//    빌린 수 A = (B - D mod B) mod B, 몫 S = (D+A)/B 를 구해
//    A가 홀수면 S-A, 짝수(0 포함)면 S+A 번째 궁(寅=1)에 자미를 안치한다.
// 8. 자미성계 6성(역행): 자미 → 천기(-1) → [한 칸 건너] 태양(-3) → 무곡(-4) →
//    천동(-5) → [두 칸 건너] 염정(-8).  ("紫微天機逆行旁, 隔一陽武天同當, 又隔二位廉貞地")
// 9. 천부(天府): 자미와 寅-申 축 대칭. index = (4 - 자미index) mod 12
// 10. 천부성계 8성(순행): 천부 → 태음(+1) → 탐랑(+2) → 거문(+3) → 천상(+4) →
//     천량(+5) → 칠살(+6) → [세 칸 건너] 파군(+10).
// 11. 12궁: 명궁에서 역행으로 형제→부처→자녀→재백→질액→천이→노복→관록→전택→복덕→부모.
// 12. 명궁이 공궁이면 대궁(천이궁)의 주성을 빌려 읽는다(차성안궁 借星安宮).
//
// ━━━ 규칙 출처 (교차 확인) ━━━
// - https://zh.wikipedia.org/wiki/%E7%B4%AB%E5%BE%AE%E6%96%97%E6%95%B0
//   (명궁/신궁 순월역시, 기자미 수식 — 차수 홀짝 가감법, 자미계 역행·천부계 순행 배열)
// - https://m.k366.com/bazi/77202.htm
//   (8단계 배반 절차, 안성결 "紫微天機星逆行 隔一陽武天同行 天同隔二是廉貞",
//    천부 대칭식 x+y=6 / x+y=18)
// - https://zhuanlan.zhihu.com/p/678994105 및 동일 기사
//   https://c.m.163.com/news/a/IOVU4BHC0521C9T8.html
//   (검증례 1: 辛酉년 음력 2월 24일 午시 → 명궁 酉(丁酉)·화육국·자미 巳)
// - https://zhuanlan.zhihu.com/p/669148811
//   (기자미 대조표 5례: 22일 木三局→亥, 3일 火六局→亥, 2일 金四局→辰,
//    20일 土五局→巳, 10일 水二局→午)
// - http://www.360doc.com/content/22/0112/22/66166532_1013012451.shtml
//   (검증례 2: 음력 9월 초6일 申시 → 명궁 寅 — 명궁은 생월·생시로만 결정)

import KoreanLunarCalendar from "korean-lunar-calendar";

// ━━━ 기본 상수 ━━━

/** 12지지 — index 0 = 子 */
export const ZIWEI_BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"] as const;
export type ZiweiBranch = typeof ZIWEI_BRANCHES[number];

const BRANCH_KR: Record<ZiweiBranch, string> = {
  "子":"자", "丑":"축", "寅":"인", "卯":"묘", "辰":"진", "巳":"사",
  "午":"오", "未":"미", "申":"신", "酉":"유", "戌":"술", "亥":"해",
};

/** 10천간 — index 0 = 甲 */
const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"] as const;

// 납음오행 — 六十甲子 두 개씩 30쌍. index = floor(간지index / 2)
// 甲子乙丑金, 丙寅丁卯火, 戊辰己巳木, 庚午辛未土, 壬申癸酉金, 甲戌乙亥火,
// 丙子丁丑水, 戊寅己卯土, 庚辰辛巳金, 壬午癸未木, 甲申乙酉水, 丙戌丁亥土,
// 戊子己丑火, 庚寅辛卯木, 壬辰癸巳水 … (뒤 15쌍은 같은 순서로 반복)
const NAYIN_ELEMENTS =
  "金火木土金火水土金木水土火木水金火木土金火水土金木水土火木水";

/** 납음오행 → 오행국 수 */
const ELEMENT_TO_BUREAU: Record<string, number> = {
  "水": 2, "木": 3, "金": 4, "土": 5, "火": 6,
};

const BUREAU_NAMES: Record<number, { kr: string; hanja: string; phrase: string }> = {
  2: { kr: "수이국", hanja: "水二局", phrase: "물처럼 유연하게 스며드는" },
  3: { kr: "목삼국", hanja: "木三局", phrase: "나무처럼 단계를 밟아 자라나는" },
  4: { kr: "금사국", hanja: "金四局", phrase: "쇠처럼 단련될수록 단단해지는" },
  5: { kr: "토오국", hanja: "土五局", phrase: "흙처럼 묵직하게 쌓아 올리는" },
  6: { kr: "화육국", hanja: "火六局", phrase: "불처럼 빠르게 타올랐다 정련되는" },
};

// ━━━ 14주성 콘텐츠 ━━━

export type ZiweiStarName =
  | "자미" | "천기" | "태양" | "무곡" | "천동" | "염정" | "천부"
  | "태음" | "탐랑" | "거문" | "천상" | "천량" | "칠살" | "파군";

export interface ZiweiStarInfo {
  name: ZiweiStarName;
  hanja: string;
  keywords: string[];       // 4개
  personality: string;      // 4~5문장
  career: string[];         // 3~4개
  love: string;             // 2~3문장
  shadow: string;           // 2문장
  modernType: string;       // 한 줄
}

export const ZIWEI_STARS: Record<ZiweiStarName, ZiweiStarInfo> = {
  "자미": {
    name: "자미", hanja: "紫微",
    keywords: ["리더십", "품격", "책임감", "자존심"],
    personality:
      "자미두수에서는 자미성을 북두의 제왕, 곧 명반 전체의 중심축으로 봅니다. 이 별이 명궁에 든 사람은 어디에 있든 자연스럽게 무리의 중심에 서게 되며, 스스로도 평범한 자리에 만족하지 못하는 기질을 타고났습니다. 위엄과 품격을 중시하여 함부로 흐트러진 모습을 보이지 않고, 한번 책임을 맡으면 끝까지 짊어지려는 무게감이 있습니다. 다만 제왕의 별답게 대접받고자 하는 욕구가 강해, 인정받지 못하는 환경에서는 의욕을 잃기 쉽습니다. 곁을 지키는 좋은 참모를 얻었을 때 비로소 그릇이 온전히 드러나는 별입니다.",
    career: [
      "조직을 총괄하는 경영자·CEO — 판을 짜고 사람을 세우는 자리에서 역량이 만개합니다",
      "고위 공직자·행정 책임자 — 명분과 절차를 중시하는 기질이 공적 영역과 잘 맞습니다",
      "프로젝트 총괄 디렉터 — 여러 분야를 조율해 하나의 결과물로 묶어내는 힘이 있습니다",
      "브랜드·기관의 대표 얼굴 — 품격 있는 존재감 자체가 자산이 되는 일에 어울립니다",
    ],
    love:
      "연애에서도 주도권을 자연스럽게 쥐는 쪽이며, 상대를 품위 있게 배려하는 만큼 자신도 존중받기를 원합니다. 마음을 준 상대에게는 아낌없이 베풀지만, 자존심이 상하면 내색하지 않은 채 서서히 마음의 문을 닫습니다. 진심 어린 인정과 칭찬이 이 사람의 애정을 오래 지속시키는 열쇠입니다.",
    shadow:
      "칭찬에 약해 아첨을 가려내지 못하면 판단이 흐려지는 것이 제왕성의 그림자입니다. 모든 것을 스스로 결정하려는 습관이 지나치면 곁에 사람이 남지 않게 됩니다.",
    modernType: "회의실 상석이 어색하지 않은 타고난 리더형",
  },
  "천기": {
    name: "천기", hanja: "天機",
    keywords: ["지략", "분석력", "임기응변", "호기심"],
    personality:
      "자미두수에서는 천기성을 지혜와 모략을 관장하는 책사의 별로 봅니다. 머리 회전이 빠르고 상황 변화를 읽는 감각이 예민하여, 남들이 문제를 인식하기도 전에 이미 해법을 궁리하고 있는 사람입니다. 하나를 들으면 열을 헤아리는 유추 능력이 있으나, 생각이 많은 만큼 결정 앞에서 오래 망설이기도 합니다. 몸을 쓰기보다 머리를 쓰는 자리에서 진가가 드러나며, 변화와 이동이 잦은 삶을 사는 경우가 많습니다. 지식이 얕게 흩어지지 않도록 한 우물을 정하는 것이 이 별의 평생 과제입니다.",
    career: [
      "전략기획·경영 컨설턴트 — 복잡한 판을 구조로 정리해 수를 내는 데 탁월합니다",
      "데이터 분석가·리서처 — 숨은 패턴을 찾아내는 관찰력과 추리력이 빛납니다",
      "개발자·시스템 설계자 — 논리의 틈을 메우며 정교한 구조를 세우는 일이 맞습니다",
      "방송작가·기획 PD — 트렌드를 한발 먼저 읽어 판을 짜는 감각이 있습니다",
    ],
    love:
      "연애에서도 상대의 심리를 빠르게 읽어 세심하게 맞춰 주지만, 머릿속 계산이 앞서 정작 마음을 여는 데는 시간이 걸립니다. 대화가 통하는 상대에게 깊이 끌리며, 지적인 자극이 사라지면 마음이 먼저 떠나는 타입입니다.",
    shadow:
      "생각이 지나치게 많아 기회를 눈앞에서 흘려보내는 것이 이 별의 그림자입니다. 잔걱정과 신경과민으로 스스로를 소모하지 않도록 마음 관리가 필요합니다.",
    modernType: "회의 중에 이미 플랜 B와 C까지 짜 놓는 전략 참모형",
  },
  "태양": {
    name: "태양", hanja: "太陽",
    keywords: ["열정", "베풂", "명예", "존재감"],
    personality:
      "자미두수에서는 태양성을 만물을 고루 비추는 박애와 명예의 별로 봅니다. 이 별이 명궁에 들면 베푸는 것을 아까워하지 않고, 옳다고 믿는 일에는 목소리를 아끼지 않는 공적인 기질이 드러납니다. 존재 자체가 밝아 사람들이 자연스럽게 모여들며, 조직에서는 대변인이나 얼굴 역할을 맡게 되는 경우가 많습니다. 다만 태양이 스스로를 태워 빛을 내듯, 남을 챙기느라 자신을 소모하는 경향이 있습니다. 낮에 태어났는지 밤에 태어났는지에 따라 빛의 세기가 달라진다고 해석하는 별이기도 합니다.",
    career: [
      "교육자·강연가 — 아는 것을 나누고 사람을 성장시키는 일에서 큰 보람을 얻습니다",
      "방송인·아나운서 — 대중 앞에 서는 것이 부담이 아니라 에너지가 되는 체질입니다",
      "사회활동가·정치인 — 공익을 위해 목소리를 내는 자리에서 명예가 따릅니다",
      "홍보·마케팅 책임자 — 사람들의 시선을 모으고 열기를 퍼뜨리는 데 능합니다",
    ],
    love:
      "사랑을 표현하는 데 스스럼이 없고, 연인을 주변에 자랑스럽게 드러내는 타입입니다. 다만 바깥일에 에너지를 쏟느라 정작 가장 가까운 사람에게 소홀해질 수 있어, 관심의 방향을 안쪽으로 돌리는 연습이 필요합니다.",
    shadow:
      "인정 욕구가 강해 비출 무대가 사라지면 급격히 시드는 것이 태양의 그림자입니다. 베푼 만큼 돌아오지 않을 때의 서운함을 다스리는 것이 평생의 과제입니다.",
    modernType: "팀의 사기를 끌어올리는 에너지 발전소형",
  },
  "무곡": {
    name: "무곡", hanja: "武曲",
    keywords: ["실행력", "재물감각", "결단력", "강인함"],
    personality:
      "자미두수에서는 무곡성을 재물과 실행을 관장하는 장군의 별로 봅니다. 말보다 행동이 앞서고, 목표가 정해지면 곁눈질 없이 밀어붙이는 강단이 있습니다. 숫자와 현실 감각이 밝아 재물을 다루는 능력을 타고났으며, 남의 도움보다 자기 힘으로 일가를 이루려는 자수성가의 기질이 강합니다. 감정 표현이 무뚝뚝해 차갑다는 오해를 받기도 하지만, 책임져야 할 사람은 끝까지 책임지는 속정이 있습니다. 강한 쇠일수록 부러지기 쉬우니, 유연함을 배우는 것이 이 별의 관건입니다.",
    career: [
      "금융·투자 전문가 — 숫자 앞에서 냉정해지는 기질이 재물을 불리는 힘이 됩니다",
      "창업가·자영업 대표 — 맨손으로 시작해 실적으로 증명하는 자수성가형입니다",
      "군인·경찰 등 제복 직군 — 규율과 강인함이 요구되는 자리에서 신뢰를 얻습니다",
      "정밀 기술 엔지니어 — 묵묵히 완성도를 끌어올리는 장인 기질이 있습니다",
    ],
    love:
      "사랑을 말로 꾸미기보다 행동과 결과로 증명하는 타입입니다. 표현이 서툴러 연애 초반에는 오해를 사기 쉽지만, 한번 맺은 관계에는 흔들림 없이 헌신합니다.",
    shadow:
      "일과 성과에 몰두하느라 관계의 온도를 놓치는 것이 이 별의 그림자입니다. 고집이 강해 조언을 튕겨내기 시작하면 고립을 자초할 수 있습니다.",
    modernType: "말없이 실적으로 증명하는 행동파 승부사형",
  },
  "천동": {
    name: "천동", hanja: "天同",
    keywords: ["낙천성", "온화함", "공감", "여유"],
    personality:
      "자미두수에서는 천동성을 복을 타고난 아이 같은 별, 곧 복성(福星)으로 봅니다. 성정이 온화하고 낙천적이어서 어떤 모임에서도 분위기를 부드럽게 만드는 재주가 있습니다. 다투기보다 웃어넘기고, 각박한 상황에서도 즐거움을 찾아내는 천진함이 이 별의 힘입니다. 다만 복이 많다는 것은 뒤집어 보면 절박함이 부족하다는 뜻이기도 하여, 안락함에 안주하면 재능이 무뎌집니다. 시련을 한 번 겪은 뒤에 오히려 복이 발동한다고 보는, 대기만성형의 별입니다.",
    career: [
      "서비스·호스피탈리티 — 사람을 편안하게 만드는 기운 자체가 경쟁력이 됩니다",
      "사회복지·상담 — 따뜻한 공감 능력이 지친 사람을 일으키는 힘이 됩니다",
      "콘텐츠 크리에이터·작가 — 일상의 즐거움을 발견해 전하는 감각이 뛰어납니다",
      "식음료·라이프스타일 업계 — 먹고 쉬고 즐기는 일을 업으로 삼으면 복이 커집니다",
    ],
    love:
      "함께 있으면 편안한 연인으로, 상대의 이야기를 잘 들어 주고 감정의 결을 세심하게 살핍니다. 갈등을 정면으로 다루기보다 피하는 경향이 있어, 문제를 오래 묵히면 어느 날 관계가 통째로 흔들릴 수 있습니다.",
    shadow:
      "편안함을 좇다 결정적인 순간의 승부를 피하는 것이 이 별의 그림자입니다. 게으름과 여유는 한 끗 차이임을 늘 기억해야 합니다.",
    modernType: "있는 것만으로 팀 분위기가 풀리는 힐링 담당형",
  },
  "염정": {
    name: "염정", hanja: "廉貞",
    keywords: ["카리스마", "승부욕", "매력", "변화"],
    personality:
      "자미두수에서는 염정성을 열네 별 가운데 해석이 가장 어려운 별, 곧 차도화(次桃花)이자 관록의 별로 봅니다. 원칙과 욕망, 절제와 매혹이라는 상반된 기운을 한 몸에 품고 있어, 놓인 자리에 따라 전혀 다른 얼굴이 나타납니다. 조직 안에서는 누구보다 규율에 충실한 관리자가 되지만, 무대가 바뀌면 치명적인 매력으로 판을 흔드는 승부사가 되기도 합니다. 감정의 진폭이 크고 승부욕이 강해 인생의 굴곡도 큰 편이나, 그 굴곡이 곧 이 사람만의 이야기가 됩니다. 타고난 기운을 어디에 쓰느냐에 따라 극과 극의 삶이 갈리는 별입니다.",
    career: [
      "법조·감찰·수사 계통 — 원칙을 세우고 어긋난 것을 바로잡는 일에 어울립니다",
      "정치·조직 관리 — 권력의 생리를 읽고 판을 운영하는 감각이 비상합니다",
      "엔터테인먼트·이벤트 비즈니스 — 사람을 홀리는 매력을 무대 위에서 쓰는 길입니다",
      "영업·협상 전문가 — 승부처에서 판을 뒤집는 배짱과 화술이 있습니다",
    ],
    love:
      "밀고 당기는 긴장감 있는 연애를 하며, 한번 불이 붙으면 누구보다 뜨겁게 몰입합니다. 소유욕과 질투가 강한 편이라, 신뢰가 흔들리면 관계가 급격히 격랑에 휩싸일 수 있습니다. 감정을 다스리는 쪽이 언제나 관계의 승자가 됩니다.",
    shadow:
      "욕망과 원칙 사이에서 균형을 잃으면 극단으로 치닫는 것이 이 별의 그림자입니다. 이기고 싶은 마음이 지나쳐 소중한 것까지 판돈으로 거는 순간을 경계해야 합니다.",
    modernType: "규칙 안에서 가장 대담하게 노는 치명적 승부사형",
  },
  "천부": {
    name: "천부", hanja: "天府",
    keywords: ["안정감", "포용력", "관리능력", "신중함"],
    personality:
      "자미두수에서는 천부성을 남두의 제왕이자 나라의 금고를 지키는 별로 봅니다. 자미가 개척하고 명령하는 왕이라면, 천부는 지키고 살찌우는 왕입니다. 성정이 너그럽고 위기 앞에서도 낯빛이 변하지 않는 안정감이 있어, 사람들이 자연스럽게 기대고 의지합니다. 모으고 관리하고 불리는 데 천부적인 감각이 있으며, 무리한 모험보다 확실한 한 수를 선호합니다. 다만 지키려는 본능이 지나치면 변화의 흐름에 올라타지 못하고 현상 유지에 머무를 수 있습니다.",
    career: [
      "재무·회계·자산관리 — 곳간을 지키고 불리는 일에 타고난 안목이 있습니다",
      "운영 총괄 COO — 조직의 살림을 안정적으로 굴리는 관리 능력이 탁월합니다",
      "부동산·인프라 비즈니스 — 오래 남는 자산의 가치를 알아보는 눈이 있습니다",
      "공공기관 관리자 — 신중함과 책임감이 공적인 신뢰로 이어집니다",
    ],
    love:
      "연인에게 울타리 같은 존재로, 화려한 이벤트보다 변함없는 일상으로 사랑을 증명합니다. 안정을 중시해 관계에서 모험을 즐기지는 않지만, 신뢰가 쌓인 상대에게는 곳간을 통째로 열어 주는 통 큰 면모가 있습니다.",
    shadow:
      "잃지 않으려는 마음이 앞서 도전의 적기를 놓치는 것이 이 별의 그림자입니다. 너그러움이 자기만족에 그치면 은근한 오만으로 비칠 수 있습니다.",
    modernType: "위기 때 가장 먼저 찾게 되는 든든한 곳간지기형",
  },
  "태음": {
    name: "태음", hanja: "太陰",
    keywords: ["섬세함", "직관", "심미안", "축재"],
    personality:
      "자미두수에서는 태음성을 달의 별, 곧 감성과 축재(蓄財)를 관장하는 별로 봅니다. 겉으로는 고요하지만 내면에는 밀물과 썰물 같은 풍부한 감정이 흐르고 있습니다. 섬세한 심미안과 직관을 타고나 아름답고 정제된 것에 끌리며, 거칠고 소란한 환경에서는 기운이 쉽게 상합니다. 재물을 소리 없이 차곡차곡 모으는 힘이 있어 예로부터 전답과 곳간의 별로도 불렸습니다. 달빛처럼 은은하게 스며들어, 오래 곁에 둘수록 진가를 알게 되는 사람입니다.",
    career: [
      "예술·디자인 분야 — 정제된 아름다움을 알아보고 빚어내는 감각이 탁월합니다",
      "재무설계·자산운용 — 조용히 그러나 꾸준히 쌓아 가는 축재의 재능이 있습니다",
      "심리상담·케어 직군 — 말하지 않은 감정까지 읽어내는 섬세함이 힘이 됩니다",
      "기획·에디터 — 흩어진 것을 결이 고운 결과물로 다듬는 손끝이 있습니다",
    ],
    love:
      "사랑이 깊어질수록 말수가 줄고 마음은 커지는, 은근하고 헌신적인 연인입니다. 표현을 기다리기보다 알아채 주기를 바라는 마음이 커서, 무심한 상대를 만나면 혼자 상처를 쌓기 쉽습니다.",
    shadow:
      "감정을 안으로만 삭여 마음에 우울의 물이 고이는 것이 달의 그림자입니다. 싫다는 말을 하지 못해 손해를 떠안는 습관도 경계해야 합니다.",
    modernType: "조용히 실력과 잔고를 쌓아 가는 은둔 실력자형",
  },
  "탐랑": {
    name: "탐랑", hanja: "貪狼",
    keywords: ["매력", "다재다능", "사교성", "욕망"],
    personality:
      "자미두수에서는 탐랑성을 으뜸가는 도화성이자 욕망과 재예(才藝)의 별로 봅니다. 사람을 끄는 매력과 다재다능함을 함께 타고나, 어느 자리에 두어도 존재감이 사라지지 않습니다. 호기심의 폭이 넓어 예술과 사교, 사업, 때로는 신비학의 영역까지 손을 뻗으며, 배우는 속도 또한 남다릅니다. 욕망이라는 이름 그대로 원하는 것이 분명하고, 그것을 얻어내는 사교적 수완이 비상합니다. 다만 열정이 여러 갈래로 흩어지면 어느 것도 완성하지 못하니, 욕망의 과녁을 좁히는 것이 성패를 가릅니다.",
    career: [
      "마케팅·브랜딩 — 사람의 욕망을 읽고 자극하는 감각을 타고났습니다",
      "엔터테인먼트·방송 — 무대 위에서 매력이 배가되는 타고난 끼가 있습니다",
      "영업·비즈니스 개발 — 처음 만난 사람과도 판을 만들어내는 수완이 있습니다",
      "뷰티·트렌드 산업 — 유행을 반 박자 먼저 감지하는 촉이 살아 있습니다",
    ],
    love:
      "타고난 도화의 별답게 이성의 시선을 끄는 매력이 넘치고, 연애의 밀고 당기기를 본능적으로 즐깁니다. 사랑에 빠지는 속도가 빠른 만큼 권태도 빨리 찾아올 수 있어, 함께 성장하며 새로움을 만들어 가는 관계라야 오래갑니다.",
    shadow:
      "여러 욕망을 동시에 좇다 정작 중요한 하나를 놓치는 것이 이 별의 그림자입니다. 유혹에 대한 면역이 약해 스스로 선을 정해 두지 않으면 구설에 오르기 쉽습니다.",
    modernType: "어디서든 명함 백 장이 오가는 만능 인싸형",
  },
  "거문": {
    name: "거문", hanja: "巨門",
    keywords: ["언변", "통찰", "탐구심", "비판적 사고"],
    personality:
      "자미두수에서는 거문성을 어둠 속을 비추는 말(言)의 별, 암성(暗星)으로 봅니다. 타고난 언변과 논리로 상대의 허점을 정확히 짚어내며, 남들이 그냥 지나치는 것을 의심하고 파고드는 탐구심이 있습니다. 세상의 이면을 보는 눈이 밝아 분석과 비평, 변론처럼 말과 글로 진실을 다투는 영역에서 재능이 빛납니다. 다만 그 날카로운 입이 복도 부르고 화도 부르니, 예로부터 시비와 구설이 따르는 별이라 하였습니다. 의심이 많은 만큼 쉽게 속지 않고, 한번 파기 시작한 주제는 바닥까지 파고드는 집요함이 있습니다.",
    career: [
      "변호사·법률 전문가 — 말과 논리로 진실을 다투는 일이 천직에 가깝습니다",
      "기자·평론가 — 이면을 의심하고 파헤치는 탐사 기질이 빛을 발합니다",
      "강사·아나운서 — 정확하고 설득력 있는 전달력으로 신뢰를 얻습니다",
      "리서처·감정평가 전문가 — 진위를 가려내는 집요한 검증 능력이 있습니다",
    ],
    love:
      "말로 시작해 말로 깊어지는 연애를 하며, 대화가 통하지 않는 상대와는 오래가지 못합니다. 애정이 깊어질수록 확인하고 따지고 싶은 마음도 커지는데, 그 날 선 말투가 상대에게는 심문처럼 느껴질 수 있음을 기억해야 합니다.",
    shadow:
      "정확한 지적도 지나치면 주변에 적을 만드는 것이 이 별의 그림자입니다. 의심이 깊어 마음을 여는 데 오랜 시간이 걸리고, 그 사이 좋은 인연이 지나가기도 합니다.",
    modernType: "팩트체크로 회의를 평정하는 논객형",
  },
  "천상": {
    name: "천상", hanja: "天相",
    keywords: ["균형감각", "신의", "조율", "품위"],
    personality:
      "자미두수에서는 천상성을 왕의 옥새를 맡아 관리하는 재상(宰相)의 별로 봅니다. 공정함과 균형 감각을 타고나 어느 한쪽으로 치우치지 않으며, 다툼이 있는 곳에서는 자연스럽게 중재자 역할을 맡게 됩니다. 약속과 신의를 목숨처럼 여기고, 옷차림과 예의처럼 격식을 갖추는 데서도 품위가 드러납니다. 남을 돕는 데서 보람을 느끼는 봉사의 기질이 있어, 일인자보다 일인자를 완성시키는 이인자의 자리에서 더 크게 빛납니다. 다만 자기 목소리를 아끼다 보면 정작 자신의 몫을 챙기지 못할 수 있습니다.",
    career: [
      "행정·기획 관리자 — 조직의 균형을 잡고 절차를 완성하는 데 능합니다",
      "인사·조직문화 전문가 — 사람 사이의 신뢰를 설계하는 감각이 있습니다",
      "외교·중재 전문가 — 상충하는 이해를 품위 있게 조율하는 재능이 빛납니다",
      "비서실·대관 업무 — 일인자를 완성시키는 이인자의 미덕을 갖췄습니다",
    ],
    love:
      "배려가 몸에 밴 연인으로, 상대의 체면과 입장을 먼저 헤아립니다. 관계의 균형을 중시해 감정이 격해지는 상황 자체를 피하려 하는데, 갈등을 덮는 것과 푸는 것은 다르다는 점을 배워야 합니다.",
    shadow:
      "모두에게 공정하려다 정작 자기 욕구에는 불공정해지는 것이 이 별의 그림자입니다. 결정적인 순간에 자기 주장을 미루면 공은 남의 몫이 됩니다.",
    modernType: "조직의 신뢰를 한 몸에 받는 만인의 조정자형",
  },
  "천량": {
    name: "천량", hanja: "天梁",
    keywords: ["원칙", "보호본능", "연륜", "통찰"],
    personality:
      "자미두수에서는 천량성을 수명과 음덕(蔭德)을 관장하는 어른의 별, 노성(老星)으로 봅니다. 나이보다 성숙하다는 말을 어릴 때부터 들으며, 사람들이 고민을 들고 찾아오는 큰형·큰누나 같은 존재가 됩니다. 원칙과 도리를 중시하고 약자를 지나치지 못하는 보호 본능이 있으며, 험한 일을 겪어도 결국 귀인의 도움으로 풀려나는 화난해액(化難解厄)의 복을 타고났다고 봅니다. 잔재주보다 정도(正道)를 걷는 우직함이 이 별의 방식입니다. 다만 훈수와 참견의 경계를 지키지 못하면 잔소리꾼으로 오해받기 쉽습니다.",
    career: [
      "의료·약학 계통 — 사람을 살리고 지키는 일에서 음덕의 복이 발동합니다",
      "판사·감사·컴플라이언스 — 원칙의 수호자 역할이 몸에 맞습니다",
      "교육자·멘토 — 사람을 바르게 이끄는 어른의 기질이 천직이 됩니다",
      "종교·상담 지도자 — 지친 이를 품고 방향을 제시하는 그늘 큰 나무입니다",
    ],
    love:
      "연인을 보살피고 이끌어 주는 보호자형 연애를 합니다. 다만 사랑과 훈계를 혼동하면 상대는 연인이 아니라 보호자를 둔 기분이 들 수 있으니, 가르치려는 마음을 내려놓는 순간 관계가 한결 부드러워집니다.",
    shadow:
      "옳은 말을 참지 못해 어른 노릇이 과해지는 것이 이 별의 그림자입니다. 남의 짐을 대신 지는 데 익숙해 정작 자기 삶의 재미를 뒤로 미루곤 합니다.",
    modernType: "후배들이 커피를 사 들고 찾아오는 정신적 지주형",
  },
  "칠살": {
    name: "칠살", hanja: "七殺",
    keywords: ["돌파력", "독립심", "결단", "개척정신"],
    personality:
      "자미두수에서는 칠살성을 변방을 평정하는 대장군의 별로 봅니다. 눈빛에 힘이 있고 결단이 빠르며, 남의 명령을 받기보다 스스로 길을 여는 개척자의 기질을 타고났습니다. 안정된 자리를 제 발로 걷어차고 새 판에 뛰어드는 승부사여서, 인생에 한 번 이상 판을 크게 갈아엎는 전환점이 온다고 봅니다. 위기 상황일수록 오히려 침착해지는 강심장으로, 남들이 무너지는 국면에서 기회를 잡습니다. 다만 돌파에는 능하나 지키는 데는 약하니, 이룬 것을 관리해 줄 사람을 곁에 두어야 합니다.",
    career: [
      "창업가·개척형 사업가 — 무에서 유를 만드는 돌파의 국면에서 가장 강합니다",
      "외과의·응급의료 — 긴박한 순간에 냉정해지는 강심장이 생명을 살립니다",
      "프로 스포츠·특수 직군 — 극한의 승부 환경이 오히려 집중력을 깨웁니다",
      "턴어라운드 전문가 — 무너진 조직을 수술하고 재건하는 임무에 적합합니다",
    ],
    love:
      "좋아하면 직진하는 화끈한 연애를 하며, 애매한 관계를 견디지 못합니다. 독립심이 강해 연인에게도 각자의 영역을 존중해 주기를 원하고, 구속이 심해지면 마음이 먼저 전장을 떠납니다.",
    shadow:
      "속도가 빠른 만큼 브레이크가 약한 것이 이 별의 그림자입니다. 혼자 결정하고 혼자 책임지려는 습관이 깊어지면 고독한 장군이 됩니다.",
    modernType: "레드오션에 맨몸으로 뛰어드는 돌파 전문 개척자형",
  },
  "파군": {
    name: "파군", hanja: "破軍",
    keywords: ["혁신", "모험심", "재창조", "폭발력"],
    personality:
      "자미두수에서는 파군성을 부수고 다시 세우는 선봉장의 별로 봅니다. 낡은 것을 견디지 못하고, 이미 완성된 판보다 뒤집을 판에 끌리는 파괴와 창조의 기운을 함께 품고 있습니다. 소모와 변동이 큰 별이라 인생의 부침이 있는 편이지만, 무너진 자리에서 다시 일어서는 회복력만큼은 열네 별 가운데 으뜸입니다. 남들이 불가능하다고 말리는 일일수록 투지가 타오르며, 실제로 그 무모함이 새 시대의 문을 여는 경우가 많습니다. 에너지가 큰 별인 만큼, 부술 대상을 바깥의 낡은 질서로 정확히 겨누는 것이 중요합니다.",
    career: [
      "스타트업 창업가 — 기존 판을 부수는 파괴적 혁신이 이 별의 본업입니다",
      "크리에이터·아티스트 — 정형을 깨는 파격에서 독창성이 태어납니다",
      "재개발·구조혁신 전문가 — 허물고 새로 세우는 일의 전 과정에 강합니다",
      "변화가 빠른 IT·신기술 분야 — 격변의 파도를 즐기는 체질이 무기가 됩니다",
    ],
    love:
      "사랑도 전부를 거는 올인형으로, 미지근한 관계는 이 사람에게 의미가 없습니다. 감정의 파고가 커서 극적인 연애를 반복하기 쉬운데, 안정과 자극이 공존하는 상대를 만나면 놀랄 만큼 한결같아집니다.",
    shadow:
      "부술 필요가 없는 것까지 부수고 나서 후회하는 것이 이 별의 그림자입니다. 소모가 큰 별이라 돈과 에너지의 리스크 관리가 평생의 숙제입니다.",
    modernType: "판을 뒤집어야 직성이 풀리는 파괴적 혁신가형",
  },
};

// ━━━ 12궁 콘텐츠 ━━━

export const PALACES: { name: string; hanja: string; meaning: string }[] = [
  { name: "명궁",   hanja: "命宮",   meaning: "타고난 기질과 인생 전체의 큰 방향을 보는 자리" },
  { name: "형제궁", hanja: "兄弟宮", meaning: "형제자매와 가까운 동료 등 곁을 지키는 인연의 자리" },
  { name: "부처궁", hanja: "夫妻宮", meaning: "배우자의 성향과 연애·결혼의 양상을 보는 자리" },
  { name: "자녀궁", hanja: "子女宮", meaning: "자녀와의 인연, 그리고 내가 낳는 창조적 결실의 자리" },
  { name: "재백궁", hanja: "財帛宮", meaning: "돈을 벌고 쓰고 굴리는 방식, 재물의 흐름을 보는 자리" },
  { name: "질액궁", hanja: "疾厄宮", meaning: "타고난 체질과 건강, 몸의 약한 고리를 보는 자리" },
  { name: "천이궁", hanja: "遷移宮", meaning: "집 밖의 활동 무대, 이동·여행·대외 운을 보는 자리" },
  { name: "노복궁", hanja: "奴僕宮", meaning: "친구·후배·아랫사람 등 나를 둘러싼 인간관계의 자리" },
  { name: "관록궁", hanja: "官祿宮", meaning: "직업과 커리어, 사회적 성취의 방식을 보는 자리" },
  { name: "전택궁", hanja: "田宅宮", meaning: "부동산·주거 환경과 물려받는 터전의 자리" },
  { name: "복덕궁", hanja: "福德宮", meaning: "정신적 만족과 취향, 마음의 복을 보는 자리" },
  { name: "부모궁", hanja: "父母宮", meaning: "부모·윗사람과의 인연과 그 영향력을 보는 자리" },
];

// ━━━ 한글 조사 처리 (받침 유무) ━━━

function josa(word: string, withBatchim: string, withoutBatchim: string): string {
  const code = word.charCodeAt(word.length - 1);
  const hasBatchim =
    code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  return word + (hasBatchim ? withBatchim : withoutBatchim);
}

/** (으)로 조사 — 받침이 없거나 ㄹ 받침이면 "로", 그 외 받침은 "으로" */
function josaRo(word: string): string {
  const code = word.charCodeAt(word.length - 1);
  const jong = code >= 0xac00 && code <= 0xd7a3 ? (code - 0xac00) % 28 : 0;
  return word + (jong === 0 || jong === 8 ? "로" : "으로");
}

// ━━━ 계산 헬퍼 ━━━

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** 시(0~23) → 시지 index (子=0). 23~01시 = 子 */
function hourBranchIndex(hour: number): number {
  return hour === 23 ? 0 : Math.floor((hour + 1) / 2);
}

/** 오호둔 — 연간 index → 寅월(궁) 천간 index. 甲己→丙, 乙庚→戊, 丙辛→庚, 丁壬→壬, 戊癸→甲 */
function tigerStemIndex(yearStemIdx: number): number {
  const map = [2, 4, 6, 8, 0]; // 丙 戊 庚 壬 甲
  return map[yearStemIdx % 5];
}

/** 간지(천간 idx, 지지 idx) → 60갑자 index */
function ganzhiIndex(stemIdx: number, branchIdx: number): number {
  return mod(6 * stemIdx - 5 * branchIdx, 60);
}

/** 명궁 간지 → 오행국 수 (납음오행: 水2 木3 金4 土5 火6) */
function bureauNumber(stemIdx: number, branchIdx: number): number {
  const element = NAYIN_ELEMENTS[Math.floor(ganzhiIndex(stemIdx, branchIdx) / 2)];
  return ELEMENT_TO_BUREAU[element];
}

/**
 * 기자미(起紫微) — 오행국 수와 음력 생일로 자미성 지지를 구한다.
 * 빌린 수 A = (B - D mod B) mod B, 몫 S = (D+A)/B.
 * A가 홀수면 S-A, 짝수(0 포함)면 S+A 번째 궁(寅=1번째)에 자미 안치.
 * (검증: 22일 木三局→亥, 3일 火六局→亥, 2일 金四局→辰, 20일 土五局→巳, 10일 水二局→午)
 */
export function ziweiBranchForDay(bureau: number, lunarDay: number): ZiweiBranch {
  const A = (bureau - (lunarDay % bureau)) % bureau;
  const S = (lunarDay + A) / bureau;
  const pos = A % 2 === 1 ? S - A : S + A; // 寅궁을 1로 세는 순번
  return ZIWEI_BRANCHES[mod(2 + pos - 1, 12)];
}

/** 14주성 배치 — 12지지 index별 주성 이름 목록 */
function placeMainStars(ziweiIdx: number): ZiweiStarName[][] {
  const chart: ZiweiStarName[][] = Array.from({ length: 12 }, () => []);
  // 자미성계 6성 — 역행: 자미(0) 천기(-1) [격1] 태양(-3) 무곡(-4) 천동(-5) [격2] 염정(-8)
  const ziweiSeries: [ZiweiStarName, number][] = [
    ["자미", 0], ["천기", -1], ["태양", -3], ["무곡", -4], ["천동", -5], ["염정", -8],
  ];
  for (const [star, offset] of ziweiSeries) {
    chart[mod(ziweiIdx + offset, 12)].push(star);
  }
  // 천부 — 자미와 寅申축 대칭
  const tianfuIdx = mod(4 - ziweiIdx, 12);
  // 천부성계 8성 — 순행: 천부(0) 태음(+1) 탐랑(+2) 거문(+3) 천상(+4) 천량(+5) 칠살(+6) [격3] 파군(+10)
  const tianfuSeries: [ZiweiStarName, number][] = [
    ["천부", 0], ["태음", 1], ["탐랑", 2], ["거문", 3],
    ["천상", 4], ["천량", 5], ["칠살", 6], ["파군", 10],
  ];
  for (const [star, offset] of tianfuSeries) {
    chart[mod(tianfuIdx + offset, 12)].push(star);
  }
  return chart;
}

// 내부 명반 계산 (음력 기준)
function buildChart(lunarYear: number, lunarMonth: number, lunarDay: number, hourIdx: number) {
  const mingIdx = mod(2 + (lunarMonth - 1) - hourIdx, 12); // 명궁
  const bodyIdx = mod(2 + (lunarMonth - 1) + hourIdx, 12); // 신궁
  const yearStemIdx = mod(lunarYear - 4, 10);              // 음력 연도 천간
  const mingStemIdx = mod(tigerStemIndex(yearStemIdx) + mod(mingIdx - 2, 12), 10);
  const bureau = bureauNumber(mingStemIdx, mingIdx);
  const ziweiIdx = ZIWEI_BRANCHES.indexOf(ziweiBranchForDay(bureau, lunarDay));
  const chart = placeMainStars(ziweiIdx);
  return { mingIdx, bodyIdx, mingStemIdx, bureau, ziweiIdx, chart };
}

// ━━━ 결과 타입 ━━━

export interface ZiweiResult {
  /** 명궁의 주성 정보 (공궁이면 천이궁에서 빌린 별) */
  mainStars: ZiweiStarInfo[];
  /** 명궁 지지 */
  palaceBranch: ZiweiBranch;
  /** 신궁 지지 */
  bodyPalaceBranch: ZiweiBranch;
  /** 오행국 — 예: "화육국(火六局)" */
  bureau: string;
  /** 명궁이 공궁(주성 없음)인지 — true면 mainStars는 천이궁 차성 */
  isEmpty: boolean;
  /** 출생 시각 미제공으로 子시를 가정했는지 */
  hourAssumed: boolean;
  /** 12궁 전체 — 명궁부터 역행 순서 */
  palaces: { name: string; branch: ZiweiBranch; stars: ZiweiStarName[] }[];
  /** 종합 요약 (3~4문장) */
  summary: string;
  /** 변환된 음력 생일 (참고용) */
  lunar: { year: number; month: number; day: number; isLeapMonth: boolean };
}

// ━━━ 메인 분석 함수 ━━━

/**
 * 자미두수 명반 분석 — 양력 생년월일(+시각) 입력.
 * @param hour 0~23. 미제공 시 子시(0시)를 가정하고 hourAssumed=true 반환.
 */
export function analyzeZiwei(year: number, month: number, day: number, hour?: number): ZiweiResult {
  const hourAssumed = hour === undefined;
  const h = hour ?? 0; // 시각 미상 → 子시 가정
  if (h < 0 || h > 23 || !Number.isInteger(h)) {
    throw new Error(`유효하지 않은 시각입니다: ${h} (0~23 정수)`);
  }

  // 1) 양력 → 음력 (윤달은 해당 월로 귀속)
  const cal = new KoreanLunarCalendar();
  if (!cal.setSolarDate(year, month, day)) {
    throw new Error(`유효하지 않은 양력 날짜입니다: ${year}-${month}-${day}`);
  }
  const lunar = cal.getLunarCalendar();

  // 2) 명반 계산
  const hourIdx = hourBranchIndex(h);
  const { mingIdx, bodyIdx, bureau, chart } = buildChart(
    lunar.year, lunar.month, lunar.day, hourIdx,
  );

  // 3) 12궁 구성 (명궁에서 역행)
  const palaces = PALACES.map((p, i) => {
    const idx = mod(mingIdx - i, 12);
    return { name: p.name, branch: ZIWEI_BRANCHES[idx], stars: chart[idx] };
  });

  // 4) 명궁 주성 — 공궁이면 대궁(천이궁)에서 차성
  const ownStars = chart[mingIdx];
  const isEmpty = ownStars.length === 0;
  const starNames = isEmpty ? chart[mod(mingIdx + 6, 12)] : ownStars;
  const mainStars = starNames.map((n) => ZIWEI_STARS[n]);

  // 5) 오행국 표기
  const b = BUREAU_NAMES[bureau];
  const bureauLabel = `${b.kr}(${b.hanja})`;

  // 6) 요약 (3~4문장)
  const palaceBranch = ZIWEI_BRANCHES[mingIdx];
  const bodyPalaceBranch = ZIWEI_BRANCHES[bodyIdx];
  const joined = mainStars.map((s) => s.name).join("·");

  let head: string;
  let core: string;
  if (mainStars.length === 0) {
    head = `당신의 명궁은 ${BRANCH_KR[palaceBranch]}(${palaceBranch})궁의 공궁(空宮)으로, 특정한 별에 매이지 않는 유연한 명입니다.`;
    core = `자미두수에서는 공궁을 결핍이 아니라 환경에 따라 색을 바꾸는 잠재력으로 봅니다.`;
  } else if (isEmpty) {
    head = `당신의 명궁은 ${BRANCH_KR[palaceBranch]}(${palaceBranch})궁의 공궁(空宮)으로, 차성안궁(借星安宮)의 법에 따라 맞은편 천이궁의 ${josa(joined, "을", "를")} 빌려 읽습니다.`;
    core = `빌려 온 ${joined}의 기운으로 보면 ${josa(mainStars[0].keywords[0], "과", "와")} ${josa(mainStars[0].keywords[1], "이", "가")} 삶의 기조가 되며, ${mainStars[0].modernType}의 면모가 바깥 활동에서 특히 뚜렷하게 드러납니다.`;
  } else {
    head = `당신의 명궁은 ${BRANCH_KR[palaceBranch]}(${palaceBranch})궁이며, 주성으로 ${josa(joined, "이", "가")} 자리합니다.`;
    core = `자미두수에서는 명궁의 주성을 타고난 기질의 뼈대로 보는데, ${mainStars[0].name}(${mainStars[0].hanja})의 기운은 ${josa(mainStars[0].keywords[0], "과", "와")} ${josaRo(mainStars[0].keywords[1])} 요약되는 ${mainStars[0].modernType}입니다.`;
  }
  const summary = [
    head,
    core,
    `오행국은 ${bureauLabel}으로, ${b.phrase} 호흡으로 운이 전개됩니다.`,
    `신궁(身宮)은 ${BRANCH_KR[bodyPalaceBranch]}(${bodyPalaceBranch})궁에 자리하여, 중년 이후에는 이 궁의 기운이 삶의 무게중심이 됩니다.`,
  ].join(" ");

  return {
    mainStars,
    palaceBranch,
    bodyPalaceBranch,
    bureau: bureauLabel,
    isEmpty,
    hourAssumed,
    palaces,
    summary,
    lunar: {
      year: lunar.year,
      month: lunar.month,
      day: lunar.day,
      isLeapMonth: !!lunar.intercalation,
    },
  };
}

// ━━━ 검증 ━━━

interface VerifyCase {
  case: string;
  source: string;
  expected: string;
  actual: string;
  pass: boolean;
}

/**
 * 웹 공개 명반 사례와의 대조 검증.
 * 사례 1: 辛酉년(1981) 음력 2월 24일 午시 → 명궁 酉(간지 丁酉), 화육국, 자미 巳
 *   출처: https://zhuanlan.zhihu.com/p/678994105
 *        https://c.m.163.com/news/a/IOVU4BHC0521C9T8.html (동일 기사 — 명궁 酉·寅干庚 확인)
 * 사례 2: 음력 9월 초6일 申시 → 명궁 寅 (명궁은 생월·생시로만 결정되므로 연도 무관)
 *   출처: http://www.360doc.com/content/22/0112/22/66166532_1013012451.shtml
 * 사례 3: 기자미표 대조 5례 (국수·생일 → 자미 지지)
 *   출처: https://zhuanlan.zhihu.com/p/669148811
 */
export function verifyZiwei(): { passed: boolean; cases: VerifyCase[] } {
  const cases: VerifyCase[] = [];

  // ── 사례 1: 辛酉년 음력 2월 24일 午시 ──
  {
    const cal = new KoreanLunarCalendar();
    cal.setLunarDate(1981, 2, 24, false); // 辛酉년
    const solar = cal.getSolarCalendar();
    const r = analyzeZiwei(solar.year, solar.month, solar.day, 12); // 午시
    const ziweiPalace = r.palaces.find((p) => p.stars.includes("자미"));
    const actual = `명궁 ${r.palaceBranch}, ${r.bureau}, 자미 ${ziweiPalace?.branch}`;
    cases.push({
      case: "辛酉(1981)년 음력 2/24 午시",
      source: "https://zhuanlan.zhihu.com/p/678994105 (163 동일 기사 교차 확인)",
      expected: "명궁 酉, 화육국(火六局), 자미 巳",
      actual,
      pass:
        r.palaceBranch === "酉" &&
        r.bureau.includes("火六局") &&
        ziweiPalace?.branch === "巳",
    });
  }

  // ── 사례 2: 음력 9월 초6일 申시 → 명궁 寅 (연도 무관 규칙) ──
  {
    const cal = new KoreanLunarCalendar();
    cal.setLunarDate(2000, 9, 6, false);
    const solar = cal.getSolarCalendar();
    const r = analyzeZiwei(solar.year, solar.month, solar.day, 16); // 申시
    cases.push({
      case: "음력 9/6 申시 (2000년으로 대입)",
      source: "http://www.360doc.com/content/22/0112/22/66166532_1013012451.shtml",
      expected: "명궁 寅",
      actual: `명궁 ${r.palaceBranch}`,
      pass: r.palaceBranch === "寅",
    });
  }

  // ── 사례 3: 기자미표 5례 ──
  {
    const table: [number, number, ZiweiBranch][] = [
      [3, 22, "亥"], // 木三局 22일
      [6, 3, "亥"],  // 火六局 초3일
      [4, 2, "辰"],  // 金四局 초2일
      [5, 20, "巳"], // 土五局 20일
      [2, 10, "午"], // 水二局 10일
    ];
    const actual = table
      .map(([b, d]) => ziweiBranchForDay(b, d))
      .join(",");
    const expected = table.map(([, , e]) => e).join(",");
    cases.push({
      case: "기자미표 대조 (국수·생일 5례)",
      source: "https://zhuanlan.zhihu.com/p/669148811",
      expected,
      actual,
      pass: actual === expected,
    });
  }

  return { passed: cases.every((c) => c.pass), cases };
}
