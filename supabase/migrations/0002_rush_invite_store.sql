-- 2026-10-27 10차: 주간 러쉬 · 친구초대 · 매장 미션 · 타깃 퀴즈
-- (마이비 bpointrush/stamp · user/me.invitationCode · user-segment 구조를 우리 모델로 옮김)

alter table profiles add column if not exists invite_code text;
alter table profiles add column if not exists referred_by uuid references profiles(id);
update profiles set invite_code = upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)) where invite_code is null;
alter table profiles alter column invite_code set not null;
create unique index if not exists profiles_invite_code_idx on profiles(invite_code);

alter table quiz_sets add column if not exists target_badges text[] not null default '{}';

-- 원장 reason 확장 (enum). 같은 트랜잭션 안에서는 새 값을 바로 쓸 수 없으니 이 파일은 단독 적용
alter type ledger_reason add value if not exists 'rush';
alter type ledger_reason add value if not exists 'store_mission';

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
  code          text not null,                  -- 인증코드(서버 전용)
  capacity      integer not null default 0,     -- 0 = 무제한
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
  week_key    date not null,            -- 주 시작(일요일) KST
  mission_key text not null,            -- 미션 키 또는 stamp7 / stamp8
  points      integer not null default 0,
  claimed_at  timestamptz not null default now(),
  unique (user_id, week_key, mission_key)
);

insert into store_missions (id, store_name, kind, title, description, reward_points, code, capacity, sort) values
  ('sm-01', '엠플리파이 카페 성수점', 'visit',  '매장 방문하고 인증코드 입력', '카운터의 ''캐치캐치'' 안내문에 적힌 4자리 코드를 입력하면 완료', 300, '1234', 100, 1),
  ('sm-02', '엠플리파이 카페 성수점', 'save',   '네이버 플레이스 저장하기', '플레이스 ''저장'' 후 직원에게 보여주면 코드를 알려드려요', 200, '5678', 0, 2),
  ('sm-03', '온앤온 헤어 강남점',     'review', '방문 리뷰 남기기', '영수증 리뷰 작성 후 받은 코드를 입력하세요', 500, '2468', 30, 3)
on conflict (id) do nothing;
