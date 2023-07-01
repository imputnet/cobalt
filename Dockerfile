FROM node:18-alpine

RUN apk add --no-cache git ffmpeg

WORKDIR /app
RUN chown node:node /app
USER node

COPY package*.json ./
RUN npm install

COPY --chown=node . .

EXPOSE 9000
CMD [ "node", "src/cobalt" ]
