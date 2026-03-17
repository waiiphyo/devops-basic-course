import express from "express";
import { Pool } from "pg";
import Redis from "ioredis";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Redis connection
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to DevOps Course - This is Production Node app",
    services: { postgres: "connected", redis: "connected" },
  });
});

// Health check
app.get("/health", async (_req, res) => {
  try {
    const pgResult = await pool.query("SELECT 1");
    const redisResult = await redis.ping();

    res.json({
      status: "ok",
      postgres: pgResult.rows.length > 0 ? "healthy" : "unhealthy",
      redis: redisResult === "PONG" ? "healthy" : "unhealthy",
    });
  } catch (err) {
    res.status(503).json({
      status: "error",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Get all users
app.get("/users", async (_req, res) => {
  try {
    const cached = await redis.get("users");
    if (cached) {
      return res.json({ source: "cache", data: JSON.parse(cached) });
    }

    const result = await pool.query("SELECT id, name, email, created_at FROM users ORDER BY id");
    await redis.set("users", JSON.stringify(result.rows), "EX", 60);
    res.json({ source: "database", data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// Create a user
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at",
      [name, email]
    );
    await redis.del("users");
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// Generate a sample JWT token
app.post("/token", (req, res) => {
  const { username } = req.body;
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

app.listen(PORT, () => {
  console.log(`Production server running on port ${PORT}`);
});
