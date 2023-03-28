
const { Pool } = require('pg');
const NodeCache = require('node-cache');

// Create a new NodeCache instance

const cache = new NodeCache({maxKeys: 5000});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    idleTimeoutMillis: 30 * 60 * 1000,
    connectionTimeoutMillis: 5000,
    max: 5
  });

const logPoolStatus = () => console.log(`Pool status - total: ${pool.totalCount}, idle: ${pool.idleCount}, waiting: ${pool.waitingCount}`);

// Listen for the connect event
pool.on('connect', () => console.log('New client connected to the pool'));

// Listen for the remove event
pool.on('remove', () => console.log('Client removed from the pool'));

let lastQueryTime = 0;

const ensureMinimumConnections = async () => {
  // Check if there are any idle clients in the pool
  const clients = await pool.connect();
  await clients.query('SELECT 1');
  clients.release();
  return;
};


// Call the async function to ensure that there is at least one connection in the pool
ensureMinimumConnections().catch(err => console.error(err));

// Use a setInterval to periodically check if there is still at least one connection in the pool
setInterval(() => {
  ensureMinimumConnections().catch(err => console.error(err));
}, 25 * 60 * 1000); // Check every 10 seconds

setInterval(() => {
  //logPoolStatus()
}, 200); // Check every 10 seconds

exports.fetchIngredientByName = async (name, page=1, limit=5, disableCache=false) => {
    const cacheKey = `ingredients:${name}:${page}:${limit}`;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    // Check if the data is already cached
    console.time("CACHE CHECK")
    const cachedData = cache.get(cacheKey);
    console.timeEnd("CACHE CHECK")
  
    if (cachedData && !disableCache) {
      // Return the cached data
      return cachedData
    } else {
      // Get connection from pool

      let client = await pool.connect();

      // Build the SQL query
      let sql = 'SELECT id,text AS name,score,description FROM ingredients';
      const values = [];
  
      if (name) {
        const ingredientName = `%${name}%`;
        sql += ' WHERE text ILIKE $1';
        values.push(ingredientName);
      }

      // Pagination
      sql += ` LIMIT ${limit} OFFSET ${offset};`;
  
      // Query the database
      console.time("SQL REQUEST")
      const result = await client.query(sql, values);
      console.timeEnd("SQL REQUEST");
  
      client.release();
      // Cache the result
      console.time("CACHE SET")
      cache.set(cacheKey, result.rows);
      console.timeEnd("CACHE SET")
  
      // Return the result
      return result.rows;
    }
  };
  