// import { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";

// export const TicTacToeDuel = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { t } = useTranslation();

//   const {
//     user,
//     guest,
//     userAvatar,
//     guestAvatar,
//     userColor,
//     guestColor,
//     gameType,
//   } = location.state || {};

//   // Ensure that the logged-in user's username is taken from local storage or JWT token
//   const [loggedInUsername, setLoggedInUsername] = useState(() => {
//     const token = localStorage.getItem("ping-pong-jwt");
//     if (token) {
//       const payload = JSON.parse(atob(token.split(".")[1]));
//       return payload.username; // Logged-in user's username from JWT token
//     }
//     return "";
//   });

//   // Get guestName from localStorage as it was saved there during customization
//   const [guestName, setGuestName] = useState(
//     localStorage.getItem("guestName") || "Guest"
//   );

//   const [board, setBoard] = useState<Array<"X" | "O" | "">>(Array(9).fill("")); // Ensure empty fields at the start
//   const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
//   const [winner, setWinner] = useState<"X" | "O" | "None">("None");
//   const [isGameOver, setIsGameOver] = useState(false);

//   // Update the board based on the game type (3x3 for boring, 4x5 for madness)
//   useEffect(() => {
//     if (gameType === "boring") {
//       setBoard(Array(9).fill("")); // 3x3 board
//     } else if (gameType === "madness") {
//       setBoard(Array(20).fill("")); // 4x5 board
//     }
//     setCurrentPlayer("X");
//     setWinner("None");
//     setIsGameOver(false); // Ensure the game isn't over when starting
//   }, [gameType]);

//   // Winning patterns for boring game (3x3)
//   const boringWinPatterns = [
//     [0, 1, 2],
//     [3, 4, 5],
//     [6, 7, 8],
//     [0, 3, 6],
//     [1, 4, 7],
//     [2, 5, 8],
//     [0, 4, 8],
//     [2, 4, 6],
//   ];

//   // Winning patterns for madness game (4x5)
//   const madnessWinPatterns = [
//     // Horizontal
//     [0, 1, 2],
//     [1, 2, 3],
//     [7, 8, 9],
//     [10, 11, 12],
//     [11, 12, 13],
//     [12, 13, 14],
//     // Vertical
//     [0, 5, 10],
//     [2, 7, 12],
//     [7, 12, 13],
//     [3, 8, 13],
//     [9, 14, 19],
//     // Diagonal
//     [1, 7, 13],
//     [2, 8, 14],
//     [5, 11, 17],
//     [7, 13, 19],
//     [3, 7, 11],
//     [8, 12, 16],
//     [9, 13, 17],
//   ];

//   const winPatterns =
//     gameType === "boring" ? boringWinPatterns : madnessWinPatterns;

//   const blockedCells = gameType === "madness" ? [4, 6, 15, 18] : []; // Blocked cells for madness game

//   const checkForWinner = () => {
//     // Check for win conditions first
//     for (const pattern of winPatterns) {
//       const [a, b, c] = pattern;
//       // Skip blocked cells in madness mode
//       if (
//         gameType === "madness" &&
//         (blockedCells.includes(a) ||
//           blockedCells.includes(b) ||
//           blockedCells.includes(c))
//       ) {
//         continue;
//       }
//       // If a player has won, set the winner and end the game
//       if (board[a] && board[a] === board[b] && board[a] === board[c]) {
//         setWinner(board[a]);
//         setIsGameOver(true); // Stop the game when a winner is found
//         return; // Exit the function once we found a winner
//       }
//     }

//     // Check for a tie: If all playable cells are filled (excluding blocked cells)
//     const remainingEmptyCells = board.filter(
//       (cell, index) => cell === "" && !blockedCells.includes(index)
//     );
//     if (remainingEmptyCells.length === 0 && !isGameOver) {
//       setWinner("None");
//       setIsGameOver(true); // Declare the game a tie if no empty spaces left
//     }
//   };

