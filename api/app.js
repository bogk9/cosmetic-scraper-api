require('dotenv').config();

// Import required libraries
const express = require('express');
const { Pool } = require('pg');
const compression = require('compression')
const cors = require('cors');

const ingredientsRouter = require('./routes/ingredients');

// Create a new instance of the Express.js application
const app = express();

// Use compression
app.use(cors());
app.use(compression({threshold: 0}))

// Create a new instance of the Pool object for connecting to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Define a route for retrieving ingredient data by ID
app.get('/ingredients/:id', async (req, res) => {
  try {
    // Retrieve the ingredient ID from the request parameters
    const { id } = req.params;

    // Query the database to retrieve the ingredient data
    const { rows } = await pool.query('SELECT * FROM ingredients WHERE id = $1', [id]);

    // If the ingredient is not found, return a 404 error
    if (rows.length === 0) {
      res.status(404).json({ error: `Ingredient with ID ${id} not found` });
      return;
    }

    // Return the ingredient data as JSON
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving the ingredient data' });
  }
});

app.use('/api/ingredients', ingredientsRouter);


// Start the Express.js server
app.listen(process.env.PORT || 8085, () => {
  console.log(`Server listening on port ${process.env.PORT || 8085}`);
});