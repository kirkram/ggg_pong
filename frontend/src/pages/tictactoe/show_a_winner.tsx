import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ShowAWinner = () => {
  const navigate = useNavigate();

  const userAvatar = JSON.parse(localStorage.getItem("userAvatar"));
  const guestAvatar = JSON.parse(localStorage.getItem("guestAvatar"));
  const points1 = JSON.parse(localStorage.getItem("points1"));
  const points2 = JSON.parse(localStorage.getItem("points2"));
  const points3 = JSON.parse(localStorage.getItem("points3"));
  const userName = localStorage.getItem("userName"); // Get logged-in username
  const guestName = localStorage.getItem("guestName"); // Get guest's username

  const [winner, setWinner] = useState(null);
  const [loser, setLoser] = useState(null);

  useEffect(() => {
    if (!userAvatar || !guestAvatar) {
      console.error("User or Guest Avatar is missing in localStorage");
    }
  }, [userAvatar, guestAvatar]);

  useEffect(() => { // Determine winner and loser based on points
    const totalPointsPlayer1 = points1.player1 + points2.player1 + points3.player1;
    const totalPointsPlayer2 = points1.player2 + points2.player2 + points3.player2;

    if (totalPointsPlayer1 > totalPointsPlayer2) {
      setWinner("player1");
      setLoser("player2");
    } else if (totalPointsPlayer1 < totalPointsPlayer2) {
      setWinner("player2");
      setLoser("player1");
    } else {
      setWinner("tie");
      setLoser("tie");
    }
  }, [points1, points2, points3]);

  const getAvatarPath = (player, status) => {
    const avatarName = player === "player1" ? userAvatar?.name : guestAvatar?.name;

    return avatarName
      ? `/${status}/${avatarName}.png`
      : "/path/to/default-avatar.png";
  };

  return (
    <div
      className="flex flex-col justify-center items-center p-4 bg-gray-900 min-h-screen"
      style={{
        backgroundImage: "url('/background/360_F_339060225_w8ob8LjMJzPdEqD9UFxbE6ibcKx8dFrP.jpg')",
        backgroundSize: "cover",
      }}
    >
      <button
        onClick={() => navigate("/menu")}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 Back to Menu
      </button>

      <h1 className="text-4xl text-black mt-8 mb-4">Game Over</h1>

      {winner === "tie" ? (
        <div className="text-black text-2xl">It's a tie! No winner.</div>
      ) : (
        <div className="flex justify-around items-center w-full max-w-5xl">
          {/* Winner Section */}
          <div className="flex flex-col items-center">
            <h2 className="text-black text-xl mb-4">
              {winner === "player1" ? userName : guestName} Wins!
            </h2>
            <img
              src={getAvatarPath(winner === "player1" ? "player1" : "player2", "winning")}
              alt="Winner Avatar"
              className="w-96 h-96 object-contain mb-4" 
            />
            <p className="text-black">Winner</p>
          </div>

          {/* Loser Section */}
          <div className="flex flex-col items-center">
            <h2 className="text-black text-xl mb-4">
              {loser === "player1" ? userName : guestName} Loses!
            </h2>
            <img
              src={getAvatarPath(loser === "player1" ? "player1" : "player2", "losing")}
              alt="Loser Avatar"
              className="w-96 h-96 object-contain mb-4" 
            />
            <p className="text-black">Loser</p>
          </div>
        </div>
      )}
    </div>
  );
};
