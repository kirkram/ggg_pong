// import { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";

// export const TicTacToeDuel = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { t } = useTranslation();
//   const { user, guest, userAvatar, guestAvatar } = location.state || {};

//   const [board, setBoard] = useState<Array<"X" | "O" | "None" | "">>(Array(9).fill(""));
//   const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
//   const [winner, setWinner] = useState<"X" | "O" | "None">("None");
//   const [isGameOver, setIsGameOver] = useState(false);

//   useEffect(() => {
//     setBoard(Array(9).fill("")); // Reset the board when location changes
//     setCurrentPlayer("X");
//     setWinner("None");
//     setIsGameOver(false);
//   }, [location.state]);

//   useEffect(() => {
//     checkForWinner();
//   }, [board]);

//   const checkForWinner = () => {
//     const winPatterns = [
//       [0, 1, 2],
//       [3, 4, 5],
//       [6, 7, 8],
//       [0, 3, 6],
//       [1, 4, 7],
//       [2, 5, 8],
//       [0, 4, 8],
//       [2, 4, 6],
//     ];

//     for (const pattern of winPatterns) {
//       const [a, b, c] = pattern;
//       if (board[a] && board[a] === board[b] && board[a] === board[c]) {
//         setWinner(board[a]);
//         setIsGameOver(true);
//         return;
//       }
//     }

//     if (!board.includes("")) {
//       setWinner("None");
//       setIsGameOver(true);
//     }
//   };

//   const handleCellClick = (index: number) => {
//     if (board[index] !== "" || isGameOver) return; // Prevent changing cell after it's already filled or game over
//     const newBoard = [...board];
//     newBoard[index] = currentPlayer;
//     setBoard(newBoard);
//     setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
//   };

//   const handleRestart = () => {
//     setBoard(Array(9).fill("")); // Reset the board
//     setCurrentPlayer("X");
//     setWinner("None");
//     setIsGameOver(false);
//   };

//   return (
//     <div
//       className="w-full min-h-screen bg-cover bg-center text-white p-8 flex flex-col items-center"
//       style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
//     >
//       <button
//         onClick={() => navigate("/menu")}
//         className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
//       >
//         🔙 {t("BACK_TO_MENU")}
//       </button>

//       <h1 className="text-4xl font-bold text-center mb-10">
//         {t("START_TIC_TAC_TOE")}
//       </h1>

//       <div className="flex flex-row items-center justify-center gap-12 min-h-[650px]">
//         {/* Player Section */}
//         <div className="bg-gray-800 p-12 w-96 rounded-xl shadow-lg flex flex-col items-center">
//           <h2 className="text-3xl font-bold mb-4">👤 {user?.username} 1</h2>
//           {userAvatar ? (
//             <>
//               <img
//                 src={userAvatar.image}
//                 alt={userAvatar.name}
//                 className="w-full h-full max-w-[250px] max-h-[250px] object-contain border-4 border-blue-400 mb-4"
//               />
//               <p className="capitalize mb-6 text-xl">{userAvatar.name}</p>
//             </>
//           ) : (
//             <p className="mb-6 italic text-gray-400 text-xl">{t("NO_AVATAR_SELECTED")}</p>
//           )}
//         </div>

//         {/* Game Board Section */}
//         <div className="grid grid-cols-3 gap-6 mb-6 max-w-[500px]">
//           {board.map((cell, index) => (
//             <button
//               key={index}
//               onClick={() => handleCellClick(index)}
//               className="w-32 h-32 text-4xl font-bold border-4 border-gray-400 rounded-md flex justify-center items-center"
//               style={{
//                 backgroundColor:
//                   cell === "X" ? "#4b6bfb" : cell === "O" ? "#e94e77" : "#f1f1f1",
//               }}
//             >
//               {cell}
//             </button>
//           ))}
//         </div>

//         {/* Guest Section */}
//         <div className="bg-gray-800 p-12 w-96 rounded-xl shadow-lg flex flex-col items-center">
//           <h2 className="text-3xl font-bold mb-4">👥 {guest?.username}</h2>
//           {guestAvatar ? (
//             <>
//               <img
//                 src={guestAvatar.image}
//                 alt={guestAvatar.name}
//                 className="w-full h-full max-w-[250px] max-h-[250px] object-contain border-4 border-pink-400 mb-4"
//               />
//               <p className="capitalize mb-6 text-xl">{guestAvatar.name}</p>
//             </>
//           ) : (
//             <p className="mb-6 italic text-gray-400 text-xl">{t("NO_AVATAR_SELECTED")}</p>
//           )}
//         </div>
//       </div>

//       <div className="mt-6 text-2xl font-bold">
//         {isGameOver
//           ? winner === "None"
//             ? t("ITS_A_TIE")
//             : `${winner} ${t("WINS")} 🎉`
//           : `${t("ITS_TURN", {
//               player: currentPlayer === "X" ? t("PLAYER") + " 1" : t("GUEST_PLAYER"),
//             })}`}
//       </div>

//       {isGameOver && (
//         <button
//           onClick={handleRestart}
//           className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl mt-4"
//         >
//           {t("PLAY_AGAIN")} 🔄
//         </button>
//       )}
//     </div>
//   );
// };

