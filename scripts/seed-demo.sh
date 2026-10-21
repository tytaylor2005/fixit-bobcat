#!/usr/bin/env bash
# Seed demo reports through the REAL pipeline: S3 upload -> analyze Lambda (Bedrock) -> createReport.
# Usage: bash scripts/seed-demo.sh   (needs `aws login` creds + amplify_outputs.json)
set -euo pipefail
cd "$(dirname "$0")/.."
BUCKET=$(python3 -c "import json; print(json.load(open('amplify_outputs.json'))['storage']['bucket_name'])")
URL=$(python3 -c "import json; print(json.load(open('amplify_outputs.json'))['data']['url'])")
KEY=$(python3 -c "import json; print(json.load(open('amplify_outputs.json'))['data']['api_key'])")
OUT=/tmp/claude-501/seed-render; mkdir -p "$OUT"

seed() { # name building
  local name=$1 building=$2 svg="scripts/seed-images/$1.svg"
  rm -f "$OUT/$name.svg.png" "$OUT/$name.jpg"
  cp "$svg" "$OUT/$name.svg" && (cd "$OUT" && qlmanage -t -s 800 -o . "$name.svg" >/dev/null 2>&1)
  sips -s format jpeg "$OUT/$name.svg.png" --out "$OUT/$name.jpg" >/dev/null
  local key="photos/seed-$(date +%s)-$name.jpg"
  aws s3 cp "$OUT/$name.jpg" "s3://$BUCKET/$key" --content-type image/jpeg --only-show-errors
  local q; q=$(python3 -c "import json,sys; print(json.dumps({'query':'query A(\$k:String!,\$b:String){ analyze(photoKey:\$k, building:\$b){ category title description impact impactScore severity action estimatedCost } }','variables':{'k':sys.argv[1],'b':sys.argv[2]}}))" "$key" "$building")
  local res; res=$(curl -s "$URL" -H "Content-Type: application/json" -H "x-api-key: $KEY" --data "$q")
  echo "analyze[$name]: $(echo "$res" | cut -c1-220)"
  python3 - "$res" "$key" "$building" "$URL" "$KEY" <<'PY'
import json, sys, urllib.request
res, key, building, url, api = sys.argv[1:]
a = json.loads(res)['data']['analyze']
inp = {k: a[k] for k in ('category','title','description','impact','impactScore','severity','action','estimatedCost') if a.get(k) is not None}
inp.update({'photoKey': key, 'building': building, 'status': 'OPEN'})
q = {'query': 'mutation C($i: CreateReportInput!){ createReport(input:$i){ id title category } }', 'variables': {'i': inp}}
req = urllib.request.Request(url, data=json.dumps(q).encode(), headers={'Content-Type':'application/json','x-api-key':api})
print('create ->', json.load(urllib.request.urlopen(req)))
PY
}

seed lights    "Arts & Sciences"
seed recycling "Ina Dillard Russell Library"
seed fountain  "Wells Hall"
seed door      "Wellness & Recreation Center"
echo "SEED DONE"
