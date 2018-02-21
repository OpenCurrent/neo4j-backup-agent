FROM node:8-alpine
WORKDIR /app
COPY index.js .
COPY ./config ./config
COPY package.json .
COPY ./lib ./lib
COPY ./node_modules ./node_modules
RUN npm install
CMD npm start
