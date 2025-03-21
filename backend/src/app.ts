import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import { Env } from './env';

export const app = Fastify({ logger: Env.Logger });

// Register JWT plugin
app.register(jwt, { secret: Env.JwtSecret });

// Dummy user database
const users: { username: string, password: string }[] = [];

// Register (Sign Up)
app.post('/register', async (request, reply) => {
  const { username, password } = request.body as { username: string, password: string };

  // Check if user exists
  if (users.find(user => user.username === username)) {
    return reply.status(400).send({ error: 'User already exists' });
  }

  // Save user (in a real app, hash the password!)
  users.push({ username, password });

  return reply.send({ message: 'User registered successfully' });
});

// Login
app.post('/login', async (request, reply) => {
  const { username, password } = request.body as { username: string, password: string };

  // Find user
  const user = users.find(user => user.username === username && user.password === password);
  
  if (!user) {
    return reply.status(401).send({ error: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = app.jwt.sign({ username });

  return reply.send({ token });
});

// Middleware to protect routes
async function authenticate(request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}

// Protected Route
app.get('/profile', { preHandler: [authenticate] }, async (request: any, reply) => {
  return reply.send({ message: `Hello, ${request.user.username}` });
});

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