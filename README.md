# 📈 MarketDash: Latinoamérica

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

Conjunto de herramientas profesionales para el monitoreo de divisas y criptomonedas en tiempo real, diseñado con una estética premium y enfocado en la precisión de datos de **Argentina, Venezuela, Uruguay, Chile y Brasil**.

---

## ✨ Características Principales

### 🇦🇷 Argentina (Full Markets)
- **Dólares:** Oficial, Blue, Tarjeta, MEP, CCL y Cripto.
- **Gráficos:** Historial de tendencia de 24 horas integrado.

### 🇻🇪 Venezuela
- **Dólar Paralelo:** Promedio actualizado en tiempo real.
- **Dólar Oficial:** Tasa oficial del BCV.

### 🌎 Latinoamérica (Países Vecinos)
- **Uruguay:** Peso Uruguayo (oficial).
- **Chile:** Peso Chileno (oficial).
- **Brasil:** Real Brasileño (oficial).

### 🚀 Herramientas Inteligentes
- **Conversor Multi-Divisa:** Cálculo bidireccional instantáneo entre USD, ARS, VES, UYU, CLP y BRL.
- **Refresh Inteligente:** Temporizador de actualización automática cada 5 minutos.
- **Modo Oscuro/Claro:** Soporte nativo para temas según preferencia del usuario o sistema.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19 + Vite + Tailwind CSS + Lucide Icons.
- **Visualización:** Recharts para gráficos de área minimalistas.
- **Backend:** Node.js + Express + Proxy API para evitar CORS y persistencia de datos.
- **Infraestructura:** Docker & Docker Compose para despliegue simplificado.

---

## 🚀 Despliegue con Docker

1. **Instalación:**
   ```bash
   docker-compose up --build -d
   ```
2. **Acceso:** Navega a `http://localhost`.

---

## 🤖 Scripts de Automatización (Telegram)

El repositorio incluye un motor de notificaciones en Bash ideal para servidores ligeros.

1. Configura `config.sh` con tu `BOT_TOKEN` y `CHAT_ID`.
2. Ejecuta `./live.sh` para alertas automáticas cada 5 minutos.

---

## 👤 Autor e IA-Assisted Development
- **Johann (@johannmx)** - [GitHub Profile](https://github.com/johannmx)
- **Desarrollado con asistencia de Antigravity (Google DeepMind)** - IA-Assisted Development en tiempo real.

---

> [!NOTE]
> Los datos son provistos por [DolarApi.com](https://dolarapi.com) y la API pública de Binance.
