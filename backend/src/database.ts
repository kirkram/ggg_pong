import Fastify from "fastify";
import { fpSqlitePlugin } from "fastify-sqlite-typed";

// Initialize the Fastify instance
const database = Fastify();

// Register the SQLite plugin
database.register(fpSqlitePlugin, {
  dbFilename: "./database.db", // Define the path to the SQLite database file
});

// Function to initialize the database (creating the table)
export const initializeDatabase = async () => {
  try {
    await database.ready();
    // Create table if it doesn't exist already
    // profilePic - URL or file path for the picture
    // dateOfBirth - ISO date format e.g. "YYYY-MM-DD"
    await database.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        reset_token TEXT,
        secret TEXT,
        firstName TEXT,
        lastName TEXT,
        dateOfBirth TEXT,
        gender TEXT CHECK(gender IN ('male', 'female', 'other')) DEFAULT 'other',
        favAvatar TEXT CHECK(favAvatar IN ('None', 'QueenOfTheSpoons', 'JustBorn', 'Maslina', 'BossLady', 'Inka', 'Burek', 'Fish', 'WarMachine', 'Finn', 'GangGanger', 'StabIlity', 'VampBoy')) DEFAULT 'None',
        language TEXT CHECK(language IN ('english', 'serbian', 'finnish', 'russian')) DEFAULT 'english',
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        profilePic TEXT 
      )
    `);
    await database.db.exec(`
      CREATE TABLE IF NOT EXISTS games (
        id_game INTEGER PRIMARY KEY AUTOINCREMENT,
        id_user TEXT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        rounds_json TEXT NOT NULL
      )
    `);
    console.log("Database and tables are ready");
  } catch (error) {
    console.error("Error creating database table:", error);
  }
};

// Export db to interact with it in other parts of the database
export { database };
