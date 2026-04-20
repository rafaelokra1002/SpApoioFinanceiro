FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm install --include=dev

COPY . .

RUN npx prisma generate && npx tsc

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy || echo 'Migration skipped'; node dist/server.js"]
