FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS build
WORKDIR /app
COPY . /app

RUN corepack enable
RUN apk add --no-cache python3 alpine-sdk

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile

RUN pnpm deploy --filter=@imput/cobalt-api --prod /prod/api

FROM base AS api
WORKDIR /app

COPY --from=build --chown=node:node /prod/api /app
RUN mkdir -p /app/.git/logs && \
      printf 'ref: refs/heads/main\n' > /app/.git/HEAD && \
      printf '0000000000000000000000000000000000000000 a636575b09de1fc55d9b8cd98cac88f5f2f16b42 deploy <build@render>\n' > /app/.git/logs/HEAD && \
      printf '[remote "origin"]\n\turl = https://github.com/alexcohan69-eng/cobalt.git\n' > /app/.git/config

USER node

EXPOSE 9000
CMD [ "node", "src/cobalt" ]
