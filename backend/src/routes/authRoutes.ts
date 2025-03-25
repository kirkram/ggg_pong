import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../database';
import { send2FACode, sendLoginSuccessEmail, sendPasswordResetEmail } from '../emailService';

export const authRoutes = async (app: FastifyInstance) => {
  // Login Route
  app.post('/login', async (request, reply) => {
    const { username, password } = request.body as { username: string, password: string };

    // Find user by username
    const user = await db.sqlite.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Generate a 2FA code and send it via email
    const twoFACode = crypto.randomBytes(3).toString('hex'); // 6-character hex string
    await send2FACode(user.email, twoFACode, user.username);

    // Save the 2FA code in the database (this could also be stored in memory for a short time)
    await db.sqlite.run('UPDATE users SET secret = ? WHERE username = ?', [twoFACode, username]);

    // Send a login success email
    await sendLoginSuccessEmail(user.email, user.username);

    return reply.send({ message: '2FA code sent to email. Please verify your code.' });
  });

  // Verify 2FA Route
  app.post('/verify-2fa', async (request, reply) => {
    const { username, twoFACode } = request.body as { username: string, twoFACode: string };

    // Find user by username
    const user = await db.sqlite.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return reply.status(401).send({ error: 'User not found' });
    }

    // Check if the 2FA code matches
    if (user.secret !== twoFACode) {
      return reply.status(400).send({ error: 'Invalid 2FA code' });
    }

    // Optionally, clear the stored 2FA code after verification
    await db.sqlite.run('UPDATE users SET secret = NULL WHERE username = ?', [username]);

    // Generate JWT token after 2FA verification
    const token = app.jwt.sign({ username });

    return reply.send({ token });
  });

  // Password Reset Request Route
  app.post('/reset-password', async (request, reply) => {
    const { email } = request.body as { email: string };

    // Find the user by email
    const user = await db.sqlite.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return reply.status(400).send({ error: 'No user found with this email address.' });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Save the reset token in the database (you should set an expiration time for the token)
    await db.sqlite.run('UPDATE users SET reset_token = ? WHERE email = ?', [resetToken, email]);

    // Send the reset email with a link
    const resetLink = `${Env.FrontendBaseUrl}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, resetLink);

    return reply.send({ message: 'Password reset email sent. Please check your inbox.' });
  });
};

