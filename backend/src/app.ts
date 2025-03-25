import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import { Env } from './env'; // Assuming you have env.ts for environment variables
import auth from './auth'; // Import the auth.ts file
import { initializeDatabase } from './database'; // Import the initializeDatabase function

export const app = Fastify({ logger: Env.Logger });

// Register JWT plugin for signing and verifying tokens
app.register(jwt, { secret: Env.JwtSecret });

// Initialize the database (create tables if they don't exist)
initializeDatabase();

// Register the authentication routes from the auth.ts file
app.register(auth);

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