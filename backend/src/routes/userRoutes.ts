import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { database } from '../database'
import { sendPasswordResetEmail, sendGameAchievementEmail } from '../emailService'
import { Env } from '../env'

// change it completely when you start working on user stuff!!!


export const userRoutes = async (app: FastifyInstance) => {
  

  // Game Achievement Route
  app.post('/game-achievement', async (request, reply) => {
    const { username, email, position } = request.body as { username: string, email: string, position: number };

    if (position === 1) {
      // Send congratulatory email when user gets 1st place
      await sendGameAchievementEmail(email, username);
    }

    return reply.send({ message: `Game result: ${username} finished in position ${position}` });
  });
};
