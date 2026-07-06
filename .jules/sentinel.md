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

## 2026-05-01 - [HIGH] HTTP Parameter Injection via curl in Bash Scripts
**Vulnerability:** A Bash script used for Telegram notifications submitted a payload via `curl -d "text=${MSG}"`. Because `$MSG` incorporated data fetched from external APIs, if the external data contained an unencoded ampersand (`&`), `curl` would interpret the payload as URL-encoded form data and split the variable, injecting arbitrary parameters into the HTTP POST request (e.g., overriding `chat_id` or other fields).
**Learning:** Using `-d` (or `--data`) with `curl` passes data exactly as-is. If the data contains `&` or `=`, it will be treated as part of the application/x-www-form-urlencoded syntax. Bash variables interpolated inside `-d` strings are highly vulnerable to parameter injection if the content is not strictly controlled.
**Prevention:** Always use `--data-urlencode` instead of `-d` when passing variables to `curl` that may contain arbitrary or external content to ensure proper encoding and prevent parameter injection.

## 2026-05-10 - [HIGH] XSS via Environment Variable Injection in Shell Script
**Vulnerability:** A shell script (`env.sh`) injected an environment variable (`VITE_API_URL`) directly into a JavaScript file output (`env-config.js`) without sanitization: `echo "  VITE_API_URL: \"${VITE_API_URL}\","`. A malicious or malformed environment variable containing double quotes could break out of the string literal and execute arbitrary JavaScript (XSS) when the application is loaded.
**Learning:** Shell scripts generating code (like JavaScript configuration files) are highly susceptible to injection attacks if they directly interpolate variables. Standard bash variables do not escape JSON/JS syntax properly.
**Prevention:** Always use a JSON processor like `jq` to safely encode environment variables before injecting them into JavaScript contexts. Use `echo -n "$VAR" | jq -R -s '.'` to ensure quotes, newlines, and backslashes are correctly escaped into a valid JSON string literal. Ensure `jq` is installed in the target container environment (e.g., `apk add --no-cache jq` in Alpine).

## 2026-06-12 - [MEDIUM] Duplicate Rate Limit Plugin Registration Errors
**Vulnerability:** The Fastify rate limit plugin (`@fastify/rate-limit`) was registered twice in the application context—once globally with configuration options, and a second time further down the file using `await server.register(rateLimit, { global: false, ... })`.
**Learning:** Registering a Fastify plugin multiple times in the same scope leads to undefined behavior, duplicate registration errors (e.g., `server.rateLimit is not a function` during tests), and can interfere with the correct application of rate limits on individual routes, potentially leaving endpoints unprotected or crashing the server during startup or testing.
**Prevention:** Always register plugins like `rate-limit` exactly once at the top level (either globally or using a dedicated encapsulation context). Use the route-specific `config` object to override or customize limits for individual endpoints instead of re-registering the plugin.

## 2026-06-19 - [MEDIUM] Server-Side DoS via Malformed Upstream API Responses
**Vulnerability:** The backend endpoint `/api/rates` and the background history-saving task accessed properties on external upstream API response data (e.g., `vesOficialData.promedio`) without optional chaining or type guards. If any upstream API returned `null`, a non-object, or a malformed structure, it would throw an unhandled `TypeError` (e.g., `Cannot read properties of null`), causing the entire route to return a 500 error or the background task to fail.
**Learning:** Hardening an application against external inputs includes defensive programming at the property-access level. Third-party APIs are outside our trust boundary and can fail, get compromised, or change their payload structure at any time.
**Prevention:** Always use optional chaining (`?.`) and fallback defaults when accessing properties of data returned by external APIs. Furthermore, use Fastify's schema validator on route inputs (like `/api/historical/:casa`) to reject malformed parameters at the framework level before route handler execution.
## 2026-06-25 - [MEDIUM] Server-Side DoS via Malformed Upstream API Responses
**Vulnerability:** The backend endpoint `/api/rates` and the background history-saving task accessed properties on external upstream API response data (e.g., `vesOficialData.promedio`, `uyuData.venta`, etc.) without optional chaining or type guards. If any upstream API successfully responded with a `null` or structurally malformed payload (instead of just triggering the `catch` block), a `TypeError` (e.g., "Cannot read properties of null") would be thrown. This crashes the background task or returns a 500 error for the entire route, causing a Denial of Service.
**Learning:** Hardening an application against external inputs includes defensive programming at the property-access level. Third-party APIs are outside our trust boundary and can fail, get compromised, or change their payload structure at any time. A successful HTTP response does not guarantee a valid data payload.
**Prevention:** Always use optional chaining (`?.`) and fallback defaults when accessing properties of data returned by external APIs to prevent unhandled exceptions from crashing the server process or breaking API routes.
## 2026-06-25 - [MEDIUM] Server-Side DoS via Malformed Upstream API Responses
**Vulnerability:** The backend endpoint `/api/rates` and the background history-saving task accessed properties on external upstream API response data (e.g., `vesOficialData.promedio`, `uyuData.venta`, etc.) without optional chaining or type guards. If any upstream API successfully responded with a `null` or structurally malformed payload (instead of just triggering the `catch` block), a `TypeError` (e.g., "Cannot read properties of null") would be thrown. This crashes the background task or returns a 500 error for the entire route, causing a Denial of Service.
**Learning:** Hardening an application against external inputs includes defensive programming at the property-access level. Third-party APIs are outside our trust boundary and can fail, get compromised, or change their payload structure at any time. A successful HTTP response does not guarantee a valid data payload.
**Prevention:** Always use optional chaining (`?.`) and fallback defaults when accessing properties of data returned by external APIs to prevent unhandled exceptions from crashing the server process or breaking API routes. When fixing this, be careful not to create logical state regressions by bypassing intended `catch` logic.