//   // Handle a click on a cell
//   const handleCellClick = (index: number) => {
//     if (
//       board[index] !== "" ||
//       isGameOver ||
//       (gameType === "madness" && blockedCells.includes(index))
//     )
//       return; // Prevent changing cell after it's already filled or game over or blocked

//     const newBoard = [...board];
//     newBoard[index] = currentPlayer;
//     setBoard(newBoard);
//     setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
//   };

//   const handleRestart = () => {
//     if (gameType === "boring") {
//       setBoard(Array(9).fill("")); // Reset for 3x3
//     } else {
//       setBoard(Array(20).fill("")); // Reset for 4x5
//     }
//     setCurrentPlayer("X");
//     setWinner("None");
//     setIsGameOver(false);
//   };

//   useEffect(() => {
//     checkForWinner(); // Check for winner on every board change
//   }, [board]);

//   const getBlockedCellImage = (index: number) => {
//     // Depending on the index, return different blocked images
//     if (index === 4) return "/game_assets/cup.png";
//     if (index === 6) return "/game_assets/spoon.png";
//     if (index === 15) return "/game_assets/cup2.png";
//     if (index === 18) return "/game_assets/gp.png";
//     return ""; // For non-blocked cells
//   };

//   // Helper function to get the button's color based on the selected color
//   // const getCellColor = (index: number) => {
//   //   if (gameType === "boring") {
//   //     return board[index] === "X"
//   //       ? userColor
//   //       : board[index] === "O"
//   //       ? guestColor
//   //       : "#f1f1f1";
//   //   }
//   //   if (blockedCells.includes(index)) {
//   //     const imageUrl = getBlockedCellImage(index);
//   //     return imageUrl ? `url(${imageUrl})` : "#d3d3d3"; // Blocked cells should have a default gray color
//   //   }
//   //   return board[index] === "X"
//   //     ? userColor
//   //     : board[index] === "O"
//   //     ? guestColor
//   //     : "#f1f1f1";
//   // };

//   // Helper function to get the button's style (image for blocked cells)
//   const getCellStyle = (index: number) => {
//     if (gameType === "boring") {
//       return {
//         backgroundColor:
//           board[index] === "X"
//             ? userColor
//             : board[index] === "O"
//             ? guestColor
//             : "#f1f1f1",
//       };
//     }

//     if (blockedCells.includes(index)) {
//       const imageUrl = getBlockedCellImage(index);
//       return {
//         backgroundImage: `url(${imageUrl})`,
//         backgroundSize: "contain", // Ensure the image covers the entire button
//         backgroundPosition: "center", // Center the image in the button
//         backgroundRepeat: "no-repeat",
//       };
//     }

//     return {
//       backgroundColor:
//         board[index] === "X"
//           ? userColor
//           : board[index] === "O"
//           ? guestColor
//           : "#f1f1f1",
//     };
//   };

//   return (
//     <div
//       className="w-full min-h-screen bg-cover bg-center text-white p-8 flex flex-col items-center"
//       // style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
//       // style={{ backgroundImage: "url('/background/cute-abstract-modern-background-free-vector.jpg')" }}
//       // style={{ backgroundImage: "url('/background/background.png')" }}
//       // style={{ backgroundImage: "url('/background/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdjkzNS1hdW0tMDMuanBn.webp')" }}
//       style={{ backgroundImage: "url('/background/360_F_339060225_w8ob8LjMJzPdEqD9UFxbE6ibcKx8dFrP.jpg')" }}
//       // style={{ backgroundImage: "url('/background/background2.jpg')" }}
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
//           <h2 className="text-3xl font-bold mb-4">
//             X 👤 {loggedInUsername || "Player 1"}
//           </h2>
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
//             <p className="mb-6 italic text-gray-400 text-xl">
//               {t("NO_AVATAR_SELECTED")}
//             </p>
//           )}
//         </div>

