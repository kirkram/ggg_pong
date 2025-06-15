## ggg_pong

Node.js project that was aimed to create a fully running website for a simple Pong game.

Technologies used:

<li> Node.js + Fastify for backend</li>
<li> React.js with Typescript and Tailwind CSS for frontend</li>
<li> SQLite for DB</li>
<li> JWT auth </li>
<li> Docker </li>
<hr>

Notable features:

<li> 2FA Authentication with JWT tokens</li>
<li> Google Auth </li>
<li> Match history and stats </li>
<li> Ability to send friend requests in real time</li>
<li> User customizaton</li>
<li> Option to run with Docker</li>
<li> Multiple language support</li>
<li> Different play modes</li>
<li> Supported on all devices with a keyboard </li>

<p align="center">
  <img src="https://github.com/user-attachments/assets/5bc698c0-7c1d-4428-a874-a3bc498b5bb7" width=70%>
</p>

<h3 align="center">Short gif preview:</h3> 
<p align="center">
  <img src="https://github.com/user-attachments/assets/7721eac2-1e85-4172-a5c9-ead2561880ed" width=60%>
</p>

# Run the app with Node:

```sh
cd frontend
npm install
npm run dev
```

open another terminal window:

```sh
cd backend
npm install
npm run dev
```

# Run the app in Docker:

```sh
docker compose up --build
```

## Clean the Docker:

```sh
docker compose down --volumes --remove-orphans
docker system prune -a --volumes -f
```
