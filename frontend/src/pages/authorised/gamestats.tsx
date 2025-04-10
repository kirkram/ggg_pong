import { useEffect, useState } from "react";
import { data, useNavigate } from "react-router-dom";
import {
  getUserProfile,
  getGamestatsProfile,
  addGameToTable,
  getUserGames,
} from "../../service/userService";
import { UserProfile, Game } from "../../service/interface";

export const GameStats: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProfile, fetchedProfiles] = await Promise.all([
          getUserProfile(),
          getGamestatsProfile(),
        ]);

        setProfile(fetchedProfile);
        setProfiles(fetchedProfiles);

        const fetchedGames = await getUserGames(fetchedProfile.username);
        setUserGames(fetchedGames);

        if (!fetchedProfile || !fetchedProfile.username) {
          throw new Error(
            "Gamestats.tsx: User profile or username is undefined"
          );
        }

        //fetch all previous games

        //adding newGame to table
        // const newGame = await addGameToTable(user);

        //update the game as the Game goes
        // const newGame = await updateGameToTable(user);
        // setUserGames((prevGames) => [...prevGames, newGame]);
        console.log(fetchedGames);
      } catch (err) {
        console.error("Error during data fetching:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false); // Set loading to false after both are finished
      }
    };

    fetchData();
    // calcPoints();
  }, []);

  if (loading || !profile) {
    return <div className="text-white p-44">Loading...</div>;
  }

  const toggleGameDetails = (id: number) => {
    if (!userGames) console.debug("no user Games defined");
    else console.debug(userGames + "11111111111111111");

    setExpandedGameId(expandedGameId === id ? null : id);
  };

  const sortedPlayers = profiles.sort((a, b) => {
    if (b.wins === a.wins) {
      return a.losses - b.losses;
    }
    return b.wins - a.wins;
  });

  // const calcPoints = () => {
  //   pr
  // }

  return (
    <>
      <div
        className="w-full h-full min-h-screen bg-cover bg-center text-black relative p-8"
        style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
      >
        <button
          onClick={() => navigate("/menu")}
          className="absolute top-6 left-6 bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
        >
          🔙 Back to Menu
        </button>

        <div className="bg-stone-200 bg-opacity-70 backdrop-blur-md p-8 rounded-xl max-w-5xl mx-auto mt-20 shadow-lg">
          <h1 className="text-4xl font-bold mb-6 text-center border-b-2 border-gray-600 pb-4">
            Game Stats
          </h1>

          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="text-center">
              <div className="w-45 h-45 bg-gray-700 rounded-full flex items-center ">
                <img
                  src={
                    profile.profilePic || "/profile-pics/default-profile.jpg"
                  }
                  alt="avatar"
                  className="w-45 h-45 rounded-full border-4 border-white object-cover mx-auto"
                />
              </div>
            </div>

            <div className="text-left">
              <p className="text-xl">
                <strong>Username:</strong> {profile.username}
              </p>
              <p className="text-xl mt-2">
                <strong>Email:</strong> {profile.email}
              </p>
              <p className="text-xl mt-2">
                <strong>Wins:</strong> {profile.wins}
              </p>
              <p className="text-xl mt-2">
                <strong>Losses:</strong> {profile.losses}
              </p>
            </div>
          </div>

          <hr className="my-6 border-gray-600" />

          <div className=" bg-cover bg-center text-white relative p-8">
            <div className="bg-stone-900 bg-opacity-50 backdrop-blur-md p-8 rounded-xl max-w-5xl mx-auto mt-20 shadow-2xl">
              <h1 className="text-3xl font-semibold mb-4 text-center">
                Game Leaderboard
              </h1>
              <table className="w-full text-left border-collapse border border-gray-600">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="border border-gray-600 px-4 py-2">Rank</th>
                    <th className="border border-gray-600 px-4 py-2">Player</th>
                    <th className="border border-gray-600 px-4 py-2">Wins</th>
                    <th className="border border-gray-600 px-4 py-2">Losses</th>
                    <th className="border border-gray-600 px-4 py-2">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((player, index) => (
                    <tr key={player.username} className="hover:bg-gray-700">
                      <td className="border border-gray-600 px-4 py-2">
                        {index + 1}
                      </td>
                      <td className="border border-gray-600 px-4 py-2">
                        {player.username}
                      </td>
                      <td className="border border-gray-600 px-4 py-2">
                        {player.wins}
                      </td>
                      <td className="border border-gray-600 px-4 py-2">
                        {player.losses}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <hr className="my-6 border-gray-600" />

          <div className="bg-stone-900 bg-opacity-50 backdrop-blur-md p-8 rounded-xl max-w-5xl mx-auto mt-20 shadow-2xl">
            <h1 className="text-3xl text-white font-semibold mb-4 text-center">
              Game History
            </h1>
            <div>
              {userGames.map((game) => (
                <div key={game.id_game} className="mb-4">
                  <button
                    onClick={() => toggleGameDetails(game.id_game)}
                    className="w-full text-left bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    {game.date} - {game.game_name}
                  </button>
                  {expandedGameId === game.id_game && (
                    <div className="bg-gray-700 text-white p-4 mt-2 rounded-lg">
                      <h2 className="text-xl font-bold mb-2">Game Details</h2>
                      <pre className="text-sm">
                        {JSON.stringify(game.rounds_json, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameStats;
