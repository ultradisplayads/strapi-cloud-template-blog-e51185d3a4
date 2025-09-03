#!/bin/bash

# Start the news scheduler in the background
# This script ensures the scheduler runs persistently

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_DIR/logs/scheduler.log"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

echo "🚀 Starting news scheduler..."
echo "📁 Project directory: $PROJECT_DIR"
echo "📝 Log file: $LOG_FILE"

# Kill any existing scheduler processes
pkill -f "alternative-scheduler" 2>/dev/null || true

# Start the scheduler in the background with logging
cd "$PROJECT_DIR"
nohup node scripts/alternative-scheduler.js >> "$LOG_FILE" 2>&1 &

SCHEDULER_PID=$!
echo "✅ News scheduler started with PID: $SCHEDULER_PID"
echo "📊 To monitor: tail -f $LOG_FILE"
echo "🛑 To stop: pkill -f 'alternative-scheduler'"

# Save PID for easy stopping
echo $SCHEDULER_PID > "$PROJECT_DIR/scheduler.pid"
