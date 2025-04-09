import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { database } from "../database";
import { Env } from "../env";
import { useResolvedPath } from "react-router-dom";
import { fdatasync } from "fs";
import fastifyMultipart from "@fastify/multipart";
import fs from "fs";
import { dirname } from "path";
import { pipeline } from "stream/promises";
import { sendGameAchievementEmail } from "../emailService";
// import { Game } from '../../../frontend/src/service/interface'

// change it completely when you start working on user stuff!!!
interface UpdateField {
  field: string;
  value: any;
}

export const userRoutes = async (app: FastifyInstance) => {
  // Retrieving Profile Data
  // app.get('/get-profile/:id', async (request, reply) => {
  //   const { id } = request.params as { id: string };
  //   const profile = await database.db.get(
  //     'SELECT username, email, profilePic, firstName, lastName, gender, dateOfBirth, wins, losses, language, favAvatar FROM users WHERE id = ?'
  //     , [id]);
  //     return reply.send(profile);
  // })

  app.get("/get-profile/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    console.log("Fetching profile for ID:", id); // 👈 Add this line

    try {
      const profile = await database.db.get(
        `SELECT username, email, profilePic, firstName, lastName, gender, dateOfBirth, wins, losses, language 
         FROM users WHERE id = ?`,
        [id]
      );

      if (!profile) {
        return reply.code(404).send({ error: "User not found" });
      }

      return reply.send(profile);
    } catch (err) {
      console.error("Error fetching profile:", err); // 👈 Catch and log error
      return reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  app.get("/get-all-profiles", async (request, reply) => {
    try {
      const profiles = await database.db.all(
        `SELECT username, wins, losses FROM users`
      );

      if (!profiles || profiles.length === 0) {
        console.debug("error fetching profiles:", profiles);
        return reply.code(404).send({ error: "No profiles found" });
      }

      console.debug("Fetched profiles:", profiles);

      return reply.send(profiles);
    } catch (err) {
      console.error("Error fetching profiles:", err);
      return reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  // Profile Update
  // app.patch('/update-field/:id', async (request, reply) => {
  //   const { id } = request.params as { id: string };
  //   const { field, value } = request.body as UpdateField;

  //   const allowedFields = ['firstNAme', 'lastName', 'gender', 'dateOfBirth', 'language'];
  //   if (!allowedFields.includes(field)) {
  //     return reply.code(400).send({error: 'Field not allowed to update'});
  //   }

  //   const query = 'UPDATE users SET ${field} = ? WHERE id = ?';
  //   await database.db.run(query, [value, id]);

  //   return reply.send({ success: true });
  // });
  app.patch("/update-field/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { field, value } = request.body as { field: string; value: string };

    console.log("🔧 PATCH /update-field called with:", { id, field, value });

    const allowedFields = [
      "firstName",
      "lastName",
      "gender",
      "dateOfBirth",
      "language",
      "favAvatar",
    ];

    if (!allowedFields.includes(field)) {
      console.warn("⛔ Blocked update to disallowed field:", field);
      return reply.code(400).send({ error: "Field not allowed to update" });
    }

    try {
      const query = `UPDATE users SET ${field} = ? WHERE id = ?`;
      await database.db.run(query, [value, id]);
      console.log("✅ Successfully updated field.");
      return reply.send({ success: true });
    } catch (err) {
      console.error("🔥 Error updating field:", err);
      return reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  // Uploading profile pic
  app.register(require("@fastify/multipart"));

  app.post("/upload-profile-pic/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await request.file({
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }); // using fastify-multipart
    if (!data) {
      return reply.code(400).send({ error: "No file uploaded" });
    }

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(data.mimetype)) {
      return reply.code(400).send({ error: "Invalid file type" });
    }

    const filePath = `/profile-pics/uploads/${data.filename}`;
    try {
      await pipeline(
        data.file,
        fs.createWriteStream(
          `${dirname(process.cwd())}/frontend/public${filePath}`
        )
      );
    } catch (error) {
      console.log(error);
      return reply.code(500).send({ error: "Error saving file" });
    }

    await database.db.run("UPDATE users SET profilePic = ? WHERE id = ?", [
      filePath,
      id,
    ]);

    return reply.send({ success: true, profilePic: filePath });
  });

  // Getting public profile's information based on username
  app.get("/get-public-profile/:username", async (request, reply) => {
    const { username } = request.params as { username: string };
    try {
      const profile = await database.db.get(
        `
        SELECT username, email, profilePic, firstName, lastName, dateOfBirth, gender, wins, losses, language, favAvatar
        FROM users WHERE username = ?
      `,
        [username]
      );

      if (!profile) {
        return reply.code(404).send({ error: "User not found" });
      }

      return reply.send(profile);
    } catch (error) {
      console.error("Error fetching public profile:", error);
      return reply.code(500).send({ error: "Failed to load profile" });
    }
  });

  // Game Achievement Route
  app.post("/game-achievement", async (request, reply) => {
    const { username, email, position } = request.body as {
      username: string;
      email: string;
      position: number;
    };

    if (position === 1) {
      // Send congratulatory email when user gets 1st place
      await sendGameAchievementEmail(email, username);
    }

    return reply.send({
      message: `Game result: ${username} finished in position ${position}`,
    });
  });

  app.post("/post-game", async (request, reply) => {
    const { id_user, rounds } = request.body as {
      id_user: string | undefined;
      rounds: any[];
    };

    console.debug(`got into post game with id_user=${id_user}`);

    const roundsTest = [
      [
        {
          p1_username: "Alice",
          p2_username: "Bob",
          p1_avatar: "avatar1.png",
          p2_avatar: "avatar2.png",
          p1_wins: 2,
          p2_wins: 1,
        },
        {
          p1_username: "Carol",
          p2_username: "Dave",
          p1_avatar: "avatar3.png",
          p2_avatar: "avatar4.png",
          p1_wins: 3,
          p2_wins: 0,
        },
      ],
      [
        {
          p1_username: "Alice",
          p2_username: "Carol",
          p1_avatar: "avatar1.png",
          p2_avatar: "avatar3.png",
          p1_wins: 1,
          p2_wins: 2,
        },
      ],
    ];

    await database.db.run(
      `INSERT INTO games (id_user, rounds_json) VALUES (?, ?)`,
      [id_user, JSON.stringify(roundsTest)]
    );

    console.debug(
      `inserted into games new row with id_user=${id_user}, rounds_json =${roundsTest}`
    );
    reply.send({ status: "ok" });
  });
};
