FROM node:12.7.0-alpine

WORKDIR /usr/src/app

CMD npm install && \
  npm run dev
