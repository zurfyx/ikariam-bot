FROM node:latest

WORKDIR /usr/app

COPY package.json .
COPY package-lock.json .
RUN npm install --quiet
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
