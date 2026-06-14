# ==============================================================================
# Stage 1: Dependency Installation & Build
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies (e.g. python, make, g++ if any native node modules exist)
RUN apk add --no-cache libc6-compat

# Copy dependency manifests
COPY package*.json ./
RUN npm ci

# Copy source code files
COPY . .

# Next.js embeds NEXT_PUBLIC_* variables into the client bundle during build time.
# We accept these as ARGs and export them as ENVs for the compile script.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:8080/api}

RUN npm run build

# ==============================================================================
# Stage 2: Minimal Secure Runtime
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary runtime assets from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Ensure the runner directory is owned by the node user
RUN chown -R node:node /app

# Run as built-in non-root node user (UID 1000)
USER node

# Document container port
EXPOSE 3000

# Start Next.js
CMD ["npm", "run", "start"]
