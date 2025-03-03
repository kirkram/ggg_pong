import Fastify from 'fastify';

import { Env } from './env';

export const app = Fastify({ logger: Env.Logger });

app.get('/info', async (request, response) => {
  // //simulate delay
  // await new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve(0)
  //   }, 5000)
  // })

  return {
    user: {
      name: 'Test',
      email: 'test@test.com'
    }
  }
})

app.get('/', async (request, reply) => {
  return { message: 'Hello, Fastify with TypeScript!' };
});
