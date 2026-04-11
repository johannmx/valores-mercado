## 2024-05-18 - [HIGH] Rate Limiting Bypass via Express Trust Proxy
**Vulnerability:** Nginx reverse proxy was not explicitly setting `X-Forwarded-For` and `X-Real-IP` headers before forwarding traffic to an Express backend configured with `app.set('trust proxy', 1);`.
**Learning:** This combination allowed an attacker to trivially bypass `express-rate-limit` by injecting spoofed `X-Forwarded-For` headers in their requests. Express trusted the attacker-supplied header instead of the actual connection IP.
**Prevention:** Always ensure the reverse proxy (Nginx, HAProxy, etc.) overwrites or strictly appends to the `X-Forwarded-For` header using `$proxy_add_x_forwarded_for`, and explicitly passes the `$remote_addr`. Do not trust headers blindly when `trust proxy` is enabled.

## 2026-04-08 - [MEDIUM] Server-Side DoS via Upstream API Payload Exhaustion
**Vulnerability:** The backend API performs multiple concurrent fetching operations using Axios (`Promise.all` with `axios.get`) against external upstream APIs without enforcing response size limits. A compromised upstream API could return excessively large JSON payloads, causing memory exhaustion on the Node.js backend.
**Learning:** Relying solely on request timeouts (`axios.defaults.timeout`) is insufficient when interacting with external services. Network latency may not trigger a timeout, while a high-bandwidth connection reading a massive response can still OOM (Out-of-Memory) crash the Node.js process.
**Prevention:** Always configure `maxContentLength` and `maxBodyLength` limits on HTTP client configurations (like Axios) to defensively limit upstream response sizes to expected boundaries (e.g., 500 KB).

## 2026-04-08 - [MEDIUM] Event Loop Blocking via Synchronous File I/O
**Vulnerability:** The Express backend used `fs.readFileSync` and `fs.writeFileSync` within request handlers and recurring background tasks. This blocks the single-threaded Node.js event loop for the duration of the I/O operation.
**Learning:** For an application handling historical data as a local JSON file, the I/O delay increases as the file size grows. Blocking the event loop prevents the server from processing other concurrent requests, effectively creating a self-inflicted Denial of Service (DoS) vulnerability.
**Prevention:** Always use the asynchronous versions of I/O operations (e.g., `fs.promises.readFile`) within request handlers and scheduled background tasks to keep the event loop responsive.

## 2026-04-08 - Insecure CORS Configuration
* **Vulnerability:** The API blindly parsed the `ALLOWED_ORIGINS` environment variable and passed it directly to the CORS configuration, leading to a risk where incorrect env configuration could open the application to Cross-Origin Resource Sharing attacks, potentially allowing malicious sites to access API responses.
* **Learning:** Always strictly validate configuration input, especially for security features like CORS. Relying on an unvalidated environment variable or `false` flag to protect cross-origin access is highly error-prone.
* **Prevention:** Ensure the origin parameter passed to `cors` middleware explicitly validates parsed domains, ensuring they form a valid URL and fallback to secure defaults instead of turning CORS checking off entirely.

## 2026-04-11 - [MEDIUM] Missing Timeout Configurations in Express
**Vulnerability:** The Express backend relied on Node's default `keepAliveTimeout` (5s) and `headersTimeout`. When operating behind a reverse proxy (like Nginx), mismatched timeouts can cause 502 Bad Gateway errors, and leaving them unconfigured can make the server slightly more susceptible to connection exhaustion or Slowloris-style delays if the proxy buffers are misconfigured.
**Learning:** Security robusting isn't just about preventing unauthorized access, but also ensuring stability and availability against malformed or slow network traffic at the Node.js level.
**Prevention:** Always configure `keepAliveTimeout` and `headersTimeout` on the underlying `http.Server` instance returned by `app.listen()` to values that align with or exceed the reverse proxy's timeout expectations (e.g., 65s and 66s).
