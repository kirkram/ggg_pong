import { FastifyInstance } from "fastify";
import { database } from "../database";

export const gameRoutes = async (app: FastifyInstance) => {
  // Save avatar selection session
  app.post("/start-game", async (request, reply) => {
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

    return reply.send({ message: "Game session created successfully" });
  });

  // Optional: fetch all sessions
  app.get("/game-sessions", async (_, reply) => {
    const sessions = await database.db.all(`SELECT * FROM game_sessions`);
    return reply.send(sessions);
  });
};
