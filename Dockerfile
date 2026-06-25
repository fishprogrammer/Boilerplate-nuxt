# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 120000

COPY . .

ARG NUXT_PUBLIC_API_BASE_URL=""
ARG NUXT_PUBLIC_API_TIMEOUT=30000
ARG NUXT_PUBLIC_APP_TITLE="My App"
ARG NUXT_PUBLIC_APP_NAME="My App"
ARG NUXT_PUBLIC_APP_DESCRIPTION="An admin dashboard"
ARG NUXT_PUBLIC_APP_VERSION="1.0.0"
ARG NUXT_PUBLIC_APP_THEME_COLOR="#00B894"
ARG NUXT_PUBLIC_APP_BG_COLOR="#f4f5f6"
ARG NUXT_PUBLIC_APP_STORAGE_PREFIX="app"

ENV NUXT_PUBLIC_API_BASE_URL=$NUXT_PUBLIC_API_BASE_URL \
    NUXT_PUBLIC_API_TIMEOUT=$NUXT_PUBLIC_API_TIMEOUT \
    NUXT_PUBLIC_APP_TITLE=$NUXT_PUBLIC_APP_TITLE \
    NUXT_PUBLIC_APP_NAME=$NUXT_PUBLIC_APP_NAME \
    NUXT_PUBLIC_APP_DESCRIPTION=$NUXT_PUBLIC_APP_DESCRIPTION \
    NUXT_PUBLIC_APP_VERSION=$NUXT_PUBLIC_APP_VERSION \
    NUXT_PUBLIC_APP_THEME_COLOR=$NUXT_PUBLIC_APP_THEME_COLOR \
    NUXT_PUBLIC_APP_BG_COLOR=$NUXT_PUBLIC_APP_BG_COLOR \
    NUXT_PUBLIC_APP_STORAGE_PREFIX=$NUXT_PUBLIC_APP_STORAGE_PREFIX

RUN yarn generate

# ─── Stage 2: Production (nginx) ──────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/.output/public /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
