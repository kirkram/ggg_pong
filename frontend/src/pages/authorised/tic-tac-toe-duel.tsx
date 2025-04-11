import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const TicTacToeDuel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, guest, userAvatar, guestAvatar } = location.state || {};

  const [board, setBoard] = useState<Array<string>>(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<"X" | "O" | "None">("None");
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    // Reset the board and other states when navigating to the game
    setBoard(Array(9).fill(""));
    setCurrentPlayer("X");
    setWinner("None");
    setIsGameOver(false);
  }, [location.state]);

  // Check for a win or a tie after every move
  useEffect(() => {
    checkForWinner();
  }, [board]);

  const checkForWinner = () => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    // Check for a winner
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setIsGameOver(true);
        return;
      }
    }

    // Check for a tie (no empty spots)
    if (!board.includes("")) {
      setWinner("None");
      setIsGameOver(true);
    }
  };

  const handleCellClick = (index: number) => {
    if (board[index] !== "" || isGameOver) return; // Ignore click if cell is already filled or game is over

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  const handleRestart = () => {
    setBoard(Array(9).fill(""));
    setCurrentPlayer("X");
    setWinner("None");
    setIsGameOver(false);
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
        🔙 Back to Menu
      </button>

      <h1 className="text-4xl font-bold text-center mb-10">
        X’s & O’s Showdown ✖️⭕️
      </h1>

      <div className="flex flex-row items-center justify-center gap-12 min-h-[650px]">
        {/* Player 1 - Left side */}
        {/* <div className="bg-gray-800 p-6 w-72 rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">👤 Player 1</h2>
          {userAvatar ? (
            <>
              <img
                src={userAvatar.image}
                alt={userAvatar.name}
                className="w-full h-full max-w-[150px] max-h-[150px] object-contain border-4 border-blue-400 mb-2"
              />
              <p className="capitalize mb-4">{userAvatar.name}</p>
            </>
          ) : (
            <p className="mb-4 italic text-gray-400">No avatar selected</p>
          )}
        </div> */}
        <div className="bg-gray-800 p-12 w-96 rounded-xl shadow-lg flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4">👤 Player 1</h2>
            {userAvatar ? (
                <>
                    <img
                        src={userAvatar.image}
                        alt={userAvatar.name}
                        className="w-full h-full max-w-[250px] max-h-[250px] object-contain border-4 border-blue-400 mb-4" // Increased avatar size
                    />
                    <p className="capitalize mb-6 text-xl">{userAvatar.name}</p>
                </>
            ) : (
            <p className="mb-6 italic text-gray-400 text-xl">No avatar selected</p>
            )}
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-3 gap-6 mb-6 max-w-[500px]">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className="w-32 h-32 text-4xl font-bold border-4 border-gray-400 rounded-md flex justify-center items-center"
              style={{
                backgroundColor: cell === "X" ? "#4b6bfb" : cell === "O" ? "#e94e77" : "#f1f1f1",
              }}
            >
              {cell}
            </button>
          ))}
        </div>

        {/* Guest Player - Right side */}
        {/* <div className="bg-gray-800 p-6 w-72 rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2">👥 Guest Player</h2>
          {guestAvatar ? (
            <>
              <img
                src={guestAvatar.image}
                alt={guestAvatar.name}
                className="w-full h-full max-w-[150px] max-h-[150px] object-contain border-4 border-pink-400 mb-2"
              />
              <p className="capitalize mb-4">{guest}</p>
            </>
          ) : (
            <p className="mb-4 italic text-gray-400">No avatar selected</p>
          )}
        </div> */}
        <div className="bg-gray-800 p-12 w-96 rounded-xl shadow-lg flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4">👥 Guest Player</h2>
            {userAvatar ? (
                <>
                    <img
                        src={guestAvatar.image}
                        alt={guestAvatar.name}
                        className="w-full h-full max-w-[250px] max-h-[250px] object-contain border-4 border-pink-400 mb-4"
                    />
                    <p className="capitalize mb-6 text-xl">{guest}</p>
                </>
            ) : (
            <p className="mb-6 italic text-gray-400 text-xl">No avatar selected</p>
            )}
        </div>
      </div>

      {/* Game Status */}
      <div className="mt-6 text-2xl font-bold">
        {isGameOver
          ? winner === "None"
            ? "It's a Tie!"
            : `${winner} Wins! 🎉`
          : `It's ${currentPlayer === "X" ? "Player 1" : "Guest's"} Turn`}
      </div>

      {/* Restart Button */}
      {isGameOver && (
        <button
          onClick={handleRestart}
          className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl mt-4"
        >
          Play Again 🔄
        </button>
      )}
    </div>
  );
};

export default TicTacToeDuel;
