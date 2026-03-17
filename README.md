# Docker Lab - DevOps Course

A hands-on Docker lab featuring sample applications in Node.js, Python, and Go, plus a production-grade Node.js stack with PostgreSQL and Redis.

## Project Structure

```
docker-lab/
├── node-app/                  # Simple Node.js (Express + TypeScript)
├── python-app/                # Simple Python (FastAPI)
├── go-app/                    # Simple Go (net/http)
├── production-node-app/       # Production Node.js + PostgreSQL + Redis
└── docker-volume-test.md      # Docker volume persistence demo
```

## Applications

### Node App

A simple Express server built with TypeScript.

| Detail   | Value                  |
|----------|------------------------|
| Port     | 3000                   |
| Language | TypeScript (Node 20)   |
| Base     | `node:20-alpine`       |

```bash
cd node-app
docker build -t node-app .
docker run -d -p 3000:3000 node-app
curl http://localhost:3000
# Welcome to DevOps Course - This is Node app
```

### Python App

A FastAPI application served with Gunicorn + Uvicorn workers.

| Detail   | Value                          |
|----------|--------------------------------|
| Port     | 8000                           |
| Language | Python 3.12                    |
| Base     | `python:3.12-slim`             |

```bash
cd python-app
docker build -t python-app .
docker run -d -p 8000:8000 python-app
curl http://localhost:8000
# {"message":"Welcome to DevOps Course - This is Python app"}
```

### Go App

A lightweight Go HTTP server compiled to a scratch (distroless) image.

| Detail   | Value                   |
|----------|-------------------------|
| Port     | 8080                    |
| Language | Go 1.22                 |
| Base     | `scratch` (production)  |

```bash
cd go-app
docker build -t go-app .
docker run -d -p 8080:8080 go-app
curl http://localhost:8080
# Welcome to DevOps Course - This is Go app
```

### Production Node App

A full-stack production setup with Express, PostgreSQL, and Redis managed via Docker Compose.

| Service  | Image                | Port |
|----------|----------------------|------|
| API      | Node 20 (multi-stage)| 3000 |
| Postgres | `postgres:16-alpine` | 5432 |
| Redis    | `redis:7-alpine`     | 6379 |

**Features:**
- Multi-stage Docker build (builder → production)
- PostgreSQL with init scripts for schema and seed data
- Redis caching with 60s TTL on `/users`
- JWT token generation
- Health checks on all services
- Resource limits (CPU/memory)
- Non-root user in container
- JSON logging with rotation

```bash
cd production-node-app
docker compose up -d --build
```

**API Endpoints:**

| Method | Endpoint   | Description                       |
|--------|------------|-----------------------------------|
| GET    | `/`        | Welcome message + service status  |
| GET    | `/health`  | Health check (Postgres + Redis)   |
| GET    | `/users`   | List users (Redis cached)         |
| POST   | `/users`   | Create a user `{name, email}`     |
| POST   | `/token`   | Generate JWT `{username}`         |

**Environment Variables (`.env`):**

| Variable      | Description              |
|---------------|--------------------------|
| `DB_PASSWORD` | PostgreSQL password      |
| `JWT_SECRET`  | Secret for JWT signing   |

## Dockerfile Highlights

All Dockerfiles follow production best practices:

- **Multi-stage builds** — separate build and runtime stages to minimize image size
- **Non-root users** — containers run as `appuser` (UID 1001)
- **Health checks** — built-in Docker HEALTHCHECK instructions
- **Layer caching** — dependencies installed before source code copy
- **Minimal base images** — Alpine / slim / scratch variants

## Docker Volume Persistence Demo

See [docker-volume-test.md](docker-volume-test.md) for a step-by-step walkthrough demonstrating data persistence across container restarts using named volumes with PostgreSQL.

## Quick Start — Run All Apps

```bash
# Build and run the three simple apps
docker build -t node-app ./node-app && docker run -d -p 3000:3000 --name node-app node-app
docker build -t python-app ./python-app && docker run -d -p 8000:8000 --name python-app python-app
docker build -t go-app ./go-app && docker run -d -p 8080:8080 --name go-app go-app

# Run the production stack
cd production-node-app && docker compose up -d --build

# Verify
curl http://localhost:3000        # Node
curl http://localhost:8000        # Python
curl http://localhost:8080        # Go
curl http://localhost:3000/health # Production (when port 3000 is free)
```

## Cleanup

```bash
# Stop simple app containers
docker rm -f node-app python-app go-app

# Stop production stack and remove volumes
cd production-node-app && docker compose down -v
```
