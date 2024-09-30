FROM node:20-alpine

RUN apk update
RUN apk upgrade
RUN apk add libc6-compat

WORKDIR /tmp/app

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .

RUN mkdir -p uploads
RUN mkdir -p exports
RUN mkdir -p logs

ENV NODE_ENV production

EXPOSE 9888

CMD ["node", "app.js"]