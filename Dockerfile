FROM node:20-slim
WORKDIR /app
EXPOSE 9000

RUN apt-get update
RUN apt-get install -y git
RUN apt-get install -y git

COPY . .

RUN npm install

# Drop privileges
RUN groupadd cobalt && useradd -g cobalt cobalt
RUN chown -R cobalt:cobalt /app
RUN chmod -R 755 /app

USER cobalt

CMD [ "node", "src/cobalt" ]
