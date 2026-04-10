#!/usr/bin/env bash
set -euo pipefail

docker build -f web.Dockerfile -t ferrum-web .
# docker build -f api.Dockerfile -t ferrum-api .
