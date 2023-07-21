FROM node:18-alpine

WORKDIR /app

RUN apk update \
    && apk add --no-cache git

COPY package*.json ./
RUN npm install

RUN git clone -n https://github.com/wukko/cobalt.git --depth 1 \
    && mv cobalt/.git ./ \
    && rm -rf cobalt

COPY . .
EXPOSE 9000
CMD [ "node", "src/cobalt" ]
