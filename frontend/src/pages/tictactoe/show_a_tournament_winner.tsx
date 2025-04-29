// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export const ShowATournamentWinner = () => {
//   const navigate = useNavigate();
//   const [winner, setWinner] = useState(null);

//   useEffect(() => {
//     const storedTournamentData = localStorage.getItem("tournamentData");
//     if (!storedTournamentData) {
//       console.error("No tournament data found");
//       return;
//     }

//     const data = JSON.parse(storedTournamentData);
//     if (!data.winner) {
//       console.error("No winner found in tournament data");
//       return;
//     }

//     setWinner(data.winner);
//   }, []);

//   const getAvatarPath = (avatarname: string) => {
//     return avatarname
//       ? `/winning/${avatarname}.png`
//       : "/path/to/default-avatar.png";
//   };

//   if (!winner) {
//     return (
//       <div className="flex flex-col justify-center items-center p-4 bg-gray-900 min-h-screen text-white">
//         Loading winner...
//       </div>
//     );
//   }

//   return (
//     <div
//       className="flex flex-col justify-center items-center p-4 bg-gray-900 min-h-screen"
//       style={{
//         backgroundImage:
//           "url('/background/360_F_339060225_w8ob8LjMJzPdEqD9UFxbE6ibcKx8dFrP.jpg')",
//         backgroundSize: "cover",
//       }}
//     >
//       <button
//         onClick={() => navigate("/menu")}
//         className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
//       >
//         🔙 Back to Menu
//       </button>

//       <h1 className="text-5xl font-bold text-black mt-12 mb-8">🏆 Game Over</h1>

//       <div className="flex flex-col items-center bg-white bg-opacity-80 p-8 rounded-2xl shadow-xl">
//         <h2 className="text-3xl font-semibold text-green-800 mb-4">
//           {winner.username} Wins!
//         </h2>
//         <img
//           src={getAvatarPath(winner.avatarname)}
//           alt="Winner Avatar"
//           className="w-72 h-72 object-contain mb-4"
//         />
//         <p className="text-xl text-gray-800">Points: {winner.points}</p>
//       </div>
//     </div>
//   );
// };

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Winner = {
  username: string;
  avatarname: string;
  points: number | string;
};

export const ShowATournamentWinner = () => {
  const navigate = useNavigate();
  const [winner, setWinner] = useState<Winner | null>(null);

  useEffect(() => {
    const storedTournamentData = localStorage.getItem("tournamentData");
    if (!storedTournamentData) {
      console.error("No tournament data found");
      return;
    }

    try {
      const data = JSON.parse(storedTournamentData);
      if (!data.winner) {
        console.error("No winner found in tournament data");
        return;
      }
      setWinner(data.winner);
    } catch (error) {
      console.error("Failed to parse tournament data:", error);
    }
  }, []);

  const getAvatarPath = (avatarname: string) => {
    return avatarname
      ? `/winning/${avatarname}.png`
      : "/path/to/default-avatar.png";
  };

  if (!winner) {
    return (
      <div className="flex flex-col justify-center items-center p-4 bg-gray-900 min-h-screen text-white">
        Loading winner...
      </div>
    );
  }

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
        🔙 Back to Menu
      </button>

      <h1 className="text-5xl font-bold text-black mt-12 mb-8">🏆 Game Over</h1>

      <div className="flex flex-col items-center bg-white bg-opacity-80 p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-semibold text-green-800 mb-4">
          {winner.username} Wins!
        </h2>
        <img
          src={getAvatarPath(winner.avatarname)}
          alt="Winner Avatar"
          className="w-72 h-72 object-contain mb-4"
        />
        <p className="text-xl text-gray-800">Points: {winner.points}</p>
      </div>
    </div>
  );
};
