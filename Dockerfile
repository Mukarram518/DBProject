# Multi-stage Dockerfile for Monorepo Backend Build on Railway
FROM node:20-alpine AS builder

WORKDIR /app/backend

# Copy backend package files first for caching
COPY backend/package*.json ./
RUN npm install

# Copy backend source code
COPY backend/ ./

# Ensure binary execution permissions for node_modules/.bin
RUN chmod -R +x node_modules/.bin

# Build TypeScript to JavaScript
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app/backend

ENV NODE_ENV=production

COPY backend/package*.json ./
RUN npm install --only=production

COPY --from=builder /app/backend/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
