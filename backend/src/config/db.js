// =====================================================================
// Database Configuration and Connection Pool
// Uses mysql2 with promise support and connection pooling
// =====================================================================

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config();

// Create a connection pool to efficiently manage and reuse database connections
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'research_portal',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // dateStrings: true ensures MySQL DATE columns are returned as 'YYYY-MM-DD' strings
  // rather than ISO UTC timestamps that can shift dates across time zones.
  dateStrings: true
});

module.exports = pool;
