import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { startDuelGame } from "../../service";

export const CustomazationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [guestName, setGuestName] = useState(
    () => localStorage.getItem("guestName") || ""
  );

  const [userAvatar, setUserAvatar] = useState<{
    name: string;
    image: string;
  } | null>(() => {
    const saved = localStorage.getItem("userAvatar");
    return saved ? JSON.parse(saved) : null;
  });

  const [guestAvatar, setGuestAvatar] = useState<{
    name: string;
    image: string;
  } | null>(() => {
    const saved = localStorage.getItem("guestAvatar");
    return saved ? JSON.parse(saved) : null;
  });

  const [loggedInUsername, setLoggedInUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("ping-pong-jwt");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setLoggedInUsername(payload.username);
    }
  }, []);

  useEffect(() => {
    const fromAvatar = location.state?.fromAvatar === true;

    if (!fromAvatar) {
      // 🧹 Clear all stored customization state (including guest name)
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("guestAvatar");
      localStorage.removeItem("guestName");
      localStorage.removeItem("guests");
      localStorage.removeItem("guestCount");

      // Reset guest name to empty string as well
      setGuestName("");
    }
  }, []);

  useEffect(() => {
    const state = location.state as {
      selectedAvatar?: { name: string; image: string };
      target?: "user" | "guest";
    };

    if (state?.selectedAvatar && state.target) {
      if (state.target === "user") {
        setUserAvatar(state.selectedAvatar);
        localStorage.setItem(
          "userAvatar",
          JSON.stringify(state.selectedAvatar)
        );
      } else {
        setGuestAvatar(state.selectedAvatar);
        localStorage.setItem(
          "guestAvatar",
          JSON.stringify(state.selectedAvatar)
        );
      }
    }
  }, [location.state]);

  useEffect(() => {
    localStorage.setItem("guestName", guestName);
  }, [guestName]);

  const chooseAvatar = (target: "user" | "guest") => {
    navigate("/avatar", {
      state: { target, returnTo: "/customization" },
      replace: false,
    });
  };

  const startGameHandler = (targetRoute: string) => {
    if (!userAvatar || !guestAvatar || !guestName) return;

    startDuelGame({
      user: loggedInUsername,
      userAvatar: userAvatar.name,
      guest: guestName,
      guestAvatar: guestAvatar.name,
    })
      .then(() => {
        // ✅ Redirect to game page // HERE HERE
        navigate("/game/play?mode=duel", {
          state: {
            user: loggedInUsername,
            guest: guestName,
            userAvatar,
            guestAvatar,
          },
        });
      })
      .catch((err) => alert("Failed to start game: " + err.message));
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center text-white p-8 flex flex-col items-center"
      style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
    >
      <button
        onClick={() => navigate("/menu")}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 Back to Menu
      </button>

      <h1 className="text-4xl font-bold text-center mb-10">
        🧑‍🤝‍🧑 Choose Your Avatars
      </h1>

      <div className="w-full max-w-2xl flex flex-col gap-8 items-center">
        {/* Player 1 */}
        <div className="bg-gray-800 p-6 w-full rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2">👤 Player 1</h2>
          <p className="mb-4 text-lg">
            Username: <strong>{loggedInUsername}</strong>
          </p>

          {userAvatar ? (
            <>
              <img
                src={userAvatar.image}
                alt={userAvatar.name}
                className="w-32 h-32 rounded-full border-4 border-blue-400 mb-2 object-cover"
              />
              <p className="capitalize mb-4">{userAvatar.name}</p>
            </>
          ) : (
            <p className="mb-4 italic text-gray-400">No avatar selected</p>
          )}

          <button
            onClick={() => chooseAvatar("user")}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
          >
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
              <img
                src={guestAvatar.image}
                alt={guestAvatar.name}
                className="w-32 h-32 rounded-full border-4 border-pink-400 mb-2 object-cover"
              />
              <p className="capitalize mb-4">{guestAvatar.name}</p>
            </>
          ) : (
            <p className="mb-4 italic text-gray-400">No avatar selected</p>
          )}

          <button
            onClick={() => chooseAvatar("guest")}
            className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg font-semibold"
          >
            Choose Avatar
          </button>
        </div>

        {/* Start Game Button */}
        <button
          className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl mt-4"
          onClick={() => startGameHandler("/start-duel-game")}
        >
          Ping Pong Madness 🏓
        </button>

        <button
          onClick={() => startGameHandler("/tic-tac-toe-duel")}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl"
        >
          X’s & O’s Showdown ✖️⭕️
        </button>
      </div>
    </div>
  );
};

export default CustomazationPage;
