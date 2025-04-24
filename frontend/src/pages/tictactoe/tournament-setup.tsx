import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const TournamentSetupPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [guestCount, setGuestCount] = useState<number>(3); // Default to 3 guests
  const [players, setPlayers] = useState<any[]>([]); // List of players (user + guests)
  const [rounds, setRounds] = useState<any[]>([]); // Dynamic rounds
  const [loggedInUsername, setLoggedInUsername] = useState("");
  const [userAvatar, setUserAvatar] = useState<any | null>(null); // User avatar
  const [userColor, setUserColor] = useState<string | null>(null); // User color

  // Initialize player data from localStorage
  useEffect(() => {
    const token = localStorage.getItem("ping-pong-jwt");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setLoggedInUsername(payload.username); // Set logged-in username from JWT token
    }

    setGuestCount(parseInt(localStorage.getItem("guestCount") || "3"));
    const storedGuests = localStorage.getItem("tournamentGuests");
    if (storedGuests) {
      setPlayers(JSON.parse(storedGuests));
    }
    setUserAvatar(JSON.parse(localStorage.getItem("userAvatar") || "null"));
    setUserColor(localStorage.getItem("userColor"));
  }, []);

  // Dynamically create rounds based on guestCount (4 or 8 players)
  useEffect(() => {
    const updatedPlayers = [{ username: loggedInUsername, avatar: userAvatar, color: userColor }];
    
    const storedGuests = localStorage.getItem("tournamentGuests");
    if (storedGuests) {
      const guests = JSON.parse(storedGuests);
      updatedPlayers.push(...guests);
    }

    while (updatedPlayers.length < guestCount + 1) { // +1 for the user
      updatedPlayers.push({ username: "", avatar: null, color: null });
    }

    setPlayers(updatedPlayers);

    // Dynamically create rounds based on player count
    const generatedRounds = [];
    if (guestCount === 3) {
      // 4 players, 3 rounds
      generatedRounds.push(
        { round: 1, players: [updatedPlayers[0], updatedPlayers[1]], winner: null },
        { round: 2, players: [updatedPlayers[2], updatedPlayers[3]], winner: null },
        { round: 3, players: [], winner: null } // Final round, players to be decided
      );
    } else if (guestCount === 7) {
      // 8 players, 4 rounds
      generatedRounds.push(
        { round: 1, players: [updatedPlayers[0], updatedPlayers[1]], winner: null },
        { round: 2, players: [updatedPlayers[2], updatedPlayers[3]], winner: null },
        { round: 3, players: [updatedPlayers[4], updatedPlayers[5]], winner: null },
        { round: 4, players: [updatedPlayers[6], updatedPlayers[7]], winner: null },
        { round: 5, players: [], winner: null }, // To be filled after picking winners from Round 1
        { round: 6, players: [], winner: null }, // To be filled after picking winners from Round 2
        { round: 7, players: [], winner: null } // Final round
      );
    }
    
    setRounds(generatedRounds);
  }, [guestCount, loggedInUsername, userAvatar, userColor]);

  // Handle round completion and player progress
  const handlePickWinner = (roundIndex, winner) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].winner = winner;
    setRounds(updatedRounds);
  };

  // Game start button handler
  const startTournament = (roundIndex) => {
    // Pass roundIndex, round players, and players to the new game page
    navigate(`/tic-tac-toe-tournament/${roundIndex}`, {
      state: { roundIndex, rounds, players }
    });
  };

  // Component for each round match-up
  const RoundCard = ({ roundIndex, round, setRounds }) => {
    const player1Points = round.winner === round.players[0] ? 1 : (round.winner === null ? "?" : 0);
    const player2Points = round.winner === round.players[1] ? 1 : (round.winner === null ? "?" : 0);

    // Check if it's a tie and show the "Pick Winner" button
    const isTie = player1Points === 0 && player2Points === 0;
    
    return (
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold mb-4">{t("ROUND")} {round.round}</h2>
        <div className="flex gap-4">
          {round.players.map((player, index) => (
            <div key={index} className="flex items-center gap-4">
              <img
                src={player.avatar?.image || "/path/to/default-avatar"}
                alt={player.avatar?.name}
                className="w-16 h-16 rounded-full"
              />
              <p className="text-white">{player.username || "?"}</p>
            </div>
          ))}
        </div>

        {/* Points section */}
        <div className="flex justify-between mt-4">
          <p className="text-white">{round.players[0]?.username} - Points: {player1Points}</p>
          <p className="text-white">{round.players[1]?.username} - Points: {player2Points}</p>
        </div>

        {/* If the game is a tie, show a button to pick a winner */}
        {isTie && (
          <button
            onClick={() => handlePickWinner(roundIndex, round.players[0])}
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
          >
            {t("PICK_WINNER")}
          </button>
        )}

        {/* Start Game Button */}
        <button
          onClick={() => startTournament(roundIndex)}
          disabled={player1Points !== "?" && player2Points !== "?"} // Disable if the game has already been played
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
        >
          {t("START_GAME")}
        </button>
      </div>
    );
  };

  // Check if all rounds are completed and we have a winner
  const isTournamentCompleted = () => {
    return rounds.every(round => round.winner !== null); // Make sure all rounds have winners or a tie
  };

  return (
    <div className="flex flex-col justify-center items-center p-4 bg-gray-900 min-h-screen"
      style={{ backgroundImage: "url('/background/360_F_339060225_w8ob8LjMJzPdEqD9UFxbE6ibcKx8dFrP.jpg')",
      backgroundSize: "cover" }}>
      <button onClick={() => navigate("/menu")} className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md">
        🔙 {t("BACK_TO_MENU")}
      </button>

      {/* Render Dynamic Rounds */}
      {rounds.map((round, index) => (
        round.players.length > 0 && (
          <RoundCard
            key={index}
            roundIndex={index}
            round={round}
            setRounds={setRounds}
          />
        )
      ))}

      {/* Show winner if tournament is completed */}
      {isTournamentCompleted() && (
        <button
          onClick={() => navigate("/show_a_winner")}
          className="mt-6 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg"
        >
          {t("SHOW_WINNER")}
        </button>
      )}
    </div>
  );
};

export default TournamentSetupPage;
