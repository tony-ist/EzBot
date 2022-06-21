FROM node:16.14.2 as builder

WORKDIR /app
COPY . /app
RUN ls /app
RUN npm install --production
RUN npm run build

FROM node:16.14.2

WORKDIR /app
COPY --from=builder /app /app
RUN rm -rf /app/src /app/scripts /app/node_modules
RUN ls /app

ARG GIT_COMMIT
LABEL commit=${GIT_COMMIT}
ENV COMMIT_SHA=${GIT_COMMIT}

ENTRYPOINT [ "/docker-entrypoint.sh" ]