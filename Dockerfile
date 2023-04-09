FROM node:18-bullseye-slim
WORKDIR /app

RUN apt-get update
RUN apt-get install -y git
RUN rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

RUN git clone -n https://github.com/wukko/cobalt.git --depth 1 && mv cobalt/.git ./ && rm -rf cobalt

COPY . .
EXPOSE 9000
CMD [ "node", "src/cobalt" ]
