#!/bin/bash
echo "Starting Terabithia Autonomous Harvest Node..."
npx tsx facilitator.ts &
npx tsx server.ts &
npx tsx sweeper.ts &
echo "All daemons active in background."
