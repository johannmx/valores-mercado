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
## 2026-04-12 - [HIGH] Rate Limiting Bypass via Fastify Trust Proxy
**Vulnerability:** Fastify was configured with `trustProxy: true`, blindly trusting all incoming `X-Forwarded-For` headers.
**Learning:** When using `trustProxy: true`, an attacker can easily spoof their IP address by injecting an `X-Forwarded-For` header, bypassing rate-limiting middleware.
**Prevention:** Restrict `trustProxy` to an array of trusted private network CIDR blocks (e.g., `['127.0.0.1', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']`) instead of using `true`.

## 2026-04-15 - Remove hardcoded secrets template from tracking

**Vulnerability:** Hardcoded placeholder secrets in tracked configuration files.
**Learning:** Committing even "placeholder" secrets like "YOUR_BOT_TOKEN" in a file named `config.sh` encourages users to modify the tracked file, leading to accidental credential leaks.
**Prevention:** Always use a `.example` or `.template` suffix for configuration files committed to the repository, and ensure the actual configuration filename is explicitly listed in `.gitignore`.

## 2026-04-20 - [MEDIUM] Upstream API Exhaustion via Uncached Dynamic Routes
**Vulnerability:** The backend endpoint `/api/historical/:casa` validated its parameter but failed to cache the result from the external upstream API (`api.argentinadatos.com`). Although the endpoint itself was rate-limited to 100 requests per 15 minutes per IP, an aggregate of requests from multiple users, or even legitimate traffic spikes, could rapidly multiply and exhaust the external API limits, causing downstream service degradation or IP bans.
**Learning:** Rate-limiting local routes is necessary but insufficient if external, expensive resources are fetched dynamically on each request without intermediate caching. External resources require an explicit caching layer to decouple internal scaling from external limits.
**Prevention:** Always implement a short-lived cache (e.g., using `node-cache`) for endpoints that proxy data from external third-party APIs. This bounds the maximum request rate to the external API regardless of internal route traffic.

## 2026-04-22 - [HIGH] Server-Side Request Forgery (SSRF) via Axios Redirects
**Vulnerability:** The Fastify backend utilizes Axios to fetch external API data (e.g., currency rates from `dolarapi.com`). Axios automatically follows HTTP redirects (up to 5 by default). If an upstream API is hijacked or maliciously returns a 3xx redirect to an internal IP address (like `http://169.254.169.254` on AWS) or loopback interface, the backend would blindly execute the request.
**Learning:** Default HTTP client configurations often prioritize convenience (following redirects) over security. When a backend acts as a proxy or aggregator for external data, it must explicitly limit its trust in upstream responses to prevent SSRF and internal network scanning.
**Prevention:** Always configure `maxRedirects = 0` (or rigidly validate redirect destinations) on the HTTP client (e.g., `axios.defaults.maxRedirects = 0;`) when consuming external APIs that are expected to return data directly.

## 2026-04-26 - [HIGH] Overly Permissive CORS Configuration in Production
**Vulnerability:** The Fastify backend included localhost origins (`http://localhost:5173`, `http://localhost:4173`, `http://localhost:3000`) in the default CORS array, which were active even in production environments.
**Learning:** Permitting localhost origins in a production CORS configuration is an anti-pattern. It exposes the API to attacks from malicious scripts running on local development servers, or allows attackers to exploit local applications running on a user's machine to make cross-origin requests to the production API.
**Prevention:** Always restrict localhost and local development CORS origins strictly to development environments (e.g., `NODE_ENV !== 'production'`) and never mix them with production domains.
