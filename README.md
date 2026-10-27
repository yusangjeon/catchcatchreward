# 캐치캐치리워드 (catchcatchreward)

엠플리파이의 **타겟이 확실한 리워드 웹앱**. 모바일 웹(PWA) 우선.

- 리워드 구조: **취향 퀴즈(마이비형) + 행동 스탬프 → 룰렛(스탬플리형)**
- 데이터 자산: 퀴즈로 쌓이는 **취향 배지(유저 세그먼트)** → 광고주/오퍼월 타깃 보상 판매
- 연결 축: 캐치랭크 광고주(네이버 플레이스 매장)의 방문·저장·리뷰 미션을 스탬프로 치환

작업 지침과 인수인계 내용은 [`CLAUDE.md`](./CLAUDE.md) 참고.

## 스택

Next.js 15.5 · React 19 · Tailwind 4 · TypeScript · pnpm · Supabase(Postgres) · Vercel

## 라이브

- https://catchcatchreward-git-main-yusang.vercel.app (Vercel, `main` 자동 배포). 폰 브라우저에서 **홈 화면에 추가**하면 PWA 로 전체화면 실행.
- 데이터는 `DATABASE_URL` 이 있으면 Postgres(영속), 없으면 인메모리.

## 실행

```powershell
pnpm install
pnpm dev        # http://localhost:3000
```

환경변수 없이 실행하면 **인메모리 저장소**로 동작한다(서버 인스턴스 교체 시 초기화). 영속 저장(Supabase 등 Postgres)을 붙이려면:

1. Supabase 프로젝트 생성 → Project Settings → Database → Connection string **URI**(Transaction pooler, 6543) 복사
2. 그 값을 `DATABASE_URL` 로 설정(Vercel 환경변수 또는 `.env.local`) → 관리자 **/admin/db** 에서 "스키마 적용 + 시드" 1회(또는 `pnpm db:migrate`)
3. 관리자(`/admin`)는 `ADMIN_KEY` 설정 시 열림(로컬 QA: `CCR_DEV_TOOLS=1`)

스키마 원본은 `lib/db/schema.ts`(`pnpm db:sql` 로 `supabase/migrations/0001_init.sql` 생성). 저장소 구현은 `lib/db/postgres.ts`(postgres.js, 직접 연결) · `lib/db/memory.ts`.

```powershell
pnpm typecheck  # tsc
pnpm lint       # eslint
pnpm build      # 프로덕션 빌드
```

## 기능 (2026-10-27)

| 영역 | 화면 | 규칙 |
|---|---|---|
| 취향 퀴즈 | `/quiz`, `/quiz/[setId]` | 16세트 41문항. 하루 꿀 8개(세트 8회), 세트 완료 → 포인트 + 랜덤 보너스 + 태그→배지(14종) + 스탬프 1. 가입 보너스 300P, 가입 3일 스타터팩 2배. 보상 화면에 선택 분포 |
| 세그먼트 타깃 | 관리자 세트 등록 | `target_badges` 보유 유저에게만 노출("내 취향 맞춤") |
| 비포인트 러쉬 | `/rush` | 주간(일~토 KST) 스탬프 미션 8개, 보상받기 → 포인트 + 룰렛 스탬프, 7개 300P · 8개 500P |
| 출석체크 | 홈 퀵메뉴 | 1일 1회 10P + 스탬프, 연속 7일마다 +50P |
| 룰렛 | `/roulette` | 스탬프 10개 = 1회, 서버 가중치 추첨, 경품 확률 관리자 설정 |
| 매장 미션 | `/missions` | 캐치랭크 제휴 매장 방문·저장·리뷰 — 인증코드 입력 → 포인트 + 스탬프 |
| 친구초대 | `/invite` | 코드 입력 300P, 초대한 쪽은 친구 첫 퀴즈 완료 시 500P(일 5명) |
| 지갑·교환 | `/wallet`, `/exchange`, `/history` | 최소 1,000P, 신청 즉시 차감, 관리자 처리(반려 시 자동 환불) |
| 미니게임 | `/games` | 카드 뒤집기(일 1회, 시도 수 보상) · 틀린그림 찾기(일 1회, 날짜 시드 공통 퍼즐, 칸당 5P+완주 10P) · 가위바위보(일 3판, 승 10P) · 복권 긁기(일 1장, 최대 500P). 결과는 서버 난수, 러쉬 "미니게임 3회" 미션 집계 |
| 제휴 쇼핑 | `/shop/[id]` CTA | `/api/shop/out?merchant=` → 하루 1회 방문 적립 5P 후 제휴 링크(쿠팡 파트너스 `COUPANG_PARTNERS_URL`, 쇼핑몰별 `AFFILIATE_URL_*`)로 이동 |
| 알림 | `/notifications` | 받을 보상·출석·룰렛·꿀·교환 진행·초대 보상 |
| 웹뷰 복제 | `/benefits`, `/shop`, `/game`, `/cpq`, `/survey` | 마이비 캡처 기반 1:1 복제(정적 데이터) |
| 관리자 | `/admin` | 대시보드(14일 추이) · 세그먼트 인사이트 · 유저 360 · 퀴즈(타깃 배지) · 룰렛 확률 · 배지 · 교환 · 수동 지급 · 매장 미션 · DB |

