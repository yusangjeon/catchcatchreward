-- 개발용 시드. 인메모리 시드(lib/quiz/seed.ts)와 동일 내용을 유지한다.

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
  ('quiz_set', '취향 퀴즈 세트 완료', '퀴즈 세트 1개 완료 시 스탬프 1개', 0, 1, '{}');

-- 퀴즈 세트 8개 + 문항. 선택지 tags 가 취향 태그 → 배지 원천. 이미지는 placeholder(picsum).
do $$
declare
  sid uuid; qid uuid;
  img text := 'https://picsum.photos/seed/';
begin
  -- s01
  insert into quiz_sets (title, image_url, reward_points, capacity, base_participants, today_only, sort)
    values ('알쏭달쏭 경제용어 탐험, 함께 도전해봐요!', img||'safe/600/600', 590, 5000, 1201, true, 1) returning id into sid;
  insert into quizzes (set_id, question, kind, sort) values (sid, '월급이 들어오면 가장 먼저 하는 일은?', 4, 1) returning id into qid;
  insert into quiz_options (quiz_id, label, tags, sort) values (qid,'저축·투자','{value,saving}',0),(qid,'맛집 가기','{dining_out}',1),(qid,'쇼핑','{shopping}',2),(qid,'일단 둠','{rest}',3);
  insert into quizzes (set_id, question, kind, sort) values (sid, '''복리''하면 떠오르는 건?', 4, 2) returning id into qid;
  insert into quiz_options (quiz_id, label, tags, sort) values (qid,'눈덩이','{saving}',0),(qid,'이자','{saving}',1),(qid,'모르겠어요','{rest}',2),(qid,'투자','{value}',3);
  insert into quizzes (set_id, question, kind, sort) values (sid, '갑자기 생긴 5만원, 어디에?', 2, 3) returning id into qid;
  insert into quiz_options (quiz_id, label, tags, sort) values (qid,'맛집 탐방','{dining_out,outdoor}',0),(qid,'저축·투자','{value,saving}',1);

  -- s02
  insert into quiz_sets (title, image_url, reward_points, capacity, base_participants, today_only, sort)
    values ('당신의 소파 취향을 알려주세요 🛋️', img||'sofa/600/600', 30, 10000, 8888, false, 2) returning id into sid;
  insert into quizzes (set_id, question, kind, sort) values (sid, '주말 오후 2시, 나는 어디에?', 4, 1) returning id into qid;
  insert into quiz_options (quiz_id, label, tags, sort) values (qid,'동네 카페','{cafe,outdoor}',0),(qid,'소파 위','{home,rest}',1),(qid,'헬스장','{fitness,outdoor}',2),(qid,'쇼핑몰','{shopping,outdoor}',3);
  insert into quizzes (set_id, question, kind, sort) values (sid, '소파에서 주로 하는 건?', 2, 2) returning id into qid;
  insert into quiz_options (quiz_id, label, tags, sort) values (qid,'넷플릭스','{late_night,home}',0),(qid,'낮잠','{home,rest}',1);

  -- s03
  insert into quiz_sets (title, image_url, reward_points, capacity, base_participants, today_only, sort)
    values ('드라마 "형제들의 식탁" 어디까지 봤나요?', img||'drama/600/600', 55, 3000, 1201, false, 3) returning id into sid;
  insert into quizzes (set_id, question, kind, sort) values (sid, '밤 11시, 지금 뭐 해?', 4, 1) returning id into qid;
  insert into quiz_options (quiz_id, label, tags, sort) values (qid,'야식 주문 중','{late_night,delivery}',0),(qid,'드라마 정주행','{late_night,home}',1),(qid,'이미 잠듦','{early_bird,rest}',2),(qid,'운동 또는 산책','{late_night,fitness}',3);
  insert into quizzes (set_id, question, kind, sort) values (sid, '드라마는 어떻게 봐?', 2, 2) returning id into qid;
  insert into quiz_options (quiz_id, label, tags, sort) values (qid,'본방 사수','{home}',0),(qid,'몰아보기','{late_night,home}',1);

  -- s04 (이미지형 선택지)
  insert into quiz_sets (title, image_url, reward_points, capacity, base_participants, today_only, sort)
    values ('짜장면이 더 좋나요? 짬뽕이 더 좋나요?', img||'noodle/600/600', 100, 5000, 3205, false, 4) returning id into sid;
  insert into quizzes (set_id, question, kind, sort) values (sid, E'짜장면이 더 좋나요?\n짬뽕이 더 좋나요?', 2, 1) returning id into qid;
  insert into quiz_options (quiz_id, label, image_url, tags, sort) values (qid,'짜장면',img||'jajang/400/400','{mild}',0),(qid,'짬뽕',img||'jjamppong/400/400','{spicy}',1);
  insert into quizzes (set_id, question, kind, sort) values (sid, '치킨 시킬 때 나의 선택은?', 2, 2) returning id into qid;
  insert into quiz_options (quiz_id, label, image_url, tags, sort) values (qid,'매운 양념',img||'chicken1/400/400','{spicy,delivery}',0),(qid,'후라이드',img||'chicken2/400/400','{mild,delivery}',1);
  insert into quizzes (set_id, question, kind, sort) values (sid, '떡볶이 맵기, 나는?', 4, 3) returning id into qid;
  insert into quiz_options (quiz_id, label, tags, sort) values (qid,'순한맛','{mild}',0),(qid,'보통','{mild}',1),(qid,'매운맛','{spicy}',2),(qid,'극한맵기 도전','{spicy,challenge}',3);

  -- s05
  insert into quiz_sets (title, image_url, reward_points, capacity, base_participants, today_only, sort)
    values ('어떤 스마트 워치를 사용하고 계시나요?', img||'watch/600/600', 240, 1000, 3205, false, 5) returning id into sid;
  insert into quizzes (set_id, question, kind, sort) values (sid, '어떤 스마트 워치를 사용하고 계시나요?', 2, 1) returning id into qid;
  insert into quiz_options (quiz_id, label, tags, sort) values (qid,'애플 워치','{apple,tech}',0),(qid,'갤럭시 워치','{samsung,tech}',1);
  insert into quizzes (set_id, question, kind, sort) values (sid, '운동, 얼마나 해?', 4, 2) returning id into qid;
  insert into quiz_options (quiz_id, label, tags, sort) values (qid,'거의 매일','{fitness}',0),(qid,'주 1~2회','{fitness}',1),(qid,'가끔 생각날 때','{rest}',2),(qid,'숨쉬기 운동','{home,rest}',3);

  -- s06
  insert into quiz_sets (title, image_url, reward_points, capacity, base_participants, today_only, sort)
    values ('식재료 구입 시 어떤 앱을 사용하세요?', img||'veggie/600/600', 500, 993, 1201, false, 6) returning id into sid;
  insert into quizzes (set_id, question, kind, sort) values (sid, '같은 물건, 어디서 살래?', 2, 1) returning id into qid;
  insert into quiz_options (quiz_id, label, tags, sort) values (qid,'최저가 검색해서 온라인','{value,online_shopping}',0),(qid,'바로 집 앞 편의점','{convenience}',1);
  insert into quizzes (set_id, question, kind, sort) values (sid, '식재료는 주로 어디서?', 4, 2) returning id into qid;
  insert into quiz_options (quiz_id, label, tags, sort) values (qid,'새벽배송 앱','{online_shopping,convenience}',0),(qid,'대형마트','{value}',1),(qid,'동네 마트','{convenience}',2),(qid,'시장','{value}',3);

  -- s07
  insert into quiz_sets (title, image_url, reward_points, capacity, base_participants, today_only, sort)
    values ('어떤 장르의 게임을 좋아하시나요?', img||'gamer/600/600', 450, 5000, 3205, false, 7) returning id into sid;
  insert into quizzes (set_id, question, kind, sort) values (sid, '어떤 장르의 게임을 좋아하시나요?', 4, 1) returning id into qid;
  insert into quiz_options (quiz_id, label, tags, sort) values (qid,'RPG','{game,home}',0),(qid,'FPS','{game,challenge}',1),(qid,'퍼즐','{game,rest}',2),(qid,'안 해요','{rest}',3);
  insert into quizzes (set_id, question, kind, sort) values (sid, '게임은 언제?', 2, 2) returning id into qid;
  insert into quiz_options (quiz_id, label, tags, sort) values (qid,'밤에 몰아서','{late_night,home}',0),(qid,'출퇴근길 짬짬이','{convenience}',1);

  -- s08
  insert into quiz_sets (title, image_url, reward_points, capacity, base_participants, today_only, sort)
    values ('어떤 음악 스트리밍앱을 사용하세요?', img||'music/600/600', 240, 1000, 3205, false, 8) returning id into sid;
  insert into quizzes (set_id, question, kind, sort) values (sid, '어떤 음악 스트리밍앱을 사용하세요?', 4, 1) returning id into qid;
  insert into quiz_options (quiz_id, label, tags, sort) values (qid,'멜론','{music}',0),(qid,'유튜브 뮤직','{music,value}',1),(qid,'스포티파이','{music}',2),(qid,'애플 뮤직','{music,apple}',3);
  insert into quizzes (set_id, question, kind, sort) values (sid, '디저트 하나만 고른다면?', 2, 2) returning id into qid;
  insert into quiz_options (quiz_id, label, image_url, tags, sort) values (qid,'달달한 케이크',img||'cake/400/400','{cafe,sweet}',0),(qid,'아메리카노로 충분',img||'coffee/400/400','{cafe,coffee}',1);
end $$;
