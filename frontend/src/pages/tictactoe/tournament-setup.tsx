import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PlayerInfo, Tournament4, Tournament8 } from "./tournament_interface";
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

    setGuestCount(storedGuestCount ? parseInt(storedGuestCount) : 3); // Default to 3 if not set
    setUserAvatar(storedUserAvatar ? JSON.parse(storedUserAvatar) : null); // Default to null if not set
    setUserColor(storedUserColor || "#FFFFFF"); // Default to white if not set

    // Fetch guest information from localStorage
    const storedGuests = JSON.parse(localStorage.getItem("tournamentGuests") || "[]");
    if (storedGuests && storedGuests.length > 0) {
      localStorage.setItem("tournamentGuests", JSON.stringify(storedGuests));
    }
  }, []);  // This will run only once when the page is first loaded

  // Initialize tournament data based on guest count
  useEffect(() => {
    // Initialize the players from the stored data
    const players = generatePlayerData(loggedInUsername, userAvatar, userColor); 
    generateTournamentData(guestCount, players);  // This will set tournament data in localStorage
    const storedTournamentData = localStorage.getItem("tournamentData");
    if (storedTournamentData) {
      setTournamentData(JSON.parse(storedTournamentData));
    }
  }, [guestCount, loggedInUsername, userAvatar, userColor]);

  // Handle moving to next circle
  const handleNextCircle = () => {
    setCurrentCircle((prevCircle) => prevCircle + 1);
  };

  // Handle game completion (to be used in GamePage)
  const handleGameCompletion = (gameIndex: number, winner: PlayerInfo) => {
    const updatedTournamentData = { ...tournamentData };
    updatedTournamentData[`game${gameIndex}`].winner = winner;
    localStorage.setItem("tournamentData", JSON.stringify(updatedTournamentData));
    setTournamentData(updatedTournamentData);
  };

  const isCircleCompleted = (circleNumber: number) => {
    if (!tournamentData) return false; // Ensure that tournamentData is defined before checking
    const gamesInCircle = Object.values(tournamentData).filter((game: any) => game.circle === circleNumber);
    return gamesInCircle.every((game: any) => game.winner && game.winner.username !== "?");
  };

  const startGame = (gameIndex: number) => {
    // Logic to start the game goes here. You can store the game index or use it for navigation.
    navigate(`/tic-tac-toe-tournament/${gameIndex}`);
  };

  return (
    <div className="flex flex-col justify-center items-center p-4 bg-gray-900 min-h-screen">
      <button
        onClick={() => navigate("/menu")}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 {t("BACK_TO_MENU")}
      </button>

      <h1 className="text-4xl font-bold text-center mb-10">{t("TOURNAMENT_SETUP")}</h1>

      {/* Render Dynamic Rounds based on current circle */}
      {tournamentData &&
        Object.values(tournamentData).map((game: any, index: number) =>
          game.circle === currentCircle ? (
            <div key={index} className="mb-6">
              <h2>{t(`ROUND`)} {game.round}</h2>
              <div className="flex justify-around">
                <div>{game.player1.username}</div>
                <div>{game.player2.username}</div>
              </div>
              <div className="flex justify-around mt-4">
                {/* Player 1 */}
                <div>
                  <img src={game.player1.avatarimage} alt={game.player1.avatarname} width={50} />
                  <div>{game.player1.username}</div>
                  <div>{game.player1.points}</div>
                </div>
                {/* Player 2 */}
                <div>
                  <img src={game.player2.avatarimage} alt={game.player2.avatarname} width={50} />
                  <div>{game.player2.username}</div>
                  <div>{game.player2.points}</div>
                </div>
              </div>
              {/* Tie button */}
              {game.player1.points === "0" && game.player2.points === "0" && (
                <button
                  onClick={() => handleGameCompletion(game.round, { username: "random_winner", avatarname: "", avatarimage: "", color: "", points: "1" })}
                  className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                >
                  {t("PICK_WINNER")}
                </button>
              )}

              {/* Start game button */}
              {game.player1.points === "?" && game.player2.points === "?" && (
                <button
                  onClick={() => startGame(game.round)}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                >
                  {t("START_GAME")}
                </button>
              )}
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
