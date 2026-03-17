FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

# Using tsx which is more robust for ESM + TypeScript in Node 20
CMD ["npx", "tsx", "index.ts"]
