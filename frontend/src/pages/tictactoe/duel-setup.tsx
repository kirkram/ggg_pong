import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const DuelSetup = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [rounds1, setRounds1] = useState(0); 
  const [rounds2, setRounds2] = useState(0); 
  const [rounds3, setRounds3] = useState(0); 

  const [points1, setPoints1] = useState({
    player1: "?", 
    player2: "?", 
  });

  const [points2, setPoints2] = useState({
    player1: "?", 
    player2: "?", 
  });

  const [points3, setPoints3] = useState({
    player1: "?", 
    player2: "?", 
  });

  const [userName, setUserName] = useState(""); 
  const [guestName, setGuestName] = useState(""); 
  const [userAvatar, setUserAvatar] = useState(null); 
  const [guestAvatar, setGuestAvatar] = useState(null); 

  useEffect(() => {
    const token = localStorage.getItem("ping-pong-jwt");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserName(payload.username); // Set logged-in username from JWT token
    }

    setGuestName(localStorage.getItem("guestName") || "Guest");
    
    setUserAvatar(JSON.parse(localStorage.getItem("userAvatar")) || null);
    setGuestAvatar(JSON.parse(localStorage.getItem("guestAvatar")) || null);

    // Fetch points for each game and update them if available
    const updatedPoints1 = JSON.parse(localStorage.getItem("points1"));
    const updatedPoints2 = JSON.parse(localStorage.getItem("points2"));
    const updatedPoints3 = JSON.parse(localStorage.getItem("points3"));

    if (updatedPoints1) {
      setPoints1(updatedPoints1); 
    }
    if (updatedPoints2) {
      setPoints2(updatedPoints2); 
    }
    if (updatedPoints3) {
      setPoints3(updatedPoints3); 
    }
  }, []);

  const handlePickWinner = (gameNumber: number) => {
    const winner = Math.random() > 0.5 ? "player1" : "player2"; // Randomly pick a winner
    if (gameNumber === 1) {
      setPoints1((prevPoints) => {
        const updatedPoints = {
          ...prevPoints,
          [winner]: prevPoints[winner] === "?" ? 1 : prevPoints[winner] + 1,
        };
        localStorage.setItem("points1", JSON.stringify(updatedPoints)); 
        return updatedPoints;
      });
    } else if (gameNumber === 2) {
      setPoints2((prevPoints) => {
        const updatedPoints = {
          ...prevPoints,
          [winner]: prevPoints[winner] === "?" ? 1 : prevPoints[winner] + 1,
        };
        localStorage.setItem("points2", JSON.stringify(updatedPoints));
        return updatedPoints;
      });
    } else if (gameNumber === 3) {
      setPoints3((prevPoints) => {
        const updatedPoints = {
          ...prevPoints,
          [winner]: prevPoints[winner] === "?" ? 1 : prevPoints[winner] + 1,
        };
        localStorage.setItem("points3", JSON.stringify(updatedPoints)); 
        return updatedPoints;
      });
    }
  };

  const startGame = (gameNumber: number) => {
    localStorage.setItem("userName", userName);
    localStorage.setItem("guestName", guestName);
    localStorage.setItem("userAvatar", JSON.stringify(userAvatar));
    localStorage.setItem("guestAvatar", JSON.stringify(guestAvatar));

    if (gameNumber === 1) {
      localStorage.setItem("points1", JSON.stringify(points1));
    } else if (gameNumber === 2) {
      localStorage.setItem("points2", JSON.stringify(points2));
    } else if (gameNumber === 3) {
      localStorage.setItem("points3", JSON.stringify(points3));
    }

    navigate(`/tic-tac-toe-duel/${gameNumber}`);
  };

  // Reusable component for displaying each game
  const GameCard = ({ gameNumber, points, setPoints, rounds, setRounds }) => (
    <div className="flex justify-around items-center bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl mb-6">
      {/* Player 1 */}
      <div className="flex flex-col items-center bg-pink-500 p-4 rounded-lg">
        <div className="w-20 h-20 bg-pink-500 rounded-full flex justify-center items-center mb-4">
          <img
            src={userAvatar?.image || "/path/to/default-avatar"}
            alt="Player 1 Avatar"
            style={{ width: "50px", height: "50px", borderRadius: "50%" }}
          />
        </div>
        <h3 className="text-white">{userName || "Player 1"}</h3>
        <p className="text-white">Points: {points.player1}</p>
      </div>

      {/* Divider */}
      <div className="text-white text-xl mx-8">vs</div>

      {/* Player 2 */}
      <div className="flex flex-col items-center bg-pink-500 p-4 rounded-lg">
        <div className="w-20 h-20 bg-pink-500 rounded-full flex justify-center items-center mb-4">
          <img
            src={guestAvatar?.image || "/path/to/default-avatar"}
            alt="Player 2 Avatar"
            style={{ width: "50px", height: "50px", borderRadius: "50%" }}
          />
        </div>
        <h3 className="text-white">{guestName}</h3>
        <p className="text-white">Points: {points.player2}</p>
      </div>

      <div className="flex flex-col items-center mt-6">
        {(points.player1 === "?" || points.player2 === "?") && <button
          onClick={() => startGame(gameNumber)}
          className="mt-4 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
        >
          Start Game {gameNumber}
        </button>
        }
        {points.player1 === 0 && points.player2 === 0 && (
          <button
            onClick={() => handlePickWinner(gameNumber)}
            className="mt-4 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
          >
            It's a tie, pick a winner!
          </button>
        )}
      </div>
    </div>
  );

  // Check if all 3 games have been completed and have a winner or tie
  const isAllGamesCompleted = () => {
    return (
      (points1.player1 !== "?" && points1.player2 !== "?") &&
      (points2.player1 !== "?" && points2.player2 !== "?") &&
      (points3.player1 !== "?" && points3.player2 !== "?") &&
      (points1.player1 !== points1.player2) &&
      (points2.player1 !== points2.player2) &&
      (points3.player1 !== points3.player2)
    );
  };

  return (
    <div className="flex flex-col justify-center items-center p-4 bg-gray-900 min-h-screen"
    style={{ backgroundImage: "url('/background/360_F_339060225_w8ob8LjMJzPdEqD9UFxbE6ibcKx8dFrP.jpg')",
    backgroundSize: "cover" }}>
       <button onClick={() => navigate("/menu")} className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md">
         🔙 {t("BACK_TO_MENU")}
       </button>

      {/* Game 1 */}
      <GameCard
        gameNumber={1}
        points={points1}
        setPoints={setPoints1}
        rounds={rounds1}
        setRounds={setRounds1}
      />

      {/* Game 2 */}
      <GameCard
        gameNumber={2}
        points={points2}
        setPoints={setPoints2}
        rounds={rounds2}
        setRounds={setRounds2}
      />

      {/* Game 3 */}
      <GameCard
        gameNumber={3}
        points={points3}
        setPoints={setPoints3}
        rounds={rounds3}
        setRounds={setRounds3}
      />

      {isAllGamesCompleted() && (
        <button
          onClick={() => navigate("/show_a_winner")}
          className="mt-6 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg"
        >
          Show the Winner
        </button>
      )}
    </div>
  );
};
