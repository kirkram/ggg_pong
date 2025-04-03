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
      await database.db.run(
        `INSERT INTO friendships (sender_id, receiver_id, status) VALUES (?, ?, 'Pending')`,
        [sender_id, receiver_id]
      );
      return reply.send({ message: "Friend request sent" });
    } catch (error) {
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
}
