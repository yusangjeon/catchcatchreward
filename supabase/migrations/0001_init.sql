-- 캐치캐치리워드 초기 스키마 (MVP 1차)
-- 원칙
--  * 포인트는 point_ledger에 적립/차감 이벤트로만 쌓고, 잔액은 집계(view)로 본다.
--  * 룰렛 확률·보상 계산은 서버(service role)에서만 수행한다. 클라이언트는 결과만 받는다.
--  * 퀴즈 응답 → 태그 점수(user_tag_scores) → 배지(user_badges). 배지 = 유저 세그먼트 원천.
--  * 모든 테이블 RLS on. anon/authenticated 정책은 2차에서 추가. 1차는 서버 전용 접근.

create extension if not exists "pgcrypto";

-- ───────────────────────────── 유저 ─────────────────────────────
create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  anon_key    text unique not null,           -- 쿠키 기반 익명 식별자. 로그인 도입 시 auth.users.id 로 매핑
  nickname    text,
  created_at  timestamptz not null default now()
);

-- ───────────────────────────── 퀴즈 ─────────────────────────────
create table if not exists quizzes (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  kind        smallint not null check (kind in (2, 4)),   -- 2지선다 / 4지선다
  active      boolean not null default true,
  sort        integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists quiz_options (
  id          uuid primary key default gen_random_uuid(),
  quiz_id     uuid not null references quizzes(id) on delete cascade,
  label       text not null,
  emoji       text,
  tags        text[] not null default '{}',   -- 선택 시 누적되는 취향 태그 (예: {spicy, late_night})
  sort        integer not null default 0
);
create index if not exists quiz_options_quiz_idx on quiz_options(quiz_id);

create table if not exists quiz_responses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  quiz_id     uuid not null references quizzes(id) on delete cascade,
  option_id   uuid not null references quiz_options(id) on delete cascade,
  day_key     date not null,                  -- KST 기준 응답일 (일일 한도 집계 키)
  answered_at timestamptz not null default now(),
  unique (user_id, quiz_id)                   -- 같은 퀴즈는 1회만
);
create index if not exists quiz_responses_user_day_idx on quiz_responses(user_id, day_key);
create index if not exists quiz_responses_option_idx on quiz_responses(option_id);

-- ───────────────────────────── 취향 태그 · 배지 ─────────────────────────────
create table if not exists user_tag_scores (
  user_id     uuid not null references profiles(id) on delete cascade,
  tag         text not null,
  score       integer not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (user_id, tag)
);

create table if not exists badges (
  code        text primary key,               -- 예: spicy_lover
  name        text not null,                  -- 예: 매운맛러버
  description text,
  emoji       text,
  rule        jsonb not null                  -- {"tag":"spicy","min":3}
);

create table if not exists user_badges (
  user_id     uuid not null references profiles(id) on delete cascade,
  badge_code  text not null references badges(code) on delete cascade,
  earned_at   timestamptz not null default now(),
  primary key (user_id, badge_code)
);
create index if not exists user_badges_badge_idx on user_badges(badge_code); -- 관리자: 배지별 유저 수

-- ───────────────────────────── 미션 · 스탬프 ─────────────────────────────
do $$ begin
  create type mission_type as enum ('quiz_set', 'shopping', 'store_visit', 'store_save', 'store_review');
exception when duplicate_object then null; end $$;

create table if not exists missions (
  id             uuid primary key default gen_random_uuid(),
  type           mission_type not null,
  title          text not null,
  description    text,
  reward_points  integer not null default 0,
  reward_stamps  integer not null default 1,
  config         jsonb not null default '{}', -- quiz_set: {"count":5} / store_*: {"place_id":"..."} / shopping: {"partner":"...","min_amount":30000}
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

create table if not exists mission_completions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  mission_id   uuid not null references missions(id) on delete cascade,
  day_key      date not null,
  completed_at timestamptz not null default now(),
  meta         jsonb not null default '{}',
  unique (user_id, mission_id, day_key)       -- 일 1회 미션 기본. 1회성 미션은 앱에서 추가 체크
);

