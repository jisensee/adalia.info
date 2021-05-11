FROM node:latest

LABEL org.opencontainers.image.source="https://github.com/jisensee/adalia.info"

WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json .
RUN npm ci

ADD . /usr/src/app
RUN npm run build

ENV NODE_ENV=production
CMD [ "node", "dist/server.js" ]
EXPOSE 5000
