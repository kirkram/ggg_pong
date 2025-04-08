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
        profilePic TEXT,
        online_status TEXT CHECK(online_status IN ('offline', 'online')) DEFAULT 'offline',
        last_activity number DEFAULT 0
      )
    `);

    // Create friendships table (if it doesn't exist)
    await database.db.exec(`
      CREATE TABLE IF NOT EXISTS friendships (
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        sender_username TEXT NOT NULL,
        receiver_username TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('Not Friend', 'Pending', 'Friend')),
        PRIMARY KEY (sender_id, receiver_id),
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Database and table are ready');
  } catch (error) {
    console.error('Error creating database table:', error);
  }
};

// Export db to interact with it in other parts of the database
export { database };
