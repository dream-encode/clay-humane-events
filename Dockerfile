FROM node:24-slim AS frontend-build

WORKDIR /app

COPY package.json ./
COPY frontend/package.json frontend/yarn.lock frontend/
RUN cd frontend && yarn install --frozen-lockfile --non-interactive

COPY frontend frontend

ARG VITE_API_URL
ARG VITE_BASE_URL
RUN cd frontend && yarn build


FROM nginx:1.29-alpine AS web

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

HEALTHCHECK --interval=5s --timeout=3s --retries=1 CMD test ! -f /tmp/drain && wget -qO /dev/null http://127.0.0.1/ || exit 1


FROM node:24-slim AS api

ENV NODE_ENV=production

WORKDIR /app

COPY --chown=node:node package.json ./
COPY --chown=node:node api/package.json api/yarn.lock api/
RUN cd api && yarn install --production --frozen-lockfile --non-interactive && yarn cache clean

COPY --chown=node:node api api
RUN install -d -o node -g node api/uploads

USER node
WORKDIR /app/api
EXPOSE 3263

HEALTHCHECK --interval=5s --timeout=3s --retries=2 --start-period=20s CMD test ! -f /tmp/drain && node -e "require( 'net' ).connect( process.env.API_PORT || 3263, '127.0.0.1' ).on( 'connect', () => process.exit( 0 ) ).on( 'error', () => process.exit( 1 ) )" || exit 1

CMD ["node", "server.js"]
