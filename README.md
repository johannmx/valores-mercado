# valores-mercado

Script Bash para envío de valores, a un canal de Telegram, del Peso Argentina con respecto al Dolar, Venezuela, y BitCoin mediante APIs públicas robustas.

## Características
- **Argentina:** Dólar Oficial, Blue y Tarjeta (vía [DolarApi](https://dolarapi.com)).
- **Venezuela:** Dólar Paralelo (Promedio) (vía [VE DolarApi](https://ve.dolarapi.com)).
- **BitCoin:** Precio en USD en tiempo real (vía [Binance API](https://binance.com)).
- **Cálculo de Tasa:** Conversión automática entre Dólar Blue AR y Paralelo VE (Tasa Remesa).
- **Notificaciones:** Mensajes con formato HTML y emojis en Telegram.
- **Robustez:** Reintentos automáticos, timeouts y manejo de errores.
- **Logs:** Registro detallado en `MercadoNotificationsLog.txt`.

## Requisitos
- Bash
- `curl`
- `jq` (Procesador de JSON)
- Telegram Bot (creado vía [@BotFather](https://t.me/botfather))

## Configuración
Edita el archivo `config.sh` con tus credenciales:
```bash
BOT_TOKEN="TU_BOT_TOKEN"    # Token de Telegram
CHAT_ID="TU_CHAT_ID"        # ID del chat/grupo
MAX_RETRIES=3               # Reintentos de API
RETRY_DELAY=5               # Segundos entre reintentos
USE_EMOJIS=true             # Activar/Desactivar emojis
```

## Modos de Ejecución

### 1. Ejecución Manual
```bash
chmod +x dolar_telegram_notification.sh
./dolar_telegram_notification.sh
```

### 2. Modo "En Vivo" (Loop Continuo)
Ideal para servidores que no usan Cron. Ejecuta el script cada 5 minutos:
```bash
chmod +x live.sh
./live.sh
# O en segundo plano (daemon):
nohup ./live.sh > /dev/null 2>&1 &
```

### 3. Automatización con Cron (Recomendado)
Para enviar actualizaciones cada hora:
1. Abre tu crontab: `crontab -e`
2. Añade la línea (ajusta la ruta completa):
   ```bash
   0 * * * * /ruta/al/proyecto/dolar_telegram_notification.sh
   ```

## APIs Utilizadas
- **Argentina/Venezuela:** [DolarApi.com](https://dolarapi.com) (Pública y Estable).
- **Crypto:** [Binance Public API](https://api.binance.com).

## Logs
Los eventos se guardan en `MercadoNotificationsLog.txt` con marcas de tiempo para auditoría.
