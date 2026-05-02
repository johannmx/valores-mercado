#!/bin/bash

# ==============================================================================
# Script: Mercado Notifications
# Description: Sends currency and crypto rates to Telegram
# Author: Gemini CLI (Refactored)
# ==============================================================================

# Configuration
CONFIG_FILE="config.sh"
LOG_FILE="MercadoNotificationsLog.txt"

# Default configuration (will be overridden by config.sh if it exists)
BOT_TOKEN="YOUR_BOT_TOKEN"
CHAT_ID="YOUR_CHAT_ID"
MAX_RETRIES=3
RETRY_DELAY=5
USE_EMOJIS=true
SHOW_TIMESTAMP=true

# Load configuration
if [[ -f "$CONFIG_FILE" ]]; then
    source "$CONFIG_FILE"
else
    echo "Warning: $CONFIG_FILE not found, using default values."
fi

# Logging function
log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $1" | tee -a "$LOG_FILE"
}

# Error handling function
handle_error() {
    log "ERROR: $1"
    # Optional: Send error to Telegram if BOT_TOKEN is set
    # exit 1 # Don't necessarily exit if one API fails? 
    # Actually, for this script, we might want to continue with other values.
}

# Function to make API calls with retry mechanism
fetch_data() {
    local url=$1
    local jq_filter=$2
    local label=$3
    local retry_count=0
    local result

    while [[ $retry_count -lt $MAX_RETRIES ]]; do
        result=$(curl -s --connect-timeout 10 "$url" | jq -r "$jq_filter" 2>/dev/null)
        if [[ $? -eq 0 ]] && [[ -n "$result" ]] && [[ "$result" != "null" ]]; then
            echo "$result"
            return 0
        fi
        retry_count=$((retry_count + 1))
        log "Retry $retry_count/$MAX_RETRIES for $label: $url"
        sleep "$RETRY_DELAY"
    done
    handle_error "Failed to fetch $label from $url"
    return 1
}

# Start execution
log "Starting market data update..."

# Fetch values from new reliable APIs (DolarApi and Binance)
AR_OFICIAL=$(fetch_data 'https://dolarapi.com/v1/dolares/oficial' '.venta' "Argentina Oficial")
AR_BLUE=$(fetch_data 'https://dolarapi.com/v1/dolares/blue' '.venta' "Argentina Blue")
AR_TARJETA=$(fetch_data 'https://dolarapi.com/v1/dolares/tarjeta' '.venta' "Argentina Tarjeta")
VE_PARALELO=$(fetch_data 'https://ve.dolarapi.com/v1/dolares/paralelo' '.promedio' "Venezuela Paralelo")
BTC_USD=$(fetch_data 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT' '.price' "Bitcoin USD")

# Data Validation & Defaults
AR_OFICIAL=${AR_OFICIAL:-"N/A"}
AR_BLUE=${AR_BLUE:-"N/A"}
AR_TARJETA=${AR_TARJETA:-"N/A"}
VE_PARALELO=${VE_PARALELO:-"N/A"}

# Calculate Tasa Pesos -> Bolivares (Parallel VE / Blue AR)
if [[ "$VE_PARALELO" != "N/A" ]] && [[ "$AR_BLUE" != "N/A" ]]; then
    TASA_REMESA=$(echo "$VE_PARALELO $AR_BLUE" | awk '{printf "%.2f", $1/$2}')
else
    TASA_REMESA="N/A"
fi

# Format Bitcoin (Remove excess decimals)
if [[ "$BTC_USD" != "null" ]] && [[ -n "$BTC_USD" ]]; then
    BTC_USD_FORMATTED=$(printf "%.2f" "$BTC_USD")
else
    BTC_USD_FORMATTED="N/A"
fi

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Emojis
FLAG_AR=$([[ "$USE_EMOJIS" == true ]] && echo -e '\U0001f1e6\U0001f1f7' || echo "[AR]")
FLAG_VE=$([[ "$USE_EMOJIS" == true ]] && echo -e '\U0001f1fb\U0001f1ea' || echo "[VE]")
EMOJI_BTC=$([[ "$USE_EMOJIS" == true ]] && echo -e '\U0001f4b1' || echo "[BTC]")
EMOJI_CLOCK=$([[ "$USE_EMOJIS" == true ]] && echo -e '\U0001f550' || echo "[TIME]")
EMOJI_MONEY=$([[ "$USE_EMOJIS" == true ]] && echo -e '\U0001f4b5' || echo "[S]")

# Compose Message (HTML mode)
MSG="<b>${EMOJI_CLOCK} Actualización: ${TIMESTAMP}</b>%0A%0A"
MSG+="<b>${FLAG_AR} Argentina (Dólar):</b>%0A"
MSG+="├ Oficial: ${AR_OFICIAL}%0A"
MSG+="├ Blue: ${AR_BLUE}%0A"
MSG+="└ Tarjeta: ${AR_TARJETA}%0A%0A"

MSG+="<b>${FLAG_VE} Venezuela (Dólar):</b>%0A"
MSG+="└ Paralelo: ${VE_PARALELO}%0A%0A"

MSG+="<b>${FLAG_AR}${FLAG_VE} Tasa de Cambio:</b>%0A"
MSG+="└ 1 ARS Blue = ${TASA_REMESA} VES%0A%0A"

MSG+="<b>${EMOJI_BTC} Crypto:</b>%0A"
MSG+="└ Bitcoin: ${BTC_USD_FORMATTED} USD"

# Check if we have at least some data to send
if [[ "$AR_BLUE" == "N/A" ]] && [[ "$VE_PARALELO" == "N/A" ]]; then
    log "Critical data missing. Skipping Telegram notification."
    exit 1
fi

# Send to Telegram
log "Sending notification to Telegram..."

RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    --data-urlencode "chat_id=${CHAT_ID}" \
    --data-urlencode "text=${MSG}" \
    --data-urlencode "parse_mode=HTML")

if echo "$RESPONSE" | grep -q '"ok":true'; then
    log "Notification sent successfully."
else
    log "Failed to send notification. Response: $RESPONSE"
    exit 1
fi

log "Process completed successfully."
