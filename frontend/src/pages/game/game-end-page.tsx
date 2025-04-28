import React, { useEffect, useState } from "react";
import { appClient } from "../../service/index";

type Player = {
	name: string;
	avatar: string;
	wins: number;
};

const GameEndingPage: React.FC = () => {
	
	const [winner, setWinner] = useState<Player | null>(null);
	const [losers, setLosers] = useState<Player[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchGameResult = async () => {
			try {
				const token = localStorage.getItem("ping-pong-jwt");
				if (!token) throw new Error("User not authenticated");

				const response = await appClient.get(`/api/get-latest-game-session`, {
					headers: { "Content-Type": "application/json" },
				});

				const session = response.data?.rounds?.[0]?.[0];
				if (!session) throw new Error("Invalid session data");

				const players = [
					{ name: session.p1_username, avatar: session.p1_avatar, wins: session.p1_wins },
					{ name: session.p2_username, avatar: session.p2_avatar, wins: session.p2_wins },
				];

				const sortedPlayers = players.sort((a, b) => b.wins - a.wins);
				setWinner(sortedPlayers[0]);
				setLosers(sortedPlayers.slice(1));

			} catch (error) {
				console.error("❌ Error fetching game result:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchGameResult();
	}, []);

	const handleBackToMenu = () => {
		window.location.href = "/menu";
	};

	if (loading) {
		return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
	}

	if (!winner) {
		return <div className="flex justify-center items-center min-h-screen">No game data found.</div>;
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-beige">
			<h1 className="text-4xl font-bold mb-6">🏆 {winner.name} Wins! 🏆</h1>

			<img
				src={winner.avatar}
				alt={`${winner.name} Avatar`}
				className="w-48 h-48 rounded-full mb-4"
			/>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
				{losers.map((loser, index) => (
					<div key={index} className="flex flex-col items-center">
						<img
							src={loser.avatar}
							alt={`${loser.name} Avatar`}
							className="w-24 h-24 rounded-full"
						/>
						<p className="mt-2 text-lg">{loser.name}</p>
					</div>
				))}
			</div>

			<button
				onClick={handleBackToMenu}
				className="mt-10 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-700 text-xl"
			>
				Back to Menu
			</button>
		</div>
	);
};

export default GameEndingPage;



// OLD VERSION TO CONNECT TO PONG< NO DATABAS
//import React  from "react";
//import { useRouter } from "next/router";

//type Loser = 
//{
//	name: string;
//	avatar: string;
//};

//type GameEndingPageProps = {
//  winnerName: string;
//  winnerAvatar: string;
//  losers: Loser[];
//};

//const GameEndingPage: React.FC<GameEndingPageProps> = ({
//  winnerName,
//  winnerAvatar,
//  losers,
//}) => {
//  const router = useRouter();

//  const handleBackToMenu = () => {
//    router.push("/"); // Assuming "/" is your main menu
//  };

//  return (
//    <div className="flex flex-col items-center justify-center min-h-screen p-4">
//      <h1 className="text-4xl font-bold mb-6">🏆 {winnerName} Wins! 🏆</h1>
      
//      <img
//        src={winnerAvatar}
//        alt={`${winnerName} Avatar`}
//        className="w-48 h-48 rounded-full mb-4"
//      />
      
//      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
//        {losers.map((loser, index) => (
//          <div key={index} className="flex flex-col items-center">
//            <img
//              src={loser.avatar}
//              alt={`${loser.name} Avatar`}
//              className="w-24 h-24 rounded-full"
//            />
//            <p className="mt-2 text-lg">{loser.name}</p>
//          </div>
//        ))}
//      </div>

//      <button
//        onClick={handleBackToMenu}
//        className="mt-10 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-700 text-xl"
//      >
//        Back to Menu
//      </button>
//    </div>
//  );
//};

//export default GameEndingPage;
