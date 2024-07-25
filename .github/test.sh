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
    curl -m 3 http://localhost:3000/api/serverInfo
    API_RESPONSE=$(curl -m 3 http://localhost:3000/api/json \
         -X POST \
         -H "Accept: application/json" \
         -H "Content-Type: application/json" \
         -d '{"url":"https://vine.co/v/huwVJIEJW50", "isAudioOnly": true}')

    echo "$API_RESPONSE"
    STATUS=$(echo "$API_RESPONSE" | jq -r .status)
    STREAM_URL=$(echo "$API_RESPONSE" | jq -r .url)
    [ "$STATUS" = stream ] || exit 1;

    CONTENT_LENGTH=$(curl -I -m 3 "$STREAM_URL" \
                        | grep -i content-length \
                        | cut -d' ' -f2 \
                        | tr -d '\r')

    echo "$CONTENT_LENGTH"
    [ "$CONTENT_LENGTH" = 0 ] && exit 1
    if [ "$CONTENT_LENGTH" -lt 512 ]; then
        exit 1
    fi
}

test_web() {
    waitport 3001
    curl -m 3 http://127.0.0.1:3001/onDemand?blockId=0 \
        | grep -q '"status":"success"' 
}

setup_api() {
    export API_PORT=3000
    export API_URL=http://localhost:3000
    timeout 10 npm run start
}

setup_web() {
    export WEB_PORT=3001
    export WEB_URL=http://localhost:3001
    export API_URL=http://localhost:3000
    timeout 5 npm run start
}

cd "$(git rev-parse --show-toplevel)"
npm i

if [ "$1" = "api" ]; then
    setup_api &
    test_api
elif [ "$1" = "web" ]; then
    setup_web &
    test_web
else
    echo "usage: $0 <api/web>" >&2
    exit 1
fi

wait || exit $?