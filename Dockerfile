ARG APP_VERSION=0.0.0-dev
FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++
ENV HUSKY=0
COPY package.json package-lock.json .npmrc ./
RUN npm ci --engine-strict=false
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV AUTH_MODE=oidc
ARG APP_VERSION=0.0.0-dev
ENV APP_VERSION=${APP_VERSION}
COPY package.json package-lock.json .npmrc ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
RUN mkdir -p /data
VOLUME ["/data"]
ENV DATABASE_PATH=/data/app.db
ENV BODY_SIZE_LIMIT=2097152
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD ["node", "build"]