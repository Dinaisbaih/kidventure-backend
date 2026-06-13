import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import userRoutes from './routes/user.routes';
import { pool } from './config/db'; 
import venueRoutes from './routes/venueRoutes';

dotenv.config();

const app = express();
const PORT = 8080;



// Global Middleware
app.use(cors());
app.use(express.json());
// app.get('/', (req, res) => {
//   res.json({
//     status: "online",
//     message: "Welcome to the KidVenture API Gateway!",
//     endpoints: ["/venues"]
//   });
// });

// Mount Modular Resource Router Paths
// app.use('/users', userRoutes);
app.use('/venues', venueRoutes);

// Self-Healing Table Verification Strategy
const initDatabase = async () => {
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS "Venue" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,      -- Stores VenueCategory enum string
      location JSONB NOT NULL,             -- Stores complete Location interface object
      contact JSONB NOT NULL,              -- Stores complete ContactInfo interface object
      images TEXT[] NOT NULL,              -- Stores string array of image URLs
      rating NUMERIC(3, 2) DEFAULT 0.0,
      "reviewCount" INT DEFAULT 0,
      "priceRange" VARCHAR(20) NOT NULL,   -- Stores PriceRange enum string
      "ageGroups" TEXT[] NOT NULL,         -- Stores array of AgeGroup enum strings
      amenities TEXT[] NOT NULL,
      activities JSONB NOT NULL,           -- Stores array of Activity interface objects
      "operatingHours" JSONB NOT NULL,     -- Stores complete OperatingHours interface object
      "isPartner" BOOLEAN DEFAULT false,
      featured BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTablesQuery);
    console.log('✅ Database Schema Synchronized: Venue parameters mapped.');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};


initDatabase();

app.listen(PORT, () => {
  console.log('🚀 Clean Native Backend active at http://localhost:8080');
});
