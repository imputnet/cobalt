FROM node:24 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS build
WORKDIR /app
COPY . /app

RUN corepack enable
# RUN apk add --no-cache python3 alpine-sdk

# RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    # pnpm install --prod --frozen-lockfile

WORKDIR /app/web
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    # pnpm install
RUN pnpm install
RUN pnpm build

# USER node
EXPOSE 4173
CMD [ "pnpm", "preview", "--host" ]
