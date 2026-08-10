# Multi-stage Dockerfile for Monorepo Backend Build on Railway
FROM node:20-alpine AS builder

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy backend source code and build
COPY backend/ ./
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app/backend

ENV NODE_ENV=production

COPY --from=builder /app/backend/package*.json ./
RUN npm install --only=production

COPY --from=builder /app/backend/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
