#!/bin/sh
# Security Enhancement: JSON encode the VITE_API_URL to prevent XSS via unescaped quotes or newlines
SAFE_VITE_API_URL=$(echo -n "$VITE_API_URL" | jq -R -s '.')

# Fallback to "null" if SAFE_VITE_API_URL is somehow empty to maintain valid JS syntax
SAFE_VITE_API_URL=${SAFE_VITE_API_URL:-"null"}

echo "window._env_ = {" > /usr/share/nginx/html/env-config.js
echo "  VITE_API_URL: ${SAFE_VITE_API_URL}," >> /usr/share/nginx/html/env-config.js
echo "}" >> /usr/share/nginx/html/env-config.js
exec "$@"
