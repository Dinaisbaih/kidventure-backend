import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // FORCE SSL: This passes the SSL/TLS verification rules required by Render cloud
  ssl: {
    rejectUnauthorized: false, // Allows connection to Render's dynamically signed certificates
  },
});

export interface UserRow {
  id: number;
  email: string;
  name: string | null;
  created_at: Date;
}
