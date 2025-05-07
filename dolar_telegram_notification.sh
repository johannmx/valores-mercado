#!/bin/bash

# Configuration
CONFIG_FILE="config.sh"
LOG_FILE="MercadoNotificationsLog.txt"

# Load configuration if exists
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    # Default configuration
    BOT_TOKEN="YOUR_BOT_TOKEN"
    CHAT_ID="YOUR CHAT/CHANNEL/GROUP ID"
    MAX_RETRIES=3
    RETRY_DELAY=5
fi

# Logging function
log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $1" | tee -a "$LOG_FILE"
}

# Error handling function
handle_error() {
    log "ERROR: $1"
    exit 1
}

# Function to make API calls with retry mechanism
make_api_call() {
    local url=$1
    local jq_filter=$2
    local retry_count=0
    local result

    while [ $retry_count -lt $MAX_RETRIES ]; do
        result=$(curl -s "$url" | jq "$jq_filter" 2>/dev/null)
        if [ $? -eq 0 ] && [ ! -z "$result" ]; then
            echo "$result"
            return 0
        fi
        retry_count=$((retry_count + 1))
        log "Retry $retry_count/$MAX_RETRIES for API call: $url"
        sleep $RETRY_DELAY
    done
    handle_error "Failed to fetch data from $url after $MAX_RETRIES attempts"
}

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Get variables from APIs with error handling
log "Fetching data from APIs..."

ARdolarS=$(make_api_call 'https://static.coins.infobae.com/cotizacion-simple/dolar-libre-riesgo.json' '.items[0].unico') || handle_error "Failed to get ARdolarS"
ARdolarB=$(make_api_call 'https://static.coins.infobae.com/cotizacion-simple/dolar-libre-riesgo.json' '.items[1].unico') || handle_error "Failed to get ARdolarB"
ARdolarO=$(make_api_call 'https://static.coins.infobae.com/cotizacion-simple/dolar-libre-riesgo.json' '.items[4].unico') || handle_error "Failed to get ARdolarO"
VEdolarpV=$(make_api_call 'https://s3.amazonaws.com/dolartoday/data.json' '.USD.transferencia') || handle_error "Failed to get VEdolarpV"
bitcoin=$(make_api_call 'https://api.coindesk.com/v1/bpi/currentprice.json' '.bpi.USD.rate') || handle_error "Failed to get bitcoin price"

# Calculate derived values
TasaPesosRemesa=$(echo "$VEdolarpV $ARdolarB" | awk '{printf "%.2f", $1/$2}')

# Emojis
msgAR=$(echo -e '\U0001f1e6\U0001f1f7')
msgVE=$(echo -e '\U0001f1fb\U0001f1ea')
msgBT=$(echo -e '\U0001f4b1')
msgClock=$(echo -e '\U0001f550')

# Format messages with HTML
msgHeader="<strong>${msgClock} Actualización: ${TIMESTAMP}</strong>%0A%0A"
msgARdolarSoli="<strong>${msgAR} Argentina | Dolar Solidario:</strong>%0AValor: ${ARdolarS}%0A%0A"
msgARdolarBlue="<strong>${msgAR} Argentina | Dolar Blue:</strong>%0AValor: ${ARdolarB}%0A%0A"
msgARdolarOficial="<strong>${msgAR} Argentina | Dolar Oficial:</strong>%0AValor: ${ARdolarO}%0A%0A"
msgVEdolarToday="<strong>${msgVE} Venezuela | Dolar Paralelo:</strong>%0ATransferencia: ${VEdolarpV}%0A%0A"
msgARVEtasa="<strong>${msgAR}${msgVE} Tasa Promedio Pesos a BsF.:</strong>%0AValor: ${TasaPesosRemesa}%0A%0A"
msgBitcoin="<strong>${msgBT} BitCoin:</strong>%0AUSD: ${bitcoin}"

# Compose final message
MESSAGE="${msgHeader}${msgARdolarSoli}${msgARdolarBlue}${msgARdolarOficial}${msgARVEtasa}${msgVEdolarToday}${msgBitcoin}"

# Send notification
log "Sending Telegram notification..."
PAYLOAD="https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${MESSAGE}&parse_mode=HTML"

if curl -S -X POST "${PAYLOAD}" > /dev/null 2>&1; then
    log "Notification sent successfully"
else
    handle_error "Failed to send Telegram notification"
fi

log "Script completed successfully"