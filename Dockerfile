FROM node:9-alpine
ADD . /src
RUN cd /src; npm install
RUN ln -sf /usr/share/zoneinfo/Europe/Paris  /etc/localtime
EXPOSE  3000
CMD [ "node","/src/app.js" ]
