FROM node:22

WORKDIR /app
COPY ./user-service/package.json /app
RUN npm install
COPY ./user-service /app

EXPOSE 3001
ENTRYPOINT ["npm", "start"]