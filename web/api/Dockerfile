FROM node:24-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

# Ensure data directory has correct permissions for 'node' user
RUN mkdir -p data && chown -R node:node /app

EXPOSE 3001

USER node

# Using tsx which is more robust for ESM + TypeScript in Node 20
CMD ["./node_modules/.bin/tsx", "index.ts"]
