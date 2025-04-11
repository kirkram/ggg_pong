import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { database } from "../database";
import {
  send2FACode,
  sendPasswordResetEmail,
  sendRegisterSuccessEmail,
} from "../emailService";
import { Env } from "../env";

interface RegisterInput {
  username: string;
  password: string;
  email: string;
}

interface LoginInput {
  username: string;
  password: string;
}

interface VerifyInput {
  username: string;
  code: string;
}

interface ResetPasswordInput {
  email: string;
}

interface ChangePasswordInput {
  token: string;
  password: string;
}

// In authRoutes.ts
export const authRoutes = async (app: FastifyInstance) => {
  app.post("/register", async (request, reply) => {
    try {
      const { username, password, email } = request.body as RegisterInput;

      const existingUser = await database.db.get(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        [username, email]
      );
      if (existingUser) {
        return reply.status(400).send({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into the database
      await database.db.run(
        `INSERT INTO users 
         (username, password, email, gender, favAvatar, language, wins, losses, profilePic, online_status, last_activity)
         VALUES (?, ?, ?, 'other', 'None', 'english', 0, 0, '/profile-pics/default-profile.jpg', 'offline', 0)`,
        [username, hashedPassword, email]
      );

      // Get the new user's info
      const newUser = await database.db.get(
        "SELECT id, username FROM users WHERE username = ?",
        [username]
      );
      const newUserId = newUser.id;
      const newUsername = newUser.username;

      // Get all existing users except the new user
      const users = await database.db.all(
        "SELECT id, username FROM users WHERE id != ?",
        [newUserId]
      );

      // Create "Not Friend" entries in both directions
      const friendshipPromises = users.flatMap(
        (user: { id: number; username: string }) => [
          database.db.run(
            `INSERT OR IGNORE INTO friendships 
          (sender_id, receiver_id, sender_username, receiver_username, status) 
        VALUES (?, ?, ?, ?, 'Not Friend')`,
            [newUserId, user.id, newUsername, user.username]
          ),
          database.db.run(
            `INSERT OR IGNORE INTO friendships 
          (sender_id, receiver_id, sender_username, receiver_username, status) 
        VALUES (?, ?, ?, ?, 'Not Friend')`,
            [user.id, newUserId, user.username, newUsername]
          ),
        ]
      );

      await Promise.all(friendshipPromises);

      // Send a registration success email
      await sendRegisterSuccessEmail(email, username);

      return reply.send({ message: "User registered successfully" });
    } catch (err) {
      console.error("🔥 Registration error:", err);
      return reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  // export const authRoutes = async (app: FastifyInstance) => {
  //   app.post('/register', async (request, reply) => {
  //     try {
  //       const { username, password, email } = request.body as RegisterInput;

  //       const existingUser = await database.db.get(
  //         'SELECT * FROM users WHERE username = ? OR email = ?',
  //         [username, email]
  //       );
  //       if (existingUser) {
  //         return reply.status(400).send({ error: 'User already exists' });
  //       }

  //       const hashedPassword = await bcrypt.hash(password, 10);

  //       await database.db.run(
  //         `INSERT INTO users
  //           (username, password, email, gender, favAvatar, language, wins, losses, profilePic)
  //          VALUES (?, ?, ?, 'other', 'None', 'english', 0, 0, '/profile-pics/default-profile.jpg')`,
  //         [username, hashedPassword, email]
  //       );

  //       await sendRegisterSuccessEmail(email, username);
  //       return reply.send({ message: 'User registered successfully' });

  //     } catch (err) {
  //       console.error("🔥 Registration error:", err); // Look for this in your terminal
  //       return reply.code(500).send({ error: 'Internal Server Error' });
  //     }
  //   });

  // Login Route
  app.post("/login", async (request, reply) => {
    const { username, password } = request.body as LoginInput;

    // Find user by username
    const user = await database.db.get(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (!user) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    // Compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    // Generate a 2FA code and send it via email
    const twoFACode = crypto.randomBytes(3).toString("hex"); // 6-character hex string
    await send2FACode(user.email, twoFACode, user.username);

    // Save the 2FA code in the database (this could also be stored in memory for a short time)
    await database.db.run("UPDATE users SET secret = ? WHERE username = ?", [
      twoFACode,
      username,
    ]);



    return reply.send({
      message: "2FA code sent to email. Please verify your code.",
    });
  });

  // Verify 2FA Route
  app.post("/verify-2fa", async (request, reply) => {
    const { username, code } = request.body as VerifyInput;

    // Find user by username
    const user = await database.db.get(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (!user) {
      return reply.status(401).send({ error: "User not found" });
    }

    // Check if the 2FA code matches
    if (user.secret !== code) {
      return reply.status(400).send({ error: "Invalid 2FA code" });
    }

    // Optionally, clear the stored 2FA code after verification
    await database.db.run("UPDATE users SET secret = NULL WHERE username = ?", [
      username,
    ]);

    // Generate JWT token after 2FA verification
    const token = app.jwt.sign({ id: user.id, username: user.username });

    await database.db.run(`UPDATE users SET online_status = 'online' WHERE username = ?`, [username]);

    return reply.send({ token });
  });

  // Password Reset Request Route
  app.post("/reset-password", async (request, reply) => {
    const { email } = request.body as ResetPasswordInput;

    // Find the user by email
    const user = await database.db.get("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!user) {
      return reply
        .status(400)
        .send({ error: "No user found with this email address." });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Save the reset token in the database (you should set an expiration time for the token)
    await database.db.run("UPDATE users SET reset_token = ? WHERE email = ?", [
      resetToken,
      email,
    ]);

    // Send the reset email with a link
    await sendPasswordResetEmail(
      email,
      `${Env.FrontendBaseUrl}/change-password?token=${resetToken}`
    );

    return reply.send({
      message: "Password reset email sent. Please check your inbox.",
    });
  });

  // Update Password Route (for password reset after clicking the reset link)
  app.post("/update-password", async (request, reply) => {
    const { token, password } = request.body as ChangePasswordInput;

    // Find user by reset token
    const user = await database.db.get(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token IS NOT NULL",
      [token]
    );
    if (!user) {
      return reply
        .status(400)
        .send({ error: "Invalid or expired reset token." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Compare password with stored hash !!!FIX THIS!!!!
    // const passwordMatch = await bcrypt.compare(hashedPassword, user.password);
    // if (passwordMatch) {
    //   return reply.status(401).send({ error: 'Same password' });
    // }

    // Update the user's password and clear the reset token
    await database.db.run(
      "UPDATE users SET password = ?, reset_token = NULL WHERE reset_token = ?",
      [hashedPassword, token]
    );

    return reply.send({ message: "Password successfully updated!" });
  });
};
