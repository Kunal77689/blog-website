FROM node:22

WORKDIR /mnt/c/Users/kunal/blog-website/app.js

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
