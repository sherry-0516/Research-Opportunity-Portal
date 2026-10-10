/**
 * One-command database setup.
 *
 * Runs ../database/schema.sql (and optionally sample_data.sql) using the
 * credentials in .env, so you do NOT need MySQL Workbench or the mysql CLI.
 *
 * Usage:
 *   npm run setup-db            -> creates database + table
 *   npm run setup-db -- --sample -> also inserts the optional sample rows
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const withSample = process.argv.includes('--sample');

  // No "database" option here: schema.sql itself creates the database.
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // allows running a whole .sql file at once
  });

  try {
    const dbDir = path.join(__dirname, '..', '..', 'database');
    const files = ['schema.sql'];
    if (withSample) files.push('sample_data.sql');

    for (const file of files) {
      const sql = fs.readFileSync(path.join(dbDir, file), 'utf8');
      await connection.query(sql);
      console.log(`✅ Executed database/${file}`);
    }
    console.log('🎉 Database is ready. Now run: npm start');
  } finally {
    await connection.end();
  }
}

run().catch((err) => {
  console.error('❌ Database setup failed:', err.code || '', err.message);
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('   -> Wrong DB_USER / DB_PASSWORD in backend/.env');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('   -> MySQL is not running. Start the MySQL service first.');
  }
  process.exit(1);
});
