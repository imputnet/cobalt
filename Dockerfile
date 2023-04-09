FROM node:18-bullseye-slim
WORKDIR /app
COPY package*.json ./
ARG GIT_COMMIT
ARG GIT_BRANCH
RUN apt-get update
RUN apt-get install -y git
RUN rm -rf /var/lib/apt/lists/*
RUN npm install
ENV GIT_BRANCH=$GIT_BRANCH
ENV GIT_COMMIT=$GIT_COMMIT
RUN git clone -n https://github.com/wukko/cobalt.git --depth 1 && mv cobalt/.git ./ && rm -rf cobalt
COPY . .
EXPOSE 9000
CMD [ "node", "src/cobalt" ]

