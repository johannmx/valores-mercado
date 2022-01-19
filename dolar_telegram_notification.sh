#!/bin/bash

# Bot token
BOT_TOKEN="YOUR_BOT_TOKEN"

# Your chat id
CHAT_ID="YOUR CHAT/CHANNEL/GROUP ID"

# Get variables from APIs

#API Argentina - Infobae
ARdolarS=$(curl -s 'https://static.coins.infobae.com/cotizacion-simple/dolar-libre-riesgo.json' | jq '.items[0].unico')
ARdolarB=$(curl -s 'https://static.coins.infobae.com/cotizacion-simple/dolar-libre-riesgo.json' | jq '.items[1].unico')
ARdolarO=$(curl -s 'https://static.coins.infobae.com/cotizacion-simple/dolar-libre-riesgo.json' | jq '.items[4].unico')

#API Venezuela - DolarToday
VEdolarpV=$(curl -s 'https://s3.amazonaws.com/dolartoday/data.json' | jq '.USD.transferencia')
TasaPesosRemesa=$(echo $VEdolarpV $ARdolarB | awk '{print $1/$2}')

#API Coindesk
bitcoin=$(curl -s 'https://api.coindesk.com/v1/bpi/currentprice.json' | jq --raw-output '.bpi.USD.rate')

# se crean variables para los mensajes a enviar por cada valor

#emojis de banderas paises
msgAR=$(echo -e '\U0001f1e6\U0001f1f7')
msgVE=$(echo -e '\U0001f1fb\U0001f1ea')
#emoji bitcoin
msgBT=$(echo -e '\U0001f4b1')

#mensaje
msgARdolarSoli="<strong>Argentina | Dolar Solidario:</strong>%0AValor: ${ARdolarS}%0A%0A"
msgARdolarBlue="<strong>Argentina | Dolar Blue:</strong>%0AValor: ${ARdolarB}%0A%0A"
msgARdolarOficial="<strong>Argentina | Dolar Oficial:</strong>%0AValor: ${ARdolarO}%0A%0A"
msgVEdolarToday="<strong>Venezuela | Dolar Paralelo:</strong>%0ATransferencia: ${VEdolarpV}%0A%0A"
msgARVEtasa="<strong>Tasa Promedio Pesos a BsF.:</strong>%0AValor: ${TasaPesosRemesa}%0A%0A"
msgBitcoin="<strong>BitCoin:</strong>%0AUSD: ${bitcoin}"

# Notification message
# If you need a line break, use "%0A" instead of "\n".

#con emojis
#MESSAGE="${msgAR} - ${msgARdolarSoli}${msgAR} - ${msgARdolarBlue}${msgAR} - ${msgARdolarOficial}${msgAR}${msgVE} - ${msgARVEtasa}${msgVE} - ${msgVEdolarToday}${msgBT} - ${msgBitcoin}"

#sin emojis
MESSAGE="${msgARdolarSoli} - ${msgARdolarBlue} - ${msgARdolarOficial} - ${msgARVEtasa} - ${msgVEdolarToday} - ${msgBitcoin}"

# Prepares the request payload
PAYLOAD="https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${MESSAGE}&parse_mode=HTML"

# Sends the notification to the telegram bot and save the response content into the notificationsLog.txt
curl -S -X POST "${PAYLOAD}" -w "\n\n" | tee -a MercadoNotificationsLog.txt

# Prints a info message in the console
echo "Information completed. Telegram notification sent."