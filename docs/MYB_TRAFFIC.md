# 마이비 HTTP 캡처 분석 — 어디로 쏘고, 광고 지면은 누가 주나 (2026-10-28)

캡처 2건 기준: ① 2026-10-25 iOS 프록시(929 flow) ② 2026-10-28 09:14(`2026_10_28__09_14_56`, 148MB, 2,554 요청·2,279 응답, 호스트 180여 개).
개인 식별값(Bearer 토큰·IDFA·IDFV·Slack 토큰)은 캡처에 그대로 들어 있으므로 **파일 자체는 리포 밖 스크래치에만** 둔다.

## 1. 구조 한 줄 요약
```
MyB 앱(Flutter 네이티브)
 ├─ api-gateway.myb.im  /v1/api/*      ← 자체 백엔드 1개(포인트·미션·세그먼트·오퍼 목록). Authorization: Bearer <JWT HS256>
 ├─ 웹뷰 10개(/home/webview-url 가 URL 배포, 전부 *.myb.im React 번들, ?v=번들버전&gv=앱버전)
 │    benefit-hub(혜택) · shop(쇼핑 CPS) · survey(설문 CPX) · adjoe(게임) · reward-event(초간단 CPQ)
 │    bpointrush-event(러쉬) · bplay · monthly-mission · ad-free-pass(프리패스) · myb.plam.kr(음악) · live-shopping · audience-offer · banner
 └─ 네이티브 광고 SDK 5종: AdPopcorn(igaworks) · AppLovin MAX · AdMob · Buzzvil · adjoe  + 분석 Airbridge/Firebase/Flarelane(푸시)
```
즉 **지면(어디에 광고를 보여줄지)은 MyB 백엔드가 `user/me.adPlacementData` 로 내려주고, 광고 자체는 각 SDK/오퍼월 네트워크가 채운다.**

## 2. 광고 지면 → 공급자 매핑 (`GET /v1/api/user/me` → `adPlacementData.ios|android`, 37개 지면)
| 지면 키 | 쓰임 | 공급자 | 형식 |
|---|---|---|---|
| creditCharge, creditStationCreditChargeShort/Long/Long2/Long3 | 꿀(크레딧) 충전소 — 광고 보고 꿀 | **adpopcorn** | iv(인터스티셜 비디오)·rv(리워드 비디오)·i(인터스티셜) |
| attendance, attendanceCredit | 출석체크 전후 광고 | adpopcorn | iv + i |
| eventReward, quizJoin, quizBasicReward, quizAnswerReveal | 퀴즈 참여/보상/정답 공개 시 광고 | adpopcorn | rv/iv + i |
| creditStationLottery, creditStationRSP | 복권·가위바위보 미니게임 광고 | adpopcorn | iv + i |
| pedometerRewardStep1~10 | 만보기 걸음 보상 10단계마다 광고 | adpopcorn | rv/iv + i |
| bplayBetHint/BetChange/TreasureMileage/LottoShort/LottoLong, bpointRushRoulette, honeyRoadShort, homeMenuVideo, homeAdPopup | 비플레이·러쉬 룰렛·홈 팝업 | adpopcorn | rv/iv + i |
| techlabsBannerA1/A2/B | 배너 지면 | **admob** | b(배너) |
| techlabsFortune, offerwallDummy | 운세·오퍼월 더미 | (빈 값) | — |
| houseAdPlacementData | 하우스 배너(뱅크샐러드 잠자는 돈, houseAdRatio 100) | 자체 | 이미지+링크 |

- 지면 id 는 AdPopcorn 콘솔 발급 placement id(15자). AdPopcorn SSP 초기화: `POST sspi.adpopcorn.com/v2_sdk/init`(app_key 705699631, sdk 3.3.2in) → `/v2_sdk/rev1/schedule|interstitial|banner` 로 광고 스케줄 수신. `applovin_installed:true` 로 **AdPopcorn 이 AppLovin MAX 를 하위 미디에이션으로 사용**.
- AppLovin MAX: `ms.applovin.com/5.0/i`(초기화, SDK key `578efbfe…`), `rt.applovin.com/4.0/pix`(픽셀), `prod-mediate-events.applovin.com/1.0/event/{load,serr,mimp,mclk}`. 미디에이션 네트워크 트래픽: Moloco(`sdkopmetrics-asia.dsp-api.moloco.com`, mediator:MAX), Pangle/TikTok(`api16-access-wf-sg.pangle.io`, `v16-ad.byteoversea.com`), Unity Ads(`i-sdk.mediation.unity3d.com`, `ae.iads.unity3d.com`), Inner-Active(`cdn2.inner-active.mobi`), AdMob(`googleads.g.doubleclick.net`, `odf.app-ads-services.com`), Axon(AppLovin 플레이어블 `prod-e.axon.ai`), igaworks(응답에 networkName "igaworks").
- 결론: **비디오·인터스티셜 전부 = AdPopcorn(1차) → AppLovin MAX → Moloco/Pangle/Unity/AdMob 등(2차)**. 배너만 AdMob 직접.