// export default TicTacToeDuel;

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const TicTacToeDuel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const { user, guest, guestName, userAvatar, guestAvatar, userColor, guestColor, gameType } = location.state || {};

  const [board, setBoard] = useState<Array<"X" | "O" | "">>(Array(9).fill("")); // Ensure empty fields at the start
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<"X" | "O" | "None">("None");
  const [isGameOver, setIsGameOver] = useState(false);

  // Update the board based on the game type (3x3 for boring, 4x5 for madness)
  useEffect(() => {
    if (gameType === "boring") {
      setBoard(Array(9).fill("")); // 3x3 board
    } else if (gameType === "madness") {
      setBoard(Array(20).fill("")); // 4x5 board
    }
    setCurrentPlayer("X");
    setWinner("None");
    setIsGameOver(false); // Ensure the game isn't over when starting
  }, [gameType]);

  // Winning patterns for boring game (3x3)
  const boringWinPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // Winning patterns for madness game (4x5)
  const madnessWinPatterns = [
    // Horizontal
    [0, 1, 2],
    [5, 6, 7],
    [10, 11, 12],
    [15, 16, 17],
    // Vertical
    [0, 5, 10],
    [1, 6, 11],
    [2, 7, 12],
    [3, 8, 13],
    [4, 9, 14],
    // Diagonal
    [0, 6, 12],
    [4, 8, 12],
  ];

  const winPatterns = gameType === "boring" ? boringWinPatterns : madnessWinPatterns;

  const blockedCells = gameType === "madness" ? [4, 6, 15, 18] : []; // Blocked cells for madness game

  const checkForWinner = () => {
    // Check for win conditions first
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      // Skip blocked cells in madness mode
      if (gameType === "madness" && (blockedCells.includes(a) || blockedCells.includes(b) || blockedCells.includes(c))) {
        continue;
      }
      // If a player has won, set the winner and end the game
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setIsGameOver(true); // Stop the game when a winner is found
        return; // Exit the function once we found a winner
      }
    }

    // Check for a tie: If all playable cells are filled (excluding blocked cells)
    const remainingEmptyCells = board.filter((cell, index) => cell === "" && !blockedCells.includes(index));
    if (remainingEmptyCells.length === 0 && !isGameOver) {
      setWinner("None");
      setIsGameOver(true); // Declare the game a tie if no empty spaces left
    }
  };

  // Handle a click on a cell
  const handleCellClick = (index: number) => {
    if (board[index] !== "" || isGameOver || (gameType === "madness" && blockedCells.includes(index))) return; // Prevent changing cell after it's already filled or game over or blocked

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  const handleRestart = () => {
    if (gameType === "boring") {
      setBoard(Array(9).fill("")); // Reset for 3x3
    } else {
      setBoard(Array(20).fill("")); // Reset for 4x5
    }
    setCurrentPlayer("X");
    setWinner("None");
    setIsGameOver(false);
  };

  useEffect(() => {
    checkForWinner(); // Check for winner on every board change
  }, [board]);

  // Helper function to get the button's color based on the selected color
  const getCellColor = (index: number) => {
    if (gameType === "boring") {
      return board[index] === "X" ? userColor : board[index] === "O" ? guestColor : "#f1f1f1";
    }
    if (blockedCells.includes(index)) {
      return "#d3d3d3"; // Blocked cells should have a default gray color
    }
    return board[index] === "X" ? userColor : board[index] === "O" ? guestColor : "#f1f1f1";
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center text-white p-8 flex flex-col items-center"
      style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
    >
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
          <h2 className="text-3xl font-bold mb-4">👤 {user?.username}</h2>
          {userAvatar ? (
            <>
              <img
                src={userAvatar.image}
                alt={userAvatar.name}
                className="w-full h-full max-w-[250px] max-h-[250px] object-contain border-4 border-blue-400 mb-4"
              />
              <p className="capitalize mb-6 text-xl">{userAvatar.name}</p>
            </>
          ) : (
            <p className="mb-6 italic text-gray-400 text-xl">{t("NO_AVATAR_SELECTED")}</p>
          )}
        </div>

        {/* Game Board Section */}
        <div className={`grid ${gameType === "boring" ? "grid-cols-3" : "grid-cols-5"} gap-6 mb-6 max-w-[500px]`}>
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className="w-20 h-20 text-4xl font-bold border-4 border-gray-400 rounded-md flex justify-center items-center"
              style={{
                backgroundColor: getCellColor(index),
              }}
            >
              {cell}
            </button>
          ))}
        </div>

        {/* Guest Section */}
        <div className="bg-gray-800 p-12 w-96 rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">👥 {guestName}</h2>
          {guestAvatar ? (
            <>
              <img
                src={guestAvatar.image}
                alt={guestAvatar.name}
                className="w-full h-full max-w-[250px] max-h-[250px] object-contain border-4 border-pink-400 mb-4"
              />
              <p className="capitalize mb-6 text-xl">{guestAvatar.name}</p>
            </>
          ) : (
            <p className="mb-6 italic text-gray-400 text-xl">{t("NO_AVATAR_SELECTED")}</p>
          )}
        </div>
      </div>

      <div className="mt-6 text-2xl font-bold">
        {isGameOver
          ? winner === "None"
            ? t("ITS_A_TIE")
            : `${winner} ${t("WINS")} 🎉`
          : `${t("ITS_TURN", {
              player: currentPlayer === "X" ? t("PLAYER") + " 1" : t("GUEST_PLAYER"),
            })}`}
      </div>

      {isGameOver && (
        <button
          onClick={handleRestart}
          className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl mt-4"
        >
          {t("PLAY_AGAIN")} 🔄
        </button>
      )}
    </div>
  );
};

export default TicTacToeDuel;
