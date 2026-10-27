# 광고 시작 전 체크리스트 (2026-10-28 저녁 목표)

## 1. Vercel 환경변수 (Settings → Environment Variables → Production) — 값은 채팅에 올리지 말 것
| 키 | 용도 | 없으면 |
|---|---|---|
| `DATABASE_URL` | Supabase Postgres(Transaction pooler 6543, `?sslmode=require`) | 인메모리 → 인스턴스마다 포인트 리셋(**광고 전 필수**) |
| `ADMIN_KEY` | 관리자 로그인 + 틀린그림 토큰 서명 | 관리자 닫힘 |
| `APP_BASE_URL` | `https://<도메인>` (카카오 콜백·푸시 링크) | 카카오 콜백 불일치 |
| `KAKAO_REST_API_KEY` (+ `KAKAO_CLIENT_SECRET` 선택) | 카카오 로그인. 카카오 콘솔 Redirect URI = `{APP_BASE_URL}/api/auth/kakao/callback` | 로그인 버튼 비활성(익명 유저로만 동작) |
| `VAPID_PUBLIC_KEY` · `VAPID_PRIVATE_KEY` · `VAPID_SUBJECT` | 웹푸시(`pnpm push:keys` 로 생성) | 알림 토글 "서버 미설정" |
| `CRON_SECRET` | `/api/push/cron` 보호(vercel.json 09:00 KST) | 크론 거부 |
| `COUPANG_PARTNERS_URL` · `AFFILIATE_URL_<MERCHANT_ID>` | 쇼핑 아웃링크(없으면 쇼핑몰 홈) | 수익 없이 방문 적립만 |
| `SPOT_SECRET` | 틀린그림 토큰 키(미설정 시 ADMIN_KEY 사용) | — |
| `MISSION_PARTNER_URL` | 캐치미션 앱 참여 링크(예: `https://<캐치미션 도메인>/m`). 앱이 `?uid=<유저 id>&mid=<미션 id>` 를 붙여 연다 | 플레이스 방문하기 탭의 참여 버튼이 "미리보기" 안내 |
| `POSTBACK_SECRET` | 캐치미션 서버 → `POST /api/postback/mission` 인증(Bearer 또는 `?key=`) | 포스트백 503(적립 안 됨) |
| `CCR_DEV_TOOLS` | **배포에 절대 넣지 말 것**(개발 전용 API·무키 관리자 오픈) | — |

## 2. 배포 후 1회
1. `/admin/db` → "스키마 적용 + 시드" 버튼 1회(idempotent). 상태가 "연결됨"인지 확인.
2. `/admin/roulette` 확률·`/admin/quizzes` 세트 활성 확인, `/admin/stores` 에 매장 미션 등록.
3. 폰에서 `/` 열어 가입 보너스 → 퀴즈 1세트 → 보상 오버레이 → 지갑 잔액 확인.
4. Vercel Deployment Protection 이 꺼져 있는지(외부 유입) 확인.

## 2-1. 캐치미션 포스트백 연동(미션 서버 쪽 설정)
- 성공 콜백: `POST https://<도메인>/api/postback/mission` (JSON/form, 또는 GET 쿼리) · 헤더 `Authorization: Bearer <POSTBACK_SECRET>`
- 파라미터: `uid`(참여 링크의 uid 그대로 = 유저 id) · `mid`(미션 id) · `tx`(미션 서버의 결과 고유값, 멱등 키) · `points`(선택, 미션 보상 이하만 인정)
- 미션 id: `nav_capture` 길찾고 캡처하기 8P · `phone_quiz` 전화번호 퀴즈 8P · `landmark_quiz` 명소 찾기 퀴즈 8P · `steps_find` 걸음 수 찾기 8P · `walk_distance` 도보 거리 입력하기 8P · `parking_find` 주차장 찾기 8P · `ai_quiz` AI 추천 퀴즈 8P · `tag_find` 상품 태그 찾기 7P (일 60회, 태그는 120회)
- 응답: 201 `{ok:true, points, balance}` · 같은 tx 재전송 200 `{duplicate:true}` · 한도 초과 409 · 유저/미션 없음 404 · 키 불일치 401
- 적립 = 원장 reason `mission`(refType `catchmission`) + 룰렛 스탬프 1개. 내역·관리자 유저 360 에서 "캐치미션 · <미션명>" 으로 보임.

## 3. 아직 연결 안 된 것(제휴사 계정 필요)
- 게임적립(오퍼월 SDK) · 설문(CPX Research 등록) · 초간단적립 → 현재 `/game` `/cpq` `/survey` 는 "제휴사 연동 준비 중" 안내. 원본 복제 코드는 `app/_replica/` 에 보관(라우팅 안 됨).
- 기프티콘 발송은 `/admin/redemptions` 에서 수동 처리(영업일 3일 안내).

## 4. 광고 랜딩 권장
- 랜딩 = `/` (첫 방문 가입 보너스 300P 시트 → 3일 혜택). UTM 은 그대로 통과.
- 친구초대 링크 `/invite?code=XXXXXXXX` 도 랜딩 가능.
