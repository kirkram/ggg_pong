import Fastify from 'fastify';
import { fpSqlitePlugin } from "fastify-sqlite-typed"

// Initialize the Fastify instance
const database = Fastify();

// Register the SQLite plugin
database.register(fpSqlitePlugin, {
  dbFilename: './database.db' // Define the path to the SQLite database file
});

// Function to initialize the database (creating the table)
export const initializeDatabase = async () => {
  try {
    await database.ready()
    // Create table if it doesn't exist already
    await database.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        reset_token TEXT,
        secret TEXT
      )
    `);
    console.log('Database and table are ready');
  } catch (error) {
    console.error('Error creating database table:', error);
  }
};

// Export db to interact with it in other parts of the database
export { database };
