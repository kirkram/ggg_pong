import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import { Env } from './env';
import { initializeDatabase } from './database'; // Import the initializeDatabase function
import { authRoutes } from './routes/authRoutes';  // Import authRoutes
import { userRoutes } from './routes/userRoutes';  // Import userRoutes

export const app = Fastify({ logger: Env.Logger });

// Register JWT plugin for signing and verifying tokens
app.register(jwt, { secret: Env.JwtSecret });

// Initialize the database (create tables if they don't exist)
initializeDatabase();

// Register authentication and user routes
app.register(authRoutes);
app.register(userRoutes);

// Info Route (Public)
app.get('/info', async (request, reply) => {
  return {
    user: {
      name: 'Test',
      email: 'test@test.com'
    }
  };
});

// Root Route
app.get('/', async (request, reply) => {
  return { message: 'Hello, Fastify with TypeScript!' };
});

// Protected Route Example
app.get('/profile', { preHandler: [app.authenticate] }, async (request, reply) => {
  return reply.send({ message: `Hello, ${request.user.username}` });
});
