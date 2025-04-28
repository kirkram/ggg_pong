import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PlayerInfo } from "./tournament_interface";
import { generatePlayerData, generateTournamentData, checkIfCircleCompleted, updateNextCircle } from "./tournament_init";

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
    let username = "";
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      username = payload.username;
      setLoggedInUsername(username);
    }
  
    const storedGuestCount = localStorage.getItem("guestCount");
    const storedUserAvatar = localStorage.getItem("userAvatar");
    const storedUserColor = localStorage.getItem("userColor");
  
    const guestCountValue = storedGuestCount ? parseInt(storedGuestCount) : 3;
    const userAvatarValue = storedUserAvatar ? JSON.parse(storedUserAvatar) : null;
    const userColorValue = storedUserColor || "#FFFFFF";
  
    setGuestCount(guestCountValue);
    setUserAvatar(userAvatarValue);
    setUserColor(userColorValue);
  
    // Fetch guest information from localStorage
    const storedGuests = JSON.parse(
      localStorage.getItem("tournamentGuests") || "[]"
    );
    if (storedGuests && storedGuests.length > 0) {
      localStorage.setItem("tournamentGuests", JSON.stringify(storedGuests));
    }
  
    // After setting everything, now generate tournament
    const storedTournamentData = localStorage.getItem("tournamentData");
  
    if (storedTournamentData) {
      const updatedData = JSON.parse(storedTournamentData);
      console.log("Loaded tournament data from storage:", updatedData);
      setTournamentData(updatedData);
    } else if (username && userAvatarValue && userColorValue) {
      const players = generatePlayerData(username, userAvatarValue, userColorValue);
      const tournament = generateTournamentData(guestCountValue, players);
      if (tournament) {
        setTournamentData(tournament);
        localStorage.setItem("tournamentData", JSON.stringify(tournament));
      }
    }
  }, []); // runs only once at page load
  
  useEffect(() => {
    console.log("Updated currentCircle: ", currentCircle);
  }, [currentCircle]);

  // useEffect(() => {
  //   // Ensure that the tournament data is re-filtered based on the current circle
  //   if (tournamentData) {
  //     const filteredData = Object.values(tournamentData).filter(
  //       (game: any) => game.circle === currentCircle
  //     );
  //     console.log("Filtered tournament data for circle " + currentCircle, filteredData);
  //     setTournamentData(filteredData);
  //   }
  // }, [currentCircle, tournamentData]); // Dependency on currentCircle and tournamentData
  
  useEffect(() => {
    // Ensure that the tournament data is re-filtered based on the current circle
    if (tournamentData) {
      const filteredData = Object.values(tournamentData).filter(
        (game: any) => game.circle === currentCircle
      );
      console.log("Filtered tournament data for circle " + currentCircle, filteredData);
  
      // Only update the state if the filtered data is different from the current tournamentData
      if (JSON.stringify(filteredData) !== JSON.stringify(Object.values(tournamentData))) {
        setTournamentData(filteredData);
      }
    }
  }, [currentCircle, tournamentData]); // Dependency on currentCircle and tournamentData
  

  // Handle moving to next circle
  // const handleNextCircle = () => {
  //   let prevCircle: number = currentCircle + 1;
  //   console.log("currentCircle: " + currentCircle);
  //   setCurrentCircle((prevCircle));
  //   console.log("Hangle next circle: currecntCircle " + currentCircle + " guestCount " + guestCount);
  //   updateNextCircle(currentCircle + 1, guestCount);
  // };
  const handleNextCircle = () => {
    let prevCircle: number = currentCircle + 1;
    console.log("currentCircle before update: " + currentCircle);
    setCurrentCircle(prevCircle); // This updates the state
    
    // Regenerate or reload tournament data here
    const storedTournamentData = localStorage.getItem("tournamentData");
    if (storedTournamentData) {
      const updatedData = JSON.parse(storedTournamentData);
      console.log("Loaded tournament data for the next circle:", updatedData);
      setTournamentData(updatedData);
    }
    
    console.log("Handle next circle: currentCircle now is " + prevCircle);
    updateNextCircle(prevCircle, guestCount);
  };
  

  // const startGame = (gameIndex: number) => {
  //   const gameData = tournamentData[`game${gameIndex}`]; // Get the current game data

  //   // Pass player data to the game page via state
  //   navigate(`/tic-tac-toe-tournament/${gameIndex}`, {
  //     state: {
  //       player1: gameData.player1,
  //       player2: gameData.player2,
  //       gameIndex: gameIndex,
  //     },
  //   });
  // };
  // const startGame = (gameNumber: number) => {
  //   const gameData = tournamentData[`game${gameNumber}`]; // Get the current game data
  
  //   console.log("Tournament Data:", tournamentData);
  //   console.log("Tournament Data keys:", Object.keys(tournamentData));

  //   console.log("Game number is: " + gameNumber);
  //   console.log("game data: " + gameData);
  //   // Check if the game data and players are available
  //   if (!gameData || !gameData.player1 || !gameData.player2) {
  //     console.error(`Game ${gameNumber} data is missing player1 or player2.`);
  //     return; // Exit if the data is incomplete
  //   }
  
  //   // Pass player data to the game page via state
  //   navigate(`/tic-tac-toe-tournament/${gameNumber}`, {
  //     state: {
  //       player1: gameData.player1,
  //       player2: gameData.player2,
  //       gameIndex: gameNumber,
  //     },
  //   });
  // };
  const startGame = (gameNumber: number) => {
    // Access game using the correct keys (0, 1, etc.)
    const gameData = tournamentData[(gameNumber - 1).toString()]; // Convert gameNumber to string to match keys
  
    console.log("Game number is: " + gameNumber);
    console.log("game data:", gameData);
  
    // Check if the game data and players are available
    if (!gameData || !gameData.player1 || !gameData.player2) {
      console.error(`Game ${gameNumber} data is missing player1 or player2.`);
      return; // Exit if the data is incomplete
    }
  
    // Pass player data to the game page via state
    navigate(`/tic-tac-toe-tournament/${gameNumber}`, {
      state: {
        player1: gameData.player1,
        player2: gameData.player2,
        gameIndex: gameNumber,
      },
    });
  };
  
  


  const isCircleCompleted = (circleNumber: number) => {
   
    return checkIfCircleCompleted(circleNumber, guestCount);
  };  

  // const isCircleCompleted = (circleNumber: number) => {
  //   if (!tournamentData) return false;

  //   const gamesInCircle = Object.values(tournamentData).filter(
  //     (game: any) => game.circle === circleNumber
  //   );
  //   return gamesInCircle.every(
  //     (game: any) => game.winner && game.winner.username !== "?"
  //   );
  // };  



  const handlePickWinner = (gameNumber: number) => {
    const updatedTournamentData = { ...tournamentData };
  const game = updatedTournamentData[`game${gameNumber}`];

  // Randomly choose a winner between player1 and player2
  const randomWinner =
    Math.random() < 0.5 ? game.player1 : game.player2;

  // Update winner points
  if (randomWinner.username === game.player1.username) {
    game.player1.points = "1"; // Winner
    game.player2.points = "0"; // Loser
  } else {
    game.player1.points = "0"; // Loser
    game.player2.points = "1"; // Winner
  }

  // Save to localStorage and update state
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
                {game.player1.points === "0" && game.player2.points === "0" && ( // fix this!
                  <button
                    onClick={() =>
                      handlePickWinner(game.round)
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
