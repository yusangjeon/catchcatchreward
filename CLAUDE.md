# CLAUDE.md — 캐치캐치리워드

이 리포는 엠플리파이의 신규 **타겟형 리워드 웹앱** "캐치캐치리워드"다. 2026-10-25 claude.ai 세션에서 기획을 넘겨받아 여기서 코드 작업을 이어간다.

## 작업 원칙
- 대화·커밋 메시지·문서는 한국어. 사용자는 **대표님**으로 부른다.
- 대표님은 **Windows PC**에서 Claude Code를 쓴다. 터미널 안내는 Windows(PowerShell) 기준.
- 대표님 스타일: 논리·구조·확률 기반, 빠른 실험·검증. 긴 설명보다 결론 먼저.
- 전략 판단은 엠플리파이 로드맵 "두 축, 하나의 플라이휠" 안에서 한다.
  - Axis A = 캐치랭크(네이버 플레이스 B2B SaaS) · Axis B = 오퍼월/리워드 트래픽
  - 이 앱은 **Axis B의 트래픽·유저 데이터 공급원**이자, Axis A 광고주(매장) 미션의 소비 지면이다.

## 왜 이 구조인가 (레퍼런스 조사 요약, 2026-10)
범용 "광고 보고 돈 받기" 앱은 급락 중(캐시슬라이드 MAU 85만→32만). 성장하는 건 **타겟이 명확한 행동형 리워드**다.

| 레퍼런스 | 타겟 | 카피할 구조 | 성과 |
|---|---|---|---|
| 마이비 | 광고주가 원하는 잠재고객 | 취향 퀴즈 → 포인트 + **취향배지** → 배지로 타깃 광고 → 광고단가↑ → 보상↑ | 일 기대보상 250원(만보기 2.5배), MAU 13위 |
| 스탬플리 | 온라인 쇼핑족 | 제휴 쇼핑 3만원↑ 구매 시 스탬프 → 스탬프 모아 **룰렛 경품** | MAU 5위 |
| 메모리워드 | 영어 학습자 | 단어 퀴즈 정답 시 캐시 | 월 10만, MAU 18위 |
| 참새마트 | 저가 쇼핑층 | 30개 플랫폼 경유 포인트 + 실시간 특가 큐레이션 | 출시 3개월 MAU 17위 |
| 발로소득 | 습관 실천층 | 걸음·양치·물 인증 → 포인트 → 앱 내 커머스 | MAU 7위 |
| Upside(美) | 주유 운전자 | 갤런당 할인 + **추천인 영구 수익(1¢/gal)** | 연 $180 |
| Fetch(美) | 영수증/브랜드 | 아무 영수증 스캔 → 포인트, 브랜드 오퍼 보너스 | 월 $5~15 |

**선택: 마이비(1순위) + 스탬플리 게이미피케이션.**
- 퀴즈·스탬프·룰렛은 웹에서 완전 구현 가능. 만보기·영수증 스캔은 웹앱에서 약하므로 MVP 제외.
- 취향배지 = 유저 세그먼트 DB → 오퍼월·캠페인 광고주에게 타깃 보상을 비싸게 팔 수 있다(플라이휠 연결).
- 캐치랭크 매장 미션(방문·저장·리뷰)을 스탬프로 치환하면 우리 플레이스 데이터와 결합되는 유일한 포지션.

## MVP 범위 (1차)
1. **취향 퀴즈** — 일 N회, 2지선다/4지선다, 정답 없음(취향). 응답 → 포인트 + 배지 태그 누적.
2. **취향 배지** — 태그 집계로 배지 발급(예: 매운맛러버, 카페러버). 유저 세그먼트 테이블의 원천.
3. **미션 → 스탬프** — 미션 완료(퀴즈 세트·제휴 쇼핑·매장 미션) 시 스탬프 1개. 10개 = 룰렛 1회.
4. **룰렛** — 확률 테이블 기반 경품(포인트·기프티콘). 당첨 확률·기대값은 서버에서 관리.
5. **포인트 지갑·교환** — 내역, 최소 교환 금액, 기프티콘 교환(1차는 수동 처리 가능).
6. **관리자(최소)** — 퀴즈 등록, 미션 등록, 룰렛 확률 테이블, 배지별 유저 수 조회.

제외(2차 이후): 만보기, 영수증 OCR, 오퍼월 SDK 실연동(지면만 자리 확보), 추천인 영구 수익(Upside형 — 2차 우선 검토).

## 기술 방향 (2026-10-24 확정)
- Next.js 15.5 + React 19 + Tailwind 4 + TypeScript, pnpm (기존 `yusangjeon/catchreward`와 동일 스택 → UI 자산 재사용 가능)
- **반응형 모바일 웹** (catchreward는 420×912 절대좌표 픽셀복제라 반응형 아님 — 구조만 참고, 좌표 복사 금지)
- DB: Postgres(Supabase 포함, `DATABASE_URL` 직접 연결) — 스키마 원본 `lib/db/schema.ts`(`pnpm db:sql` → `supabase/migrations/0001_init.sql`), 어댑터 `lib/db/postgres.ts`(postgres.js). env 없으면 인메모리 저장소(`lib/db/memory.ts`). 저장소는 `Repo` 인터페이스(`lib/db/repo.ts`) 뒤에 숨기고 비즈니스 규칙은 각 `lib/*/service.ts`에만 둔다. 관리자 `/admin/db` 에서 스키마 적용+시드(idempotent).
- 배포: Vercel
- 포인트는 **원장(ledger) 테이블**로 적립/차감 이벤트를 쌓고 잔액은 집계. 룰렛·보상 확률은 서버에서만 계산.

## 참고 리포
- `yusangjeon/catchreward` — 캐치미션 구조(미션·상점·MY 3탭) + 칩스 디자인 웹앱. 탭 구조·컴포넌트(`Shell`, `MissionList`, `Txt`)·로딩 패턴 참고.
- `yusangjeon/shopping-reward` — 쇼핑 리워드 플랫폼 기획 리포(초기 상태).

## 현재 상태
- 2026-10-25: 레포 생성, 인수인계 문서 작성.
- 2026-10-24(첫 코드 세션): 스택 확정, 스캐폴드, DB 스키마, 취향 퀴즈 MVP(자체 디자인). → 대표님 피드백: "**마이비를 99% 똑같이 카피**"가 원래 지시.
- 2026-10-25(2차): **마이비 UI 복제로 전면 교체.** 앱스토어 스크린샷 7장 + 공식 사이트 이미지 기준.
  - 화면: 홈(P잔액·러쉬 배너·오늘의 루틴·내게 딱 맞는 퀴즈 가로 카드·퀵메뉴), 퀴즈 탭(페르소나 그리드), 퀴즈 풀기(01/03·객관식 칩·파란 하단·이미지/리스트 선택지·다음 질문으로), 보상(축하해요!·B포인트/CONX·랜덤 보상·이런 퀴즈는 어때요?·둘러보기/계속하기), 지갑(자산/상품 구매/뱃지), 만보기(정적), 혜택(구조만). 하단 5탭.
  - 데이터 모델: `quiz_sets`(카드 1장) → `quizzes`(문항) → `quiz_options`. 세트 완료 = `set_completions` + 원장 적립 + 랜덤 보너스 + 태그→배지 + 스탬프 1.
  - 검증: typecheck·lint·build 통과, API 스모크(미완성·잘못된 선택지·중복·404) 통과, Playwright 전 화면 스크린샷 콘솔 에러 0. Supabase 어댑터는 여전히 **미연결**.
  - 레퍼런스 원본: 앱스토어 `apps.apple.com/kr/app/id6476365625`, 공식 `myb.im`. 세션 스크래치에 크롭본 있었음(재수집 가능).
  - 픽셀 캘리브레이션(2026-10-25 3차): 서체 Pretendard Variable(jsDelivr) 로드. 앱스토어 스크린샷의 폰 화면 내부(1242px 원본 기준 x 178~1082, y 900~)를 390px 폭으로 리스케일해 20px 격자 위에서 우리 스크린샷과 요소 좌표를 대조, 헤더 55·배너 44·세그먼트 50·카드 145 등 수치로 맞춤. 도구: Playwright 390×844 dpr1 스크린샷 + PIL 격자/블렌드 비교(세션 스크래치 `grid.py`, `compare.py` — 리포 밖). 퀴즈 화면 좌우 패딩은 30px(다른 화면 20px).
  - 한계: 레퍼런스가 마케팅 프레임 속 축소 목업이라 ±3px 오차. 3D 캐릭터·브랜드 로고·실사진은 저작권 자산이라 이모지/placeholder. 실기기 캡처를 받으면 그 기준으로 재보정.
