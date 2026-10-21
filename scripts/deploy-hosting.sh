#!/usr/bin/env bash
# Build the site and publish it to Amplify Hosting with a manual (zip) deployment.
# Needs: `aws login` credentials, the sandbox's amplify_outputs.json, and the app created once with:
#   aws amplify create-app --region us-east-2 --name fixit-bobcat --platform WEB \
#     --custom-rules '[{"source":"/<*>","target":"/index.html","status":"404-200"}]'
set -euo pipefail
cd "$(dirname "$0")/.."
R=us-east-2
APP_ID=$(aws amplify list-apps --region $R --query "apps[?name=='fixit-bobcat'].appId" --output text)
[ -n "$APP_ID" ] || { echo "Amplify app 'fixit-bobcat' not found in $R"; exit 1; }
aws amplify get-branch --region $R --app-id "$APP_ID" --branch-name main >/dev/null 2>&1 \
  || aws amplify create-branch --region $R --app-id "$APP_ID" --branch-name main --stage PRODUCTION >/dev/null
npm run build >/dev/null
mkdir -p dist/docs && cp docs/slide.html dist/docs/slide.html
rm -f site.zip && (cd dist && zip -qr ../site.zip .)
DEP=$(aws amplify create-deployment --region $R --app-id "$APP_ID" --branch-name main)
JOB=$(echo "$DEP" | python3 -c "import json,sys; print(json.load(sys.stdin)['jobId'])")
UPLOAD=$(echo "$DEP" | python3 -c "import json,sys; print(json.load(sys.stdin)['zipUploadUrl'])")
curl -sf -o /dev/null -X PUT -H "Content-Type: application/zip" --upload-file site.zip "$UPLOAD"
aws amplify start-deployment --region $R --app-id "$APP_ID" --branch-name main --job-id "$JOB" >/dev/null
for _ in $(seq 1 40); do
  ST=$(aws amplify get-job --region $R --app-id "$APP_ID" --branch-name main --job-id "$JOB" --query 'job.summary.status' --output text)
  [ "$ST" = "SUCCEED" ] && break
  [ "$ST" = "FAILED" ] && { echo "deployment FAILED"; exit 1; }
  sleep 5
done
echo "LIVE: https://main.$(aws amplify get-app --region $R --app-id "$APP_ID" --query 'app.defaultDomain' --output text)"
