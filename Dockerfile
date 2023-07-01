# https://alphasec.io/dockerize-a-node-js-app-using-a-distroless-image/
# Stage A - Build application artifacts
FROM node:18.15.0-alpine AS base
ENV NODE_ENV prod

WORKDIR /app

RUN apk add git -y
RUN git clone -n https://github.com/wukko/cobalt.git --depth 1 && mv cobalt/.git ./ && rm -rf cobalt

COPY package*.json ./
RUN npm install --production

# Stage 2 - Launch 
FROM gcr.io/distroless/nodejs18-debian11

WORKDIR /app
COPY --from=base /app /app

EXPOSE 9000
CMD [ "node", "src/cobalt" ]
