# Multi-stage build for React + Node.js
FROM node:18-alpine AS builder

# Build client (React)
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev
COPY client/ .
# Remove .env files to prevent local URLs from being baked into production build
RUN rm -f .env .env.local .env.production .env.development 2>/dev/null || true
# Set NODE_ENV to production for the build
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy server dependencies and install
COPY server/package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev

# Copy server code
COPY server/ .

# Copy built React app from builder stage
COPY --from=builder /app/client/build ./public

# Cloud Run expects port from PORT env var
EXPOSE 8080
ENV PORT=8080

CMD ["npm", "start"]