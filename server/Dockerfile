FROM node:latest


WORKDIR /usr/src/app
COPY package.json .
RUN npm install

ADD . /usr/src/app
RUN npm run build

ENV NODE_ENV=production
CMD [ "node", "dist/server.js" ]
EXPOSE 5000
