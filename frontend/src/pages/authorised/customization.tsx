import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { startDuelGame } from "../../service";

export const CustomazationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

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

  const [userColor, setUserColor] = useState<string | null>(() => {
    const savedColor = localStorage.getItem("userColor");
    return savedColor ? savedColor : ""; // Default to none
  });

  const [guestColor, setGuestColor] = useState<string | null>(() => {
    const savedColor = localStorage.getItem("guestColor");
    return savedColor ? savedColor : ""; // Default to none
  });

  const [gameType, setGameType] = useState<string>(() => {
    const savedGameType = localStorage.getItem("gameType");
    return savedGameType ? savedGameType : "boring"; // Default to "boring"
  });

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
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("guestAvatar");
      localStorage.removeItem("guestName");
      localStorage.removeItem("userColor");
      localStorage.removeItem("guestColor");
      setGuestName("");
      setGameType("boring");
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
        localStorage.setItem("userAvatar", JSON.stringify(state.selectedAvatar));
      } else {
        setGuestAvatar(state.selectedAvatar);
        localStorage.setItem("guestAvatar", JSON.stringify(state.selectedAvatar));
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

    if (!userColor || !guestColor) {
      return alert(t("ALL_PLAYERS_MUST_SELECT_COLOR")); // Alert if color is not selected
    }

    startDuelGame({
      user: loggedInUsername,
      userAvatar: userAvatar.name,
      guest: guestName,
      guestAvatar: guestAvatar.name,
      userColor,
      guestColor,
      gameType
    })
      .then(() => {
        navigate(targetRoute, {
          state: {
            user: loggedInUsername,
            guest: guestName,
            userAvatar,
            guestAvatar,
            userColor,
            guestColor,
            gameType,
          },
        });
      })
      .catch((err) => alert(`${t("FAILED_TO_START_GAME")}: ${err.message}`));
  };

  // Colors already taken by user and guest
  const takenColors = [
    userColor,
    guestColor,
  ];

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center text-white p-8 flex flex-col items-center"
      style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
    >
      <button
        onClick={() => navigate("/menu")}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 {t("BACK_TO_MENU")}
      </button>

      <h1 className="text-4xl font-bold text-center mb-10">
        🧑‍🤝‍🧑 {t("CHOOSE_AVATARS")}
      </h1>

      <div className="w-full max-w-2xl flex flex-col gap-8 items-center">
        {/* Player 1 */}
        <div className="bg-gray-800 p-6 w-full rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2">👤 {t("PLAYER")} 1</h2>
          <p className="mb-4 text-lg">
            {t("USERNAME")}: <strong>{loggedInUsername}</strong>
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
            <p className="mb-4 italic text-gray-400">{t("NO_AVATAR_SELECTED")}</p>
          )}

          <button
            onClick={() => chooseAvatar("user")}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
          >
            {t("CHOOSE_AVATAR")}
          </button>

          {/* Color selection */}
          <div className="mt-4">
            <label htmlFor="userColor" className="block mb-2">{t("CHOOSE_COLOR")}</label>
            <select
              id="userColor"
              value={userColor || ""}
              onChange={(e) => {
                const selectedColor = e.target.value;
                setUserColor(selectedColor);
                localStorage.setItem("userColor", selectedColor); // Save color in localStorage
              }}
              className="p-2 rounded text-black"
            >
              <option value="">{t("NONE")}</option>
              {["red", "green", "blue", "yellow", "purple", "orange"].map((color) => (
                <option key={color} value={color} disabled={takenColors.includes(color)}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Guest Player */}
        <div className="bg-gray-800 p-6 w-full rounded-xl shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2">👥 {t("GUEST_PLAYER")}</h2>

          <input
            type="text"
            placeholder={t("ENTER_GUEST_USERNAME")}
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
            <p className="mb-4 italic text-gray-400">{t("NO_AVATAR_SELECTED")}</p>
          )}

          <button
            onClick={() => chooseAvatar("guest")}
            className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg font-semibold"
          >
            {t("CHOOSE_AVATAR")}
          </button>

          {/* Guest Color selection */}
          <div className="mt-4">
            <label htmlFor="guestColor" className="block mb-2">{t("CHOOSE_COLOR")}</label>
            <select
              id="guestColor"
              value={guestColor || ""}
              onChange={(e) => {
                const selectedColor = e.target.value;
                setGuestColor(selectedColor);
                localStorage.setItem("guestColor", selectedColor); // Save color in localStorage
              }}
              className="p-2 rounded text-black"
            >
              <option value="">{t("NONE")}</option>
              {["red", "green", "blue", "yellow", "purple", "orange"].map((color) => (
                <option key={color} value={color} disabled={takenColors.includes(color)}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Customization */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-2">{t("GAME_CUSTOMIZATION")}</h2>
          <div className="flex items-center gap-4">
            <div>
              <input
                type="radio"
                id="boring"
                name="gameType"
                value="boring"
                checked={gameType === "boring"}
                onChange={() => {
                  setGameType("boring");
                  localStorage.setItem("gameType", "boring");
                }}
              />
              <label htmlFor="boring" className="ml-2">{t("BORING_GAME")}</label>
            </div>
            <div>
              <input
                type="radio"
                id="madness"
                name="gameType"
                value="madness"
                checked={gameType === "madness"}
                onChange={() => {
                  setGameType("madness");
                  localStorage.setItem("gameType", "madness");
                }}
              />
              <label htmlFor="madness" className="ml-2">{t("MADNESS")}</label>
            </div>
          </div>
        </div>

        {/* Start Game Buttons */}
        <button
          className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl mt-4"
          onClick={() => startGameHandler("/game/play?mode=duel")}
          disabled={!userColor || !guestColor}
        >
          {t("START_PING_PONG")}
        </button>

        <button
          onClick={() => startGameHandler("/tic-tac-toe-duel")}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl"
          disabled={!userColor || !guestColor}
        >
          {t("START_TIC_TAC_TOE")}
        </button>
      </div>
    </div>
  );
};

export default CustomazationPage;
