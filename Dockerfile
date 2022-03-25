# TODO: Update to 16.14.2
FROM node:10.13.0

WORKDIR /app
COPY . /app

ENTRYPOINT [ "/docker-entrypoint.sh" ]