## 3. 오퍼월·미션 공급자 (혜택 탭 콘텐츠, `user-segment/me.benefitTabContents` 가 노출 순서 결정: adjoe, cpx, cpa, high-reward, offerwall, cps, cpq, music)
| 혜택 | 웹뷰 | 공급자 | 호출 |
|---|---|---|---|
| 게임하고 적립 | adjoe.myb.im | **adjoe**(독일 플레이타임 SDK) | 네이티브 `att.prod.adjoe.zone/v1/sdk/ios/init`, 캠페인 아이콘 `/v1/campaign-view/...`, 부정행위 체크 `/v1/fraud-event/{vpn-check(132회),app-integrity,dns-check,runtime-hook-detection,metrics}`. 추천 목록은 백엔드 `game-recommendations/benefit|game-bridge|detail`(campaignUUID+appId → `ADJOE_SHOW_APP_DETAILS` 네이티브 액션) |
| 설문 보상 | survey.myb.im | **CPX Research**(app_id 27598, ext_user_id = MyB userId) | `/v1/api/cpx` → 302 → `offers.cpx-research.com` → `live-api.cpx-research.com/api/get-surveys.php`, 클릭은 백엔드 `POST /v1/api/cpx/click {surveyId, landingUrl}` 기록 후 `click.cpx-research.com` → 설문 공급자 체인: Toluna(`ups.surveyrouter.com`·`quicksurveys.com`·`ttm.toluna.com`), PrimeOpinion(`r.cpxsurveys.com`·`cls-fra.primeopinion.com`), Insights Today(`surveys.insights-today.com`, 봇 검출 verisoul.ai), MakeOpinion. 완료 포스트백 `redirect.cpx-research.com/tracker/redirect.php?…reward=` |
| 간편 보상(오퍼월) | 네이티브 SDK | **AdPopcorn Offerwall**(mediakey 708282349, sdk 5.1.1in) | `offerwall.adpopcorn.com/SDK/list?mediakey=…`, `apapi.adpopcorn.com/ap/v3/sdk/media/{area,config,tabInfo}`, 행동 로그 `/ap/v2/sdk/behavior/action`, 캠페인 이미지 `static.adbrix.igaworks.com/adpopcorn/...`, 쇼핑 CPS 서브 `cps.mallpie.kr/api/v1/list/adpopcornof` |
| 포인트허브(게임·콘텐츠) | pointhub.buzzvil.com | **Buzzvil BuzzBenefit**(app_id 518336704009977, unit 30083739019919) | `api.buzzvil.com/buzzbenefit/api/v3/ads`, 노출 `atr.buzzvil.com/api/impression`(109회), 미니게임 에셋 `www.s.gfactory.ai`(핀볼·룰렛·테트라팝), 쇼핑 `shopping-reward.s3`, 광고주 이미지 `d3aulf22blzf9p.cloudfront.net` |
| 초간단 적립(CPQ 퀴즈·플레이스 저장/검색) | reward-event.myb.im | 백엔드 `event/cpq-list`(provider: **greenp 12 · ohc(ohpoint) 6 · tns(1self/rewardofferwall) 2**) | 참여 링크 `baseURL`: `api.greenp.kr`, `w6.ohpoint.co.kr`, `1self.rewardofferwall.com/?codes=NAVER_SHOPPING_ANSWER_01,NAVER_PLACE_TRAFFIC_01&appKey=…&userId=…`. 보상 확인 `POST /v1/api/event/cpq/reward-amount {startTime,endTime}`. 광고주 랜딩: conet.co.kr, aline-soft.kr, easyalba, autoring, snskeep, tip-box, daily-place, superap, logiclab-offerwall, smaad(`tr.smaad.net/redirect?zo=…&ad=…&u=userId`) |
| 고보상·CPA(팔로우/구독/가입) | benefit-hub 안 | 백엔드 `native-easy/recommend|high-reward`(광고주 이미지 `d3aulf22blzf9p.cloudfront.net`, 일부 greenp) | 참여 `POST /v1/api/native-easy/participate {nativeEventId}`, 누적 미션 `native-easy/high-reward/mission {currentPoint, goalPoint 1000, rewardPoint 100}` |
| 쇼핑 적립(CPS) | shop.myb.im | 백엔드 `cps/merchants`(쿠팡 pincrux, 네이버 adbc, 그 외 ADISON) | `cps/merchants/:id/click-url` → `api-ao.adison.co`(pub_int_code ohc_kr) / `tr.smaad.net` / `cf.smaad.net`, 추적 `api.x.adison.co/u/offers/:id/tracking?uid=…&advertising_id=IDFA&sub1=…` |
| 퀴즈 광고(취향 퀴즈 자체) | 네이티브 | 백엔드 `myb-quiz/:id`, `/offer`, `/stats`, `POST /landing-url` | 퀴즈 정답 뒤 광고주 랜딩 = `tr.smaad.net/redirect?zo=746446406&ad=…`(smaad = 광고주 트래킹) |
| 음악 | myb.plam.kr | PLAM(oneselfworld 채널) | `adUserId=userId&subpId=myb` |
| 라이브쇼핑 | live-shopping.myb.im | 백엔드 `live-shopping/main`(G마켓 라이브) | 이번 캡처엔 빈 목록 |
| 프리패스(광고 스킵권) | ad-free-pass.myb.im | 백엔드 `ad-skip-pass/me/v2` | adjoe·cpx 각각 isTarget/canClaim/remainingCount + 웹뷰 URL |

