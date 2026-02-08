# Clay Humane Events

Event management application for Clay Humane. Manages events, registrations, email notifications, and administrative workflows.

## Architecture

| Component | Stack | Directory |
|-----------|-------|-----------|
| API | Express, Mongoose, Nodemailer | `api/` |
| Frontend | React, Vite, React Router | `frontend/` |

Both the API and frontend share a single set of environment files (`.env`, `.env.local`, etc.) located in the **project root**.

## Prerequisites

- [Node.js 24+](https://nodejs.org/) (see `.nvmrc`)
- [Yarn](https://classic.yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/)

## Local Environment Setup

### 1. Clone the repository

```bash
git clone git@github.com:<org>/clay-humane-events.git
cd clay-humane-events
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
NODE_ENV=development

# API
API_PORT=3001
FRONTEND_URL=https://dev.clayhumaneevents.local

# MongoDB
MONGO_DB=clay-humane-events
MONGO_USER=
MONGO_PASSWORD=
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_AUTH_SOURCE=admin

# SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# Frontend (VITE_ prefix required for client-side access)
VITE_API_URL=https://api.clayhumaneevents.local
VITE_BASE_URL=https://dev.clayhumaneevents.local
VITE_SERVE_PORT=3264
```

Override any value locally by creating a `.env.local` in the same directory.

### 3. Install dependencies

```bash
cd api && yarn install && cd ..
cd frontend && yarn install && cd ..
```

### 4. Start development servers

```bash
# Terminal 1 — API
cd api && yarn start

# Terminal 2 — Frontend
cd frontend && yarn start
```

The API runs on the port defined by `API_PORT`. The frontend dev server runs on the port defined by `VITE_SERVE_PORT`.

## Deployment

Production runs on a Digital Ocean droplet. Nginx serves the frontend static build and proxies API requests. The API process is managed by PM2.

### How it works

A GitHub Actions workflow (`.github/workflows/deploy.yml`) triggers on every **published release**:

1. SSHs into the production server.
2. Checks out the release tag.
3. Installs Node 24 via nvm.
4. Installs API production dependencies and reloads the PM2 process (`clay-humane-events-api`).
5. Installs frontend dependencies, runs `yarn build`, producing static assets in `frontend/dist/`.

Nginx is configured to serve `frontend/dist/` for the public site and reverse-proxy `/api` requests to the Express server.

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `SSH_DEPLOY_HOST` | Droplet IP or hostname |
| `SSH_DEPLOY_USERNAME` | SSH user |
| `SSH_DEPLOY_PRIVATE_KEY` | SSH private key |
| `SSH_DEPLOY_DOCROOT` | Absolute path to the project root on the server |

### Manual deploy

The workflow can also be triggered manually via `workflow_dispatch` in the GitHub Actions UI.

