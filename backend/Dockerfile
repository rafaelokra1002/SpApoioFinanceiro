FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate && npx tsc

EXPOSE 3000

CMD ["node", "dist/server.js"]
