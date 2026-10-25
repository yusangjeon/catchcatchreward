# 캐치캐치리워드 (catchcatchreward)

엠플리파이의 **타겟이 확실한 리워드 웹앱**. 모바일 웹(PWA) 우선.

- 리워드 구조: **취향 퀴즈(마이비형) + 행동 스탬프 → 룰렛(스탬플리형)**
- 데이터 자산: 퀴즈로 쌓이는 **취향 배지(유저 세그먼트)** → 광고주/오퍼월 타깃 보상 판매
- 연결 축: 캐치랭크 광고주(네이버 플레이스 매장)의 방문·저장·리뷰 미션을 스탬프로 치환

작업 지침과 인수인계 내용은 [`CLAUDE.md`](./CLAUDE.md) 참고.

## 스택

Next.js 15.5 · React 19 · Tailwind 4 · TypeScript · pnpm · Supabase(Postgres) · Vercel

## 실행

```powershell
pnpm install
pnpm dev        # http://localhost:3000
```

환경변수 없이 실행하면 **인메모리 저장소**로 동작한다(서버 재시작 시 초기화). Supabase를 붙이려면:

1. Supabase 프로젝트 생성 → SQL Editor에서 `supabase/migrations/0001_init.sql` 실행 → `supabase/seed.sql` 실행
2. `.env.example`을 `.env.local`로 복사하고 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 입력

```powershell
pnpm typecheck  # tsc
pnpm lint       # eslint
pnpm build      # 프로덕션 빌드
```

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
