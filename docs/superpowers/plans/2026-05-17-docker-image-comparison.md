# Docker Image Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build single-stage and multi-stage Docker demo artifacts for every sample app and add separate test, build, and push workflows.

**Architecture:** Each application owns its Dockerfiles and `.dockerignore`; workflows use matrix jobs over the app list. Build CI loads local images and writes size comparison data to the Actions summary, while push CI publishes tagged images to GHCR.

**Tech Stack:** Docker, GitHub Actions, GHCR, Node.js 20, Python 3.12, Go 1.22, PostgreSQL 16, Redis 7.

---

### Task 1: Add Dockerfile Pairs

**Files:**
- Create: `node-app/Dockerfile.single`
- Create: `node-app/Dockerfile.multi`
- Create: `python-app/Dockerfile.single`
- Create: `python-app/Dockerfile.multi`
- Create: `go-app/Dockerfile.single`
- Create: `go-app/Dockerfile.multi`
- Create: `production-node-app/Dockerfile.single`
- Create: `production-node-app/Dockerfile.multi`

- [ ] Add single-stage Dockerfiles that install dependencies, build in the same image, drop to a non-root user where practical, expose the app port, and define the production command.
- [ ] Add multi-stage Dockerfiles that separate dependency/build/runtime stages and copy only runtime artifacts into the final image.
- [ ] Preserve existing `Dockerfile` files for backward-compatible class commands.

### Task 2: Add Build Context Ignores

**Files:**
- Create: `node-app/.dockerignore`
- Create: `python-app/.dockerignore`
- Create: `go-app/.dockerignore`
- Modify: `production-node-app/.dockerignore`

- [ ] Ignore local dependency directories, compiled output, test caches, VCS metadata, and local environment files.
- [ ] Keep application source, package manifests, lockfiles, and init scripts available where needed.

### Task 3: Add Test Workflow

**Files:**
- Create: `.github/workflows/test.yml`

- [ ] Add separate jobs for Node, Python, Go, and production Node.
- [ ] Run deterministic dependency installation.
- [ ] Compile or build each app.
- [ ] Start each app and check its `/health` endpoint. The production Node job includes PostgreSQL and Redis services.

### Task 4: Add Docker Build Workflow

**Files:**
- Create: `.github/workflows/docker-build.yml`

- [ ] Build `Dockerfile.single` and `Dockerfile.multi` for every app.
- [ ] Load each image into the runner Docker daemon.
- [ ] Inspect image sizes and write a Markdown comparison table to `$GITHUB_STEP_SUMMARY`.

### Task 5: Add Docker Push Workflow

**Files:**
- Create: `.github/workflows/docker-push.yml`

- [ ] Authenticate to GHCR with `GITHUB_TOKEN`.
- [ ] Build and push single-stage and multi-stage variants for every app.
- [ ] Tag pushed images with `<tag>-single`, `<tag>-multi`, `single`, and `multi`.

### Task 6: Verify

**Commands:**

```bash
git status --short
npm ci --prefix node-app
npm run build --prefix node-app
npm ci --prefix production-node-app
npm run build --prefix production-node-app
python3 -m compileall python-app/app
go test ./...
docker build -f node-app/Dockerfile.single -t docker-lab-node-app:single node-app
docker build -f node-app/Dockerfile.multi -t docker-lab-node-app:multi node-app
```

- [ ] Run syntax/build checks that are available locally.
- [ ] Run representative Docker builds.
- [ ] Report any verification command that cannot run in the local environment.

