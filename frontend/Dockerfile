FROM node:latest

WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app

EXPOSE 5173
# TODO: Fix this by M3
ENTRYPOINT ["npm", "run", "dev", "--", "--host"]