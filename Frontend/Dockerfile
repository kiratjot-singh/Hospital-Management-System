# Stage 1: Build the React application
FROM node:22-alpine AS builder


WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.25-alpine

# Copy the custom Nginx config for React routing support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to Nginx public html directory
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
