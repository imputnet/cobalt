FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS build

WORKDIR /app

COPY . /app

RUN corepack enable
RUN apk add --no-cache python3 alpine-sdk

RUN pnpm install --prod --frozen-lockfile

RUN pnpm deploy --filter=@imput/cobalt-api --prod /prod/api

FROM base AS api

ARG RAILWAY_GIT_COMMIT_SHA=unknown
ARG RAILWAY_GIT_BRANCH=fix-instagram
ARG RAILWAY_GIT_REPO_OWNER=unknown
ARG RAILWAY_GIT_REPO_NAME=cobalt

WORKDIR /app

COPY --from=build --chown=node:node /prod/api /app

RUN mkdir -p /app/.git/logs /app/.git/refs/heads \
    && printf 'ref: refs/heads/%s\n' "$RAILWAY_GIT_BRANCH" > /app/.git/HEAD \
    && printf '0000000000000000000000000000000000000000 %s railway <railway@local> 0 +0000\tbuild\n' "$RAILWAY_GIT_COMMIT_SHA" > /app/.git/logs/HEAD \
    && printf '[remote "origin"]\n\turl = https://github.com/%s/%s.git\n' "$RAILWAY_GIT_REPO_OWNER" "$RAILWAY_GIT_REPO_NAME" > /app/.git/config \
    && chown -R node:node /app/.git

USER node

EXPOSE 9000

CMD ["node", "src/cobalt"]
