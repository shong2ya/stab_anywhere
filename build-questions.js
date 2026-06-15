const fs = require("fs");
const path = require("path");

function pair(en, ko) {
  return { en, ko };
}

// 사용자가 제공한 글·대화 소스에서만 추출한 질문 (자동 생성 없음)
const SOURCE_QUESTIONS = [
  // ── 과잉 공감 · 경계 · 부정 표현 ──
  pair(
    "When friends say someone was truly wrong, do you still defend that person?",
    "친구들이 '그 사람이 진짜 잘못했어'라고 할 때도, 그 사람 편을 드나요?"
  ),
  pair(
    "Is it easier for you to say \"this is difficult\" than \"I hate this\"?",
    "'싫다'보다 '어렵다'고 말하는 편인가요?"
  ),
  pair(
    "Do you ask why they acted that way before asking if you were hurt?",
    "상처받았는지 묻기 전에, '왜 저랬을까?'부터 생각하나요?"
  ),
  pair(
    "Do you beautify someone who hurt you when you write in your diary?",
    "일기에서 나를 속상하게 한 사람을 미화하며 쓰나요?"
  ),
  pair(
    "In your diary, do you make the person who hurt you seem like they need extra care?",
    "일기 속에서 상대를 누구보다 배려가 필요한 사람처럼 그리나요?"
  ),
  pair(
    "Can you say \"I understand\" while your face still shows discomfort?",
    "'이해해'라고 말하면서도, 얼굴에 불편함이 드러나나요?"
  ),
  pair(
    "Do you fear that saying \"no\" will ruin the relationship?",
    "'아니오'라고 말하면 관계가 망가질까 봐 두렵나요?"
  ),
  pair(
    "When you dislike something, do you say \"it's difficult\" instead of \"I hate it\"?",
    "정말 싫을 때도 '싫다' 대신 '어렵다'고 말하나요?"
  ),
  pair(
    "Do you believe you must be someone who can understand everyone?",
    "모든 사람을 다 이해할 수 있는 사람이어야 한다고 느끼나요?"
  ),
  pair(
    "When understanding others exhausts you, do you still keep doing it?",
    "이해하려는 과정이 너무 소모적인데도, 계속 이해하려 하나요?"
  ),
  pair(
    "Do you think being kind means tolerating bad behavior?",
    "착하다는 것은 나쁜 행동을 참는 것이라고 믿나요?"
  ),
  pair(
    "Would you rather absorb harm than make someone uncomfortable?",
    "누군가 불편해지게 하느니, 차라리 상처를 삼키나요?"
  ),
  pair(
    "When people call you \"too kind,\" do you feel they misunderstand why?",
    "'너 정말 착하다'는 말을 들을 때, 그 이유를 오해당한 기분이 드나요?"
  ),
  pair(
    "Do you call patience what is really fear of conflict?",
    "사실은 갈등이 두려운 걸, 인내심이라 부르나요?"
  ),
  pair(
    "When someone judges you, do you try to pass their test?",
    "누군가 나를 평가하면, 그 시험에 합격하려 하나요?"
  ),
  pair(
    "Could you tear up someone's judgment of you instead of answering it?",
    "나를 평가하는 말에 답하기보다, 그 시험지를 찢을 수 있나요?"
  ),
  pair(
    "If your gut says \"bad behavior,\" do you trust it over their smile?",
    "내 직관이 '나쁜 행동'이라 하는데, 상대의 미소를 더 믿나요?"
  ),
  pair(
    "Do you hide that you were hurt so you won't feel pitiful?",
    "불쌍해지기 싫어서, 상처받은 사실을 숨기나요?"
  ),
  pair(
    "Would you rather return to ordinary life than perform your pain for others?",
    "고통을 관객에게 보여주기보다, 평범한 일상으로 돌아가고 싶나요?"
  ),

  // ── 초등학교 · 학창시절 ──
  pair(
    "When a child was rude to your parent, did you excuse them as having a bad day?",
    "친구가 부모님께 인사도 안 하고 지나갔을 때, '오늘 기분 안 좋은 일이 있었나 봐'라고 했나요?"
  ),
  pair(
    "Were you repeatedly paired with violent classmates because you seemed understanding?",
    "이해심이 많다는 이유로, 통제 안 되는 아이들과 계속 짝이 되었나요?"
  ),
  pair(
    "When you were scared at school, did you excuse the teacher instead of saying you were afraid?",
    "무섭고 힘들 때, '선생님도 힘드실 거야'라고 말했나요?"
  ),
  pair(
    "Did you think a violent classmate might be suffering more than you?",
    "나를 괴롭힌 아이가 나보다 더 힘들 수도 있다고 생각했나요?"
  ),
  pair(
    "When a troubled classmate threatened you with a cutter, could you still not blame them?",
    "힘든 친구가 커터칼을 들이댔을 때도, 그 친구를 비난하지 못했나요?"
  ),
  pair(
    "When friends got angry on your behalf, did you hold back from agreeing?",
    "친구들이 대신 화내 줄 때, 동의하기를 주저했나요?"
  ),
  pair(
    "Did your habit of understanding others end up hurting people who truly cared about you?",
    "이해하려는 습관이, 나를 진심으로 아끼는 사람들의 마음을 상하게 한 적이 있나요?"
  ),
  pair(
    "When classmates mocked a struggling peer, did you try to understand them by approaching alone?",
    "조롱당하는 친구를 이해하려고 혼자 다가갔나요?"
  ),

  // ── 액팅 미션 · 욕하기 · 지각 ──
  pair(
    "Could you swear honestly at a friend who wronged you?",
    "나를 잘못한 친구에게, 진심으로 욕할 수 있나요?"
  ),
  pair(
    "When a friend was very late, did you usually say \"it's fine, you made it\"?",
    "친구가 많이 늦었을 때, '괜찮아, 왔으면 됐지'라고 말하는 편인가요?"
  ),
  pair(
    "When you finally swore at a late friend, did it feel strangely relieving?",
    "늦은 친구에게 욕을 했을 때, 시원한 기분이 들었나요?"
  ),
  pair(
    "When a friend kept asking about your estranged friend, could you swear about it together?",
    "서먹해진 친구 이야기를, 친구와 함께 욕하며 풀 수 있었나요?"
  ),
  pair(
    "Do you think small anger should match small wrongs?",
    "별거 아닌 일이면, 별거 아닌 정도로만 화내도 된다고 믿나요?"
  ),
  pair(
    "When you kept excusing lateness, did your friend look deflated watching your face?",
    "지각을 계속 이해해 주면, 친구가 내 표정을 살피며 풀이 죽어 있었나요?"
  ),
  pair(
    "Is your new acting mission to express refusal more directly, even through swearing?",
    "욕을 포함해서라도, 거친 부정 표현을 연습하는 게 내 새 미션인가요?"
  ),

  // ── 조종 · 가스라이팅 · B ──
  pair(
    "Did someone say they wanted to see you angry while doubting your gentleness was real?",
    "누군가 화내는 모습을 보고 싶다며, 순함이 꾸민 것인지 궁금해한 적 있나요?"
  ),
  pair(
    "Did he seem curious about the bottom of your kindness?",
    "그가 착함 너머의 순함을 보며, 내 '바닥'이 궁금해한 것 같나요?"
  ),
  pair(
    "Does a cute face make it harder to stand in an equal relationship?",
    "귀여운 표정 때문에, 동등한 관계로 설 수 없게 느껴지나요?"
  ),
  pair(
    "When you speak up and hear \"how cute,\" do you shrink back?",
    "용기 내 말했을 때 '귀엽네~'라고 들으면, 다시 움츠러들나요?"
  ),
  pair(
    "Would you accept \"I'll explain the world since you're busy\" without questioning it?",
    "'너 바쁘니 내가 세상 돌아가는 걸 알려줄게'를 그대로 받아들이나요?"
  ),
  pair(
    "When told \"don't question my math,\" would you stop thinking for yourself?",
    "'너는 계산할 필요 없어, 내 계산에 의문만 안 가지면 돼'라고 들으면, 스스로 생각을 멈추나요?"
  ),
  pair(
    "Would you hide a fight because they said telling others is spitting on your face?",
    "'싸워도 주변에 얘기하지 마, 그건 네 얼굴에 침 뱉기야'라는 말을 따르겠나요?"
  ),
  pair(
    "Does someone who truly loves you put your will before their own?",
    "진심으로 나를 사랑하는 사람은, 내 의사를 가장 우선한다고 믿나요?"
  ),
  pair(
    "Does someone trying to control you use your anxiety as a tool?",
    "나를 휘두르려는 사람이, 내 불안함을 이용하려 한다고 느낀 적 있나요?"
  ),
  pair(
    "Do you mistake anxiety manipulation for care at first?",
    "불안을 이용하는 것을, 처음엔 돌봄으로 착각한 적 있나요?"
  ),

  // ── 회복 · 경계 · 판단 기준 ──
  pair(
    "Do you ask \"when was I uncomfortable\" before \"why did they do it\"?",
    "'왜 그랬는지'보다 '언제 불편했는지'를 먼저 묻나요?"
  ),
  pair(
    "Do you ask \"when was my discomfort ignored\"?",
    "'내 불편함이 무시된 순간은 언제였지'를 묻나요?"
  ),
  pair(
    "Is a clear NO still hard for you to say?",
    "명확한 '아니오'를 말하기가 여전히 어렵나요?"
  ),

  // ── 예쁜 마음 · 순수함 · 피해자 서사 ──
  pair(
    "Do you trust people easily for your age?",
    "나이에 비해 세상 물정을 모르고, 사람을 잘 믿는 편인가요?"
  ),
  pair(
    "Does your habit of a pretty heart make you an easy target for those who want to use you?",
    "예쁜 마음의 관성 때문에, 나를 이용하려는 사람에게 표적이 되기 쉽다고 느끼나요?"
  ),
  pair(
    "Did you want to send a sincere goodbye to fake tenderness?",
    "가짜 다정함에게도, 진심 어린 마지막 작별을 남기고 싶었나요?"
  ),
  pair(
    "Did you want what was beautiful in your first meeting to stay intact?",
    "첫 만남 속 예쁜 기억을, 끝까지 온전하게 남기고 싶었나요?"
  ),
  pair(
    "Does early pity-pouring from someone new feel like intimacy to you?",
    "만난 지 얼마 안 됐는데 불우한 이야기를 쏟아내는 게, 친밀함처럼 느껴지나요?"
  ),
  pair(
    "Do you believe you can heal a wounded monster with your purity?",
    "상처 입은 괴물을, 내 순수함으로 고쳐 쓸 수 있다고 믿었나요?"
  ),
  pair(
    "When you only wanted them to smile, was that love rather than arrogance?",
    "그냥 행복하게 웃게 해주고 싶었을 뿐이었다고 믿나요?"
  ),
  pair(
    "Can unconditional giving be precious without being pitiful?",
    "조건 없이 내보이는 마음이, 가엾지 않고 귀할 수 있다고 믿나요?"
  ),
  pair(
    "When you show small sincere kindness, is there someone who denies your goodness and hopes it is poisoned?",
    "좋고 일상적인 작은 진심을 표해도, 선함을 부정하며 그 마음에 독이 있길 바라는 사람이 있나요?"
  ),
  pair(
    "Do you refuse the role of victim?",
    "피해자가 되지 않겠다고 다짐하나요?"
  ),
  pair(
    "Do you want to enlarge the audience for your pain?",
    "내 무고함과 상대의 최악을 세상에 호소하며 관객을 늘리고 싶나요?"
  ),

  // ── 칼 · 순함 · 악의 ──
  pair(
    "Do you believe a knife is not wrong, but it must not be given to malice?",
    "칼은 잘못이 없지만, 악의를 품은 사람 손에 쥐어주면 안 된다고 믿나요?"
  ),
  pair(
    "Does your gentle, trusting heart ever feel like a knife that could end up in the wrong hands?",
    "착하고 잘 믿는 내 마음이, 잘못된 손에 들어가는 칼 같다고 느낀 적 있나요?"
  ),
  pair(
    "Do you worry your kindness and trust get used for gaslighting?",
    "순함과 잘 믿는 성향이 가스라이팅에 이용되는 것 같다고 느끼나요?"
  ),
  pair(
    "Do you feel you hand your goodness to someone manipulative?",
    "내 착함을 조종하는 사람에게 쥐어주는 것 같다고 느끼나요?"
  ),

  // ── 얼굴 · 기억 · 가면 · 퇴장 ──
  pair(
    "Does that person's face still not come back to you clearly?",
    "그 사람의 얼굴이 지금도 선명하게 떠오르지 않나요?"
  ),
  pair(
    "Did a once-happy face later look like a mask to you?",
    "행복해하던 얼굴이, 순간 가면처럼 보인 적 있나요?"
  ),
  pair(
    "From start to end, do you feel you were only cast in a puppet play — never really there?",
    "기괴한 인형극에 끼워 넣어졌을 뿐, 처음부터 끝까지 그곳에 내가 없었다고 느끼나요?"
  ),
  pair(
    "Do you believe their sneer at the end was a struggle to stand above you, and also a surrender?",
    "상대 말미의 조소가, 내 위에 서려는 발버둥이자 완전한 항복이었다고 믿나요?"
  ),
  pair(
    "Do you believe they could not exist without using others as fuel?",
    "상대는 타인을 양분 삼지 않으면 존재할 수 없는 허상이었다고 믿나요?"
  ),
  pair(
    "Are you ready to return to your own world?",
    "다시 나의 세상으로 돌아갈 준비가 되었나요?"
  ),
  pair(
    "Do you believe ordinary life is your right to reclaim?",
    "사소하고 평온한 일상을 되찾는 것이, 온전한 나의 권리라고 믿나요?"
  ),
  pair(
    "Do you believe a long funeral is unnecessary — that letting them quietly disappear is enough?",
    "긴 장례 없이, 그냥 상대를 소멸시켜도 된다고 믿나요?"
  ),

  // ── 곤충 · 소유 · 예술가 ──
  pair(
    "Would you rather watch something fly than own it flattened in a book?",
    "도감 속 곤충처럼 납작하게 소유하기보다, 날아다니는 모습을 보고 싶나요?"
  ),
  pair(
    "Do you believe an artist must willingly fall into a system's error?",
    "예술가는 시스템의 오류 속으로 기꺼이 추락해야 한다고 믿나요?"
  ),
  pair(
    "Would you keep imitating love you do not feel?",
    "진짜 감정 없이, 사랑을 흉내 내며 살겠나요?"
  ),
  pair(
    "Must you walk straight even on a twisted path?",
    "비틀린 길에서도 반듯하게 걸어야 한다고 느끼나요?"
  ),

  // ── 조건 없는 내보임 · 신뢰 · 미정 ──
  pair(
    "Is showing yourself without conditions trust in the world you've lived through, not softness to be exploited?",
    "조건 없이 내보이는 것은, 길들일 수 있는 무름이 아니라 겪어온 세상에 대한 신뢰라고 믿나요?"
  ),
  pair(
    "Do you want your sincerity to stay unpolluted on the road you walked?",
    "내 진심이 오염되지 않은 채, 그 길 위에 남아 있기를 바라나요?"
  ),
  pair(
    "Did kind people around you help you notice strange signals?",
    "친절하고 따뜻한 사람들 덕분에, 이상한 신호를 알아챌 수 있었나요?"
  ),
  pair(
    "Do you want to praise your own insufficient but real efforts to protect yourself?",
    "나를 보호해 준 미흡한 최선들을, 스스로 칭찬하고 싶나요?"
  ),
  pair(
    "On days you are deeply hurt, does the world oddly feel kind to you?",
    "마음이 크게 상하는 날, 세상이 사소하게 다 나에게 친절한 느낌이 드나요?"
  ),
  pair(
    "Did you only realize later how much you had been wounded?",
    "나중에야 내가 받은 상처를 너무 몰랐다는 생각이 드나요?"
  ),
  pair(
    "Did you deceive yourself because you hated being a victim?",
    "피해자가 되는 게 싫어서, 스스로를 속여왔다고 느끼나요?"
  ),

  // ── 핵심 질문 (글에서 직접) ──
  pair(
    "Before asking why they did it, do you ask whether you disliked how you were treated?",
    "'왜 저 사람이 저랬을까?' 전에, '나는 저 대접이 싫었나?'를 먼저 묻나요?"
  ),
  pair(
    "When you feel uncomfortable, is it bad behavior even if they look happy?",
    "불편함을 느꼈다면, 상대가 행복한 표정이어도 나쁜 행동이라고 믿나요?"
  ),
  pair(
    "When someone evaluates you, can you refuse to submit an answer?",
    "누군가 나를 평가할 때, '네가 뭔데?'라며 시험지를 찢을 수 있나요?"
  ),
  pair(
    "Is refusing and drawing a line still hard for you?",
    "거절과 선 긋기가 여전히 어렵나요?"
  ),

  // ── B · C 이야기 (검토 후 반영) ──
  pair(
    "Did he seem overly tuned to your every reaction before you dated?",
    "내 마음을 얻기 위해서 내 반응 하나하나에 지나치게 예민했나요?"
  ),
  pair(
    "Did his self-deprecating messages make you want to reassure him?",
    "쭈굴거리며 자신을 낮추는 말에, 상대를 달래주고 싶어졌나요?"
  ),
  pair(
    "Did he pour out painful family stories very early on?",
    "만난 지 얼마 안 되었는데, 상대가 아픈 가정사를 너무 일찍 쏟아냈나요?"
  ),
  pair(
    "Did he say you should not lower yourself — while later making you feel smaller?",
    "스스로를 낮추지 말라 했던 사람이, 나중에 나를 작아지게 했나요?"
  ),
  pair(
    "Did he call your conversation warm, deep, and the best match he had known?",
    "내 말이 따뜻하고 깊고, 대화의 결이 맞는다고 했나요?"
  ),
  pair(
    "Did he say all his time was yours?",
    "「내 시간은 다 너의 것이다」라고 했나요?"
  ),
  pair(
    "Did he want to show you off to everyone he knew?",
    "주변 사람들에게 얼른 나를 소개하고 싶다고 했나요?"
  ),
  pair(
    "Did he say you were not calculating — and say it often?",
    "「넌 계산적이지 않아서 좋다」는 말을 자주 했나요?"
  ),
  pair(
    "Did he want to see you angry while doubting your gentleness was real?",
    "화내는 모습을 보고 싶다며, 순함이 꾸민 것인지 궁금해했나요?"
  ),
  pair(
    "When you spoke up, did he call you cute and make you shrink back?",
    "용기 내 말했을 때 「귀엽네~」 하며, 다시 움츠러들게 했나요?"
  ),
  pair(
    "Did he talk about a distant future and official introductions early?",
    "먼 미래·오피셜 소개 이야기를, 너무 일찍 꺼냈나요?"
  ),
  pair(
    "When marriage felt heavy, did he say it came out naturally only with you?",
    "결혼 얘기가 부담스럽다 하니, 너한테만 자연스럽게 나온다 했나요?"
  ),
  pair(
    "Did he trash his X on day one and say you were different?",
    "처음 사귀는 날 X를 욕하며, 넌 안 그래서 좋다 했나요?"
  ),
  pair(
    "Did he describe you as a kind of woman you clearly are not?",
    "누가 봐도 그런 사람이 아닌데, 그런 여자라고 말했나요?"
  ),
  pair(
    "Did he say he only knew you seventy to eighty percent?",
    "「난 널 70–80퍼센트 안다」고 했나요?"
  ),
  pair(
    "As an artist, were you called arrogant for living your life?",
    "예술인인 내가 잘 살고 있다고, 오만하다 했나요?"
  ),
  pair(
    "When you asked him to clarify, did he say the question was already complete?",
    "질문을 더 자세히 해 달라 하니, 이미 완전한 질문이라 했나요?"
  ),
  pair(
    "The next morning, did he text about the weather as if nothing happened?",
    "다음날 아침, 아무 일 없다는 듯 날씨·옷차림 문자를 보냈나요?"
  ),
  pair(
    "In the next meeting, did you feel audited — not equal?",
    "다음 만남에서, 동등한 게 아니라 심사받는 기분이 들었나요?"
  ),
  pair(
    "When you were hurting, did he seem to enjoy watching you break?",
    "멘탈이 깨진 나를 보며 즐거워 했나요?"
  ),
  pair(
    "Did he say badmouthing him would be fine — while smiling?",
    "「내 욕 많이 해라」고 하면서, 웃었나요?"
  ),
  pair(
    "If we fought, did he say telling others would spit on your face?",
    "우리가 싸우면 주변에 말하지 말라며, 그건 네 얼굴에 침 뱉기라 했나요?"
  ),
  pair(
    "Did you block him on chat?",
    "카톡에서 상대를 차단했나요?"
  ),
  pair(
    "Did he ask if you would discard him when he got boring?",
    "「나 재미없어지면 버릴 거야?」라고 물었나요?"
  ),
  pair(
    "Did he say you were his first standard for a partner?",
    "「넌 처음 기준이 나라서 어떡해?」라는 말을 들었나요?"
  ),
  pair(
    "Did his happy expression weigh on your heart?",
    "그의 행복한 표정이, 마음을 무겁게 했나요?"
  ),
  pair(
    "Did having your head stroked make you feel weaker?",
    "머리를 쓰다듬는 게 나를 약하게 만들었나요?"
  ),
];

function dedupe(questions) {
  const seen = new Set();
  return questions.filter((q) => {
    if (seen.has(q.en)) return false;
    seen.add(q.en);
    return true;
  });
}

const QUESTIONS = dedupe(SOURCE_QUESTIONS);

const out = `// 사용자 제공 글 소스에서만 추출한 질문. 재생성: node build-questions.js
(function (global) {
  const SOURCE_QUESTIONS = ${JSON.stringify(QUESTIONS, null, 2)};

  function buildQuestions(required) {
    if (SOURCE_QUESTIONS.length === 0) {
      throw new Error("No source questions available.");
    }
    // 소스 질문 수가 QR 칸보다 적으면, 소스 안에서만 순환합니다.
    const out = [];
    for (let i = 0; i < required; i++) {
      out.push(SOURCE_QUESTIONS[i % SOURCE_QUESTIONS.length]);
    }
    return out;
  }

  global.buildQuestions = buildQuestions;
  global.SOURCE_QUESTION_COUNT = SOURCE_QUESTIONS.length;
})(typeof window !== "undefined" ? window : global);
`;

fs.writeFileSync(path.join(__dirname, "questions.js"), out, "utf8");
console.log(`Wrote ${QUESTIONS.length} source-only questions to questions.js`);
