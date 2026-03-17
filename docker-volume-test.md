## Create a named volume for database data
```docker volume create pgdata```

## Run PostgreSQL with the volume
```docker run -d \
  --name postgres \
  -e POSTGRES_USER=appuser \
  -e POSTGRES_PASSWORD=secretpass123 \
  -e POSTGRES_DB=myapp \
  -v pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine
```
## Verify it's running
```docker logs postgres```
## Connect and create a table
```docker exec -it postgres psql -U appuser -d myapp -c "
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL
  );
  INSERT INTO users (name, email) VALUES ('Test User', 'test@example.com');
"
```
## Prove persistence: destroy and recreate container
```docker rm -f postgres
docker run -d --name postgres -e POSTGRES_USER=appuser \
  -e POSTGRES_PASSWORD=secretpass123 -e POSTGRES_DB=myapp \
  -v pgdata:/var/lib/postgresql/data -p 5432:5432 postgres:16-alpine
```
## Data survives! Verify:
```docker exec -it postgres psql -U appuser -d myapp -c "SELECT * FROM users;"```

## Stop the container
```docker stop <container-id>```