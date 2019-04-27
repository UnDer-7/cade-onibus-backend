FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm i
COPY . /usr/src/app
EXPOSE 3000

ENV NODE_ENV=development
ENV PORT=3000
ENV APP_SECRET=$2b$10$6Zz4E/zH4bPeKnqnh0paxeEgNuMBfqRTRBDvr08Tuv4asBl1tLOY.
ENV DB_URL=mongodb://localhost:27017
ENV DB_NAME=CADE_ONIBUS

CMD [ "npm", "start" ]
