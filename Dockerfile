FROM node:18-bullseye-slim
WORKDIR /app
COPY package*.json ./
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/* && git clone https://github.com/wukko/cobalt
RUN npm install
COPY . .
EXPOSE 9000
CMD [ "node", "src/cobalt" ]