//         {/* Game Board Section */}
//         <div
//           className={`grid ${
//             gameType === "boring" ? "grid-cols-3" : "grid-cols-5"
//           } gap-6 mb-6 max-w-[500px]`}
//         >
//           {board.map((cell, index) => (
//             <button
//               key={index}
//               onClick={() => handleCellClick(index)}
//               className="w-20 h-20 text-4xl font-bold border-4 border-gray-400 rounded-md flex justify-center items-center"
//               // style={{
//               //   backgroundColor: getCellColor(index),
//               //   backgroundSize: "cover",
//               // }}
//               style={getCellStyle(index)}
//             >
//               {cell}
//             </button>
//           ))}
//         </div>

//         {/* Guest Section */}
//         <div className="bg-gray-800 p-12 w-96 rounded-xl shadow-lg flex flex-col items-center">
//           <h2 className="text-3xl font-bold mb-4">O 👥 {guestName || "Guest"}</h2>
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
//             <p className="mb-6 italic text-gray-400 text-xl">
//               {t("NO_AVATAR_SELECTED")}
//             </p>
//           )}
//         </div>
//       </div>

//       <div className="mt-6 text-2xl font-bold">
//         {isGameOver
//           ? winner === "None"
//             ? t("ITS_A_TIE")
//             : `${winner} ${t("WINS")} 🎉`
//           : `${t("ITS_TURN", {
//               player:
//                 currentPlayer === "X" ? t("PLAYER") + " 1" : t("GUEST_PLAYER"),
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
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const TicTacToeDuel = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { gameNumber } = useParams(); // Get game number from URL
  const gameIndex = parseInt(gameNumber || "1", 10); // Determine the current game number

  // Fetching necessary data from localStorage
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Player 1");
  const [guestName, setGuestName] = useState(localStorage.getItem("guestName") || "Guest");
  const [userAvatar, setUserAvatar] = useState(JSON.parse(localStorage.getItem("userAvatar")) || null);
  const [guestAvatar, setGuestAvatar] = useState(JSON.parse(localStorage.getItem("guestAvatar")) || null);
  const [userColor, setUserColor] = useState(localStorage.getItem("userColor") || "#000000");
  const [guestColor, setGuestColor] = useState(localStorage.getItem("guestColor") || "#FFFFFF");
  
  // Initializing the points for each game
  const [points, setPoints] = useState({
    player1: JSON.parse(localStorage.getItem(`points${gameIndex}`))?.player1 || 0,
    player2: JSON.parse(localStorage.getItem(`points${gameIndex}`))?.player2 || 0,
  });

  const [gameType, setGameType] = useState(localStorage.getItem("gameType") || "boring");
  const [board, setBoard] = useState<Array<"X" | "O" | "">>(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<"X" | "O" | "None">("None");
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (gameType === "boring") {
      setBoard(Array(9).fill(""));
    } else if (gameType === "madness") {
      setBoard(Array(20).fill(""));
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
    [1, 2, 3],
    [7, 8, 9],
    [10, 11, 12],
    [11, 12, 13],
    [12, 13, 14],
    // Vertical
    [0, 5, 10],
    [2, 7, 12],
    [7, 12, 13],
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
  ];

  const winPatterns = gameType === "boring" ? boringWinPatterns : madnessWinPatterns;

  const blockedCells = gameType === "madness" ? [4, 6, 15, 18] : []; // Blocked cells for madness game

  const checkForWinner = () => {
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (gameType === "madness" && (blockedCells.includes(a) || blockedCells.includes(b) || blockedCells.includes(c))) {
        continue;
      }
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setIsGameOver(true); // Stop the game when a winner is found
        return;
      }
    }

    const remainingEmptyCells = board.filter((cell, index) => cell === "" && !blockedCells.includes(index));
    if (remainingEmptyCells.length === 0 && !isGameOver) {
      setWinner("None");
      setIsGameOver(true); // Declare the game a tie if no empty spaces left
    }
  };

  const handleCellClick = (index: number) => {
    if (board[index] !== "" || isGameOver || (gameType === "madness" && blockedCells.includes(index))) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  const handleRestart = () => {
    setBoard(gameType === "boring" ? Array(9).fill("") : Array(20).fill(""));
    setCurrentPlayer("X");
    setWinner("None");
    setIsGameOver(false);
  };

  useEffect(() => {
    checkForWinner();
  }, [board]);

  const handleBackToSetup = () => {
    const updatedPoints = { player1: winner === "X" ? 1 : 0, player2: winner === "O" ? 1 : 0 };
    localStorage.setItem(`points${gameIndex}`, JSON.stringify(updatedPoints));
    navigate("/duel-setup");
  };

  // const getCellStyle = (index: number) => {
  //   // If the game type is "boring", apply a pink or darker background for empty cells
  //   if (gameType === "boring") {
  //     return { backgroundColor: "#f8c1d4" }; // Light pink color for empty cells
  //   }

  //   if (blockedCells.includes(index)) {
  //     const imageUrl = getBlockedCellImage(index);
  //     return {
  //       backgroundImage: `url(${imageUrl})`,
  //       backgroundSize: "contain",
  //       backgroundPosition: "center",
  //       backgroundRepeat: "no-repeat",
  //     };
  //   }

  //   return {
  //     backgroundColor: board[index] === "X" ? userColor : board[index] === "O" ? guestColor : "#f1f1f1",
  //   };
  // };

  const getCellStyle = (index: number) => {
    // If the game type is "boring", apply a pink or darker background for empty cells
    if (gameType === "boring") {
      return { backgroundColor: "#f8c1d4" }; // Light pink color for empty cells
    }
  
    // If the game type is "madness", apply the selected player colors
    if (gameType === "madness") {
      // Check if the current cell is a blocked cell
      if (blockedCells.includes(index)) {
        const imageUrl = getBlockedCellImage(index);
        return {
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        };
      }
  
      // Apply the colors based on the "X" or "O" value in the cell
      if (board[index] === "X") {
        return { backgroundColor: userColor }; // Use userColor for "X"
      }
      if (board[index] === "O") {
        return { backgroundColor: guestColor }; // Use guestColor for "O"
      }
      return { backgroundColor: "#f1f1f1" }; // Default empty cell color
    }
  
    // If the cell is blocked, apply the background image for the blocked cell
    if (blockedCells.includes(index)) {
      const imageUrl = getBlockedCellImage(index);
      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }
  
    // Default case for the "boring" game type or other types
    return {
      backgroundColor:
        board[index] === "X" ? userColor : board[index] === "O" ? guestColor : "#f1f1f1",
    };
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
      <button onClick={() => navigate("/menu")} className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md">
        🔙 {t("BACK_TO_MENU")}
      </button>

      <h1 className="text-4xl font-bold text-center mb-10">{t("START_TIC_TAC_TOE")}</h1>

      <div className="flex flex-row items-center justify-center gap-12 min-h-[650px]">
        {/* Player Section */}
        <div className="bg-gray-800 p-12 w-96 rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">X 👤 {userName || "Player 1"}</h2>
          {userAvatar ? (
            <>
              <img src={userAvatar.image} alt={userAvatar.name} className="w-full h-full max-w-[250px] max-h-[250px] object-contain border-4 border-blue-400 mb-4" />
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
              style={getCellStyle(index)}
            >
              {cell}
            </button>
          ))}
        </div>

        {/* Guest Section */}
        <div className="bg-gray-800 p-12 w-96 rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">O 👥 {guestName || "Guest"}</h2>
          {guestAvatar ? (
            <>
              <img src={guestAvatar.image} alt={guestAvatar.name} className="w-full h-full max-w-[250px] max-h-[250px] object-contain border-4 border-pink-400 mb-4" />
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
          : `${t("ITS_TURN", { player: currentPlayer === "X" ? t("PLAYER") + " 1" : t("GUEST_PLAYER") })}`}
      </div>

      {isGameOver && (
        <button onClick={handleBackToSetup} className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl mt-4">
          {t("BACK_TO_SETUP")} 🔙
        </button>
      )}
    </div>
  );
};

export default TicTacToeDuel;