## 4. 추적·분석·푸시
- Airbridge(`event-track.airbridge.io/v2/apps/myb`, 설치 귀속 `attribution-track.airbridge.io`), AppsFlyer(`app.appsflyer.com`, `impression.appsflyer.com` — 광고주 측 SDK로 추정), Adjust(`view.adjust.com`, 광고주 랜딩), Firebase/Crashlytics/GA(`app-analytics-services(-att).com`, `firebaselogging-pa`, `crashlyticsreports-pa`), Flarelane(푸시/인앱 메시지 `service-api.flarelane.com/internal/v1/projects/5a2dc6d4…/devices/:id`, notificationPermission·lastActiveAt 동기화).
- 사용자 행동 로그는 자체 `POST /v1/api/user/action-logs {os, action: "CPX_COUNT", category: "click_benefit_specialmission", …}` (30회+) — 세그먼트(BEGINNER 등) 산정 원천.
- Slack(`slack.com/api/*`, `edgeapi.slack.com`)과 뱅크샐러드 트래픽은 캡처 중 열린 다른 앱/하우스 배너 랜딩이라 MyB 와 무관.

## 5. 우리가 붙일 때의 함의
1. **리워드 비디오·인터스티셜**: AdPopcorn(igaworks) 미디어 등록 → placement 발급 → 우리 `adPlacementData` 같은 표를 서버에 두고 화면 키로 조회. 웹에서는 AdPopcorn 웹 SDK 가 없으므로 1차는 **AdMob 웹 리워드(H5 Games Ads)** 또는 **PWA→앱 래핑 후 SDK**. 꿀 충전·출석·퀴즈 보상·만보기 단계가 지면 후보(우리 코드의 `/api/honey` 모의 광고 자리).
2. **오퍼월**: AdPopcorn Offerwall 은 웹뷰 URL(`offerwall.adpopcorn.com/SDK/list?mediakey=…&usn=userId`) 로 바로 열 수 있어 **웹앱에서도 연동 가능**(mediakey + usn + 서버 포스트백). Buzzvil BuzzBenefit 포인트허브도 웹뷰(`pointhub.buzzvil.com/buzzbenefit/<app_id>?p=<base64 사용자정보>`). 둘 다 우리 `POST /api/postback/*` 패턴으로 적립.
3. **설문**: CPX Research 는 `offers.cpx-research.com/index.php?app_id=&ext_user_id=&secure_hash=` 웹 오퍼월 + 서버 포스트백. 우리 `/survey` 목업을 이 URL 로 교체하면 끝.
4. **게임(adjoe)**: 네이티브 SDK 전용(iOS/Android) → 웹앱 단계에선 불가. 대안: AdPopcorn 오퍼월의 CPI 캠페인, Buzzvil, 또는 TNK/greenp CPI.
5. **CPQ/플레이스 미션**: greenp(`api.greenp.kr`)·ohpoint·1self(rewardofferwall) 모두 **URL 파라미터(appKey, userId)로 여는 웹 오퍼월 + 포스트백** → 우리 캐치미션 포스트백 구조와 동일. 1self 의 `NAVER_PLACE_TRAFFIC_01` 코드는 네이버 플레이스 트래픽 미션(= 캐치랭크와 같은 시장).
6. **쇼핑 CPS**: ADISON(ohc_kr)·pincrux(쿠팡)·adbc(네이버)·smaad 트래킹 링크 — 제휴사 계약 후 `click-url` 발급. 우리 `/api/shop/out` 가 그 자리.
