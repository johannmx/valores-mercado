# valores-mercado
Script Bash para envío de valores, a un canal de Telegram, del Peso Argentina con respecto al Dolar, Venezuela, y BitCoin mediante APIs públicas.

## Características
- Monitoreo de valores del dólar en Argentina (Solidario, Blue, Oficial)
- Monitoreo del dólar paralelo en Venezuela
- Monitoreo del valor del Bitcoin
- Cálculo automático de tasas de cambio
- Notificaciones automáticas vía Telegram
- Sistema de reintentos para llamadas API
- Sistema de logging con timestamps
- Configuración flexible mediante archivo externo

## Requisitos
- Bash
- curl
- jq (para procesamiento de JSON)
- Telegram Bot (creado mediante BotFather)

## Configuración
1. Crear un bot en Telegram usando BotFather
2. Editar el archivo `config.sh` con los siguientes valores:
   ```bash
   BOT_TOKEN="YOUR_BOT_TOKEN"    # Token del bot de Telegram
   CHAT_ID="YOUR_CHAT_ID"        # ID del chat/canal/grupo
   MAX_RETRIES=3                 # Número de reintentos para llamadas API
   RETRY_DELAY=5                 # Tiempo de espera entre reintentos (segundos)
   USE_EMOJIS=true              # Habilitar/deshabilitar emojis
   SHOW_TIMESTAMP=true          # Mostrar timestamp en mensajes
   ```

## Variables
### Configuración
- `BOT_TOKEN`: Token del bot de Telegram (obtenido de BotFather)
- `CHAT_ID`: ID del chat, grupo o canal para recepción de mensajes
- `MAX_RETRIES`: Número máximo de reintentos para llamadas API
- `RETRY_DELAY`: Tiempo de espera entre reintentos
- `USE_EMOJIS`: Control de uso de emojis en mensajes
- `SHOW_TIMESTAMP`: Control de visualización de timestamp

### Valores de Mercado
- `ARdolarS`: Valor del dólar solidario (Argentina)
- `ARdolarB`: Valor del dólar blue/paralelo (Argentina)
- `ARdolarO`: Valor del dólar oficial (BCRA, Argentina)
- `VEdolarpV`: Valor del dólar paralelo (Venezuela)
- `TasaPesosRemesa`: Tasa de cambio calculada entre Venezuela y Argentina
- `bitcoin`: Valor actual del Bitcoin en USD

## Uso
1. Dar permisos de ejecución:
   ```bash
   chmod +x dolar_telegram_notification.sh
   chmod +x config.sh
   ```

2. Ejecutar el script:
   ```bash
   ./dolar_telegram_notification.sh
   ```

## Logs
- Los logs se guardan en `MercadoNotificationsLog.txt`
- Incluyen timestamps y mensajes de estado
- Registran errores y reintentos de API

## APIs Utilizadas
- Argentina: Infobae (dólar solidario, blue, oficial)
- Venezuela: DolarToday (dólar paralelo)
- Bitcoin: Coindesk (precio en USD)

## Dependencias
### JQ
La información de las APIs públicas se procesa mediante la herramienta JQ para JSON.
Instalación:
- Ubuntu/Debian: `sudo apt-get install jq`
- CentOS/RHEL: `sudo yum install jq`
- macOS: `brew install jq`
- Windows: Descargar desde [stedolan.github.io/jq](https://stedolan.github.io/jq/download/)