create table if not exists stamps (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  source_type  text not null,                 -- mission | admin | event
  source_id    uuid,
  created_at   timestamptz not null default now(),
  consumed_by  uuid                           -- roulette_spins.id (소비되면 세팅). null = 미사용
);
create index if not exists stamps_user_unconsumed_idx on stamps(user_id) where consumed_by is null;

-- ───────────────────────────── 룰렛 ─────────────────────────────
do $$ begin
  create type prize_kind as enum ('points', 'gifticon', 'none');
exception when duplicate_object then null; end $$;

create table if not exists roulette_prizes (
  id      uuid primary key default gen_random_uuid(),
  name    text not null,
  kind    prize_kind not null,
  value   integer not null default 0,         -- points: 포인트 수 / gifticon: 액면가(원) / none: 0
  weight  integer not null check (weight >= 0), -- 확률 가중치. 합으로 나눠 확률 계산 (서버)
  active  boolean not null default true,
  sort    integer not null default 0
);

create table if not exists roulette_spins (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references profiles(id) on delete cascade,
  prize_id  uuid not null references roulette_prizes(id),
  roll      double precision not null,        -- 서버 난수 (감사용)
  spun_at   timestamptz not null default now()
);

-- ───────────────────────────── 포인트 원장 · 교환 ─────────────────────────────
do $$ begin
  create type ledger_reason as enum ('quiz_answer', 'mission', 'roulette', 'redeem', 'admin_adjust', 'referral');
exception when duplicate_object then null; end $$;

create table if not exists point_ledger (
  id          bigserial primary key,
  user_id     uuid not null references profiles(id) on delete cascade,
  delta       integer not null,               -- 적립 +, 차감 -
  reason      ledger_reason not null,
  ref_type    text,                            -- quiz_response | mission_completion | roulette_spin | redemption
  ref_id      uuid,
  memo        text,
  created_at  timestamptz not null default now()
);
create index if not exists point_ledger_user_idx on point_ledger(user_id, created_at desc);

create or replace view point_balances as
  select user_id, coalesce(sum(delta), 0)::integer as balance
  from point_ledger
  group by user_id;

do $$ begin
  create type redemption_status as enum ('requested', 'processing', 'done', 'rejected');
exception when duplicate_object then null; end $$;

create table if not exists redemptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  kind          text not null,                -- gifticon_cu5000 등 상품 코드
  amount_points integer not null check (amount_points > 0),
  status        redemption_status not null default 'requested',
  requested_at  timestamptz not null default now(),
  processed_at  timestamptz,
  memo          text                           -- 1차: 운영자 수동 처리 메모
);

-- ───────────────────────────── RPC ─────────────────────────────
-- 태그 점수 원자적 +1. 갱신 후 유저 전체 태그 점수를 반환한다.
create or replace function increment_tag_scores(p_user uuid, p_tags text[])
returns table (tag text, score integer)
language plpgsql security definer as $$
begin
  insert into user_tag_scores (user_id, tag, score, updated_at)
  select p_user, t, 1, now() from unnest(p_tags) as t
  on conflict (user_id, tag) do update
    set score = user_tag_scores.score + 1, updated_at = now();
  return query select s.tag, s.score from user_tag_scores s where s.user_id = p_user;
end $$;

-- ───────────────────────────── RLS ─────────────────────────────
alter table profiles            enable row level security;
alter table quizzes             enable row level security;
alter table quiz_options        enable row level security;
alter table quiz_responses      enable row level security;
alter table user_tag_scores     enable row level security;
alter table badges              enable row level security;
alter table user_badges         enable row level security;
alter table missions            enable row level security;
alter table mission_completions enable row level security;
alter table stamps              enable row level security;
alter table roulette_prizes     enable row level security;
alter table roulette_spins      enable row level security;
alter table point_ledger        enable row level security;
alter table redemptions         enable row level security;
-- 1차는 service role(서버)만 접근. anon 정책 없음 = 클라이언트 직접 접근 차단.
