# Build from repository root (mreif):
# docker build -f mofi-platform-api/docker/Dockerfile -t mofi-platform-api .
# ECS Fargate (default) is linux/amd64 — on Apple Silicon always use:
# docker build --platform linux/amd64 -f mofi-platform-api/docker/Dockerfile -t mofi-platform-api .

FROM node:20-alpine AS builder
WORKDIR /app/mofi-platform-api
COPY qshelter-auth /app/qshelter-auth
COPY mofi-platform-api/package.json mofi-platform-api/package-lock.json* ./
RUN npm install
COPY mofi-platform-api/ .
RUN npm run build

FROM node:20-alpine
# Keep same paths as builder so file:../qshelter-auth symlinks in node_modules resolve.
WORKDIR /app/mofi-platform-api
ENV NODE_ENV=production
ENV PORT=8080
RUN apk add --no-cache wget
COPY --from=builder /app/qshelter-auth /app/qshelter-auth
COPY --from=builder /app/mofi-platform-api/package.json ./
COPY --from=builder /app/mofi-platform-api/node_modules ./node_modules
COPY --from=builder /app/mofi-platform-api/dist ./dist
COPY --from=builder /app/mofi-platform-api/docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["./entrypoint.sh"]
