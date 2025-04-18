import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create a temporary connection without database to create the database
const createDbConnection = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Gamma@111r'
  });
  return connection;
};

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Gamma@111r',
  database: process.env.DB_NAME || 'fashionscore',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database by running the SQL script
async function initializeDatabase() {
  try {
    // First create a connection without specifying a database
    const connection = await createDbConnection();
    
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS fashionscore;`);
    
    // Close the temporary connection
    await connection.end();
    
    console.log('Database created successfully');
    
    // Use the database
    await pool.query(`USE fashionscore;`);
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create outfit_uploads table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS outfit_uploads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        image_path VARCHAR(255) NOT NULL,
        score FLOAT,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    
    // Create deleted_accounts_data table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deleted_accounts_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        account_created_at TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        outfit_count INT DEFAULT 0,
        deletion_reason VARCHAR(255),
        additional_data TEXT
      );
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Test database connection - useful for deployment verification
async function testDatabaseConnection() {
  try {
    // Try to connect to the database
    const connection = await pool.getConnection();
    console.log('Database connection successful!');
    
    // Get database version info
    const [rows] = await connection.query('SELECT VERSION() as version');
    console.log(`Database version: ${rows[0].version}`);
    
    // Release the connection
    connection.release();
    return { success: true, version: rows[0].version };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      // Include helpful info based on common errors
      hint: error.code === 'ECONNREFUSED' ? 'Check if the database server is running and the host is correct' :
            error.code === 'ER_ACCESS_DENIED_ERROR' ? 'Check your database username and password' :
            error.code === 'ER_BAD_DB_ERROR' ? 'The database does not exist, it will be created automatically on first run' :
            'Check your database configuration'
    };
  }
}

// Export the connection pool and initialization function
export { pool, initializeDatabase, testDatabaseConnection }; 