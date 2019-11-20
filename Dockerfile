FROM node:10.13.0

RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app
COPY . /app

ENTRYPOINT [ "/docker-entrypoint.sh" ]