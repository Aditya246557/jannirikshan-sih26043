# ============================================================
# STAGE 1: BUILD FRONTEND
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code and build production distribution
COPY . .
RUN npm run build

# ============================================================
# STAGE 2: PRODUCTION NGINX SERVER
# ============================================================
FROM nginx:alpine

# Remove default nginx configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built distribution from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
