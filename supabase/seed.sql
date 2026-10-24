-- 개발용 시드. 인메모리 저장소(lib/db/memory.ts)의 lib/quiz/seed.ts 와 동일 내용을 유지한다.

insert into badges (code, name, description, emoji, rule) values
  ('spicy_lover',  '매운맛러버',  '매운 선택지를 3번 이상 골랐어요',     '🌶️', '{"tag":"spicy","min":3}'),
  ('cafe_lover',   '카페러버',    '카페·디저트 선택지를 3번 이상 골랐어요', '☕', '{"tag":"cafe","min":3}'),
  ('night_owl',    '야행성',      '밤 시간대 선택지를 3번 이상 골랐어요',  '🦉', '{"tag":"late_night","min":3}'),
  ('home_body',    '집순이·집돌이','집에서 보내는 선택지를 3번 이상 골랐어요','🏠', '{"tag":"home","min":3}'),
  ('smart_shopper','알뜰쇼퍼',    '가성비 선택지를 3번 이상 골랐어요',     '🛒', '{"tag":"value","min":3}'),
  ('fitness',      '운동러',      '운동 선택지를 3번 이상 골랐어요',       '💪', '{"tag":"fitness","min":3}')
on conflict (code) do nothing;

insert into roulette_prizes (name, kind, value, weight, sort) values
  ('50P',               'points',   50,   50, 1),
  ('100P',              'points',   100,  30, 2),
  ('300P',              'points',   300,  12, 3),
  ('1,000P',            'points',   1000, 5,  4),
  ('편의점 5,000원권',  'gifticon', 5000, 2,  5),
  ('꽝 (다음 기회에)',  'none',     0,    1,  6);

insert into missions (type, title, description, reward_points, reward_stamps, config) values
  ('quiz_set', '오늘의 취향 퀴즈 5개 완료', '퀴즈 5개에 답하면 스탬프 1개', 0, 1, '{"count":5}');

-- 퀴즈 10문항 (lib/quiz/seed.ts 와 동일). 선택지 tags 가 취향 태그 → 배지 원천.
do $$
declare
  qid uuid;
begin
  insert into quizzes (question, kind, sort) values ('오늘 저녁, 둘 중 하나만 고른다면?', 2, 1) returning id into qid;
  insert into quiz_options (quiz_id, label, emoji, tags, sort) values
    (qid, '불닭볶음면', '🔥', '{spicy,convenience}', 0),
    (qid, '크림 파스타', '🍝', '{mild,western}', 1);

  insert into quizzes (question, kind, sort) values ('주말 오후 2시, 나는 어디에?', 4, 2) returning id into qid;
  insert into quiz_options (quiz_id, label, emoji, tags, sort) values
    (qid, '동네 카페', '☕', '{cafe,outdoor}', 0),
    (qid, '침대 위', '🛏️', '{home,rest}', 1),
    (qid, '헬스장', '🏋️', '{fitness,outdoor}', 2),
    (qid, '쇼핑몰', '🛍️', '{shopping,outdoor}', 3);

  insert into quizzes (question, kind, sort) values ('치킨 시킬 때 나의 선택은?', 2, 3) returning id into qid;
  insert into quiz_options (quiz_id, label, emoji, tags, sort) values
    (qid, '매운 양념', '🌶️', '{spicy,delivery}', 0),
    (qid, '후라이드', '🍗', '{mild,delivery}', 1);

  insert into quizzes (question, kind, sort) values ('같은 물건, 어디서 살래?', 2, 4) returning id into qid;
  insert into quiz_options (quiz_id, label, emoji, tags, sort) values
    (qid, '최저가 검색해서 온라인', '💻', '{value,online_shopping}', 0),
    (qid, '바로 집 앞 편의점', '🏪', '{convenience}', 1);

  insert into quizzes (question, kind, sort) values ('떡볶이 맵기, 나는?', 4, 5) returning id into qid;
  insert into quiz_options (quiz_id, label, emoji, tags, sort) values
    (qid, '순한맛', '😊', '{mild}', 0),
    (qid, '보통', '🙂', '{mild}', 1),
    (qid, '매운맛', '🥵', '{spicy}', 2),
    (qid, '극한맵기 도전', '💀', '{spicy,challenge}', 3);

  insert into quizzes (question, kind, sort) values ('디저트 하나만 고른다면?', 2, 6) returning id into qid;
  insert into quiz_options (quiz_id, label, emoji, tags, sort) values
    (qid, '달달한 케이크', '🍰', '{cafe,sweet}', 0),
    (qid, '아메리카노로 충분', '☕', '{cafe,coffee}', 1);

  insert into quizzes (question, kind, sort) values ('밤 11시, 지금 뭐 해?', 4, 7) returning id into qid;
  insert into quiz_options (quiz_id, label, emoji, tags, sort) values
    (qid, '야식 주문 중', '🍜', '{late_night,delivery}', 0),
    (qid, '넷플릭스', '📺', '{late_night,home}', 1),
    (qid, '이미 잠듦', '😴', '{early_bird,rest}', 2),
    (qid, '운동 또는 산책', '🏃', '{late_night,fitness}', 3);

  insert into quizzes (question, kind, sort) values ('갑자기 생긴 5만원, 어디에?', 2, 8) returning id into qid;
  insert into quiz_options (quiz_id, label, emoji, tags, sort) values
    (qid, '맛집 탐방', '🍽️', '{dining_out,outdoor}', 0),
    (qid, '저축·투자', '💰', '{value,saving}', 1);

  insert into quizzes (question, kind, sort) values ('친구가 "나와"라고 하면?', 2, 9) returning id into qid;
  insert into quiz_options (quiz_id, label, emoji, tags, sort) values
    (qid, '바로 나감', '🚶', '{outdoor,social}', 0),
    (qid, '집에서 보자고 함', '🏠', '{home,social}', 1);

  insert into quizzes (question, kind, sort) values ('운동, 얼마나 해?', 4, 10) returning id into qid;
  insert into quiz_options (quiz_id, label, emoji, tags, sort) values
    (qid, '거의 매일', '💪', '{fitness}', 0),
    (qid, '주 1~2회', '🙂', '{fitness}', 1),
    (qid, '가끔 생각날 때', '🤔', '{rest}', 2),
    (qid, '숨쉬기 운동', '😅', '{home,rest}', 3);
end $$;
