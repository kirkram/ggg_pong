import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, getGamestatsProfile } from "../../service/userService";
import { UserProfile } from "../../service/interface";

export const GameStats: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data: UserProfile[] = await getGamestatsProfile();
        setProfiles(data);
        console.debug(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message); // Safely access 'message'
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    const fetchData = async () => {
      try {
        await Promise.all([getUserProfile().then(setProfile), fetchProfiles()]);
      } catch (err) {
        console.error("Error during data fetching:", err);
      } finally {
        setLoading(false); // Set loading to false after both are finished
      }
    };

    fetchData();
  }, []);

  if (loading || !profile) {
    return <div className="text-white p-44">Loading...</div>;
  }

  const sortedPlayers = profiles.sort((a, b) => {
    if (b.wins === a.wins) {
      return a.losses - b.losses;
    }
    return b.wins - a.wins;
  });

  return (
    <>
      <div
        className="w-full h-full min-h-screen bg-cover bg-center text-white relative p-8"
        style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
      >
        <button
          onClick={() => navigate("/menu")}
          className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
        >
          🔙 Back to Menu
        </button>

        <div className="bg-black bg-opacity-70 backdrop-blur-md p-8 rounded-xl max-w-5xl mx-auto mt-20 shadow-lg">
          <h1 className="text-4xl font-bold mb-6 text-center border-b-2 border-gray-600 pb-4">
            Game Stats
          </h1>

          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="text-center">
              {/* Add an avatar or placeholder */}
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold">
                {profile.username[0].toUpperCase()}
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

          <div className="w-full h-full min-h-screen bg-cover bg-center text-white relative p-8">
            <div className="bg-black bg-opacity-50 backdrop-blur-md p-8 rounded-xl max-w-5xl mx-auto mt-20 shadow-lg">
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
        </div>
      </div>
    </>
  );
};

export default GameStats;
