import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getAllVenues = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetches all records from PostgreSQL; JSONB fields are parsed into objects automatically by pg
    const result = await pool.query('SELECT * FROM "Venue" ORDER BY id ASC;');
    res.json(result.rows);
  } catch (error) {
    console.error("Database select execution error:", error);
    res.status(500).json({ error: "Failed to fetch venue records from database." });
  }
};

export const createVenue = async (req: Request, res: Response): Promise<void> => {
  const { 
    name, description, category, location, contact, images, 
    rating, reviewCount, priceRange, ageGroups, amenities, 
    activities, operatingHours, isPartner, featured 
  } = req.body;

  // Enforce validation constraints for structural fields
  if (!name || !description || !category || !location || !contact || !priceRange || !operatingHours) {
    res.status(400).json({ error: "Missing required core parameters for Venue creation." });
    return;
  }

  try {
    const queryText = `
      INSERT INTO "Venue"(
        name, description, category, location, contact, images, 
        rating, "reviewCount", "priceRange", "ageGroups", amenities, 
        activities, "operatingHours", "isPartner", featured
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
      RETURNING *;
    `;
    
    // Objects and nested interfaces must be stringified before inserting into JSONB fields
    const values = [
      name, 
      description, 
      category,                          // string from VenueCategory enum
      JSON.stringify(location),          // Object matching Location interface
      JSON.stringify(contact),           // Object matching ContactInfo interface
      images || [],                      // text[]
      rating || 0.0, 
      reviewCount || 0, 
      priceRange,                        // string from PriceRange enum
      ageGroups || [],                   // text[] containing AgeGroup enums
      amenities || [],                   // text[]
      JSON.stringify(activities || []),  // Array of Activity interface objects
      JSON.stringify(operatingHours),    // Object matching OperatingHours interface
      isPartner || false, 
      featured || false
    ];

    const result = await pool.query(queryText, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Database insertion error:", error);
    res.status(500).json({ error: "Failed to create venue inside database." });
  }
};
