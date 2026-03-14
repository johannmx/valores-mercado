# valores-mercado

Conjunto de herramientas para el monitoreo de divisas (Argentina y Venezuela) y criptomonedas (Bitcoin) en tiempo real, incluyendo scripts de automatización para Telegram y un Dashboard Web moderno dockerizado.

## 🚀 Características
- **Argentina:** Dólar Oficial, Blue, Tarjeta, MEP, CCL y Cripto (vía [DolarApi](https://dolarapi.com)).
- **Venezuela:** Dólar Paralelo (Promedio) (vía [VE DolarApi](https://ve.dolarapi.com)).
- **BitCoin:** Precio en USD en tiempo real (vía [Binance API](https://binance.com)).
- **Web Dashboard:** Interfaz moderna con React 19, TypeScript y Tailwind CSS.
- **Gráficos de Tendencias:** Visualización histórica de tasas con Recharts.
- **Conversor Inteligente:** Conversión bidireccional (USD, ARS, VES) integrada.
- **Notificaciones Telegram:** Script Bash con formato HTML y emojis.
- **Docker Ready:** Despliegue rápido de la plataforma web mediante Docker Compose.

---

## 💻 Dashboard Web (Docker)

El dashboard web ofrece una visualización completa de los mercados y una calculadora de divisas.

### Requisitos
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)

### Despliegue Rápido
1. En la raíz del proyecto, ejecuta:
   ```bash
   docker-compose up --build -d
   ```
2. Accede desde tu navegador a: `http://localhost`

### Estructura Técnica
- **Frontend (`/web/client`):** React 19 + Vite + Tailwind CSS + Recharts + Lucide Icons.
- **Backend (`/web/api`):** Node.js + Express + TSX (Proxy para evitar CORS y persistencia de historial).

---

## 🤖 Scripts de Telegram (Bash)

Ideal para servidores livianos o Raspberry Pi.

### Configuración
Edita `config.sh` con tus credenciales:
```bash
BOT_TOKEN="TU_BOT_TOKEN"    # Token de @BotFather
CHAT_ID="TU_CHAT_ID"        # ID del chat/grupo
```

### Modos de Ejecución
- **Manual:** `./dolar_telegram_notification.sh`
- **Modo "En Vivo":** `./live.sh` (Ejecución continua cada 5 min).
- **Cron:** Agrega `0 * * * * /ruta/al/script.sh` a tu crontab para actualizaciones cada hora.

---

## 📊 APIs Utilizadas
- **Mercado Cambiario:** [DolarApi.com](https://dolarapi.com) (Argentina y Venezuela).
- **Cripto:** [Binance Public API](https://api.binance.com).

## 📝 Logs
Todos los eventos de los scripts de Bash se registran en `MercadoNotificationsLog.txt` para auditoría y seguimiento de errores.