## 구조

마이비(MyB) 앱 UI를 레퍼런스로 복제. 5탭(홈·퀴즈·혜택·지갑·만보기), 퀴즈 세트 → 보상 화면.

```
app/
  page.tsx              홈: 상단 P잔액, 비포인트 러쉬 배너, 오늘의 루틴, 내게 딱 맞는 퀴즈(가로 카드)
  quiz/page.tsx         퀴즈 탭: "{페르소나}님을 위한" 2열 그리드
  quiz/[setId]/page.tsx 퀴즈 풀기(01/03, 객관식, 이미지/리스트 선택지) → 보상 화면(축하해요!)
  benefits/page.tsx     혜택 탭(오퍼월 자리, 준비 중)
  wallet/page.tsx       지갑: 자산 / 상품 구매 / 뱃지
  walk/page.tsx         만보기(정적, 앱 출시 대비 레이아웃)
  api/home              GET  지갑·꿀·페르소나·배지·세트 카드
  api/quiz/[setId]      GET  세트 문항
  api/quiz/[setId]/submit POST 세트 제출 → 원장 적립 + 랜덤 보너스 + 태그·배지 + 스탬프
components/Shell.tsx    모바일 셸(최대 430px, 하단 5탭, 퀴즈 풀기 화면은 탭 숨김)
components/QuizPlay.tsx 퀴즈 풀기 + 보상 화면
components/SetCard.tsx  세트 카드(가로/그리드)
components/icons.tsx    SVG 아이콘·P/CX 코인
lib/quiz/service.ts     비즈니스 규칙(세트 보상, 랜덤 보너스, 페르소나, 배지)
lib/db/                 Repo 인터페이스 + memory / supabase 구현
supabase/migrations/    DB 스키마 (퀴즈 세트, 포인트 원장, 배지, 스탬프, 룰렛, 교환)
```

## 규칙 요약 (1차)

| 항목 | 값 | 위치 |
|---|---|---|
| 세트 보상 | 세트별 `reward_points` (시드 30~590P) | `supabase/seed.sql`, `lib/quiz/seed.ts` |
| 랜덤 보너스 | 0/10/20/30P 가중 추첨 | `lib/quiz/service.ts` |
| 스탬프 | 세트 1개 완료 시 1개 (룰렛 재료) | `lib/quiz/service.ts` |
| 배지 | 태그 3회 누적 (매운맛·카페·야행성·집·알뜰·운동) | `supabase/seed.sql`, `lib/quiz/seed.ts` |
| 페르소나 | 최다 태그 → 라벨 + 의사 MBTI | `lib/quiz/service.ts` |
| 보유 꿀 | 오늘 남은 세트 수 | `lib/quiz/service.ts` |
| 날짜 기준 | KST | `lib/time.ts` |
| 유저 식별 | 쿠키 `ccr_uid` (익명) | `lib/user.ts` |

## 레퍼런스 대비 미구현(실데이터 없음)
- 세트/선택지 이미지는 placeholder(picsum). 실제 이미지로 교체 필요.
- 비포인트 러쉬·프리패스·꿀 충전·룰렛·상품 구매·금 투자·CONX 환율은 표시만(정적).
- 만보기는 웹에서 걸음 수 연동 불가 → 정적 화면.
