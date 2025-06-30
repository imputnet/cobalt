# syntax=docker/dockerfile:1


# docker build -f web/Dockerfile -t cobalt-web .

FROM node:20-alpine AS builder

WORKDIR /repo

RUN npm install -g pnpm 

# Copy monorepo into container
COPY . .

# Install all deps for monorepo
RUN pnpm install --frozen-lockfile

WORKDIR /repo/web
RUN pnpm --filter ./web run build


FROM nginx:alpine

WORKDIR /usr/share/nginx/html
COPY --from=builder /repo/web/build .

COPY web/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]