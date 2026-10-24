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

```
app/
  page.tsx              홈: 포인트·스탬프 요약, 오늘의 퀴즈 CTA, 배지
  quiz/page.tsx         취향 퀴즈 플로우
  missions/page.tsx     미션 목록(퀴즈 세트 외 준비 중)
  my/page.tsx           지갑·배지
  api/quiz/today        GET  오늘 진행도·다음 퀴즈·지갑·배지
  api/quiz/answer       POST 응답 → 포인트 원장 + 태그 누적 + 배지 판정 + 스탬프
components/Shell.tsx    모바일 셸(최대 480px, 하단 4탭)
components/QuizFlow.tsx 질문 → 결과(분포·배지·스탬프) → 다음
lib/quiz/service.ts     비즈니스 규칙(일 5문제, 문제당 10P, 5개 완료 = 스탬프 1)
lib/db/                 Repo 인터페이스 + memory / supabase 구현
supabase/migrations/    DB 스키마 (포인트 원장, 배지, 스탬프, 룰렛, 교환)
```

## 규칙 요약 (1차)

| 항목 | 값 | 위치 |
|---|---|---|
| 일일 퀴즈 한도 | 5 (`QUIZ_DAILY_LIMIT`) | `lib/quiz/service.ts` |
| 문항당 포인트 | 10P | `lib/quiz/service.ts` |
| 스탬프 | 일일 5문제 완료 시 1개 | `lib/quiz/service.ts` |
| 배지 | 태그 3회 누적 (매운맛·카페·야행성·집·알뜰·운동) | `supabase/seed.sql`, `lib/quiz/seed.ts` |
| 날짜 기준 | KST | `lib/time.ts` |
| 유저 식별 | 쿠키 `ccr_uid` (익명) | `lib/user.ts` |
