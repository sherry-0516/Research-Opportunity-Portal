// =====================================================================
// Server Entry Point
// Connects to MySQL pool and starts the HTTP server
// =====================================================================

const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 3000;

/**
 * Initializes database connectivity check and boots HTTP server
 */
async function startServer() {
  try {
    // Verify MySQL pool connectivity before accepting incoming HTTP requests
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to MySQL database:', process.env.DB_NAME || 'research_portal');
    connection.release();

    // Start listening for HTTP connections
    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚀 University Research Opportunity Portal`);
      console.log(`🌐 Server running at: http://localhost:${PORT}`);
      console.log(`📡 API Base Endpoint: http://localhost:${PORT}/api/opportunities`);
      console.log(`💻 Web Application:   http://localhost:${PORT}/`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('❌ Failed to connect to MySQL database:');
    console.error(err.message);
    console.error('\nPlease verify your .env file settings, credentials, and ensure MySQL is running.');
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\nShutting down server gracefully...');
  try {
    await pool.end();
    console.log('MySQL pool closed.');
  } catch (err) {
    console.error('Error closing pool:', err.message);
  }
  process.exit(0);
});

startServer();
