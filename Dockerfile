FROM node:24-alpine

WORKDIR /src

ENV NODE_ENV=production
# 排盘时间取自访客浏览器时区（qmtz cookie），容器固定 UTC：
# 无夏令时跳变，任何访客墙钟都可表示
ENV TZ=UTC

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000
CMD ["node", "app.js"]
