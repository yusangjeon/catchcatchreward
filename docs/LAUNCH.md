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
| `CCR_DEV_TOOLS` | **배포에 절대 넣지 말 것**(개발 전용 API·무키 관리자 오픈) | — |

## 2. 배포 후 1회
1. `/admin/db` → "스키마 적용 + 시드" 버튼 1회(idempotent). 상태가 "연결됨"인지 확인.
2. `/admin/roulette` 확률·`/admin/quizzes` 세트 활성 확인, `/admin/stores` 에 매장 미션 등록.
3. 폰에서 `/` 열어 가입 보너스 → 퀴즈 1세트 → 보상 오버레이 → 지갑 잔액 확인.
4. Vercel Deployment Protection 이 꺼져 있는지(외부 유입) 확인.

## 3. 아직 연결 안 된 것(제휴사 계정 필요)
- 게임적립(오퍼월 SDK) · 설문(CPX Research 등록) · 초간단적립 → 현재 `/game` `/cpq` `/survey` 는 "제휴사 연동 준비 중" 안내. 원본 복제 코드는 `app/_replica/` 에 보관(라우팅 안 됨).
- 기프티콘 발송은 `/admin/redemptions` 에서 수동 처리(영업일 3일 안내).

## 4. 광고 랜딩 권장
- 랜딩 = `/` (첫 방문 가입 보너스 300P 시트 → 3일 혜택). UTM 은 그대로 통과.
- 친구초대 링크 `/invite?code=XXXXXXXX` 도 랜딩 가능.
