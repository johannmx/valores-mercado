## 2024-05-18 - [HIGH] Rate Limiting Bypass via Express Trust Proxy
**Vulnerability:** Nginx reverse proxy was not explicitly setting `X-Forwarded-For` and `X-Real-IP` headers before forwarding traffic to an Express backend configured with `app.set('trust proxy', 1);`.
**Learning:** This combination allowed an attacker to trivially bypass `express-rate-limit` by injecting spoofed `X-Forwarded-For` headers in their requests. Express trusted the attacker-supplied header instead of the actual connection IP.
**Prevention:** Always ensure the reverse proxy (Nginx, HAProxy, etc.) overwrites or strictly appends to the `X-Forwarded-For` header using `$proxy_add_x_forwarded_for`, and explicitly passes the `$remote_addr`. Do not trust headers blindly when `trust proxy` is enabled.
