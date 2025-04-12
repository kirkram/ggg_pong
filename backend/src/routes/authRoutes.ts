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
import axios from "axios";

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

    await database.db.run(
      `UPDATE users SET online_status = 'online' WHERE username = ?`,
      [username]
    );

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

  let isProcessing = false;

  app.get("/auth/google/callback", async (request, reply) => {
    if (isProcessing) {
      console.debug("Duplicate request detected. Ignoring...");
      return reply.code(429).send({ error: "Duplicate request" });
    }

    isProcessing = true;

    // console.debug("in the backed in auth google callback");
    // console.debug("Google Client ID:", Env.googleClientId);
    // console.debug("Google Client Secret:", Env.googleClientSecret);

    // console.debug("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
    // console.debug("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

    // console.debug("BACKEND_HOST:", process.env.BACKEND_HOST);
    // console.debug("BACKEND_PORT:", process.env.BACKEND_PORT);

    try {
      // Exchange the authorization code for an access token
      const GOOGLE_CLIENT_ID = "";
      const GOOGLE_CLIENT_SECRET = "";
      const redirectUri = "http://localhost:5173/auth/google/callback";
      const code = (request.query as { code: string }).code;
      console.debug("Token Request Params:", {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });
      const tokenResponse = await axios.post(
        "https://oauth2.googleapis.com/token",
        null,
        {
          params: {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      const { access_token, id_token } = tokenResponse.data;
      // Optionally: decode or verify the id_token
      console.log("ID Token:", id_token);
      console.log("Access Token:", access_token);

      const userInfoResponse = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      const userInfo = userInfoResponse.data;
      console.log("User Info:", userInfo);

      // Generate your own JWT or session token for the user
      // const jwtToken = app.jwt.sign({
      //   id: userInfo.sub,
      //   // email: userInfo.email,
      // });

      // reply.send({ token: jwtToken });

      // Send a response back to the user (you can render a page or redirect)
      reply.send(`Authentication successful! ID Token: ${id_token}`);
    } catch (err) {
      console.error("🔥 Google error:", err);
      return reply.code(500).send({ error: "Internal Server Error" });
    } finally {
      isProcessing = false;
    }
  });
};

// Token Request Params: {
//   code: '4/0Ab_5qll6nUoJjlo26LXPGvUwpFHukm91aHcLLTdtN1Svcwj0hkuzhjyk1lBysSkaZ8i3fg',
//   client_id: '1039775037290-cldojr5iee63fqiqf3o0jreer0k5kl16.apps.googleusercontent.com',
//   client_secret: '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',
//   redirect_uri: 'http://localhost:5173/auth/google/callback',
//   grant_type: 'authorization_code'
// }
// ID Token: eyJhbGciOiJSUzI1NiIsImtpZCI6ImMzN2RhNzVjOWZiZTE4YzJjZTkxMjViOWFhMWYzMDBkY2IzMWU4ZDkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxMDM5Nzc1MDM3MjkwLWNsZG9qcjVpZWU2M2ZxaXFmM28wanJlZXIwazVrbDE2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMTAzOTc3NTAzNzI5MC1jbGRvanI1aWVlNjNmcWlxZjNvMGpyZWVyMGs1a2wxNi5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExMDc5ODI3NjA0NDc1NzYzNzE2MiIsImVtYWlsIjoia29zc25vc3NAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJtNVg3Qjc0d00tZVJKc0Nqcjg1SHZRIiwibmFtZSI6IksgTCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLdHlTRTNNU0pfQWN6UGxhTjd2cHBINmhIRDB5MWNOT2lPWlFvN2ZhQ1VOVDRVeHJjPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IksiLCJmYW1pbHlfbmFtZSI6IkwiLCJpYXQiOjE3NDQ0NzU2MzUsImV4cCI6MTc0NDQ3OTIzNX0.jJLJQwDChcg_i4xxohas0XnXfJIQNyTifXB14AotLjAWApZUMQtUG_BHOoZCLdu91VlkVRQz__MuxBlTZMab21pP11dwLy02_OvMg7_8nczOUvZ6HF3xNKtq80xiVbTziZ9eRlV_4Dm3-aICoLaUWz5U9arZ-ROymb0NERlsET-QdHrNrwG2SBqO6-xBGHps-98RYrPrsHFhUp0NI2RJ99trCCAZuBsPQ_yLab1lebtqcycYDgh1NfCiAghLk55IiEsp5Fxz2S92hXIHrJF-6q6NwTueSTcoAewMMm3nGbVFnroiHQ4lwWE0RIFjruvb-t7ZXmWJCintbcxd0TgJTg
// Access Token: ya29.a0AZYkNZjF9OzOsG6ii-fU4amz39b0gkF5rPNFMFyR-cpfTaGbJPiPrd-8IIWCY9iOHAVSLHdX7q1R17hmTi_5MFCmsDMuYuEfeT_GEXKF8XcWEnR3wjqLdSMx7pfU6gTQrcWsvnMhr57yTstyoJcmqW7VZ2KtDaYEvMDOvkpnaCgYKAbASARISFQHGX2MisQEC0YeJCTy1UCnPCeyf6w0175
// User Info: {
//   sub: '110798276044757637162',
//   name: 'K L',
//   given_name: 'K',
//   family_name: 'L',
//   picture: 'https://lh3.googleusercontent.com/a/ACg8ocKtySE3MSJ_AczPlaN7vppH6hHD0y1cNOiOZQo7faCUNT4Uxrc=s96-c',
//   email: 'kossnoss@gmail.com',
//   email_verified: true
// }
// Token Request Params: {
//   code: '4/0Ab_5qll6nUoJjlo26LXPGvUwpFHukm91aHcLLTdtN1Svcwj0hkuzhjyk1lBysSkaZ8i3fg',
//   client_id: '1039775037290-cldojr5iee63fqiqf3o0jreer0k5kl16.apps.googleusercontent.com',
//   client_secret: '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',
//   redirect_uri: 'http://localhost:5173/auth/google/callback',
//   grant_type: 'authorization_code'
// }
// 🔥 Google error: AxiosError: Request failed with status code 400
//     at settle (/home/klukiano/git/ft_transcendence/backend/node_modules/axios/lib/core/settle.js:19:12)
//     at Unzip.handleStreamEnd (/home/klukiano/git/ft_transcendence/backend/node_modules/axios/lib/adapters/http.js:599:11)
//     at Unzip.emit (node:events:530:35)
//     at Unzip.emit (node:domain:489:12)
//     at endReadableNT (node:internal/streams/readable:1698:12)
//     at processTicksAndRejections (node:internal/process/task_queues:90:21)
//     at Axios.request (/home/klukiano/git/ft_transcendence/backend/node_modules/axios/lib/core/Axios.js:45:41)
//     at processTicksAndRejections (node:internal/process/task_queues:105:5) {
//   code: 'ERR_BAD_REQUEST',
//   config: {
//     transitional: {
//       silentJSONParsing: true,
//       forcedJSONParsing: true,
//       clarifyTimeoutError: false
//     },
//     adapter: [ 'xhr', 'http', 'fetch' ],
//     transformRequest: [ [Function: transformRequest] ],
//     transformResponse: [ [Function: transformResponse] ],
//     timeout: 0,
//     xsrfCookieName: 'XSRF-TOKEN',
//     xsrfHeaderName: 'X-XSRF-TOKEN',
//     maxContentLength: -1,
//     maxBodyLength: -1,
//     env: { FormData: [Function [FormData]], Blob: [class Blob] },
//     validateStatus: [Function: validateStatus],
//     headers: Object [AxiosHeaders] {
//       Accept: 'application/json, text/plain, */*',
//       'Content-Type': 'application/x-www-form-urlencoded',
//       'User-Agent': 'axios/1.8.4',
//       'Accept-Encoding': 'gzip, compress, deflate, br'
//     },
//     params: {
//       code: '4/0Ab_5qll6nUoJjlo26LXPGvUwpFHukm91aHcLLTdtN1Svcwj0hkuzhjyk1lBysSkaZ8i3fg',
//       client_id: '1039775037290-cldojr5iee63fqiqf3o0jreer0k5kl16.apps.googleusercontent.com',
//       client_secret: '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',
//       redirect_uri: 'http://localhost:5173/auth/google/callback',
//       grant_type: 'authorization_code'
//     },
//     method: 'post',
//     url: 'https://oauth2.googleapis.com/token',
//     data: null,
//     allowAbsoluteUrls: true
//   },
//   request: <ref *1> ClientRequest {
//     _events: [Object: null prototype] {
//       abort: [Function (anonymous)],
//       aborted: [Function (anonymous)],
//       connect: [Function (anonymous)],
//       error: [Function (anonymous)],
//       socket: [Function (anonymous)],
//       timeout: [Function (anonymous)],
//       finish: [Function: requestOnFinish]
//     },
//     _eventsCount: 7,
//     _maxListeners: undefined,
//     outputData: [],
//     outputSize: 0,
//     writable: true,
//     destroyed: true,
//     _last: false,
//     chunkedEncoding: false,
//     shouldKeepAlive: true,
//     maxRequestsOnConnectionReached: false,
//     _defaultKeepAlive: true,
//     useChunkedEncodingByDefault: true,
//     sendDate: false,
//     _removedConnection: false,
//     _removedContLen: false,
//     _removedTE: false,
//     strictContentLength: false,
//     _contentLength: 0,
//     _hasBody: true,
//     _trailer: '',
//     finished: true,
//     _headerSent: true,
//     _closed: true,
//     _header: 'POST /token?code=4%2F0Ab_5qll6nUoJjlo26LXPGvUwpFHukm91aHcLLTdtN1Svcwj0hkuzhjyk1lBysSkaZ8i3fg&client_id=1039775037290-cldojr5iee63fqiqf3o0jreer0k5kl16.apps.googleusercontent.com&client_secret=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&redirect_uri=http:%2F%2Flocalhost:5173%2Fauth%2Fgoogle%2Fcallback&grant_type=authorization_code HTTP/1.1\r\n' +
//       'Accept: application/json, text/plain, */*\r\n' +
//       'Content-Type: application/x-www-form-urlencoded\r\n' +
//       'User-Agent: axios/1.8.4\r\n' +
//       'Accept-Encoding: gzip, compress, deflate, br\r\n' +
//       'Host: oauth2.googleapis.com\r\n' +
//       'Connection: keep-alive\r\n' +
//       'Content-Length: 0\r\n' +
//       '\r\n',
//     _keepAliveTimeout: 0,
//     _onPendingData: [Function: nop],
//     agent: Agent {
//       _events: [Object: null prototype],
//       _eventsCount: 2,
//       _maxListeners: undefined,
//       defaultPort: 443,
//       protocol: 'https:',
//       options: [Object: null prototype],
//       requests: [Object: null prototype] {},
//       sockets: [Object: null prototype] {},
//       freeSockets: [Object: null prototype],
//       keepAliveMsecs: 1000,
//       keepAlive: true,
//       maxSockets: Infinity,
//       maxFreeSockets: 256,
//       scheduling: 'lifo',
//       maxTotalSockets: Infinity,
//       totalSocketCount: 2,
//       maxCachedSessions: 100,
//       _sessionCache: [Object],
//       [Symbol(shapeMode)]: false,
//       [Symbol(kCapture)]: false
//     },
//     socketPath: undefined,
//     method: 'POST',
//     maxHeaderSize: undefined,
//     insecureHTTPParser: undefined,
//     joinDuplicateHeaders: undefined,
//     path: '/token?code=4%2F0Ab_5qll6nUoJjlo26LXPGvUwpFHukm91aHcLLTdtN1Svcwj0hkuzhjyk1lBysSkaZ8i3fg&client_id=1039775037290-cldojr5iee63fqiqf3o0jreer0k5kl16.apps.googleusercontent.com&client_secret=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&redirect_uri=http:%2F%2Flocalhost:5173%2Fauth%2Fgoogle%2Fcallback&grant_type=authorization_code',
//     _ended: true,
//     res: IncomingMessage {
//       _events: [Object],
//       _readableState: [ReadableState],
//       _maxListeners: undefined,
//       socket: null,
//       httpVersionMajor: 1,
//       httpVersionMinor: 1,
//       httpVersion: '1.1',
//       complete: true,
//       rawHeaders: [Array],
//       rawTrailers: [],
//       joinDuplicateHeaders: undefined,
//       aborted: false,
//       upgrade: false,
//       url: '',
//       method: null,
//       statusCode: 400,
//       statusMessage: 'Bad Request',
//       client: [TLSSocket],
//       _consuming: true,
//       _dumped: false,
//       req: [Circular *1],
//       _eventsCount: 4,
//       responseUrl: 'https://oauth2.googleapis.com/token?code=4%2F0Ab_5qll6nUoJjlo26LXPGvUwpFHukm91aHcLLTdtN1Svcwj0hkuzhjyk1lBysSkaZ8i3fg&client_id=1039775037290-cldojr5iee63fqiqf3o0jreer0k5kl16.apps.googleusercontent.com&client_secret=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&redirect_uri=http:%2F%2Flocalhost:5173%2Fauth%2Fgoogle%2Fcallback&grant_type=authorization_code',
//       redirects: [],
//       [Symbol(shapeMode)]: true,
//       [Symbol(kCapture)]: false,
//       [Symbol(kHeaders)]: [Object],
//       [Symbol(kHeadersCount)]: 30,
//       [Symbol(kTrailers)]: null,
//       [Symbol(kTrailersCount)]: 0
//     },
//     aborted: false,
//     timeoutCb: null,
//     upgradeOrConnect: false,
//     parser: null,
//     maxHeadersCount: null,
//     reusedSocket: true,
//     host: 'oauth2.googleapis.com',
//     protocol: 'https:',
//     _redirectable: Writable {
//       _events: [Object],
//       _writableState: [WritableState],
//       _maxListeners: undefined,
//       _options: [Object],
//       _ended: true,
//       _ending: true,
//       _redirectCount: 0,
//       _redirects: [],
//       _requestBodyLength: 0,
//       _requestBodyBuffers: [],
//       _eventsCount: 3,
//       _onNativeResponse: [Function (anonymous)],
//       _currentRequest: [Circular *1],
//       _currentUrl: 'https://oauth2.googleapis.com/token?code=4%2F0Ab_5qll6nUoJjlo26LXPGvUwpFHukm91aHcLLTdtN1Svcwj0hkuzhjyk1lBysSkaZ8i3fg&client_id=1039775037290-cldojr5iee63fqiqf3o0jreer0k5kl16.apps.googleusercontent.com&client_secret=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&redirect_uri=http:%2F%2Flocalhost:5173%2Fauth%2Fgoogle%2Fcallback&grant_type=authorization_code',
//       [Symbol(shapeMode)]: true,
//       [Symbol(kCapture)]: false
//     },
//     [Symbol(shapeMode)]: false,
//     [Symbol(kCapture)]: false,
//     [Symbol(kBytesWritten)]: 0,
//     [Symbol(kNeedDrain)]: false,
//     [Symbol(corked)]: 0,
//     [Symbol(kChunkedBuffer)]: [],
//     [Symbol(kChunkedLength)]: 0,
//     [Symbol(kSocket)]: TLSSocket {
//       _tlsOptions: [Object],
//       _secureEstablished: true,
//       _securePending: false,
//       _newSessionPending: false,
//       _controlReleased: true,
//       secureConnecting: false,
//       _SNICallback: null,
//       servername: 'oauth2.googleapis.com',
//       alpnProtocol: false,
//       authorized: true,
//       authorizationError: null,
//       encrypted: true,
//       _events: [Object: null prototype],
//       _eventsCount: 9,
//       connecting: false,
//       _hadError: false,
//       _parent: null,
//       _host: 'oauth2.googleapis.com',
//       _closeAfterHandlingError: false,
//       _readableState: [ReadableState],
//       _writableState: [WritableState],
//       allowHalfOpen: false,
//       _maxListeners: undefined,
//       _sockname: null,
//       _pendingData: null,
//       _pendingEncoding: '',
//       server: undefined,
//       _server: null,
//       ssl: [TLSWrap],
//       _requestCert: true,
//       _rejectUnauthorized: true,
//       timeout: 5000,
//       parser: null,
//       _httpMessage: null,
//       autoSelectFamilyAttemptedAddresses: [Array],
//       [Symbol(alpncallback)]: null,
//       [Symbol(res)]: [TLSWrap],
//       [Symbol(verified)]: true,
//       [Symbol(pendingSession)]: null,
//       [Symbol(async_id_symbol)]: -1,
//       [Symbol(kHandle)]: [TLSWrap],
//       [Symbol(lastWriteQueueSize)]: 0,
//       [Symbol(timeout)]: Timeout {
//         _idleTimeout: 5000,
//         _idlePrev: [TimersList],
//         _idleNext: [Timeout],
//         _idleStart: 7613,
//         _onTimeout: [Function: bound ],
//         _timerArgs: undefined,
//         _repeat: null,
//         _destroyed: false,
//         [Symbol(refed)]: false,
//         [Symbol(kHasPrimitive)]: false,
//         [Symbol(asyncId)]: 362,
//         [Symbol(triggerId)]: 360,
//         [Symbol(kAsyncContextFrame)]: undefined
//       },
//       [Symbol(kBuffer)]: null,
//       [Symbol(kBufferCb)]: null,
//       [Symbol(kBufferGen)]: null,
//       [Symbol(shapeMode)]: true,
//       [Symbol(kCapture)]: false,
//       [Symbol(kSetNoDelay)]: false,
//       [Symbol(kSetKeepAlive)]: true,
//       [Symbol(kSetKeepAliveInitialDelay)]: 1,
//       [Symbol(kBytesRead)]: 0,
//       [Symbol(kBytesWritten)]: 0,
//       [Symbol(connect-options)]: [Object]
//     },
//     [Symbol(kOutHeaders)]: [Object: null prototype] {
//       accept: [Array],
//       'content-type': [Array],
//       'user-agent': [Array],
//       'accept-encoding': [Array],
//       host: [Array]
//     },
//     [Symbol(errored)]: null,
//     [Symbol(kHighWaterMark)]: 65536,
//     [Symbol(kRejectNonStandardBodyWrites)]: false,
//     [Symbol(kUniqueHeaders)]: null
//   },
//   response: {
//     status: 400,
//     statusText: 'Bad Request',
//     headers: Object [AxiosHeaders] {
//       date: 'Sat, 12 Apr 2025 16:33:55 GMT',
//       'cache-control': 'no-cache, no-store, max-age=0, must-revalidate',
//       pragma: 'no-cache',
//       expires: 'Mon, 01 Jan 1990 00:00:00 GMT',
//       'content-type': 'application/json; charset=utf-8',
//       vary: 'Origin, X-Origin, Referer',
//       server: 'scaffolding on HTTPServer2',
//       'x-xss-protection': '0',
//       'x-frame-options': 'SAMEORIGIN',
//       'x-content-type-options': 'nosniff',
//       'alt-svc': 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000',
//       'transfer-encoding': 'chunked'
//     },
//     config: {
//       transitional: [Object],
//       adapter: [Array],
//       transformRequest: [Array],
//       transformResponse: [Array],
//       timeout: 0,
//       xsrfCookieName: 'XSRF-TOKEN',
//       xsrfHeaderName: 'X-XSRF-TOKEN',
//       maxContentLength: -1,
//       maxBodyLength: -1,
//       env: [Object],
//       validateStatus: [Function: validateStatus],
//       headers: [Object [AxiosHeaders]],
//       params: [Object],
//       method: 'post',
//       url: 'https://oauth2.googleapis.com/token',
//       data: null,
//       allowAbsoluteUrls: true
//     },
//     request: <ref *1> ClientRequest {
//       _events: [Object: null prototype],
//       _eventsCount: 7,
//       _maxListeners: undefined,
//       outputData: [],
//       outputSize: 0,
//       writable: true,
//       destroyed: true,
//       _last: false,
//       chunkedEncoding: false,
//       shouldKeepAlive: true,
//       maxRequestsOnConnectionReached: false,
//       _defaultKeepAlive: true,
//       useChunkedEncodingByDefault: true,
//       sendDate: false,
//       _removedConnection: false,
//       _removedContLen: false,
//       _removedTE: false,
//       strictContentLength: false,
//       _contentLength: 0,
//       _hasBody: true,
//       _trailer: '',
//       finished: true,
//       _headerSent: true,
//       _closed: true,
//       _header: 'POST /token?code=4%2F0Ab_5qll6nUoJjlo26LXPGvUwpFHukm91aHcLLTdtN1Svcwj0hkuzhjyk1lBysSkaZ8i3fg&client_id=1039775037290-cldojr5iee63fqiqf3o0jreer0k5kl16.apps.googleusercontent.com&client_secret=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&redirect_uri=http:%2F%2Flocalhost:5173%2Fauth%2Fgoogle%2Fcallback&grant_type=authorization_code HTTP/1.1\r\n' +
//         'Accept: application/json, text/plain, */*\r\n' +
//         'Content-Type: application/x-www-form-urlencoded\r\n' +
//         'User-Agent: axios/1.8.4\r\n' +
//         'Accept-Encoding: gzip, compress, deflate, br\r\n' +
//         'Host: oauth2.googleapis.com\r\n' +
//         'Connection: keep-alive\r\n' +
//         'Content-Length: 0\r\n' +
//         '\r\n',
//       _keepAliveTimeout: 0,
//       _onPendingData: [Function: nop],
//       agent: [Agent],
//       socketPath: undefined,
//       method: 'POST',
//       maxHeaderSize: undefined,
//       insecureHTTPParser: undefined,
//       joinDuplicateHeaders: undefined,
//       path: '/token?code=4%2F0Ab_5qll6nUoJjlo26LXPGvUwpFHukm91aHcLLTdtN1Svcwj0hkuzhjyk1lBysSkaZ8i3fg&client_id=1039775037290-cldojr5iee63fqiqf3o0jreer0k5kl16.apps.googleusercontent.com&client_secret=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&redirect_uri=http:%2F%2Flocalhost:5173%2Fauth%2Fgoogle%2Fcallback&grant_type=authorization_code',
//       _ended: true,
//       res: [IncomingMessage],
//       aborted: false,
//       timeoutCb: null,
//       upgradeOrConnect: false,
//       parser: null,
//       maxHeadersCount: null,
//       reusedSocket: true,
//       host: 'oauth2.googleapis.com',
//       protocol: 'https:',
//       _redirectable: [Writable],
//       [Symbol(shapeMode)]: false,
//       [Symbol(kCapture)]: false,
//       [Symbol(kBytesWritten)]: 0,
//       [Symbol(kNeedDrain)]: false,
//       [Symbol(corked)]: 0,
//       [Symbol(kChunkedBuffer)]: [],
//       [Symbol(kChunkedLength)]: 0,
//       [Symbol(kSocket)]: [TLSSocket],
//       [Symbol(kOutHeaders)]: [Object: null prototype],
//       [Symbol(errored)]: null,
//       [Symbol(kHighWaterMark)]: 65536,
//       [Symbol(kRejectNonStandardBodyWrites)]: false,
//       [Symbol(kUniqueHeaders)]: null
//     },
//     data: { error: 'invalid_grant', error_description: 'Bad Request' }
//   },
//   status: 400
