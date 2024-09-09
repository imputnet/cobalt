#!/bin/bash
set -e

# thx: https://stackoverflow.com/a/27601038
waitport() {
    ATTEMPTS=50
    while [ $((ATTEMPTS-=1)) -gt 0 ] && ! nc -z localhost $1; do   
        sleep 0.1
    done

    [ "$ATTEMPTS" != 0 ] || exit 1
}

test_api() {
    waitport 3000
    curl -m 3 http://localhost:3000/
    API_RESPONSE=$(curl -m 3 http://localhost:3000/ \
         -X POST \
         -H "Accept: application/json" \
         -H "Content-Type: application/json" \
         -d '{"url":"https://www.tiktok.com/@fatfatmillycat/video/7195741644585454894"}')

    echo "API_RESPONSE=$API_RESPONSE"
    STATUS=$(echo "$API_RESPONSE" | jq -r .status)
    STREAM_URL=$(echo "$API_RESPONSE" | jq -r .url)
    [ "$STATUS" = tunnel ] || exit 1;
    S=$(curl -I -m 3 "$STREAM_URL")

    CONTENT_LENGTH=$(echo "$S" \
                        | grep -i content-length \
                        | cut -d' ' -f2 \
                        | tr -d '\r')

    echo "$CONTENT_LENGTH"
    [ "$CONTENT_LENGTH" = 0 ] && exit 1
    if [ "$CONTENT_LENGTH" -lt 512 ]; then
        exit 1
    fi
}

setup_api() {
    export API_PORT=3000
    export API_URL=http://localhost:3000
    timeout 10 pnpm run --prefix api start &
    API_PID=$!
}

setup_web() {
    pnpm run --prefix web build
}

cd "$(git rev-parse --show-toplevel)"
pnpm install --frozen-lockfile

if [ "$1" = "api" ]; then
    setup_api
    test_api
    [ "$API_PID" != "" ] \
        && kill "$API_PID"
elif [ "$1" = "web" ]; then
    setup_web
else
    echo "usage: $0 <api/web>" >&2
    exit 1
fi

wait || exit $?