import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface UserRow {
  id: number;
  email: string;
  name: string | null;
  created_at: Date;
}
