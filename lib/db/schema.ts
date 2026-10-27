/**
 * Postgres 스키마(단일 출처). `pnpm db:sql` 로 supabase/migrations/0001_init.sql 을 생성하고,
 * 관리자 "DB" 화면의 초기화 버튼 또는 `lib/db/migrate.ts` 가 이 SQL 을 그대로 실행한다. 모두 idempotent.
 *
 * 원칙
 *  - 앱이 id 를 만드는 테이블(quiz_sets·quizzes·quiz_options·roulette_prizes·store_missions)은 text id.
 *  - 포인트는 point_ledger 에 이벤트로만 쌓고 잔액은 집계. 룰렛·보상 계산은 서버에서만.
 *  - 모든 테이블 RLS on + 정책 없음 = Supabase PostgREST(anon key) 경로 차단. 서버는 직접 Postgres 연결(소유자)로 접근.
 */
export const SCHEMA_SQL = `
create extension if not exists "pgcrypto";

create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  anon_key    text unique not null,
  nickname    text,
  invite_code text unique not null,
  referred_by uuid references profiles(id),
  created_at  timestamptz not null default now()
);

create table if not exists quiz_sets (
  id                text primary key,
  title             text not null,
  image_url         text not null default '',
  reward_points     integer not null default 100,
  capacity          integer not null default 1000,
  base_participants integer not null default 0,
  today_only        boolean not null default false,
  active            boolean not null default true,
  sort              integer not null default 0,
  target_badges     text[] not null default '{}',
  created_at        timestamptz not null default now()
);

create table if not exists quizzes (
  id          text primary key,
  set_id      text not null references quiz_sets(id) on delete cascade,
  question    text not null,
  kind        smallint not null check (kind in (2, 4)),
  active      boolean not null default true,
  sort        integer not null default 0
);
create index if not exists quizzes_set_idx on quizzes(set_id);

create table if not exists quiz_options (
  id          text primary key,
  quiz_id     text not null references quizzes(id) on delete cascade,
  label       text not null,
  image_url   text,
  tags        text[] not null default '{}',
  sort        integer not null default 0
);
create index if not exists quiz_options_quiz_idx on quiz_options(quiz_id);

create table if not exists quiz_responses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  quiz_id     text not null references quizzes(id) on delete cascade,
  option_id   text not null references quiz_options(id) on delete cascade,
  day_key     text not null,
  answered_at timestamptz not null default now(),
  unique (user_id, quiz_id)
);
create index if not exists quiz_responses_quiz_idx on quiz_responses(quiz_id);

create table if not exists set_completions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  set_id       text not null references quiz_sets(id) on delete cascade,
  day_key      text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, set_id)
);

create table if not exists user_tag_scores (
  user_id     uuid not null references profiles(id) on delete cascade,
  tag         text not null,
  score       integer not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (user_id, tag)
);

create table if not exists badges (
  code        text primary key,
  name        text not null,
  description text,
  emoji       text,
  rule        jsonb not null
);

create table if not exists user_badges (
  user_id     uuid not null references profiles(id) on delete cascade,
  badge_code  text not null references badges(code) on delete cascade,
  earned_at   timestamptz not null default now(),
  primary key (user_id, badge_code)
);

create table if not exists stamps (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  source_type  text not null,
  source_id    text,
  created_at   timestamptz not null default now(),
  consumed_by  text
);
create index if not exists stamps_user_idx on stamps(user_id);

create table if not exists roulette_prizes (
  id      text primary key,
  name    text not null,
  kind    text not null check (kind in ('points', 'gifticon', 'none')),
  value   integer not null default 0,
  weight  integer not null check (weight >= 0),
  active  boolean not null default true,
  sort    integer not null default 0
);

create table if not exists roulette_spins (
  id        uuid primary key,
  user_id   uuid not null references profiles(id) on delete cascade,
  prize_id  text not null references roulette_prizes(id),
  roll      double precision not null,
  spun_at   timestamptz not null default now()
);

create table if not exists point_ledger (
  id          bigserial primary key,
  user_id     uuid not null references profiles(id) on delete cascade,
  delta       integer not null,
  reason      text not null,
  ref_type    text,
  ref_id      text,
  memo        text,
  created_at  timestamptz not null default now()
);
create index if not exists point_ledger_user_idx on point_ledger(user_id, created_at desc);

create table if not exists redemptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  kind          text not null,
  amount_points integer not null check (amount_points > 0),
  status        text not null default 'requested' check (status in ('requested', 'processing', 'done', 'rejected')),
  requested_at  timestamptz not null default now(),
  processed_at  timestamptz,
  memo          text
);

create table if not exists referrals (
  id          uuid primary key default gen_random_uuid(),
  inviter_id  uuid not null references profiles(id) on delete cascade,
  invitee_id  uuid not null unique references profiles(id) on delete cascade,
  code        text not null,
  status      text not null default 'pending' check (status in ('pending', 'rewarded')),
  created_at  timestamptz not null default now(),
  rewarded_at timestamptz
);
create index if not exists referrals_inviter_idx on referrals(inviter_id);

create table if not exists store_missions (
  id            text primary key,
  store_name    text not null,
  kind          text not null check (kind in ('visit', 'save', 'review')),
  title         text not null,
  description   text,
  reward_points integer not null default 0,
  code          text not null,
  capacity      integer not null default 0,
  active        boolean not null default true,
  sort          integer not null default 99,
  created_at    timestamptz not null default now()
);

create table if not exists store_mission_completions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  mission_id   text not null references store_missions(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, mission_id)
);

create table if not exists rush_claims (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  week_key    text not null,
  mission_key text not null,
  points      integer not null default 0,
  claimed_at  timestamptz not null default now(),
  unique (user_id, week_key, mission_key)
);

alter table profiles                 enable row level security;
alter table quiz_sets                enable row level security;
alter table quizzes                  enable row level security;
alter table quiz_options             enable row level security;
alter table quiz_responses           enable row level security;
alter table set_completions          enable row level security;
alter table user_tag_scores          enable row level security;
alter table badges                   enable row level security;
alter table user_badges              enable row level security;
alter table stamps                   enable row level security;
alter table roulette_prizes          enable row level security;
alter table roulette_spins           enable row level security;
alter table point_ledger             enable row level security;
alter table redemptions              enable row level security;
alter table referrals                enable row level security;
alter table store_missions           enable row level security;
alter table store_mission_completions enable row level security;
alter table rush_claims              enable row level security;
`;

export const SCHEMA_TABLES = [
  "profiles", "quiz_sets", "quizzes", "quiz_options", "quiz_responses", "set_completions", "user_tag_scores", "badges", "user_badges",
  "stamps", "roulette_prizes", "roulette_spins", "point_ledger", "redemptions", "referrals", "store_missions", "store_mission_completions", "rush_claims",
] as const;
