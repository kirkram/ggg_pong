import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PlayerInfo } from "./tournament_interface"; // Assuming this is already in your interfaces

export const TournamentGamePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { gameNumber } = useParams(); // Get game number from URL
  const gameIndex = parseInt(gameNumber || "1", 10); // Determine the current game number

  const [tournamentData, setTournamentData] = useState<any>(JSON.parse(localStorage.getItem("tournamentData") || "{}"));
  const gameData = tournamentData[`game${gameIndex}`]; // Current game data from tournament data

  const [board, setBoard] = useState<Array<"X" | "O" | "">>(Array(9).fill("")); // Default for "boring" game (3x3)
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<"X" | "O" | "None">("None");
  const [isGameOver, setIsGameOver] = useState(false);
  const [isTie, setIsTie] = useState(false);
  const [gameType, setGameType] = useState(localStorage.getItem("gameType") || "boring");

  const isMadnessGame = gameType === "madness";
  const gridSize = isMadnessGame ? 20 : 9; // 4x5 grid for madness game, 3x3 for boring game
  const gridCols = isMadnessGame ? 5 : 3; // 5 columns for madness, 3 columns for boring

  const blockedCells = isMadnessGame ? [4, 6, 15, 18] : []; // Blocked cells for madness game

  useEffect(() => {
    setBoard(Array(gridSize).fill("")); // Reset the board based on game type
    setCurrentPlayer("X");
    setWinner("None");
    setIsGameOver(false);
  }, [gameIndex, gameType]);

  const winPatterns = isMadnessGame
    ? [
        // Horizontal
        [0, 1, 2],
        [1, 2, 3],
        [7, 8, 9],
        [10, 11, 12],
        [11, 12, 13],
        [12, 13, 14],
        // Vertical
        [0, 5, 10],
        [2, 7, 12],
        [7, 12, 17],
        [3, 8, 13],
        [9, 14, 19],
        // Diagonal
        [1, 7, 13],
        [2, 8, 14],
        [5, 11, 17],
        [7, 13, 19],
        [3, 7, 11],
        [8, 12, 16],
        [9, 13, 17],
      ]
    : [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ]; // Winning patterns for boring game (3x3)

  const checkForWinner = () => {
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setIsGameOver(true);
        return;
      }
    }

    if (!board.includes("") && !isGameOver) {
      setIsTie(true);
      setWinner("None");
      setIsGameOver(true); // Tie
    }
  };

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

  const handlePickWinner = () => {
    // Randomly pick a winner in case of a tie
    const winner = Math.random() > 0.5 ? gameData.player1 : gameData.player2;
    updatePointsAndProceed(winner);
  };

  const updatePointsAndProceed = (winner: PlayerInfo) => {
    // Update the points in the current game
    const updatedTournamentData = { ...tournamentData };
    updatedTournamentData[`game${gameIndex}`].player1.points = winner.username === gameData.player1.username ? "1" : "0";
    updatedTournamentData[`game${gameIndex}`].player2.points = winner.username === gameData.player2.username ? "1" : "0";
    localStorage.setItem("tournamentData", JSON.stringify(updatedTournamentData));

    // Proceed to next circle or back to setup page
    if (isAllGamesCompletedForCircle(gameData.circle)) {
      navigate(`/tournament-setup`);
    } else {
      setTournamentData(updatedTournamentData);
    }
  };

  const isAllGamesCompletedForCircle = (circle: number) => {
    // Check if all games in the current circle are completed
    return Object.values(tournamentData).filter((game: any) => game.circle === circle)
      .every((game: any) => game.winner.username !== "?");
  };

  const handleBackToSetup = () => {
    // Update points and navigate back to the setup page
    const updatedPoints = { player1: winner === "X" ? 1 : 0, player2: winner === "O" ? 1 : 0 };
    tournamentData[`game${gameIndex}`].player1.points = updatedPoints.player1.toString();
    tournamentData[`game${gameIndex}`].player2.points = updatedPoints.player2.toString();
    localStorage.setItem("tournamentData", JSON.stringify(tournamentData));
    navigate("/tournament-setup");
  };

  const getCellStyle = (index: number) => {
    // Check if the current cell is blocked and set an image
    if (blockedCells.includes(index)) {
      return {
        backgroundImage: `url(${getBlockedCellImage(index)})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }
    
    return board[index] === "X" ? { backgroundColor: "lightblue" } : { backgroundColor: "lightpink" }; 
  };

  const getBlockedCellImage = (index: number) => {
    if (index === 4) return "/game_assets/cup.png";
    if (index === 6) return "/game_assets/spoon.png";
    if (index === 15) return "/game_assets/cup2.png";
    if (index === 18) return "/game_assets/gp.png";
    return "";
  };

  return (
    <div className="w-full min-h-screen bg-cover bg-center text-white p-8 flex flex-col items-center">
      <h1>{t("START_TIC_TAC_TOE")}</h1>

      <div className="flex justify-around">
        <div>{gameData.player1.username}</div>
        <div>{gameData.player2.username}</div>
      </div>

      {/* Game Board */}
      <div className={`grid grid-cols-${gridCols} gap-4`}>
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            className="w-20 h-20 text-4xl font-bold border-4 border-gray-400 rounded-md flex justify-center items-center"
            style={getCellStyle(index)} // Apply blocked cell styles
          >
            {cell}
          </button>
        ))}
      </div>

      <div>
        {isGameOver ? (winner === "None" ? t("ITS_A_TIE") : `${winner} ${t("WINS")} 🎉`) : `${t("ITS_TURN", { player: currentPlayer })}`}
      </div>

      {isTie && (
        <button onClick={handlePickWinner} className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg">
          {t("PICK_WINNER")}
        </button>
      )}

      {isGameOver && (
        <button onClick={handleBackToSetup} className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl mt-4">
          {t("BACK_TO_SETUP")} 🔙
        </button>
      )}
    </div>
  );
};

export default TournamentGamePage;
