#!/bin/bash

# ==============================================================================
# Script: Live Mercado Notifications (Daemon)
# Description: Runs the notification script in an infinite loop
# ==============================================================================

SCRIPT_PATH="./dolar_telegram_notification.sh"
INTERVAL=300 # 5 minutes in seconds

# Ensure the main script is executable
chmod +x "$SCRIPT_PATH"

echo "Starting Live Market Notifications (every $((INTERVAL/60)) minutes)..."
echo "Press [CTRL+C] to stop."

while true; do
    "$SCRIPT_PATH"
    echo "Waiting $INTERVAL seconds for the next update..."
    sleep "$INTERVAL"
done
