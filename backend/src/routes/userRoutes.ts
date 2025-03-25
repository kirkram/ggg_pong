import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../database';
import { sendPasswordResetEmail, sendGameAchievementEmail } from '../emailService';

export const userRoutes = async (app: FastifyInstance) => {
  // User Registration Route
  app.post('/register', async (request, reply) => {
    const { username, password, email } = request.body as { username: string, password: string, email: string };

    // Check if user already exists
    const existingUser = await db.sqlite.get('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return reply.status(400).send({ error: 'User already exists' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to the database
    await db.sqlite.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email]);

    return reply.send({ message: 'User registered successfully' });
  });

  // Update Password Route (for password reset after clicking the reset link)
  app.post('/update-password', async (request, reply) => {
    const { resetToken, newPassword } = request.body as { resetToken: string, newPassword: string };

    // Find user by reset token
    const user = await db.sqlite.get('SELECT * FROM users WHERE reset_token = ?', [resetToken]);
    if (!user) {
      return reply.status(400).send({ error: 'Invalid or expired reset token.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token
    await db.sqlite.run('UPDATE users SET password = ?, reset_token = NULL WHERE reset_token = ?', [hashedPassword, resetToken]);

    return reply.send({ message: 'Password successfully updated!' });
  });

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
