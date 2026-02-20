FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY vite.config.js ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY index.html ./

# Build arg injected at build time so Vite can embed it
ARG VITE_N8N_API_KEY
ENV VITE_N8N_API_KEY=$VITE_N8N_API_KEY

# Build
RUN npm run build

# Production: serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
