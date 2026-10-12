FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY src ./src
RUN DATABASE_URL="postgresql://carbonbox:carbonbox@localhost:5432/carbonbox?schema=public" npm run db:generate && npm run build

EXPOSE 3000

CMD ["sh", "-c", "npm run db:deploy && npm start"]
