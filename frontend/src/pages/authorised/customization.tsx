import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const CustomazationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [guestName, setGuestName] = useState("");
  const [userAvatar, setUserAvatar] = useState<{ name: string, image: string } | null>(null);
  const [guestAvatar, setGuestAvatar] = useState<{ name: string, image: string } | null>(null);

  const loggedInUsername = "pongMaster69"; // Replace with actual username logic

  useEffect(() => {
    const state = location.state as {
      selectedAvatar?: { name: string; image: string };
      target?: "user" | "guest";
    };
    if (state?.selectedAvatar && state.target) {
      if (state.target === "user") setUserAvatar(state.selectedAvatar);
      else setGuestAvatar(state.selectedAvatar);
    }
  }, [location.state]);

  const chooseAvatar = (target: "user" | "guest") => {
    navigate("/avatar", { state: { target } });
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center text-white p-8 flex flex-col items-center"
      style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
    >
      <h1 className="text-4xl font-bold text-center mb-10">🧑‍🤝‍🧑 Choose Your Avatars</h1>

      <div className="w-full max-w-2xl flex flex-col gap-8 items-center">
        {/* Player 1 */}
        <div className="bg-gray-800 p-6 w-full rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2">👤 Player 1</h2>
          <p className="mb-4 text-lg">Username: <strong>{loggedInUsername}</strong></p>

          {userAvatar ? (
            <>
              <img src={userAvatar.image} alt={userAvatar.name} className="w-32 h-32 rounded-full border-4 border-blue-400 mb-2 object-cover" />
              <p className="capitalize mb-4">{userAvatar.name}</p>
            </>
          ) : (
            <p className="mb-4 italic text-gray-400">No avatar selected</p>
          )}

          <button onClick={() => chooseAvatar("user")} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold">
            Choose Avatar
          </button>
        </div>

        {/* Guest Player */}
        <div className="bg-gray-800 p-6 w-full rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2">👥 Guest Player</h2>

          <input
            type="text"
            placeholder="Enter guest username"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="mb-4 px-4 py-2 rounded text-black w-full max-w-sm"
          />

          {guestAvatar ? (
            <>
              <img src={guestAvatar.image} alt={guestAvatar.name} className="w-32 h-32 rounded-full border-4 border-pink-400 mb-2 object-cover" />
              <p className="capitalize mb-4">{guestAvatar.name}</p>
            </>
          ) : (
            <p className="mb-4 italic text-gray-400">No avatar selected</p>
          )}

          <button onClick={() => chooseAvatar("guest")} className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg font-semibold">
            Choose Avatar
          </button>
        </div>

        {/* Start Game Button */}
        {userAvatar && guestAvatar && guestName && (
          <button
            className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl mt-4"
            onClick={() => alert(`Starting game with ${loggedInUsername} vs ${guestName}`)}
          >
            LET’S GOOOO 🏓🔥
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomazationPage;
