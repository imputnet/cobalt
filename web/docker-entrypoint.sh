#!/bin/sh
set -e

# Replace config placeholders with runtime values
if [ -f "/usr/share/nginx/html/runtime-config.js" ]; then
  envsubst '${WEB_HOST} ${WEB_PLAUSIBLE_HOST} ${WEB_DEFAULT_API}' \
    < /usr/share/nginx/html/runtime-config.js \
    > /usr/share/nginx/html/runtime-config.tmp.js && \
    mv /usr/share/nginx/html/runtime-config.tmp.js /usr/share/nginx/html/runtime-config.js
fi

exec "$@"