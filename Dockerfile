# Stage 1: Build React Frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Run Production Server
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install dependencies (only production)
COPY package*.json ./
RUN npm ci --only=production

# Copy server script, service modules, and database/image seeds
COPY server.cjs ./
COPY googleReviewsService.cjs ./
COPY instagramService.cjs ./
COPY src/data ./src/data
COPY public/images ./public/images
COPY public/instagram ./public/instagram

# Copy built frontend assets from Stage 1
COPY --from=builder /app/dist ./dist

# Expose server port
EXPOSE 3000

# Start production server
CMD ["node", "server.cjs"]
