import express, { Request, Response } from "express";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json()); // Allows your server to parse incoming JSON payloads

// 1. Establish the Native PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Define a strict TypeScript interface to type-check your database results
interface UserRow {
  id: number;
  email: string;
  name: string | null;
  created_at: Date;
}

// 2. Self-Healing Database Initialization Script
// This checks for your table automatically on startup so you don't need external database tools.
const initDatabase = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS "User" (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log('✅ Database Connection Stable: "User" table verified.');
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  }
};

initDatabase();

// 3. GET Endpoint: Fetch all users from PostgreSQL
app.get("/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query<UserRow>(
      'SELECT * FROM "User" ORDER BY id ASC;',
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Database selection error:", error);
    res.status(500).json({ error: "Failed to fetch users from database" });
  }
});

// 4. POST Endpoint: Create a new user with query parameterization (prevents SQL injection)
app.post("/users", async (req: Request, res: Response) => {
  const { email, name } = req.body;

  if (!email) {
    res.status(400).json({ error: "The email property is required." });
    return;
  }

  try {
    const queryText =
      'INSERT INTO "User"(email, name) VALUES($1, $2) RETURNING *;';
    const values = [email, name || null];

    const result = await pool.query<UserRow>(queryText, values);
    res.status(201).json(result.rows[0]); // Return the single newly created row item
  } catch (error: any) {
    console.error("Database insertion error:", error);

    // PostgreSQL error code '23505' represents a Unique Constraint Violation
    if (error.code === "23505") {
      res.status(400).json({
        error: "A user account with this email address already exists.",
      });
    } else {
      res.status(500).json({ error: "Internal server database error." });
    }
  }
});

// Start listening for network traffic
app.listen(PORT, () => {
  console.log(`🚀 Clean Native Backend active at http://localhost:${PORT}`);
});
