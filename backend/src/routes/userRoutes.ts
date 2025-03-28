import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { database } from '../database'
import { Env } from '../env'
import { useResolvedPath } from 'react-router-dom'
import { fdatasync } from 'fs'
import fastifyMultipart  from '@fastify/multipart'
import fs from 'fs'
import { pipeline } from 'stream/promises'
import { sendGameAchievementEmail } from '../emailService'

// change it completely when you start working on user stuff!!!
interface UpdateField {
  field: string
  value: any
}

export const userRoutes = async (app: FastifyInstance) => {
  // Retrieving Profile Data
  app.get('/get-profile/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const profile = await database.db.get(
      'SELECT username, email, profilePic, firstName, lastName, gender, dateOfBirth, wins, losses, language FROM users WHERE id = ?'
      , [id]);
      return reply.send(profile);
  })
  
  // Profile Update
  app.patch('/update-field/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { field, value } = request.body as UpdateField;

    const allowedFields = ['firstNAme', 'lastName', 'gender', 'dateOfBirth', 'language'];
    if (!allowedFields.includes(field)) {
      return reply.code(400).send({error: 'Field not allowed to update'});
    }

    const query = 'UPDATE users SET ${field} = ? WHERE id = ?';
    await database.db.run(query, [value, id]);

    return reply.send({ success: true });
  });

  // Uploading profile pic
  app.register(require('@fastify/multipart'));

  app.post('/upload-profile-pic/:id', async (request, reply) => {
    const { id } = request.body as { id: string };

    const data = await request.file(); // using fastify-multipart
    if (!data) {
      return reply.code(400).send({error: 'No file uploaded'});
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(data.mimetype)) {
      return reply.code(400).send({error: 'Invalid file type'});
    }

    const filePath = './profile-pics/${data.filename}';
    try {
      await pipeline(data.file, fs.createWriteStream(filePath));
    } catch (error) {
      return reply.code(500).send({error: 'Error saving file'});
    }

    await database.db.run('UPDATE users SET profilePic = ? WHERE id = ?', [filePath, id]);

    return reply.send({ success: true, profilePic: filePath });
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
