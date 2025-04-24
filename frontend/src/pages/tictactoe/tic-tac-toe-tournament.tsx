import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const TournamentGamePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  const { rounds, players } = location.state;
  const roundIndex = new URLSearchParams(location.search).get("round"); // Get round number from URL query
  const currentRound = rounds[parseInt(roundIndex || "0", 10)];

  // Game state
  const [board, setBoard] = useState<Array<"X" | "O" | "">>(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<"X" | "O" | "None">("None");
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameType, setGameType] = useState(localStorage.getItem("gameType") || "boring");

  // Get the players for the current round
  const player1 = currentRound.players[0];
  const player2 = currentRound.players[1];

  // Blocked cells for "madness" game type
  const blockedCells = gameType === "madness" ? [4, 6, 15, 18] : []; // Adjust blocked cells for madness game

  useEffect(() => {
    setBoard(gameType === "boring" ? Array(9).fill("") : Array(20).fill("")); // Reset board based on game type
    setCurrentPlayer("X");
    setWinner("None");
    setIsGameOver(false);
  }, [roundIndex, gameType]);

  // Check for a winner
  const checkForWinner = () => {
    const winPatterns = gameType === "boring"
      ? [
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8],
          [0, 3, 6],
          [1, 4, 7],
          [2, 5, 8],
          [0, 4, 8],
          [2, 4, 6],
        ]
      : [
          // Madness patterns (for 4x5 board)
          [0, 1, 2],
          [1, 2, 3],
          [7, 8, 9],
          [10, 11, 12],
          [11, 12, 13],
          [12, 13, 14],
          [0, 5, 10],
          [2, 7, 12],
          [7, 12, 17],
          [3, 8, 13],
          [9, 14, 19],
          [1, 7, 13],
          [2, 8, 14],
          [5, 11, 17],
          [7, 13, 19],
          [3, 7, 11],
          [8, 12, 16],
          [9, 13, 17],
        ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (gameType === "madness" && (blockedCells.includes(a) || blockedCells.includes(b) || blockedCells.includes(c))) {
        continue;
      }
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setIsGameOver(true);
        return;
      }
    }

    const remainingEmptyCells = board.filter((cell, index) => cell === "" && !blockedCells.includes(index));
    if (remainingEmptyCells.length === 0 && !isGameOver) {
      setWinner("None");
      setIsGameOver(true);
    }
  };

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (board[index] !== "" || isGameOver || blockedCells.includes(index)) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  useEffect(() => {
    checkForWinner();
  }, [board]);

  // Handle the end of the game (after a winner is decided)
//   const handleBackToSetup = () => {
//     const updatedRounds = [...rounds];
//     updatedRounds[parseInt(roundIndex || "0", 10)].winner = winner;
//     navigate("/tournament-setup", { state: { rounds: updatedRounds } });
//   };
const handleBackToSetup = () => {
    // Calculate the points for each player based on the winner
    const player1Points = winner === "X" ? 1 : 0;
    const player2Points = winner === "O" ? 1 : 0;

    // Update the rounds with the points
    const updatedRounds = [...rounds];
    updatedRounds[parseInt(roundIndex || "0", 10)].players[0].points = player1Points;
    updatedRounds[parseInt(roundIndex || "0", 10)].players[1].points = player2Points;

    // Save the updated points to localStorage
    localStorage.setItem(`points${roundIndex}`, JSON.stringify({
        player1: player1Points,
        player2: player2Points,
    }));

    // Navigate back to the setup page with updated rounds
    navigate("/tournament-setup", { state: { rounds: updatedRounds } });
};


  // Get the cell style based on the game type
  const getCellStyle = (index: number) => {
    if (gameType === "boring") {
      return { backgroundColor: "#f8c1d4" }; // Light pink for boring game
    }

    if (gameType === "madness") {
      // For blocked cells, add a background image
      if (blockedCells.includes(index)) {
        const imageUrl = getBlockedCellImage(index);
        return {
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        };
      }

      return {
        backgroundColor: board[index] === "X" ? player1.color : board[index] === "O" ? player2.color : "#f1f1f1",
      };
    }

    return {};
  };

  const getBlockedCellImage = (index: number) => {
    if (index === 4) return "/game_assets/cup.png";
    if (index === 6) return "/game_assets/spoon.png";
    if (index === 15) return "/game_assets/cup2.png";
    if (index === 18) return "/game_assets/gp.png";
    return "";
  };

  return (
    <div className="w-full min-h-screen bg-cover bg-center text-white p-8 flex flex-col items-center" style={{ backgroundImage: "url('/background/360_F_339060225_w8ob8LjMJzPdEqD9UFxbE6ibcKx8dFrP.jpg')" }}>
      <button
        onClick={() => navigate("/menu")}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 {t("BACK_TO_MENU")}
      </button>

      <h1 className="text-4xl font-bold text-center mb-10">{t("START_TIC_TAC_TOE")}</h1>

      <div className="flex flex-row items-center justify-center gap-12 min-h-[650px]">
        {/* Player Section */}
        <div className="bg-gray-800 p-12 w-96 rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">X 👤 {player1.username || "Player 1"}</h2>
          {player1.avatar ? (
            <img src={player1.avatar.image} alt={player1.avatar.name} className="w-full max-w-[150px] rounded-full mb-4" />
          ) : (
            <p className="italic text-gray-400">{t("NO_AVATAR_SELECTED")}</p>
          )}
          <p>{player1.username || t("UNKNOWN_PLAYER")}</p>
          {gameType === "madness" && player1.color && (
            <p>{t("COLOR")}: {player1.color}</p>
          )}
        </div>

        {/* Game Board Section */}
        <div className={`grid ${gameType === "boring" ? "grid-cols-3" : "grid-cols-5"} gap-6 mb-6 max-w-[500px]`}>
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className="w-20 h-20 text-4xl font-bold border-4 border-gray-400 rounded-md flex justify-center items-center"
              style={getCellStyle(index)}
            >
              {cell}
            </button>
          ))}
        </div>

        {/* Guest Section */}
        <div className="bg-gray-800 p-12 w-96 rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">O 👥 {player2.username || "Guest"}</h2>
          {player2.avatar ? (
            <img src={player2.avatar.image} alt={player2.avatar.name} className="w-full max-w-[150px] rounded-full mb-4" />
          ) : (
            <p className="italic text-gray-400">{t("NO_AVATAR_SELECTED")}</p>
          )}
          <p>{player2.username || t("UNKNOWN_PLAYER")}</p>
          {gameType === "madness" && player2.color && (
            <p>{t("COLOR")}: {player2.color}</p>
          )}
        </div>
      </div>

      <div className="mt-6 text-2xl font-bold">
        {isGameOver
          ? winner === "None"
            ? t("ITS_A_TIE")
            : `${winner === "X" ? player1.username : player2.username} ${t("WINS")} 🎉`
          : `${t("ITS_TURN", { player: currentPlayer === "X" ? player1.username : player2.username })}`}
      </div>

      {isGameOver && (
        <button onClick={handleBackToSetup} className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl mt-4">
          {t("BACK_TO_SETUP")} 🔙
        </button>
      )}
    </div>
  );
};

export default TournamentGamePage;
