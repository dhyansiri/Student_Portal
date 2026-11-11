# Multi-Stage Dockerfile for Presidency University CampusBuddy AI

# Stage 1: Build the React SPA frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend ./
RUN npm run build

# Stage 2: Production runtime environment
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install production backend dependencies
COPY package.json ./
COPY backend/package.json backend/
RUN cd backend && npm install --omit=dev

# Copy backend source code and campus knowledge baseline
COPY backend backend/

# Copy compiled frontend from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist frontend/dist

# Build or ensure the campus vector index exists
RUN node backend/src/scripts/build-campus-index.js

# Expose server port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start CampusBuddy Helpdesk server
CMD ["node", "backend/src/server.js"]
