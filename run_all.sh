#!/bin/bash
export PATH="$PATH:/usr/local/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -n 1)/bin"
cd "$HOME/terabithia-agent"

echo "[$(date)] Launching Full Terabithia Quad-Mesh Engine..."

# Kill previous instances cleanly
pkill -f "tsx server.ts" 2>/dev/null
pkill -f "tsx facilitator.ts" 2>/dev/null
pkill -f "tsx sweeper.ts" 2>/dev/null
pkill -f "tsx store_server.ts" 2>/dev/null
sleep 2

# Launch all 4 daemons in parallel
npx tsx facilitator.ts >> logs/facilitator.log 2>&1 &
npx tsx server.ts >> logs/server.log 2>&1 &
npx tsx sweeper.ts >> logs/sweeper.log 2>&1 &
npx tsx store_server.ts >> logs/store.log 2>&1 &

wait -n
exit 1
