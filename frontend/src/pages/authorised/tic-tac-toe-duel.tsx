import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const TicTacToeDuel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, guest, userAvatar, guestAvatar } = location.state || {};

  const [board, setBoard] = useState<Array<string>>(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<"X" | "O" | "None">("None");
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    setBoard(Array(9).fill(""));
    setCurrentPlayer("X");
    setWinner("None");
    setIsGameOver(false);
  }, [location.state]);

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

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setIsGameOver(true);
        return;
      }
    }

    if (!board.includes("")) {
      setWinner("None");
      setIsGameOver(true);
    }
  };

  const handleCellClick = (index: number) => {
    if (board[index] !== "" || isGameOver) return;
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
        🔙 {t("BACK_TO_MENU")}
      </button>

      <h1 className="text-4xl font-bold text-center mb-10">
        {t("START_TIC_TAC_TOE")}
      </h1>

      <div className="flex flex-row items-center justify-center gap-12 min-h-[650px]">
        <div className="bg-gray-800 p-12 w-96 rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">👤 {t("PLAYER")} 1</h2>
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

        <div className="grid grid-cols-3 gap-6 mb-6 max-w-[500px]">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className="w-32 h-32 text-4xl font-bold border-4 border-gray-400 rounded-md flex justify-center items-center"
              style={{
                backgroundColor:
                  cell === "X" ? "#4b6bfb" : cell === "O" ? "#e94e77" : "#f1f1f1",
              }}
            >
              {cell}
            </button>
          ))}
        </div>

        <div className="bg-gray-800 p-12 w-96 rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">👥 {t("GUEST_PLAYER")}</h2>
          {guestAvatar ? (
            <>
              <img
                src={guestAvatar.image}
                alt={guestAvatar.name}
                className="w-full h-full max-w-[250px] max-h-[250px] object-contain border-4 border-pink-400 mb-4"
              />
              <p className="capitalize mb-6 text-xl">{guest}</p>
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
