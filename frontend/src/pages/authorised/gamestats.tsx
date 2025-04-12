import { useEffect, useState } from "react";
import { data, useNavigate } from "react-router-dom";
import {
  getUserProfile,
  getGamestatsProfile,
  addGameToTable,
  getUserGames,
} from "../../service/userService";
import { UserProfile, Game, Match } from "../../service/interface";

import GameStatsChart from "../../components/GameStatsCharts";

export const GameStats: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);
  const [chartButton, setChartButton] = useState<string>("bar");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProfile, fetchedProfiles] = await Promise.all([
          getUserProfile(),
          getGamestatsProfile(),
        ]);

        setProfile(fetchedProfile);
        setProfiles(fetchedProfiles);

        console.debug("fetched all profiles:", fetchedProfiles);

        const fetchedGames = await getUserGames(fetchedProfile.username);
        console.debug("Fetched Games:", fetchedGames);
        console.debug(
          "fecthed games rounds type: ",
          typeof fetchedGames[0].rounds_json
        );
        const parsedGames = fetchedGames.map((game) => ({
          ...game,
          rounds_json:
            typeof game.rounds_json === "string"
              ? JSON.parse(game.rounds_json as string) // Explicitly assert as string
              : game.rounds_json, // If already parsed, use as is
        }));
        setUserGames(parsedGames);

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
        // console.log(fetchedGames);
      } catch (err) {
        console.error("Error during data fetching:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false); // Set loading to false after both are finished
      }
    };

    fetchData();
    // calcPoints();
    localStorage.removeItem("userAvatar");
    localStorage.removeItem("guestAvatar");
    localStorage.removeItem("guestName");
    localStorage.removeItem("guests");
    localStorage.removeItem("guestCount");
  }, []);

  const renderTournamentBracket = (rounds_json: Match[][]) => {
    console.log("rounds_json:", rounds_json);
    console.log(typeof rounds_json, rounds_json);
    // if (!Array.isArray(rounds_json)) {
    //   console.error("Invalid rounds_json:", rounds_json);
    //   return <div className="text-red-500">Invalid tournament data</div>;
    // } // Debugging output
    return (
      <div className="tournament-bracket grid grid-cols-4 gap-4">
        {rounds_json.map((round: any, index: number) => (
          <div key={index} className="round bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white text-center mb-2">Round {index + 1}</h3>
            {round.map((match: any, matchIndex: number) => (
              <div
                key={matchIndex}
                className="match bg-gray-700 p-2 rounded-lg mb-2"
              >
                <div className="player flex items-center mb-2">
                  <img
                    src={"/profile-pics/default-profile.jpg"}
                    alt={match.p1_username}
                    className="w-10 h-10 rounded-full mr-2"
                  />
                  <span className="text-white">
                    {match.p1_username} {match.p1_wins || 0}
                  </span>
                </div>
                <div className="player flex items-center">
                  <img
                    src={"/profile-pics/default-profile.jpg"}
                    alt={match.p2_username}
                    className="w-10 h-10 rounded-full mr-2"
                  />
                  <span className="text-white">
                    {match.p2_username} {match.p2_wins || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

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

        <div className="bg-stone-200 flex flex-col items-center bg-opacity-70 backdrop-blur-md p-8 rounded-xl max-w-5xl mx-auto mt-20 shadow-lg">
          <h1 className="text-4xl w-full font-bold mb-6 text-center border-b-2 border-gray-400 pb-4">
            Game Stats
          </h1>

          <div className="flex flex-col md:flex-row gap-10 items-center ">
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

          <div className="flex p-10 gap-10">
            <div className="my-8">
              <GameStatsChart
                key={`wins-chart-${profile.username}`}
                labels={sortedPlayers.map((player) => player.username)}
                data={sortedPlayers.map((player) => player.wins)}
                title="Wins by Player"
                type={chartButton}
              />
            </div>

            <div className="my-8">
              <GameStatsChart
                key={`losses-chart-${profile.username}`}
                labels={sortedPlayers.map((player) => player.username)}
                data={sortedPlayers.map((player) => player.losses)}
                title="Losses by Player"
                type={chartButton}
              />
            </div>
          </div>

          <button
            className="w-30 text-center bg-[#56c2c2] rounded-xl p-2 text-gray-100 "
            onClick={() => {
              setChartButton((prevButton) => {
                return prevButton === "bar" ? "pie" : "bar";
              });
            }}
          >
            Switch Chart Style
          </button>

          <hr className="my-6 border-gray-600 w-full" />

          <div className=" bg-cover bg-center text-white relative p-8 w-full">
            <div className="bg-stone-900 bg-opacity-50 backdrop-blur-md p-8 rounded-xl max-w-5xl mx-auto mt-20 shadow-2xl">
              <h1 className="text-3xl font-semibold mb-4 text-center">
                Leaderboard
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

          <hr className="my-6 border-gray-600 w-full" />

          <div className="bg-stone-900 w-7/8 bg-opacity-50 backdrop-blur-md p-8 rounded-xl max-w-5xl mx-auto mt-20 shadow-2xl">
            <h1 className="text-3xl text-white font-semibold mb-4 text-center ">
              User Game History
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
                      {renderTournamentBracket(game.rounds_json)}
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
