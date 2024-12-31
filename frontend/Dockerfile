FROM node:22-alpine

WORKDIR /app

COPY package.json /app/
RUN npm install

COPY . /app/
ENV PATH /app/node_modules/.bin:$PATH

EXPOSE 3000