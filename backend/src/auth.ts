import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer'; // Import nodemailer for sending emails
import crypto from 'crypto'; // Import crypto for generating random 2FA codes
import { db } from './database'; // Assuming you have a database.ts file for your database connection
import { Env } from './env'; // Import the .env configuration

// Function to send the 2FA code via email
const send2FACode = async (email: string, code: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail to send email (you can configure other services as well)
    auth: {
      user: Env.EmailUser,
      pass: Env.EmailPass,
    },
  });

  const mailOptions = {
    from: `"Gang HQ" <${Env.EmailUser}>`,  // This will show "Gang HQ" as the sender name
    to: email,  // Recipient's email
    subject: 'Gang Gang Gang - Game Code',
    text: `Yo!
  
  Welcome to the gang, ${username}! 🔥 Here's your exclusive game code:
  
  🎮 Your Code: ${code}
  
  Use it wisely... or don’t. We don’t judge. 😎
  
  If you didn’t request this code, it means someone’s trying to get in on your action! Tell them to back off and get their own invite. 💥
  
  Stay awesome,
  The Gang HQ
  
  P.S. Stay dangerous. 🚀
  `,
    html: `
      <h2>Yo, ${username}!</h2>
      <p>Welcome to the gang. 🔥 Here's your exclusive game code:</p>
      <h3 style="color: red;">🎮 Your Code: <b>${code}</b></h3>
      <p>Use it wisely... or don’t. We don’t judge. 😎</p>
      <p>If you didn’t request this, it means someone’s trying to get in on your action! Tell them to back off and get their own invite. 💥</p>
      <br>
      <p>Stay awesome,</p>
      <p><b>The Gang HQ</b></p>
      <p><i>P.S. Stay dangerous. 🚀</i></p>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('2FA code sent to:', email);
  } catch (error) {
    console.error('Error sending 2FA code:', error);
  }
};

// Register User (Sign Up)
export const registerUser = async (app: FastifyInstance) => {
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
};

// Login (Generate JWT Token and initiate 2FA)
export const loginUser = async (app: FastifyInstance) => {
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
    await send2FACode(user.email, twoFACode);

    // Save the 2FA code in the database (this could also be stored in memory for a short time)
    await db.sqlite.run('UPDATE users SET secret = ? WHERE username = ?', [twoFACode, username]);

    return reply.send({ message: '2FA code sent to email. Please verify your code.' });
  });

  // Verify 2FA code
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
};
