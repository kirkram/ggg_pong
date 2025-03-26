import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';
import { Env } from './env';
import { initializeDatabase } from './database'; // Import the initializeDatabase function
import { authRoutes } from './routes/authRoutes';  // Import authRoutes
import { userRoutes } from './routes/userRoutes';  // Import userRoutes

// Augmenting the FastifyRequest type to include the user property
declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: { username: string };
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: { username: string }
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

// Create the Fastify app instance
export const app = Fastify({ logger: Env.Logger });

// Register JWT plugin for signing and verifying tokens
app.register(jwt, { secret: Env.JwtSecret });

// Define the 'authenticate' decorator with proper types
app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Verify the JWT token and attach the user data to request.user
    const decoded = await request.jwtVerify() as { username: string };
    request.user = { username: decoded.username }; // Safely cast the decoded token to the correct type
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized access' });
  }
});

// Initialize the database (create tables if they don't exist)
initializeDatabase();

// Register authentication and user routes
app.register(authRoutes);
app.register(userRoutes);

// Root Route
app.get('/', async (request, reply) => {
  // this should send static frontend files
  return { message: 'Hello, Fastify with TypeScript!' };
});

// Protected Route Example (Use authenticate for JWT verification)
app.get('/info', { preHandler: [app.authenticate] }, async (request, reply) => {
  return reply.send({ user: request.user });
});

