import { database } from "../database"; // Assuming your database connection is in this file

// Function to update user statuses
export const updateUserStatuses = async () => {
  try {
    const currentTime = new Date().getTime();

    // Query users who haven't updated their activity timestamp in the last 10 minutes
    await database.db.run(
      `UPDATE users SET online_status = 'offline' WHERE last_activity < ? AND online_status = 'online'`,
      [currentTime - 10 * 60 * 1000] // 10 minutes ago
    );
  } catch (error) {
    console.error("Error updating user statuses:", error);
  }
};

// Set an interval to update user statuses every 5 minutes
export const startUserStatusUpdater = () => {
  setInterval(updateUserStatuses, 5 * 60 * 1000); // 5 minutes interval //5 * 60 * 1000
};
