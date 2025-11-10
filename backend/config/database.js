import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

/**
 * PostgreSQL database connection pool
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'macworld_inventory',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
})

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

/**
 * Execute a SQL query
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
export const query = async (text, params) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise} Pool client
 */
export const getClient = async () => {
  const client = await pool.connect()
  const query = client.query
  const release = client.release
  
  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!')
  }, 5000)
  
  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args
    return query.apply(client, args)
  }
  
  // Monkey patch the release method to clear our timeout
  client.release = () => {
    clearTimeout(timeout)
    client.query = query
    client.release = release
    return release.apply(client)
  }
  
  return client
}

export default pool

