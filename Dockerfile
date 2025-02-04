FROM node:23-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS build
WORKDIR /app
COPY . /app

RUN corepack enable && pnpm add -g serve
RUN apk add --no-cache python3 alpine-sdk

# Build backend (cobalt-api)
FROM build AS build-api
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile
RUN pnpm deploy --filter=@imput/cobalt-api --prod /prod/api

# Build frontend (cobalt-web)
FROM build AS build-web
WORKDIR /app/web
RUN --mount=type=cache,id=pnpm-web,target=/pnpm/store \
    pnpm install --prod=false --frozen-lockfile
ARG WEB_HOST
ARG WEB_DEFAULT_API
ENV WEB_HOST=${WEB_HOST}
ENV WEB_DEFAULT_API=${WEB_DEFAULT_API}
RUN pnpm run build

# Merge api+web results
FROM base AS final
WORKDIR /app

RUN apk add --no-cache python3
COPY --from=build-api --chown=node:node /prod/api /app
COPY --from=build-web --chown=node:node /app/web /app/web
COPY .git /app/.git

USER node

EXPOSE 9000
EXPOSE 9001
CMD [ "sh", "-c", "python3 -m http.server 9001 --directory /app/web/build & node src/cobalt" ]