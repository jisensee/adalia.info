# BUILD
FROM node:current-alpine3.10 as build

RUN apk add g++ make python
RUN npm install -g rescript

WORKDIR /app

COPY package.json /app

RUN npm install --legacy-peer-deps

COPY . /app

RUN npm run build

# RUN
FROM nginx:1.17.1-alpine

LABEL org.opencontainers.image.source="https://github.com/jisensee/adalia.info"

COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/default.conf /etc/nginx/conf.d/default.conf
