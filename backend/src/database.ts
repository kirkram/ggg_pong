import Fastify from 'fastify';
import fastifySqlite from '@fastify/sqlite';

// Initialize the Fastify instance
const db = Fastify();

// Register the SQLite plugin
db.register(fastifySqlite, {
  promiseApi: true, // Enable promise-based API
  connectionString: 'sqlite://./database.db' // Define the path to the SQLite database file
});

// Function to initialize the database (creating the table)
export const initializeDatabase = async () => {
  try {
    // Create table if it doesn't exist already
    await db.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        secret TEXT
      )
    `);
    console.log('Database and table are ready');
  } catch (error) {
    console.error('Error creating database table:', error);
  }
};

// Export db to interact with it in other parts of the app
export { db };
