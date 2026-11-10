# Build from this repo root:
#   docker build -f docker/Dockerfile -t mofi-platform-api .
# Apple Silicon → ECS (linux/amd64):
#   docker build --platform linux/amd64 -f docker/Dockerfile -t mofi-platform-api .

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
RUN apk add --no-cache wget
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["./entrypoint.sh"]
