#!/usr/bin/env bash
# Vercel REST API 로 프로젝트 생성 → ADMIN_KEY 설정 → 지정 브랜치를 프로덕션 배포.
# 필요: VERCEL_TOKEN(팀 전체 범위). 선택: VERCEL_TEAM_ID, ADMIN_KEY, BRANCH, PROJECT.
set -euo pipefail
: "${VERCEL_TOKEN:?VERCEL_TOKEN 이 필요합니다}"
PROJECT="${PROJECT:-catchcatchreward}"
REPO="${REPO:-yusangjeon/catchcatchreward}"
BRANCH="${BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"
API=https://api.vercel.com
H=(-H "Authorization: Bearer $VERCEL_TOKEN" -H "content-type: application/json")

if [ -z "${VERCEL_TEAM_ID:-}" ]; then
  VERCEL_TEAM_ID=$(curl -s "${H[@]}" "$API/v2/teams" | python3 -c 'import sys,json; t=json.load(sys.stdin).get("teams",[]); print(t[0]["id"] if t else "")')
fi
Q="${VERCEL_TEAM_ID:+?teamId=$VERCEL_TEAM_ID}"
echo "team=${VERCEL_TEAM_ID:-personal} project=$PROJECT branch=$BRANCH"

# 1) 프로젝트 (없으면 생성, GitHub 연결)
if ! curl -sf "${H[@]}" "$API/v9/projects/$PROJECT$Q" >/dev/null; then
  curl -sf "${H[@]}" -X POST "$API/v11/projects$Q" -d "{\"name\":\"$PROJECT\",\"framework\":\"nextjs\",\"gitRepository\":{\"type\":\"github\",\"repo\":\"$REPO\"}}" >/dev/null
  echo "프로젝트 생성 완료"
fi

# 2) ADMIN_KEY (없으면 생성해 출력)
ADMIN_KEY="${ADMIN_KEY:-$(python3 -c 'import secrets; print("ccr-"+secrets.token_urlsafe(9))')}"
ENVQ="${Q:+$Q&}"; ENVQ="${ENVQ:-?}"
curl -s "${H[@]}" -X POST "$API/v10/projects/$PROJECT/env${ENVQ}upsert=true" \
  -d "{\"key\":\"ADMIN_KEY\",\"value\":\"$ADMIN_KEY\",\"target\":[\"production\",\"preview\"],\"type\":\"encrypted\"}" >/dev/null
echo "ADMIN_KEY=$ADMIN_KEY"

# 3) 브랜치에서 프로덕션 배포
DEP=$(curl -sf "${H[@]}" -X POST "$API/v13/deployments$Q" \
  -d "{\"name\":\"$PROJECT\",\"project\":\"$PROJECT\",\"target\":\"production\",\"gitSource\":{\"type\":\"github\",\"org\":\"${REPO%/*}\",\"repo\":\"${REPO#*/}\",\"ref\":\"$BRANCH\"}}")
ID=$(echo "$DEP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["id"])')
echo "deployment=$ID"
for _ in $(seq 1 60); do
  sleep 10
  ST=$(curl -s "${H[@]}" "$API/v13/deployments/$ID$Q")
  STATE=$(echo "$ST" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("readyState"))')
  echo "  $STATE"
  [ "$STATE" = "READY" ] && { echo "$ST" | python3 -c 'import sys,json; d=json.load(sys.stdin); print("URL: https://"+d["url"]); [print("ALIAS: https://"+a) for a in d.get("alias",[])]'; exit 0; }
  [ "$STATE" = "ERROR" ] || [ "$STATE" = "CANCELED" ] && { echo "배포 실패: $STATE"; exit 1; }
done
echo "시간 초과"; exit 1
