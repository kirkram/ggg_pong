import { FastifyInstance } from "fastify";
import { database } from "../database";

export const gameRoutes = async (app: FastifyInstance) => {
  // Duel Game Route (unchanged)
  app.post("/start-duel-game", async (request, reply) => {
    const { user, userAvatar, guest, guestAvatar } = request.body as {
      user: string;
      userAvatar: string;
      guest: string;
      guestAvatar: string;
    };

    if (!user || !userAvatar || !guest || !guestAvatar) {
      return reply.status(400).send({ error: "Missing fields" });
    }

    await database.db.run(
      `INSERT INTO game_sessions (user, user_avatar, guest, guest_avatar) VALUES (?, ?, ?, ?)`,
      [user, userAvatar, guest, guestAvatar]
    );

    return reply.send({ message: "Duel game session created successfully" });
  });

  // 🆕 Tournament Game Route
  app.post("/start-tournament-game", async (request, reply) => {
    const { user, userAvatar, guests } = request.body as {
      user: string;
      userAvatar: string;
      guests: { username: string; avatar: string }[];
    };

    if (!user || !userAvatar || !Array.isArray(guests) || guests.length === 0) {
      return reply.status(400).send({ error: "Missing or invalid fields" });
    }

    // Save session in tournament_sessions table
    await database.db.run(
      `INSERT INTO tournament_sessions (user, user_avatar, guests_json) VALUES (?, ?, ?)`,
      [user, userAvatar, JSON.stringify(guests)]
    );

    return reply.send({ message: "Tournament session created successfully" });
  });

  // Fetch all tournament sessions
  app.get("/tournament-sessions", async (_, reply) => {
    const sessions = await database.db.all(`SELECT * FROM tournament_sessions`);
    return reply.send(sessions);
  });
};
