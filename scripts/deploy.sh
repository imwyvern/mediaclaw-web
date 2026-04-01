#!/bin/bash
set -euo pipefail

SERVER="root@8.129.133.52"
REMOTE_DIR="/opt/mediaclaw/web-next"

echo "Building..."
cd "$(dirname "$0")/.."
npm run build

echo "Deploying .next/ to $SERVER..."
rsync -az --delete .next/ "$SERVER:$REMOTE_DIR/.next/"

echo "Copying static to standalone..."
ssh "$SERVER" "cp -r $REMOTE_DIR/.next/static $REMOTE_DIR/.next/standalone/.next/static"

echo "Restarting PM2..."
ssh "$SERVER" "pm2 restart mediaclaw-web"

echo "Waiting for startup..."
sleep 5

echo "Verifying..."
ssh "$SERVER" 'curl -s http://127.0.0.1:3001/ | grep -o "/_next/static/[^\"]*\.css" | sort -u | while read f; do echo -n "$f → "; curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3001$f"; echo; done'
echo "Done!"
