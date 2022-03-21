FROM node:16

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci --only=production
COPY src/server/ .
COPY dist/ ./dist

EXPOSE 3000
CMD [ "node", "index.js" ]

