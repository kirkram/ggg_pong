import { PlayerInfo, Tournament4, Tournament8 } from "./tournament_interface";

// Function to generate player data based on localStorage
export const generatePlayerData = (loggedInUsername: string, userAvatar: any, userColor: string | null) => {
  const players: PlayerInfo[] = [{
    username: loggedInUsername,
    avatarname: userAvatar?.name || "",
    avatarimage: userAvatar?.image || "",
    color: userColor || "",
    points: "?"
  }];

  const storedGuests = JSON.parse(localStorage.getItem("tournamentGuests") || "[]");
  storedGuests.forEach((guest: any) => {
    players.push({
      username: guest.username,
      avatarname: guest.avatar?.name || "",
      avatarimage: guest.avatar?.image || "",
      color: guest.color || "",
      points: "?"
    });
  });

  return players;
};

// Function to generate Tournament4 data (for 4 players)
export const generateTournament4 = (players: PlayerInfo[]): Tournament4 => {
  return {
    game1: {
      round: 1,
      circle: 1,
      player1: players[0], // logged in user
      player2: players[1],
    },
    game2: {
      round: 2,
      circle: 1,
      player1: players[2],
      player2: players[3],
    },
    game3: {
      round: 1,
      circle: 2,
      player1: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
      player2: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
    },
    winner: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
  };
};

// Function to generate Tournament8 data (for 8 players)
export const generateTournament8 = (players: PlayerInfo[]): Tournament8 => {
  return {
    game1: {
      round: 1,
      circle: 1,
      player1: players[0], // logged in user
      player2: players[1],
    },
    game2: {
      round: 2,
      circle: 1,
      player1: players[2],
      player2: players[3],
    },
    game3: {
      round: 3,
      circle: 1,
      player1: players[4],
      player2: players[5],
    },
    game4: {
      round: 4,
      circle: 1,
      player1: players[6],
      player2: players[7],
    },
    game5: {
      round: 1,
      circle: 2,
      player1: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
      player2: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
    },
    game6: {
      round: 2,
      circle: 2,
      player1: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
      player2: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
    },
    game7: {
      round: 1,
      circle: 3,
      player1: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
      player2: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
    },
    winner: { username: "?", avatarname: "", avatarimage: "", color: "", points: "?" },
  };
};

// Function to generate tournament data and store it in localStorage
export const generateTournamentData = (guestCount: number, players: PlayerInfo[]) => {
  if (guestCount === 3) {
    const tournamentData: Tournament4 = generateTournament4(players);
    localStorage.setItem("tournamentData", JSON.stringify(tournamentData));
  } else if (guestCount === 7) {
    const tournamentData: Tournament8 = generateTournament8(players);
    localStorage.setItem("tournamentData", JSON.stringify(tournamentData));
  }
};
