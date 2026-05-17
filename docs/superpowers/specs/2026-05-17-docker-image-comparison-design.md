# Docker Image Comparison Design

## Goal

Add production-ready single-stage and multi-stage Docker builds for every sample app so students can compare build style, runtime image contents, and final image size.

## Scope

Applications covered:

- `node-app`
- `python-app`
- `go-app`
- `production-node-app`

Each app gets:

- `Dockerfile.single` for a production-minded single-stage build.
- `Dockerfile.multi` for a production-minded multi-stage build.
- `.dockerignore` coverage to keep build contexts small.

The existing `Dockerfile` files remain in place so current README commands continue to work.

## CI Design

GitHub Actions are split by lifecycle:

- `.github/workflows/test.yml` validates each application with build and runtime smoke checks.
- `.github/workflows/docker-build.yml` builds both Dockerfile variants for every app and writes an image-size comparison table to the Actions summary.
- `.github/workflows/docker-push.yml` publishes both variants to GHCR on tag, release, or manual dispatch.

Images use this naming convention:

```text
ghcr.io/<owner>/<repo>/<app>:<tag>-single
ghcr.io/<owner>/<repo>/<app>:<tag>-multi
```

The mutable comparison tags `single` and `multi` are also pushed by the publish workflow.

## Production Defaults

The Dockerfiles use deterministic dependency installs, non-root runtime users where the base image supports it, health checks where the runtime image has a health-check tool, minimal runtime stages for multi-stage builds, and OCI labels for traceability.

The Go multi-stage image uses `scratch` for the smallest possible runtime image. It intentionally omits an internal Docker health check because `scratch` does not include a shell, curl, or wget.

