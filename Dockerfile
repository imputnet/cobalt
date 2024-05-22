FROM node:18-bullseye-slim
WORKDIR /app

COPY package*.json ./

RUN apt-get update                                    && \
    apt-get install -y git python3 build-essential    && \
    npm ci                                            && \
    npm cache clean --force                           && \
    apt purge --autoremove -y python3 build-essential && \
    rm -rf ~/.cache/ /var/lib/apt/lists/*

COPY . .
EXPOSE 9000
CMD [ "node", "src/cobalt" ]
