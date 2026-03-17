# ---- Build Stage ----
FROM golang:1.22-alpine AS builder
WORKDIR /app

# Cache dependencies
RUN apk add --no-cache ca-certificates tzdata

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s -X main.version=1.0.0" \
    -o /app/server ./cmd/server

# ---- Production Stage ----
FROM scratch
LABEL maintainer="devops@company.com"

# Import CA certificates for HTTPS
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Import timezone data
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copy the binary
COPY --from=builder /app/server /server

EXPOSE 8080

ENTRYPOINT ["/server"]

