#!/bin/sh
cat <<'EOF' > /usr/share/nginx/html/env-config.js
window._env_ = {
  VITE_API_URL: "${VITE_API_URL}",
}
EOF
exec "$@"
