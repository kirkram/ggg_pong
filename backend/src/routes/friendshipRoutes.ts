import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { database } from '../database';

export async function friendshipRoutes(app: FastifyInstance) {
  // Send a friend request
  app.post('/friendships/request', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { receiver_id } = request.body as { receiver_id: number };
    const sender_id = request.user.id;

    if (sender_id === receiver_id) {
      return reply.status(400).send({ error: "You cannot friend yourself" });
    }

    try {
      console.log("Inserting friendship into database...");
      console.log('Request body:', request.body);  
      console.log(`Sender ID: ${sender_id}, Receiver ID: ${receiver_id}`);

      await database.db.run(
        `INSERT INTO friendships (sender_id, receiver_id, status) VALUES (?, ?, 'Pending')`,
        [sender_id, receiver_id]
      );
      console.log("Friend request sent very successfully");

      return reply.send({ message: "Friend request sent" });
    } catch (error) {
      console.error('Error inserting friendship:', error);
      return reply.status(500).send({ error: "Failed to send friend request" });
    }
  });

  // Accept or reject a friend request
  app.patch('/friendships/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const { status } = request.body as { status: 'Friend' | 'Rejected' };
    const user_id = request.user.id;

    if (!['Friend', 'Rejected'].includes(status)) {
      return reply.status(400).send({ error: "Invalid status" });
    }

    try {
      const { changes } = await database.db.run(
        `UPDATE friendships SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE receiver_id = ? AND sender_id = ? AND status = 'Pending'`,
        [status, user_id, id]
      );

      if (changes === 0) {
        return reply.status(404).send({ error: "No pending friend request found" });
      }

      return reply.send({ message: `Friend request ${status.toLowerCase()}` });
    } catch (error) {
      return reply.status(500).send({ error: "Failed to update friendship status" });
    }
  });

  // Remove a friend
  app.delete('/friendships/:id', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const user_id = request.user.id;

    try {
      const { changes } = await database.db.run(
        `DELETE FROM friendships WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`,
        [user_id, id, id, user_id]
      );

      if (changes === 0) {
        return reply.status(404).send({ error: "Friendship not found" });
      }

      return reply.send({ message: "Friend removed" });
    } catch (error) {
      return reply.status(500).send({ error: "Failed to remove friend" });
    }
  });

  // Get a user's friends
  app.get('/friendships', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user_id = request.user.id;

    try {
      const friends = await database.db.all(
        `SELECT u.id, u.username FROM users u 
        JOIN friendships f ON u.id = f.receiver_id 
        WHERE f.sender_id = ? AND f.status = 'Friend'`,
        [user_id]
      );

      return reply.send({ friends });
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch friends" });
    }
  });

  // Add friendships for all users except the current user
  app.post('/friendships/add-all', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const currentUserId = request.user.id;

    try {
      // Get all users except the current user
      const users = await database.db.all(
        `SELECT id FROM users WHERE id != ?`,
        [currentUserId]
      );

      // Insert friendships for each user (with status 'Pending')
      const friendshipPromises = users.map((user: { id: number }) =>
        database.db.run(
          `INSERT OR IGNORE INTO friendships (sender_id, receiver_id, status) VALUES (?, ?, 'Pending')`,
          [currentUserId, user.id]
        )
      );

      // Wait for all insertions to complete
      await Promise.all(friendshipPromises);

      return reply.send({ message: 'Friendships added successfully for all users except yourself' });
    } catch (error) {
      console.error('Error creating friendships:', error);
      return reply.status(500).send({ error: 'Failed to add friendships for all users' });
    }
  });

// Get all users except the current one
app.get('/users', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const currentUserId = request.user.id;
  
    try {
      const users = await database.db.all(
        `SELECT id, username FROM users WHERE id != ?`,  // Adjust query as needed
        [currentUserId]
      );
  
      return reply.send(users);
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch users" });
    }
  });  
}

