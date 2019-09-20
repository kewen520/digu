FROM node:12.7.0-alpine

ARG ACTION_COMMAND=prod
ENV ACTION_COMMAND=$ACTION_COMMAND
ENV BACKEND_URL=''

WORKDIR /usr/src/app
COPY . .

#ENV devApkList \
#  git

#RUN
#    apk --no-cache --update add \
#      ${devApkList} && \
RUN npm config set registry https://registry.npm.taobao.org/ && \
      npm i && \
      npm run build && \
      rm -rf /tmp/* \
          /var/cache/apk/* \
          logs/ \
          npm-debug.log \
          yarn-error.log \
          node_modules/ \
          yarn.lock \
          coverage/ \
          .idea/ \
          run/ \
          .DS_Store \
          *.sw* \
          *.un~ \
          .vscode/ \
          app/public/* && \
  npm install --production && \
  npm cache clean --force && \
#  apk del \
#    ${devApkList} && \
  rm -rf \
    package-lock.json

RUN rm -rf build \
    /var/cache/apk/* \
    common-static/ \
    front-source/ \
    manage-source/ \
    .postcssrc.js/

CMD npm config set vue-manage-system:backendUrl $BACKEND_URL && \
 npm run $ACTION_COMMAND

EXPOSE 4001