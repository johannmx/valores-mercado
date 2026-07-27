#!/bin/sh
# Security Enhancement: JSON encode the VITE_API_URL to prevent XSS via unescaped quotes or newlines
# Safe handling using jq to avoid echo evaluating the content or shell expansions
SAFE_VITE_API_URL=$(jq -n --arg url "$VITE_API_URL" '$url')

# Fallback to "null" if SAFE_VITE_API_URL is somehow empty to maintain valid JS syntax
SAFE_VITE_API_URL=${SAFE_VITE_API_URL:-"null"}

echo "window._env_ = {" > /usr/share/nginx/html/env-config.js
echo "  VITE_API_URL: ${SAFE_VITE_API_URL}," >> /usr/share/nginx/html/env-config.js
echo "}" >> /usr/share/nginx/html/env-config.js
exec "$@"
