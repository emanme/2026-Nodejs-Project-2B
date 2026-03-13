const mysql = require('mysql2/promise');
require('dotenv').config(); 

// ISSUE-0026: env vars not used properly (hardcoded config in release)
// ISSUE-0027: hardcoded DB credentials committed in code
// FIX: Use environment variables instead of hardcoded credentials
const CFG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

// ISSUE-0007: database connection not reused (no pool in release)
// FIX: Use a connection pool so connections are reused
const pool = mysql.createPool({
  ...CFG,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Return a pooled connection instead of creating a new one every time
async function getConn() {
  return pool.getConnection();
}

// Export both pool and connection helper
module.exports = { pool, getConn };