# BUILD
FROM node:17-slim as build

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

RUN npm ci

COPY . /app

RUN npm run build

# RUN
FROM nginx:1.21.6

LABEL org.opencontainers.image.source="https://github.com/jisensee/adalia.info"

COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/default.conf /etc/nginx/conf.d/default.conf
