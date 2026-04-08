## 2024-05-18 - [HIGH] Rate Limiting Bypass via Express Trust Proxy
**Vulnerability:** Nginx reverse proxy was not explicitly setting `X-Forwarded-For` and `X-Real-IP` headers before forwarding traffic to an Express backend configured with `app.set('trust proxy', 1);`.
**Learning:** This combination allowed an attacker to trivially bypass `express-rate-limit` by injecting spoofed `X-Forwarded-For` headers in their requests. Express trusted the attacker-supplied header instead of the actual connection IP.
**Prevention:** Always ensure the reverse proxy (Nginx, HAProxy, etc.) overwrites or strictly appends to the `X-Forwarded-For` header using `$proxy_add_x_forwarded_for`, and explicitly passes the `$remote_addr`. Do not trust headers blindly when `trust proxy` is enabled.

## 2026-04-08 - [MEDIUM] Server-Side DoS via Upstream API Payload Exhaustion
**Vulnerability:** The backend API performs multiple concurrent fetching operations using Axios (`Promise.all` with `axios.get`) against external upstream APIs without enforcing response size limits. A compromised upstream API could return excessively large JSON payloads, causing memory exhaustion on the Node.js backend.
**Learning:** Relying solely on request timeouts (`axios.defaults.timeout`) is insufficient when interacting with external services. Network latency may not trigger a timeout, while a high-bandwidth connection reading a massive response can still OOM (Out-of-Memory) crash the Node.js process.
**Prevention:** Always configure `maxContentLength` and `maxBodyLength` limits on HTTP client configurations (like Axios) to defensively limit upstream response sizes to expected boundaries (e.g., 500 KB).
