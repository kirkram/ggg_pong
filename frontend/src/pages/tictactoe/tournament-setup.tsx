import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PlayerInfo } from "./tournament_interface";
import { generatePlayerData, generateTournamentData } from "./tournament_init";

export const TournamentSetupPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [guestCount, setGuestCount] = useState<number>(3); // Default to 3 guests
  const [loggedInUsername, setLoggedInUsername] = useState("");
  const [userAvatar, setUserAvatar] = useState<any | null>(null);
  const [userColor, setUserColor] = useState<string | null>(null);
  const [tournamentData, setTournamentData] = useState<any>(null);
  const [currentCircle, setCurrentCircle] = useState(1);

  // Initialize player data from localStorage
  useEffect(() => {
    const token = localStorage.getItem("ping-pong-jwt");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setLoggedInUsername(payload.username); // Set logged-in username from JWT token
    }

    const storedGuestCount = localStorage.getItem("guestCount");
    const storedUserAvatar = localStorage.getItem("userAvatar");
    const storedUserColor = localStorage.getItem("userColor");

    setGuestCount(storedGuestCount ? parseInt(storedGuestCount) : 3);
    setUserAvatar(storedUserAvatar ? JSON.parse(storedUserAvatar) : null);
    setUserColor(storedUserColor || "#FFFFFF"); // Default to white if not set

    // Fetch guest information from localStorage
    const storedGuests = JSON.parse(
      localStorage.getItem("tournamentGuests") || "[]"
    );
    if (storedGuests && storedGuests.length > 0) {
      localStorage.setItem("tournamentGuests", JSON.stringify(storedGuests));
    }
  }, []); // This will run only once when the page is first loaded

  // Initialize tournament data based on guest count
  useEffect(() => {
    const players = generatePlayerData(loggedInUsername, userAvatar, userColor);
    generateTournamentData(guestCount, players);
    const storedTournamentData = localStorage.getItem("tournamentData");
    if (storedTournamentData) {
      setTournamentData(JSON.parse(storedTournamentData));
    }
  }, [guestCount, loggedInUsername, userAvatar, userColor]);

  // Handle moving to next circle
  const handleNextCircle = () => {
    setCurrentCircle((prevCircle) => prevCircle + 1);
  };

  const startGame = (gameIndex: number) => {
    const gameData = tournamentData[`game${gameIndex}`]; // Get the current game data

    // Pass player data to the game page via state
    navigate(`/tic-tac-toe-tournament/${gameIndex}`, {
      state: {
        player1: gameData.player1,
        player2: gameData.player2,
        gameIndex: gameIndex,
      },
    });
  };

  const isCircleCompleted = (circleNumber: number) => {
    if (!tournamentData) return false;
    const gamesInCircle = Object.values(tournamentData).filter(
      (game: any) => game.circle === circleNumber
    );
    return gamesInCircle.every(
      (game: any) => game.winner && game.winner.username !== "?"
    );
  };

  // Handle game completion (to be used in GamePage)
  const handleGameCompletion = (gameIndex: number, winner: PlayerInfo) => {
    // Get the current game data
    const updatedTournamentData = { ...tournamentData };
    const game = updatedTournamentData[`game${gameIndex}`];

    // Update points based on the winner
    if (winner.username === game.player1.username) {
      game.player1.points = "1"; // Player 1 wins
      game.player2.points = "0"; // Player 2 loses
    } else if (winner.username === game.player2.username) {
      game.player1.points = "0"; // Player 1 loses
      game.player2.points = "1"; // Player 2 wins
    } else {
      game.player1.points = "0"; // Tie
      game.player2.points = "0"; // Tie
    }

    // Save the updated tournament data to localStorage
    localStorage.setItem(
      "tournamentData",
      JSON.stringify(updatedTournamentData)
    );
    setTournamentData(updatedTournamentData);
  };

  return (
    <div
      className="flex flex-col justify-center items-center p-4 bg-gray-900 min-h-screen"
      style={{
        backgroundImage:
          "url('/background/360_F_339060225_w8ob8LjMJzPdEqD9UFxbE6ibcKx8dFrP.jpg')",
        backgroundSize: "cover",
      }}
    >
      <button
        onClick={() => navigate("/menu")}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 {t("BACK_TO_MENU")}
      </button>

      {/* Render Dynamic Rounds based on current circle */}
      {tournamentData &&
        Object.values(tournamentData).map((game: any, index: number) =>
          game.circle === currentCircle ? (
            <div
              key={index}
              className="flex justify-around items-center bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl mb-6"
            >
              {/* Player 1 */}
              <div className="flex flex-col items-center bg-pink-500 p-4 rounded-lg">
                <div className="w-20 h-20 bg-pink-500 rounded-full flex justify-center items-center mb-4">
                  {game.player1.avatarimage ? (
                    <img
                      src={game.player1.avatarimage}
                      alt={game.player1.avatarname}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                      }}
                    />
                  ) : null}
                </div>
                <h3 className="text-white">{game.player1.username}</h3>
                <p className="text-white">Points: {game.player1.points}</p>
              </div>

              {/* Divider */}
              <div className="text-white text-xl mx-8">vs</div>

              {/* Player 2 */}
              <div className="flex flex-col items-center bg-pink-500 p-4 rounded-lg">
                <div className="w-20 h-20 bg-pink-500 rounded-full flex justify-center items-center mb-4">
                  {game.player2.avatarimage ? (
                    <img
                      src={game.player2.avatarimage}
                      alt={game.player2.avatarname}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                      }}
                    />
                  ) : null}
                </div>
                <h3 className="text-white">{game.player2.username}</h3>
                <p className="text-white">Points: {game.player2.points}</p>
              </div>

              <div className="flex flex-col items-center mt-6">
                {/* Start game button */}
                {game.player1.points === "?" && game.player2.points === "?" && (
                  <button
                    onClick={() => startGame(game.round)}
                    className="mt-4 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                  >
                    {t("START_GAME")} {game.round}
                  </button>
                )}

                {/* Tie button */}
                {game.player1.points === "0" && game.player2.points === "0" && (
                  <button
                    onClick={() =>
                      handleGameCompletion(game.round, {
                        username: "random_winner",
                        avatarname: "",
                        avatarimage: "",
                        color: "",
                        points: "1",
                      })
                    }
                    className="mt-4 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                  >
                    {t("PICK_WINNER")}
                  </button>
                )}
              </div>
            </div>
          ) : null
        )}

      {/* Next Circle Button */}
      {isCircleCompleted(currentCircle) && currentCircle < 3 && (
        <button
          onClick={handleNextCircle}
          className="mt-6 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg"
        >
          {t("NEXT_CIRCLE")}
        </button>
      )}

      {/* Show Winner Button */}
      {isCircleCompleted(currentCircle) && currentCircle === 3 && (
        <button
          onClick={() => navigate("/show_a_winner")}
          className="mt-6 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
        >
          {t("SHOW_WINNER")}
        </button>
      )}
    </div>
  );
};

export default TournamentSetupPage;