- 2026-10-25(4차): **마이비 iOS HTTP 캡처 기반 실자산·모션 복제 + QA 3회.**
  - 대표님이 Drive로 넘긴 iOS 프록시 캡처(53.7MB, 리포 밖 스크래치에만 보관·**절대 커밋 금지**: Bearer 토큰·fcmToken·idfa 포함)를 바이너리 프레이밍(len3·kind1·flow4)으로 파싱 → 929 flow, 863 응답, 웹뷰 번들(benefit-hub/shop/adjoe/reward-event/survey)·아이콘 300+·Pretendard ExtraBold/Black·Lottie 2종·API 응답 29종 추출.
  - 추출 자산은 `public/myb/`(bh=benefit-hub, shop, adj=adjoe, res=제휴 로고, up=배너 327×72, sign) 19MB. 게임 아이콘(adjoe CDN)·3D 캐릭터는 저작권/미캡처라 benefit-hub 자체 이미지로 대체.
  - 실제 웹뷰를 Playwright로 **오프라인 렌더**(api-gateway → 캡처 JSON 라우팅, `?u=MOCKTOKEN`, Flutter 브릿지 모킹)해 DOM 좌표·computed style 스냅샷을 얻고, 그 치수로 **혜택 탭(`app/benefits`)을 1:1 복제**(헤더 48, 카운트다운 74, 히어로 그라디언트, 게임 카드 150×220 r16, 설문 카드 r20, 적립 메뉴 아이콘 40). 데이터는 `lib/benefit/seed.ts`(캡처 응답값) → `/api/benefit`.
  - 코인 아이콘(P/CX/핑크P/XPLA)·P+CX 겹침 스택·아바타·러쉬 라벨·스탬프·배너를 원본 이미지로 교체(`components/icons.tsx`).
  - 모션(`components/motion/`): react-toastify bounceInDown/OutUp 토스트(bg #293a60, r100, ic_toast_point), number-flow 카운트업, 러쉬 카운트다운 칩, Lottie(lottie-react v3 `LottieSvg`, confetti_pop), Swiper 자동 배너, 스켈레톤 shimmer, 버튼 press(.15s), 진행바(.8s cubic-bezier(0.22,1,0.36,1)).
  - QA 3회: ① typecheck·lint·build + API 스모크(INCOMPLETE/BAD_OPTION/ALREADY_DONE/404, /api/benefit) ② 원본 렌더 DOM 좌표 대조 — 혜택 탭 주요 요소 0~2px 이내(발견·수정: 스크롤 스냅으로 첫 카드 x=0, 코인 스택 z-order) ③ Playwright 전 화면 e2e — 콘솔 에러 0, 실패 요청 0, Lottie/토스트 렌더 확인. 스크립트: 스크래치 `qa/shots.js`, `smoke2.sh`(리포 밖).
  - 주의: `pkill -f "next start"` 는 자기 셸까지 죽인다(exit 144). 서버 교체는 `pgrep -x next-server` → kill PID.
  - 남은 차이(원본 불가): 하단 탭 아이콘·꿀·퀵메뉴·베이직 뱃지는 Flutter 네이티브라 캡처에 없음(SVG/이모지 근사), 게임 아이콘 대체, 홈/지갑/퀴즈는 앱스토어 스크린샷 기준(웹뷰 아님).
- 2026-10-25(5차): **쇼핑적립(shop.myb.im) 웹뷰 복제.** `/shop`(메인)·`/shop/[merchantId]`(상세), 탭바 숨김(풀스크린 웹뷰).
  - 데이터 `lib/shop/seed.ts`: cps/merchants 20개(원본 로고 `public/myb/res`), 유의사항 17항목 원문, 쿠팡·네이버+스토어 상세 원문(guide/description/deny/buttonList), 나머지는 네이버 템플릿에 적립률 치환. `/api/shop`, `/api/shop/[merchantId]`.
  - 메인: 오늘의 쇼핑 추천 배너 74 · 적립 예정 포인트 카드 137 · 즐겨찾는 쇼핑몰(원형 70, MY 뱃지) · 웰컴 2배 배너 78(2X 그라디언트) · 추천 4카드 167×122(쿠팡 보라 테두리+HOT, NEW shimmer 태그) · 전체 쇼핑몰 그리드 167×126 · 유의사항 #f2f3f5 · 첫 구매 두 배 팝업(img_promotion_banner r26 + 그라디언트 버튼 + 🚨 필, 세션당 1회).
  - 상세: 로고 64 · 제목 24/600 **첫 줄 빈 br 포함(원본 템플릿 quirk, 108px)** · 번호 안내 · 적립 대상/꼭 읽어보세요 카드 · 이 쇼핑몰도 추천해요 160×126 · 하단 고정 CTA 58(쿠팡은 2만원/5만원 2버튼).
  - QA: 원본 DOM 좌표 대조 메인 10요소·상세 7요소 전부 ±2px(수정: 즐겨찾기 행 높이 120 고정, 카드 이름 h17, 제목 빈 줄) / 콘솔 에러 0 / 404 처리.
- 2026-10-25(6차): **게임적립(adjoe)·무한적립(cpq)·설문 보상(survey) 웹뷰 복제.** 모두 풀스크린(탭바 숨김).
  - `/game`(브릿지, 다크 #191f28: 로또 바 40·카운트다운 75·히어로 128·메인 카드 350×160·추천 카드 350×104·게임왕 350×88) + `/game/[id]`(당첨자 전용 상세: 아이콘 90·미션 카드·추가보상 뱃지·프리패스·확인해 주세요·하단 고정 CTA). 데이터 `lib/game`(혜택 탭 GAMES 재사용, 안내문 `notices.json`). 자산 `public/myb/adj`.
  - `/cpq`(무한적립 이벤트: 적립 가능 142·보상받기 카드 70·sticky 필터 65·행 56 gap 30·하단 띠 18·맨 위로 버튼). 데이터 `lib/cpq/seed.ts`(cpq-list 20건 전량). 아이콘 `public/myb/cpq`(reward-event.myb.im 공개 정적 + 광고주 썸네일 사본 — 캡처엔 없어 직접 수집).
  - `/survey`(설문 보상: 상단 110·프리패스 띠 35·한정 보상 Swiper 캐러셀 342×172·기초 설문 166×128·가볍게 127×227·Hot 설문 카드·전체 리스트 카드). 데이터 `lib/survey/seed.ts`(cpx profiling/curation1~3/surveys). 아이콘 `public/myb/survey`(survey.myb.im 공개 정적). **표시 분 = ceil(loi×0.7)** (12→9, 13→10, 10→7; DOM 대조로 역산).
  - 혜택 탭 연결: 히어로/게임 카드 → `/game/[id]`, 더 많은 게임 → `/game`, Hot 설문 → `/survey`, 초간단적립 → `/cpq`, 쇼핑적립 → `/shop`.
  - QA: 원본 DOM 좌표 대조 game 11·detail 6·cpq 8·survey 16 = 41요소 전부 ±2px(수정: 기초 설문 카드 flex-basis, 시간 칩 24/23, 상단 블록 110, cpq 문구 공백(flex 텍스트 노드), 게임왕 화살표 방향, 안내문 break-keep) / 콘솔 에러 0 / 404 처리.
  - 주의: 셸 cwd 가 간헐적으로 이전 호출 디렉터리로 리셋됨 → 파일 쓰기는 **절대 경로** 사용.
- 2026-10-25(7차): **룰렛(MVP ④) + 출석체크 미션.** `/roulette`(풀스크린), `lib/roulette/`.
  - 규칙: 스탬프 10개 = 1회. 서버가 `randomInt` 로 가중치 추첨 → 스탬프 10개 `consumed_by=spinId` 소비 → `roulette_spins` 기록 → 포인트는 원장 `roulette` 적립. 기프티콘은 당첨 기록만(1차 수동 발송). 클라이언트는 결과 인덱스로 휠 정지 연출만(5바퀴+조각 중앙, 4.2s cubic-bezier(0.17,0.67,0.12,1)).
  - 경품 시드 `lib/roulette/seed.ts` = `supabase/seed.sql` (50P 50% · 100P 30% · 300P 12% · 1,000P 5% · 편의점 5천원 2% · 꽝 1%, 기대값 ≈241원). 200회 추첨 분포 51/28/12.5/4/2.5/2 로 가중치 일치 확인.
  - 출석체크(`POST /api/attendance`): KST 1일 1회, 10P + 스탬프 1(`sourceType=attendance, sourceId=날짜`). 홈 퀵메뉴 "출석체크" 클릭으로 실행, `HomePayload.attendedToday` 로 체크 표시. 마이비 러쉬 스탬프 미션 보상(10P)과 동일.
  - Repo 확장: `hasStamp`, `consumeStamps`, `listPrizes`, `saveSpin`, `listSpins` (memory·supabase 둘 다 구현, supabase 는 여전히 미연결 검증).
  - 개발 전용 `POST /api/dev/stamps`(스탬프 n개 지급)는 **`CCR_DEV_TOOLS=1` 일 때만** 열림. 배포 기본값 닫힘. 관리자 화면 생기면 대체.
  - 진입: 홈 러쉬 배너 "무료 룰렛 돌리기"(스탬프 10 이상이면 빨간 점), 지갑 "B포인트 적금" 카드.
  - QA: API 스모크(출석 1회/중복, 부족 409, 스핀→잔액 반영, 재스핀 409) + Playwright(출석 토스트 2종, 빈 상태→지급→스핀→결과 모달→잔액 카운트업) 콘솔 에러 0.
- 2026-10-25(8차): **포인트 교환(MVP ⑤) + 관리자(MVP ⑥).**
  - 교환 `/exchange`: 카탈로그 `lib/exchange/products.ts`(8종, 마이비 상품 구매 탭 가격), 최소 1,000P. 신청 즉시 원장 `redeem` 차감 + `redemptions(requested)`. 상태 칩(신청/처리 중/발송 완료/반려·환불). `/history` = 원장 내역. 지갑 "교환"·"내역"·상품 카드 → 연결. API `GET/POST /api/exchange`, `GET /api/ledger`.
  - 관리자 `/admin` (Shell 우회, 데스크톱 폭): 대시보드(유저·오늘 완료·적립/차감·스탬프·스핀·교환 대기·룰렛 기대값·배지별 유저 수) · 퀴즈(세트 활성 토글·세트 등록·문항 등록: 줄당 `라벨 | 태그 | 이미지URL`) · 룰렛 확률(가중치·활성 즉시 저장, 확률·기대값 계산) · 배지(세그먼트 비율) · 교환 신청(처리 중/발송 완료/반려→**자동 환불** admin_adjust) · 수동 지급(유저 id 또는 anonKey 로 포인트±·스탬프+).
  - 인증 `lib/admin/auth.ts`: `ADMIN_KEY` 환경변수 ↔ 로그인 → httpOnly 쿠키(sha256, path=/admin, 12h). ADMIN_KEY 없으면 비활성(로컬 QA 는 `CCR_DEV_TOOLS=1` 로 키 없이 열림). 서버 액션(`app/admin/actions.ts`) + `requireAdmin()` 가드.
  - Repo 확장: listLedger · add/list/updateRedemption · listAllSets/createSet/updateSet/createQuiz · listAllPrizes/createPrize/updatePrize · countUserBadges · findProfile · adminStats (memory·supabase).
  - 발견·수정: ① 서버 액션에서 submit 버튼 name/value 가 FormData 에 안 실림 → 버튼별 `formAction={action.bind(null, id, status)}` ② 인메모리 저장소는 같은 객체 참조를 돌려줘 갱신 후 이전 상태 비교가 깨짐 → 갱신 전 `prevStatus` 보관(환불 누락 버그) ③ 총 차감 `-0` 표시 → Math.abs.
  - QA(Playwright): 잘못된 키 거부 → 로그인 → 지급 30,000P → 유저 교환 2건(1,900/5,900 차감) → 관리자 발송 완료/반려 → 반려 건 5,900 환불 확인(잔액 28,100) · 세트/문항 등록 · 가중치 50→40 저장 시 확률 44.4% 반영 · 콘솔 에러 0. 스크립트 스크래치 `qa/admin.js`.
- 2026-10-25(9차): **네이티브 화면 원본 픽셀 자산 교체("100% 동일" 요청).** 앱스토어 스크린샷(1242×2688) 안의 폰 화면을 템플릿 매칭으로 찾아(`myb/boxes.json`, 2.44x) 아이콘·일러스트를 직접 크롭 → `public/myb/native/` 40장(흰 배경 knock-out, 오늘만 시계는 파란 배경 knock-out).
  - 탭바 5아이콘(홈=활성 진회색, 나머지=비활성 회색, 만보기=파랑; 상태 전환은 CSS filter) · 홈: 종·선물함(빨간 점 포함)·베이직 육각·꿀단지·꿀 작은 아이콘·오늘만 시계·퀵메뉴 3종·프리패스 배너 이미지 · 지갑: 안내?·시계·쇼핑백·금괴·적금 금고 일러스트·선물 아이콘·브랜드 원형 5개·상품 타일 5장 · 퀴즈: 뒤로·객관식·체크·3D 아바타·짜장면/짬뽕 실제 사진(s04 q1) · 보상: 코인 스택+뱃지 히어로 일러스트 · 만보기: 히어로(헤더·걸음 수 포함, 정적)+선물 행 이미지.
  - 좌표 재보정: 퀴즈 좌우 패딩 30→40(레퍼런스 베젤 6px 보정 후 38~40), 체크 행 mt 10, 파란 섹션 pb 36/pt 38, 아바타 52, 이미지 카드 130 · 보상 히어로 160×260 · 홈 꿀 카드 70 · 지갑 상품 순서를 2행 가로 스크롤 행 순서로 재배열.
  - 한계: 화면 밖이던 상품(피자·바나나우유·뿌링클)·스타벅스 원형·꿀 충전 아이콘(툴팁에 가려짐→꿀단지 대체)은 원본 없음. 러쉬 띠 배경(코인 장식)은 텍스트가 구워져 있어 라벨 자산 유지. 만보기는 레퍼런스 숫자(91,234·1,834)가 이미지에 포함된 정적 화면.
  - 도구(스크래치): `myb/boxes.json`, `myb/full_*.png`, `myb/grid_*.jpg`(390 좌표 격자), `qa/native-cmp*.jpg`.
- 2026-10-26(10차): **화면 갤러리 + Vercel 배포 준비.**
  - 전 화면 36장(네이티브 11·웹뷰 12·리워드 6·관리자 7)을 Playwright dpr2 로 캡처해 아티팩트 갤러리로 전달(스크래치 `qa/gallery.js`, 서버는 `CCR_DEV_TOOLS=1 ADMIN_KEY=test-admin-key pnpm start -p 3123`).
  - Vercel: 환경의 `VERCEL_TOKEN` 은 기존 yedulog 프로젝트 범위라 프로젝트 생성 403. 대표님이 팀 전체 범위 토큰으로 교체 예정. 교체 후 `scripts/deploy-vercel.sh`(REST API: 프로젝트 생성→GitHub 연결→ADMIN_KEY upsert→브랜치 프로덕션 배포→URL 출력) 실행. Vercel CLI 는 `/v2/user` 404 로 이 토큰에서 동작 안 함 → API 직접 호출.
  - 주의: Vercel 서버리스에서 인메모리 저장소는 인스턴스별이라 데이터가 리셋될 수 있음(둘러보기 데모용). 영속 필요 시 Supabase 연결이 선행.
- 2026-10-27(11차): **마이비 API 캡처 심층 분석 → 러쉬·친구초대·매장 미션·꿀·세그먼트 타깃·스타터팩 구현. Vercel 라이브.**
  - 라이브: `https://catchcatchreward-git-main-yusang.vercel.app` (Vercel 프로젝트 catchcatchreward, GitHub 연동 main 자동 배포, Deployment Protection 해제). **main = 작업 브랜치 fast-forward** 로 유지(대표님 허용). 환경의 VERCEL_TOKEN 은 yedulog 범위라 API 배포 불가 → 대표님이 vercel.com/new 에서 import.
  - 캡처 분석(`mock_api.json` 29종): `bpointrush/stamp`(주간 일~토 KST, 스탬프 미션 8개: 출석1/3·퀴즈5/10·만보기·로또·설문30P·게임50P, 7개=300P·8개=500P) · `bpointrush/special`(단계형 게임/설문 카운트 보상) · `user/me`(invitationCode 8자, character INTP, isEnableStarterPack·beginnerEndAt=가입+3일, dailyAttendanceClaimCreditIndex, adPlacementData=adpopcorn 지면 20여 종) · `user-segment/me`(세그먼트별 benefitTabContents) · `reward-banner`(배너 viewCount) · `native-easy`(CPA 팔로우/구독).
  - `/rush`(`lib/rush`): 주간 스탬프 보드. 미션 8개 = 출석1·출석3·퀴즈5·퀴즈10·룰렛1·배지1·매장1·초대1(만보기·로또·설문·게임 자리를 우리 기능으로 치환, 보상값은 원본 10/20 유지). 진행도는 저장 없이 원천(출석 스탬프·완료·스핀·배지·매장·초대)에서 `kstWeek()` 범위로 집계. 보상받기 = `rush_claims` + 원장 `rush` + 룰렛 스탬프 1(MVP ③). `lib/time.ts kstWeek` 1주차 = 2026-10-25(일). `rushEndsAt` 도 토요일 23:59:59 KST 로 정렬.
  - `/invite`(`lib/invite`): 초대코드 8자(혼동 문자 제외) `profiles.invite_code`. 코드 입력 즉시 300P, 초대한 쪽은 친구 **첫 퀴즈 세트 완료 시** 500P(일 5명 한도, `referrals`). `?code=` 프리필, Web Share → 복사 폴백.
  - `/missions`(`lib/missions`): 캐치랭크 매장 미션(방문·저장·리뷰) — 관리자가 매장·인증코드·보상·정원 등록, 유저는 코드 입력으로 완료(1회) → 원장 `store_mission` + 스탬프. 2차: 플레이스 저장/리뷰 API 검증으로 교체.
  - 꿀 = 하루 퀴즈 세트 8회(`HONEY_PER_DAY`), KST 0시 충전, 초과 시 `NO_HONEY` 409. 스타터팩 = 가입 후 3일 퀴즈 보상 2배(원장 quiz_bonus memo starter_pack). 연속 출석 7일마다 +50P. 보상 화면에 문항별 선택 분포("다른 사람들은?").
  - 세그먼트 타깃: `quiz_sets.target_badges`(배지 코드) — 보유 유저에게만 노출·제출 허용, 카드에 "내 취향 맞춤" 칩, 관리자 세트 등록 체크박스.
  - `/notifications`(상태 파생: 받을 러쉬 보상·출석·룰렛·남은 꿀·교환 진행·초대 보상), 홈 종 아이콘 빨간 점. PWA `app/manifest.ts` + `public/icons`. 관리자 `/admin/stores`·`/admin/users`(id → 수동 지급 프리필).
  - Repo 확장: listStamps · countResponsesByOption · 초대(findProfileByInviteCode/setReferredBy/addReferral/…) · 매장 미션 CRUD/완료 · rush_claims · listProfiles. Supabase `0002_rush_invite_store.sql`(**미연결 검증**, enum 확장은 단독 적용).
  - QA: typecheck·lint·build, API 스모크(`qa/smoke3.sh`: 초대 SELF/ALREADY/INVALID·첫 완료 보상, 러쉬 claim/ALREADY_CLAIMED/NOT_COMPLETED, 매장 BAD_CODE/ALREADY_DONE/SOLD_OUT 경로, 꿀 8→9번째 NO_HONEY), Playwright(`qa/feat10*.js`) 콘솔 에러 0. 갤러리 아티팩트 46장 갱신.
  - 주의: Vercel 서버리스 인메모리는 인스턴스마다 따로라 포인트가 리셋될 수 있음 → Supabase 키 연결이 다음 1순위.
- 2026-10-27(12차): **Postgres 어댑터 교체·검증 + 관리자 DB 화면.** supabase-js 어댑터(미검증, uuid id 불일치)를 버리고 `postgres`(porsager) 직접 연결 어댑터로 교체. 스키마를 `lib/db/schema.ts` 단일 출처로 재작성(앱 생성 id 는 text, enum 대신 check, 전 테이블 RLS on·정책 없음 → PostgREST 차단). `lib/db/migrate.ts` = 스키마(idempotent) + TS 시드(배지·세트·문항·경품·매장). CLI `pnpm db:sql|db:migrate|db:status`(tsx). 로컬 Postgres 16(apt, `/var/lib/postgresql/ccr`, 포트 5433)에서 전 테스트 스위트(smoke3·feat10a~d·gallery 46장) 통과, 서버 에러 0. 발견·수정: 같은 태그 중복 시 `ON CONFLICT DO UPDATE` 2회 → unnest 를 group by 로 묶어 증가분 합산. Supabase 연결은 대표님이 DATABASE_URL(Transaction pooler 6543) 을 Vercel 에 넣고 `/admin/db` 버튼 1회.
- 2026-10-27(13차, 회의 준비): 퀴즈 16세트 41문항·배지 14종(여행·반려·뷰티·패션·재테크·맛집·드라이버 등), 페르소나 타이틀 확장. 가입 보너스 300P(원장 `signup`, 첫 /api/home 1회) + 홈 웰컴 바텀시트(localStorage 1회). PWA 설치 힌트(모바일·비standalone). 혜택 탭 4번째 메뉴 → 매장 미션. 관리자 `/admin/insights`(배지 세그먼트 유저 수·비율·함께 강한 태그 상위 4·태그 분포), 대시보드 14일 SVG 차트 4종(`components/admin/DailyChart`), `/admin/users/[id]` 유저 360(잔액·배지·태그·원장 50·완료·교환·초대). Repo: listAllUserBadges·listAllTagScores·dailyStats. 전 테스트 Postgres 에서 통과, 갤러리 51장.
- 2026-10-27(14차, 리텐션): **미니게임 3종 + 제휴 아웃링크 + 세그먼트 CSV.** `lib/games/service.ts`: memory(카드 뒤집기 4×4, 클라이언트 플레이 후 시도·초 제출, ≤16회 15P/≤24회 10P/완주 5P, 일 1회, 서버 타당성 검사만) · spot(틀린그림 — `spotPuzzle(dayKey)` mulberry32 시드로 전원 동일 6×8 이모지 보드, 5칸 상이, 서버 채점 칸당 5P+완주 10P, 일 1회) · rsp(가위바위보 일 3판, 승 10P/무 3P) · scratch(복권 일 1장, 0/5/10/50/500P 가중 50/25/15/8/2). `game_plays` 테이블(일일 한도·러쉬 집계), 원장 reason `game`. 러쉬 미션 "취향배지" → "미니게임 3회"(game3). 홈 퀵메뉴 미니게임 → `/games`. 화면 `app/games/{page,spot,rsp,scratch}`(복권은 canvas destination-out 긁기).
  - 제휴: `lib/shop/affiliate.ts` — `COUPANG_PARTNERS_URL`·`AFFILIATE_URL_<ID>` env → 없으면 쇼핑몰 홈. `/api/shop/out?merchant=` 가 하루 1회 방문 적립 5P(원장 mission/shop_click) 후 302. 상세 CTA 가 `target=_blank` 앵커. 구매 포스트백은 제휴사 리포트 수동 대사(1차).
  - 관리자 `/admin/export?type=segments` CSV(관리자 쿠키 path=/admin 이라 /api 아래가 아니라 /admin 아래에 둠).
  - 다음 단계: ① 대표님 Supabase 프로젝트 → DATABASE_URL → /admin/db ② Vercel 환경변수(ADMIN_KEY 설정 완료) ③ 실기기 캡처(2x/3x) 받으면 남은 아이콘(퀵메뉴 꿀 충전·상품 타일 3장·탭 활성 상태) 교체 ④ 미션(캐치랭크 매장·제휴 쇼핑 → 스탬프) 등록 UI ⑤ 비포인트 러쉬·bplay·월간미션 웹뷰(추가 mock 필요).
- 2026-10-27(15차): **카카오 로그인·미니게임 재제작·부가 화면·꿀 충전** (커밋 1df097e·2f25440).
  - 카카오 OAuth(`lib/auth/kakao.ts`, `KAKAO_REST_API_KEY`·`KAKAO_CLIENT_SECRET`(선택)·`APP_BASE_URL`, 콜백 `/api/auth/kakao/callback`) → `profiles.provider/provider_id`, 익명 기록을 `repo.mergeProfiles` 로 병합(원장·스탬프·완료·배지 이관). `/login`·`/me`·로그아웃. 세션 쿠키 `ccr_uid`.
  - 미니게임 5종: 틀린그림(아래 16차에서 재제작)·2048(`/games/slide`)·복권(3×3 심볼)·가위바위보(3연승 +20P)·카드 뒤집기. 대표님 피드백 "너무 대충" → 벡터 장면으로 1차 재제작했으나 부족.
  - 화면: `/attendance`(출석 달력, 7일마다 +50P) · `/gifts`(선물함) · `/notice` · `/support` · `/terms`. 꿀 충전 = 모의 광고 15초 시청 → `POST /api/honey`(일 3회, `honey_topups`).
  - 마이비 영상 캡처(대표님 Drive, 스크래치 `mybvideo/ref/t###.jpg` 47프레임)로 최신 홈·퀴즈 채널·러쉬·초간단 레이아웃 확보.
- 2026-10-27(16차): **틀린그림 시중 앱 수준 재제작 + 영상 기준 홈·퀴즈 채널·러쉬 재설계 + 3일 혜택.**
  - 틀린그림(`/games/spot`): 연결된 이미지 생성 MCP(gpt_image_2_5, 장당 0.25크레딧)로 퍼즐북 풍 일러스트 8장면 생성 → 스크래치 `spotgen/gen.py`(PIL+numpy) 로 물체 단위 편집(색상 선택 hue shift·배경 복제 제거·좌우 반전·확대) 5개씩 → `public/games/spot/<id>/{a,b}.webp`(2.4MB). 좌표는 `lib/games/spotLevels.ts`(서버 전용, 정규화 0~1). **탭 판정은 서버**(`POST /api/games/spot action=tap`) → 맞춘 차이마다 HMAC 토큰(`ADMIN_KEY` 또는 `SPOT_SECRET` 키), 제출 시 토큰 검증(위조 0점). 하루 3레벨(날짜×회차로 장면 순환) · 60초 · 틀리면 −5초 · 힌트 1회(−5초) · 차이당 3P + 완주 +10P. 화면: 다크, 위 원본/아래 찾기(시작 전 블러), 양쪽 동기 마커(초록 원/분홍 점선/노랑 펄스), 다음 레벨 이어하기. 검수: 차이 40개 A/B 크롭 시트로 전수 확인(하늘·잔디가 같이 물드는 문제 → `excl` 색상 범위, 반전 중심 bbox 측정으로 보정). 옛 `spotScenes.ts`·`SceneSvg.tsx` 삭제.
  - 퀴즈 커버: picsum → 주제별 실사진 16장(`public/quiz/covers/sNN.webp`, 같은 MCP). `migrate.ts` 시드는 image_url 이 picsum 인 행만 교체.
  - 홈(`app/page.tsx`, 영상 t006~t008): 헤더 P잔액·"신규 유저" 칩·선물함·종 → 히어로 "오늘도 만나서 반가워요 / N일차 퀴즈 3개로 시작해요!"(진행 바 todayDone/3, 아바타) → 퀴즈 가로 카드 150 → 퀵메뉴 8종 가로 스크롤+점(출석·미니게임·3일 혜택(말풍선 최대 1,500P)·꿀 충전·친구초대·내 쇼핑·매장미션·룰렛) → "💰 포인트 모아서 살 수 있어요"(신규 유저 전용 네이버페이 vs 금 잠금 카드 + 상품 타일 4) → "나를 위한 맞춤 서비스"(친구초대·러쉬·매장미션·룰렛 카드) → 배너. 러쉬 상단 띠·오늘의 루틴 제거.
  - 3일 혜택(`/newbie`, `lib/quiz/newbie.ts`): 가입 후 3일, 매일 퀴즈 세트 3개 완료 → 300/500/700P(원장 `newbie`, refId day{n} 로 1회). `HomePayload.newbie`·`todayDone`.
  - 퀴즈 채널(`/quiz`, t010~t013): "✨ 시작하기 좋은 퀴즈" 2열 4장 → "캐치 뱃지 컬렉션"(배지 칩 탭 + 썸네일 리스트 카드 + 더보기, `/api/quiz/channel`: 선택지 태그 ∋ 배지 rule.tag 로 묶음) → 전체 퀴즈.
  - 러쉬(`/rush`, t070·t072): 다크 #191f28, 히어로 그라디언트, "✨ 스페셜 미션" 필, 프리패스 게임/퀴즈 배너, 단계 보상 카드(게임적립 10/10/20·퀴즈 10/10/10), 매장 도전 과제, "🔥 스탬프 미션" 필, 스탬프 7개=300P 보드(톱니 원, 라벨), 번호 미션 리스트(P·핑크 진행 문구·이동하기/받기).
  - QA(Playwright, 로컬 Postgres): spot 레벨 1 완주(5/5 +25P·confetti) → 레벨 2 부분(2/5, 놓친 곳 표시) → 위조 토큰 0점 → 3회 소진; 홈/퀴즈/3일 혜택(퀴즈 3세트 → 1일차 300P, 중복 ALREADY_CLAIMED, 2일차 NOT_COMPLETED); 러쉬 출석→받기. 콘솔 에러 0.
  - 남은 것: 웹푸시(VAPID+SW+Vercel cron) · 월간미션·비플레이 웹뷰 · 갤러리 아티팩트 갱신 · Supabase 연결(대표님 DATABASE_URL) · 카카오 앱 키.
- 2026-10-27(17차): **웹푸시 · 월간 도전 과제 · 미니게임 아트 · 갤러리 v6.**
  - 웹푸시(`lib/push/service.ts`, `web-push`): `push_subscriptions` 테이블 + Repo. `GET/POST/DELETE /api/push`(상태·구독·해제), `POST /api/push/test`(내 기기), `GET /api/push/cron`(일일 리마인드: 유저별 알림 파생 1순위 할 일, `CRON_SECRET` Bearer, 없으면 `CCR_DEV_TOOLS=1` 만). `vercel.json` 크론 `0 0 * * *`(09:00 KST). `public/sw.js`(push·notificationclick, 캐시 없음). `components/PushToggle.tsx`(/notifications 상단: SW 등록→권한→구독→저장, 테스트·끄기). `/admin/push`(구독 수·전체 발송). **활성화 조건: `pnpm push:keys` 로 VAPID 키 생성 → Vercel 환경변수 `VAPID_PUBLIC_KEY`·`VAPID_PRIVATE_KEY`(·`VAPID_SUBJECT`) + `CRON_SECRET` → Redeploy.** 키 없으면 토글이 "서버 미설정"으로 표시. iOS 는 홈 화면 추가(PWA) 후에만 수신. 만료 구독(404/410)은 발송 시 자동 삭제(로컬 테스트: 가짜 FCM endpoint → 삭제 확인).
  - 월간 도전 과제(`/monthly`, `lib/monthly/service.ts`): KST 월 집계 — 퀴즈 30(300P)·출석 15일(500P)·미니게임 30회(300P)·틀린그림 완주 10(500P)·룰렛 3(200P)·매장 3(500P)·초대 3(1,000P) = 최대 3,300P. 원장 `monthly`, refId `YYYY-MM:key` 1회. 러쉬 "월간 도전 과제" 카드·홈 맞춤 서비스·알림(받을 보상)에서 진입. API `GET/POST /api/monthly`.
  - 알림 파생에 월간·3일 혜택 받을 보상 추가(`lib/notifications.ts`).
  - 미니게임 아트(`public/games/art`, 같은 이미지 MCP 13장 ≈ 3.25크레딧): 가위바위보 손 3종(흰 배경 knock-out PNG 320) · 복권 심볼 6종(클로버·체리·종·별·다이아·선물, 서버는 여전히 이모지 문자열, 화면에서 `ART` 맵으로 치환) · 게임 허브 타일 4종(2048·복권·가위바위보·카드) webp.
  - 갤러리 아티팩트 v6(61장): https://claude.ai/artifact/HqaGWbStnGYAuyZc4ZJXF9 — `qa/gallery.js`(틀린그림 v3 플로우는 `spotgen/levels.json` 좌표로 탭, 인자 2개) + `qa/make_gallery.py`.
  - 이미지 생성 크레딧 사용 합계(이 세션): 장면 8 + 커버 16 + 아트 13 = 37장 ≈ 9.25크레딧(잔액 1,000 중).
  - 남은 것(대표님 입력 필요): Supabase `DATABASE_URL` → `/admin/db` · 카카오 `KAKAO_REST_API_KEY` · VAPID 키·`CRON_SECRET`. 코드 측 남은 것: 비플레이 웹뷰(mock 없음), 실기기 캡처 기반 아이콘 재보정.
- 2026-10-27(18차): **실사진 전면 교체("그림도 실제 사진 위주로").** 같은 이미지 MCP(gpt_image_2_5) 36장 ≈ 9크레딧.
  - 틀린그림 실사 8장면(거실·부엌·시장·책상·베이커리·해변 피크닉·놀이방·가을 공원) → `spotgen/levels2.json` + `gen.py`(4번째 인자로 레벨 파일) → `public/games/spot/photo_*/{a,b}.webp`. `SPOT_LEVELS` = 실사 8 → 일러스트 8(총 16, 날짜×회차 순환). 실사 편집 팁: hue 는 `from/tol` 을 좁게(책상 나무 hue≈30 이 노란 포스트잇 tol 25 에 걸림 → scale 로 대체), 흰 벽 제거는 액자 테두리 잔상 → hue/scale 로 대체, 바다 제거는 수평선 y 유지한 수평 src.
  - 퀴즈 선택지 이미지 20장(`public/quiz/options/<seed>.webp`, seed.ts 의 imageSeed 가 그대로 파일명) · 상품 사진 8장(`public/products/<kind>.webp`, `Product.img`, 교환·지갑·홈 타일 사용) · picsum 의존 제거(관리자 세트 기본 커버 `/quiz/covers/default.webp`). DB 시드는 picsum URL 인 quiz_options/quiz_sets 행만 image_url 갱신.
  - 갤러리 v7(61장) 재발행. QA: 전 화면 콘솔 에러 0, 실사 레벨 완주 e2e(책상 5/5 +25P).
- 2026-10-27(19차): **피드백 효과 + 라이트 톤 통일.** 대표님: "틀린 화면 클릭하면 폰 진동 울리면서 틀렸다 그런 것도" / 다크 배경이 앱 톤과 안 맞음.
  - `lib/fx.ts`: `haptic(tap|success|error|warn|jackpot)`(navigator.vibrate, iOS Safari 미지원은 무시) + `sfx(hit|miss|win|lose|tick|coin|pop)`(Web Audio 합성, 파일 없음) + 음소거 localStorage `ccr_mute`(게임 허브 🔊 토글).
  - 틀린그림: 3·2·1 카운트다운 → 틀리면 진동 [80,50,80]+흔들림+빨간 플래시+"틀렸어요 −5초" 플로팅, 맞추면 진동+효과음+"+3P" 플로팅, 10초 남으면 경고 진동, 결과 별 3개(완주+스피드=3) · ⚡ 스피드 보너스 +5P(전부 찾고 30초 이내, 서버 `SPOT_SPEED_BONUS`).
  - 햅틱·효과음 적용: 출석 · 퀴즈 선택/보상 · 룰렛 결과 · 복권 공개 · 가위바위보 결과 · 카드 짝 · 러쉬/월간/3일 혜택 보상.
  - 틀린그림·월간 과제 화면을 다크 → 라이트(#f8f9fc·#427cff)로 통일(러쉬만 영상대로 다크 유지).
  - QA: Playwright 에서 navigator.vibrate 스파이로 틀린 탭 [80,50,80]·정답 패턴 확인, 플로팅 라벨·스피드 보너스(4초 완주 +5P)·음소거 저장 확인, 콘솔 에러 0.
  - 여백 지적 → 틀린그림 화면을 `min-h-dvh flex` 로 세로 꽉 채우고 하단에 "오늘의 3레벨"(썸네일·완료🏆/진행/잠김·점수) + 오늘 포인트·최단 기록 카드 추가(`SpotPayload.today/todayPoints/best`). 390×844·430×932 꽉 참, 375×667 은 스크롤.
  - "한 페이지에 딱 맞춰야" → 루트 `h-dvh overflow-hidden`, 그림 영역 `flex-1` 을 ResizeObserver 로 재서 두 그림 크기를 남는 높이에 맞춤(`dim`), 3레벨 카드는 썸네일 56×40 한 줄로 납작하게. 사파리(390×734)·844·SE(567)·932 모두 스크롤 0.
  - "간단하게, 유명 틀린그림 앱처럼" → 상단 설명·"N회 남음"·하단 안내문·3레벨 카드 제거. HUD = LV 칩 + 찾은 개수 동그라미 5 + 장면명 + 타이머 바, 헤더 우측은 남은 초만. 하단은 플레이 중 둥근 💡힌트/■그만 2개, 대기 중엔 오늘 3레벨 알약(✓/▶/🔒). 결과는 중앙 팝업(별·+P·나가기/다음 레벨·놓친 곳 보기 → review 상태로 분홍 점선 확인). 390×734·375×567·430×932 스크롤 0.
- 2026-10-27(20차): **모션그래픽("팡팡 터지는")** — `lib/fxEngine.ts` 캔버스 파티클 엔진 + `components/motion/FxLayer.tsx`(레이아웃에 전역 1개, z-1500, 포인터 통과, pointerdown 좌표 추적).
  - API: `burst(kind, x, y)`(sparkle·miss·coins·stars·hearts·ring) · `confetti(n)`(좌우 하단 캐논) · `flyCoins(from, targetEl, n, onArrive)`(WAAPI 포물선) · `burstAtPointer(kind)` · `flyToBalance(n)`(id=hdr-balance 로 날아가 `.fx-bump`).
  - 틀린그림: 정답 = SVG 손그림 링(`pathLength=1` dashoffset 드로잉 + 흰 halo + 보조 링 + 펄스) + sparkle + 코인 3개가 찾은 개수 동그라미로 날아가 ✓ 팝(`spot-dot-pop`) · 틀림 = 빨간 파편+링+도장 X · 완주 = 컨페티 160 + 팝업 별 순차 팝(`spot-star`).
  - 적용: 홈 출석(코인 폭발→잔액 비행, 연속 보너스 컨페티) · 러쉬 받기(스탬프 보상은 컨페티) · 월간/3일 혜택(별+컨페티) · 가위바위보 승(별·코인, 연승 컨페티) · 복권(긁는 중 반짝이, 당첨 컨페티) · 룰렛 당첨(컨페티+코인+별) · 퀴즈 보상(컨페티+코인) · 카드 짝(반짝이, 완주 컨페티).
  - QA: Playwright 캔버스 픽셀 샘플링으로 파티클 렌더 확인, 틀림/정답/완주/출석 중간 프레임 캡처.
- 2026-10-27(21차, 디자인 시안): 대표님 "디자인 구리다·마이비 보고 역기획·메인컬러 바꾸자·시안 먼저".
  - 마이비 토큰 집계(캡처 CSS 2.6만 줄): 주색 #427cff(110회)·잉크 #191f28·보조 #5c6573·비활성 #8b94a0·bg #f8f9fc·반경 12/14/16/20·알약 100·그림자 `0 5px 16px rgba(0,43,141,.1)`·굵기 500/600/700·Lottie Confetti pop(614px 36f)·Explode(940×752 60fps).
  - 대표님 2차 녹화 영상(Drive `마이비2.mp4` 80MB, 9:27, 884×1920 30fps → 스크래치 `mybvideo2/`, 1fps 프레임 567장 + 구간별 5/15fps 클립) 실측: 퀴즈 완료 "보상 지급!" = 딤 0.13s → 잔액 알약 슬롯 롤링 0.87s(1,425→1,445) → 발광 3D 코인 → "P 20 를 받았어요!" → 2.5s 유지 → 0.3s 페이드로 보상 페이지(잔액 알약·히어로 +3 뱃지·받은 보상 행·추천 퀴즈·나가기/계속하기). 2일차 미션 500P = 홈 위 딤 0.07s → 3D 캐릭터 코인 한아름 + 빛줄기 1.2s → 해제 → 홈 잔액 롤링 0.3s. 만보기 = "축하해요! P 13" + "추가로 더 받았어요!" 아이템 3개. 깜짝 당첨 팝업(보라 그라디언트·핑크 CTA). 신규 퀴즈 UI = 전면 3D 장면(노랑/파랑 대각선) + A/B 카드(선택 A 파랑·B 노랑 채움) + 그만두기/다음 질문으로.
  - 시안 아티팩트 v2: https://claude.ai/artifact/L8nwodMtELamm4bVDRtiCq — 컬러 A 캐치 오렌지(#FF5A2D·골드 #FFC53D, 추천)/B 민트/C 바이올렛 + 현재(마이비 파랑) 테마 토글 목업 5장(홈·틀린그림·보상 지급·출석·퀴즈 풀기), 실측 타임라인 2종(큰 보상 2.4s 오버레이→정착 페이지 / 작은 보상 1.2s), 3D 오브젝트 4종 생성(마스코트 고양이·코인·선물상자·트로피, 스크래치 `brand/`). **코드 미변경 — 대표님 결정 대기(A/B/C, 마스코트, 코인 심볼).**
- 2026-10-27(22차): **디자인 전면 교체(A안 캐치 오렌지) + 브랜드 자산 + 보상 연출 + 제휴 게이트 — 광고 런칭 준비.** 대표님: "완벽하게 카피해놓고 내일 디자인 완전 변경·연동 다 붙이고 내일 저녁 광고 시작". 시안 선택 없이 추천안(A)으로 진행, 색은 `app/globals.css` @theme 한 곳에서 바꿀 수 있게 토큰화(클래스명 `myb*` 유지).
  - 토큰: `--color-myb #ff5a2d`·dark `#e0441a`·soft `#fff0ea`·line `#ffd2c2`·gold `#ffc53d`·ink `#1a1c22`·bg `#faf9f7`. 하드코딩 hex 는 Python 치환(파랑→myb, 보라/핑크→오렌지/골드, 회색 bg→토큰).
  - 자산 `public/brand/` 32종(이미지 MCP 23장 ≈ 5.75크레딧 + 시안 때 4장): 퀵메뉴 8(출석·게임·꿀·초대·쇼핑·매장·룰렛·종)·마스코트 5(인사/코인/돋보기/잠/멋쩍음)·코인 더미(hero)·선물·트로피·금·돼지·뱃지·티켓·스탬프·퀴즈 + SVG(ic_left/back/clock/info/list/check/coin). 흰 배경 knock-out `brand/knock.py`(edge flood fill + de-fringe). 마이비 `/myb/*` 참조는 앱 본체에서 0건(쇼핑 복제 `app/shop`·`lib/shop` 만 잔존: 제휴 로고·유의사항 원문 — 광고 전 교체 여부 대표님 판단).
  - 보상 지급 오버레이 `lib/reward.ts`(`showReward()` 이벤트 버스, Promise) + `components/motion/RewardLayer.tsx`(레이아웃 z-1400): big = 딤 .13s → 잔액 알약 자리별 슬롯 롤링 .87s(`Odometer`) → 그라디언트 "보상 지급!" → 빛줄기 conic + 코인 스프링 → "+nP 를 받았어요!" → 2.5s → .3s 페이드 → 정착 페이지 / small = 딤 .07s → 타이틀 + 마스코트(코인 한아름) + 스티커 1.2s → .2s → 호출측 `flyToBalance`. 적용: 퀴즈 완료·틀린그림(점수>0)·룰렛 포인트 당첨·월간(big), 출석·러쉬 받기·3일 혜택(small). 탭하면 스킵.
  - 혜택 탭(`app/benefits`) 자체 허브로 재작성(오늘 할 일 카드·진행 중 이벤트·적립 메뉴 8·준비 중 3). 게임적립/초간단/설문 복제는 `app/_replica/`(비라우팅) 로 이동, `/game` `/cpq` `/survey` 는 `components/ComingSoon` "제휴사 연동 준비 중" + 대체 행동 3개. `/walk` → `/games` 리다이렉트, 탭바 만보기 → 게임(SVG 5종).
  - 지갑: CONX 제거 → 룰렛 스탬프, 가짜 금 투자 카드 → 교환 카드, 상품 타일 = `lib/exchange/products`. 홈 배너 = `Banners slides`(CSS+브랜드 이미지). 토스트 아이콘 SVG. 카드 뒤집기 = 브랜드 아이콘 16종. 문구: B포인트→포인트, 비포인트 러쉬→캐치 러쉬. PWA 아이콘·manifest theme_color 재생성.
  - QA: typecheck·lint·build, Playwright `qa/v8.js`(홈·출석 오버레이·퀴즈 풀기/보상 오버레이/정착·혜택·지갑·준비 중 3·게임 허브·카드·틀린그림 완주 오버레이·룰렛 오버레이·러쉬·월간·3일·알림·초대·교환·출석·MY·매장·쇼핑) 콘솔 에러 0·실패 요청 0. 갤러리 v8 `qa/gallery8.js` + `make_gallery8.py`.
  - 런칭 체크리스트 `docs/LAUNCH.md`(Vercel env 표·배포 후 1회 작업·미연동 목록). main 은 브랜치 fast-forward(983d8fd).
- 2026-10-27(23차): **이모지 → 3D 아이콘 전면 교체(시안 승인) + 틀린그림 B컷을 이미지 모델 편집으로 재제작.**
  - 대표님: 이모지(🎉💰🤝🔥🏆📍🎡📝📅🎮)·테두리 카드가 "AI 티". 유아이볼 레퍼런스(알바몬 매일 미션·신한 슈퍼SOL 금융 미션·캐시워크 챌린지·토스증권 출석) 기반 시안 https://claude.ai/artifact/4jse7RUEmcybTB4ASfFbJG 승인("바꿔놔봐").
  - 규칙: 아이콘은 전부 같은 3D 세트(`public/brand/` + flame·party·lock·magnifier·moneybag·store_pin 6종 추가), 리스트는 연한 타일(46~52px)+행, 카드는 테두리 대신 그림자, 섹션 제목은 글자만. 적용: 홈(맞춤 서비스 → 흰 카드 1장 안 행 5개 + 보상 수치·chevron, 신규 혜택 배너·잠금 카드·VS 골드), 월간(아이콘 타일·브랜드 진행바·트로피 히어로), 매장 미션(연한 띠·매장 핀 타일), 틀린그림(시작/힌트/그만 SVG, 레벨 알약 트로피·자물쇠, 결과 별 SVG), 러쉬·MY·지갑 카테고리·푸시 토글·보상 문구. 남은 이모지는 취향 배지·페르소나 칩·복권 심볼(이미지로 치환됨) 등 데이터성뿐.
  - 틀린그림(`spotgen/v2/`): 기존 PIL 패치(hue/remove/flip)는 "포토샵 잘린 느낌" → **gpt-image 편집**(참조 이미지 + "정확히 이 n가지만 바꿔라")로 B컷 생성 후, 원본 A 위에 의도한 영역만 **링 정렬(±10px)·페더 타원 합성**(`compose3.py` 수동 좌표 / `compose4.py` 창 내 블롭 검출). 전체 재렌더 드리프트가 있어 영역 밖은 반드시 A 유지. 라운드: 1차 medium(0.5) 15장 → 실패분 2차 high(1.5) 13장 → 잔상 정리 3차 7장 → 대체 차이(깃발·우산·라떼 하트·시계줄 빨강) 4장. 합계 ≈ 42크레딧. 교훈: 모델은 "제거"보다 "색/모양 변경"을 훨씬 잘 지키고, 제거는 블러 잔상이 남기 쉬움 → 잔상은 주변 패치 클론(수평 이동)으로 덮되 다른 물체가 딸려오지 않는 방향 선택. 카툰 공원(park) 레벨은 복구 불가로 제외 → 15레벨(실사 8 + 일러 7). 좌표 `final_regions.json` → `export.py` → `lib/games/spotLevels.ts` + `public/games/spot/*` + QA용 `spotgen/levels_v2.json`(ops cx/cy).
  - QA: Playwright `qa/spotqa.js`(오늘 3레벨 전부 5/5 완주 확인) + `qa/v8.js` 전 화면 콘솔 에러 0·실패 요청 0.

- 2026-10-27(24차): **"대기업 느낌" 듀오톤 아이콘 체계 + 보조 컬러 + 틀린그림 단계별 난이도** (커밋 7b6c1ff). 대표님: 3D 클레이 아이콘도 "대기업은 절대 안 씀", 주황 과다로 눈 아픔, 틀린그림은 갈수록 어렵게.
  - `components/icons/duo.tsx`: 토스/네이버페이식 듀오톤 SVG 27종(`DuoName`) + `IconTile`(연한 타일 soft bg + deep stroke, `Tone` 9종 blue/green/violet/pink/teal/amber/orange/gray/navy). 라스터 아이콘(`/brand/*.webp`)은 홈 코인 더미·금·마스코트(보상 오버레이 small)만 잔존. 규칙: 리스트/퀵메뉴/카테고리는 IconTile, 히어로는 단색 그라디언트 + 워터마크 DuoIcon, 오렌지는 CTA·포인트 숫자에만.
  - 토큰(`app/globals.css`): `--color-blue/-soft`, `green`, `violet`, `teal`, `amber`, `navy`. 히어로 재배색: 홈 블루 틴트 · 혜택 블루 · 월간 네이비 · 초대 핑크 · 매장 틸 · 러쉬 다크(영상 기준 유지).
  - 틀린그림 난이도(`lib/games/service.ts SPOT_STAGES`): LV1 60초/오답 −5/차이당 3P/완주 +10/스피드 +5 → LV2 50/−7/4/+15/+8 → LV3 40/−10/5/+20/+12. 오늘 3레벨은 `spotLevelFor` 가 차이 반경 평균 큰 순(쉬움→어려움) 정렬. 서버 `missPenalty` 를 payload 로 내려 클라이언트가 사용, LV 칩에 제한 초 표시.
  - QA: tsc·lint 0 경고·build, Playwright `qa/spotqa.js`(3레벨 5/5, 보상 30P/35P/45P 단계 확인) · `qa/v8.js` 전 화면 콘솔 에러 0·실패 요청 0, 갤러리 v9(60장) 아티팩트 갱신.
  - 추가(같은 날): 퀴즈 채널 배지 칩·지갑 뱃지·보상 획득 칩·퀴즈 풀기 페르소나 칩의 **이모지 제거** → `components/icons/badge.tsx`(배지 코드/태그 → 듀오톤 14종 pepper/coffee/moon/home/cart/dumbbell/plane/paw/lipstick/dress/trend/fork/car/leaf + 톤). `Persona.tag` 추가. 시드 퀴즈 제목 끝 이모지 5건 삭제, `migrate.ts` 가 제목 변경도 upsert(`/admin/db` 1회로 라이브 반영). `badges.emoji` 컬럼은 관리자 표에서만 사용.
  - 추가(모션): 대표님 "코인·별 별로, 짠짠짠 움직여야, 고양이도 움직이게". ① `PCoin` 골드 코인 재설계(림 그라디언트·면 라디얼·사선 하이라이트·흰 P + 그림자). ② `components/motion/StarRating.tsx`: 별 3개가 0.28s 간격으로 도장처럼 찍힘(`starStamp` scale 0→1.55→1 회전 바운스, 링 플래시, 별마다 sparkle 파티클·진동·pop 효과음, 3개째는 stars 버스트; 못 딴 별은 회색 소형). 틀린그림 결과 팝업에 적용. ③ `components/motion/Mascot.tsx`: 홈 히어로 우측 고양이(mascot_1 손인사 기본) — 3s 둥실 idle + 그림자 수축, 4~7s 마다 두리번(mascot_3)·손인사로 포즈 크로스페이드 + wiggle, 탭하면 점프 + 코인 더미(mascot_2) + 코인 파티클 + 진동. Playwright 는 애니메이션 중이라 `click({ force: true })` 필요. 히어로 문구는 `<br/>` 로 2줄 고정, 진행 카드 `mr-[128px]`.
  - 추가(손인사): 대표님 "손이라도 흔들던가" → 포즈 크로스페이드로는 안 움직여 보여서 **팔을 실제로 분리**. 스크래치 `mascot/split.py`: mascot_1 에서 팔 폴리곤을 잘라 `public/brand/mascot_arm.webp`, 몸은 팔을 지우고 **오른쪽 볼을 좌우반전(머리 중심 x=330)해 구멍 메움** → `mascot_body.webp`. `Mascot.tsx` 가 몸 위에 팔을 bbox 비율(left 8.4% top 25% w 20.8% h 35.2%)로 얹고 어깨 축(72%,82%)으로 `mascotWave`(−22°↔+10° 4회, 1.3s) 회전. 마운트 0.5s 후 + 3~5s 마다 흔들고 3회 중 1회는 두리번(mascot_3). 탭 → 점프·코인 포즈 후 복귀하며 손인사.
