# ==========================================
# STAGE 1: Build Dependencies & Compile
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for tsc)
RUN npm ci

# Copy source code and build
COPY . .
RUN npx prisma generate
RUN npm run build

# ==========================================
# STAGE 2: Production Runtime Environment
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built dist, package.json, prisma, and node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000

CMD ["node", "dist/server.js"]
