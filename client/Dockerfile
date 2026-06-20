# Build Stage
# hadolint ignore=DL3006
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# VITE_ variables are PUBLIC frontend keys intentionally baked into the build.
# Firebase API Key and Razorpay Key ID are designed to be client-side visible.
# hadolint ignore=DL3025
ARG VITE_SERVER_URL
# hadolint ignore=DL3025
ARG VITE_FIREBASE_APIKEY
# hadolint ignore=DL3025
ARG VITE_RAZORPAY_KEY_ID

ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_FIREBASE_APIKEY=$VITE_FIREBASE_APIKEY
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID

RUN npm run build

# Serve Stage
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
