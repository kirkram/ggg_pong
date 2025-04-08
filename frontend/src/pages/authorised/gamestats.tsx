import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUserProfile,
  getGamestatsProfile
} from '../../service/userService';
import { UserProfile } from '../../service/interface'

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
          setError('An unknown error occurred');
        }
      }
    };

   const fetchData = async () => {
    try {
      await Promise.all([
        getUserProfile().then(setProfile),
        fetchProfiles(),
      ]);
    } catch (err) {
      console.error('Error during data fetching:', err);
    } finally {
      setLoading(false); // Set loading to false after both are finished
    }
  };

  fetchData();
  }, []);


  if (loading || !profile) {return <div className="text-white p-44">Loading...</div>;}
  
  return (
    <>
      <div
        className="w-full h-full min-h-screen bg-cover bg-center text-white relative p-8"
        style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
      >
      <button
        onClick={() => navigate('/menu')}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 Back to Menu
      </button>

      <div className="bg-black bg-opacity-70 backdrop-blur-md p-8 rounded-xl max-w-5xl mx-auto mt-20">
        <h1 className="text-4xl font-bold mb-6 text-center">Game Stats</h1>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="text-center">
          </div>

          <div className="text-left">
            <p className="text-xl"><strong>Username:</strong> {profile.username}</p>
            <p className="text-xl mt-2"><strong>Email:</strong> {profile.email}</p>
            <p className="text-xl mt-2"><strong>Wins:</strong> {profile.wins}</p>
            <p className="text-xl mt-2"><strong>Losses:</strong> {profile.losses}</p>
          </div>
        </div>

        <hr className="my-6 border-gray-600" />

        <div>

      <h1>Game Leaderboard</h1>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Wins</th>
              <th>Losses</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.username}>
                <td>{profile.username}</td>
                <td>{profile.wins}</td>
                <td>{profile.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      </div>
    </div>
    </>
  );
};

export default GameStats;