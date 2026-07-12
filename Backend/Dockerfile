# Stage 1: Install production dependencies
FROM node:18-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Serve the backend
FROM node:18-alpine

WORKDIR /app

# Copy production node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
