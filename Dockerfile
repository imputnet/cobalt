FROM node:19-alpine
WORKDIR /app

RUN apk add --no-cache git

COPY package*.json .
RUN npm install

COPY . .
EXPOSE 9000
CMD [ "npm", "start" ]
