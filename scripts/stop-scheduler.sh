#!/bin/bash

# Stop the news scheduler

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$PROJECT_DIR/scheduler.pid"

echo "🛑 Stopping news scheduler..."

# Kill scheduler processes
pkill -f "alternative-scheduler" 2>/dev/null && echo "✅ Scheduler processes stopped" || echo "ℹ️  No scheduler processes found"

# Remove PID file
if [ -f "$PID_FILE" ]; then
    rm "$PID_FILE"
    echo "🗑️  Removed PID file"
fi

echo "✅ Scheduler stopped successfully"
