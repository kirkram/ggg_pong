import { useLocation, useNavigate } from "react-router-dom";

const GameEndingPage: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();

	const { winnerAvatar, loserAvatar } = location.state || {};

	if (!winnerAvatar || !loserAvatar) {
		return <div>No game data found.</div>;
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-beige">
			<div className="flex flex-col items-center mb-10">
				<img
					src={`/winner/${winnerAvatar}.png`}
					alt="Winner Avatar"
					className="w-48 h-48 rounded-full mb-4"
				/>
			</div>

			<div className="flex flex-col items-center">
				<img
					src={`/loser/${loserAvatar}.png`}
					alt="Loser Avatar"
					className="w-24 h-24 rounded-full"
				/>
			</div>

			<button
				onClick={() => navigate("/menu")}
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
