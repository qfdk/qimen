FROM node
ADD . /src
RUN cd /src; npm install
EXPOSE  3000
CMD [ "node","/src/app.js" ]