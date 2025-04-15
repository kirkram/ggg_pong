import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { startGame } from "../../service";

interface AvatarInfo {
  name: string;
  image: string;
}

interface Guest {
  username: string;
  avatar: AvatarInfo | null;
  color: string | null; // Default color is null
}

export const CustomazationTournamentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [guestCount, setGuestCount] = useState<number>(() => {
    const stored = localStorage.getItem("guestCount");
    return stored ? parseInt(stored) : 2; // Default to 2 guests
  });

  const [guests, setGuests] = useState<Guest[]>(() => {
    const stored = localStorage.getItem("tournamentGuests");
    return stored ? JSON.parse(stored) : [];
  });

  const [userAvatar, setUserAvatar] = useState<AvatarInfo | null>(() => {
    const saved = localStorage.getItem("userAvatar");
    return saved ? JSON.parse(saved) : null;
  });

  const [userColor, setUserColor] = useState<string | null>(() => {
    const savedColor = localStorage.getItem("userColor");
    return savedColor ? savedColor : null; // Default to null (no color selected)
  });

  const [loggedInUsername, setLoggedInUsername] = useState("");

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

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const fromAvatar = location.state?.fromAvatar;

    if (!fromAvatar && !initialized) {
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("tournamentGuests");
      localStorage.removeItem("guestCount");
      localStorage.removeItem("userColor");
      localStorage.removeItem("gameType"); // Clear game type
      setUserAvatar(null);
      setGuests([]);
      setGuestCount(2); // Reset to default 2 guests
      setGameType("boring"); // Reset to default game type
    }

    setInitialized(true);
  }, []);

  useEffect(() => {
    setGuests((prev) => {
      const updated = [...prev];
      while (updated.length < guestCount)
        updated.push({ username: "", avatar: null, color: null }); // Default color to null
      while (updated.length > guestCount) updated.pop();
      localStorage.setItem("tournamentGuests", JSON.stringify(updated));
      return updated;
    });
    localStorage.setItem("guestCount", guestCount.toString());
  }, [guestCount]);

  const takenColors = [
    ...(userColor ? [userColor] : []),
    ...guests.filter((g) => g.color).map((g) => g.color!),
  ];

  const handleColorChange = (index: number, color: string) => {
    setGuests((prev) => {
      const updated = [...prev];
      updated[index].color = color;
      localStorage.setItem("tournamentGuests", JSON.stringify(updated));
      return updated;
    });
  };

  const chooseAvatar = (target: "user" | "guest", guestIndex?: number) => {
    navigate("/avatar", {
      state: {
        target,
        guestIndex,
        returnTo: "/customization-tournament",
        fromAvatar: true,
      },
    });
  };

  const updateGuestUsername = (index: number, name: string) => {
    setGuests((prev) => {
      const updated = [...prev];
      updated[index].username = name;
      localStorage.setItem("tournamentGuests", JSON.stringify(updated));
      return updated;
    });
  };

  const takenAvatars = [
    ...(userAvatar ? [userAvatar.name] : []),
    ...guests.filter((g) => g.avatar).map((g) => g.avatar!.name),
  ];

  useEffect(() => {
    const state = location.state as {
      selectedAvatar: AvatarInfo;
      target: "user" | "guest";
      guestIndex: number;
    };

    if (state?.selectedAvatar) {
      if (state.target === "user") {
        setUserAvatar(state.selectedAvatar);
        localStorage.setItem("userAvatar", JSON.stringify(state.selectedAvatar));
      } else if (state.target === "guest" && typeof state.guestIndex === "number") {
        setGuests((prev) => {
          const updated = [...prev];
          updated[state.guestIndex].avatar = state.selectedAvatar;
          localStorage.setItem("tournamentGuests", JSON.stringify(updated));
          return updated;
        });
      }

      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  const startGameHandler = (targetRoute: string) => {
    const guestNames = guests.map((g) => g.username.trim().toLowerCase());
    const hasDuplicates = new Set(guestNames).size !== guestNames.length;
    if (hasDuplicates) return alert(t("GUEST_NAMES_MUST_BE_UNIQUE"));

    if (!userAvatar || guests.some((g) => !g.avatar || !g.username || !g.color)) {
      return alert(t("ALL_GUESTS_MUST_HAVE_COLOR_SELECTED")); // Alert if color is not selected
    }

    const payload = {
      user: loggedInUsername,
      userAvatar: userAvatar.name,
      userColor: userColor,
      gameType, // Include gameType in the payload
      guests: guests.map((g) => ({
        username: g.username,
        avatar: g.avatar!.name,
        color: g.color,
      })),
    };

    startGame(payload)
      .then(() => {
        navigate(targetRoute, {
          state: {
            user: loggedInUsername,
            userAvatar,
            userColor,
            gameType, // Pass selected game type to the game
            guests,
          },
        });
      })
      .catch((err) => alert(t("START_GAME_FAILED") + ": " + err.message));
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
        🔙 {t("BACK_TO_MENU")}
      </button>

      <h1 className="text-4xl font-bold text-center mb-6">
        🎭 {t("CHOOSE_AVATARS")}
      </h1>

      <div className="mb-8">
        <label className="text-lg mr-2">{t("NUMBER_OF_GUESTS")}:</label>
        <select
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
          className="text-black p-2 rounded"
        >
          {[2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Player */}
      <div className="bg-gray-800 p-6 mb-8 w-full max-w-md rounded-xl shadow-lg flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2">👤 {t("PLAYER")} 1</h2>
        <p className="mb-4 text-lg">
          {t("USERNAME")}: <strong>{loggedInUsername}</strong>
        </p>

        {userAvatar ? (
          <>
            <img
              src={userAvatar.image}
              alt={userAvatar.name}
              className="w-48 h-48 rounded-full border-4 border-blue-400 mb-2 object-contain"
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

      {/* Guests */}
      {guests.map((guest, index) => (
        <div
          key={index}
          className="bg-gray-800 p-6 mb-8 w-full max-w-md rounded-xl shadow-lg flex flex-col items-center"
        >
          <h2 className="text-2xl font-bold mb-2">👥 {t("GUEST")} {index + 1}</h2>

          <input
            type="text"
            placeholder={t("ENTER_GUEST_USERNAME")}
            value={guest.username}
            onChange={(e) => updateGuestUsername(index, e.target.value)}
            className="mb-4 px-4 py-2 rounded text-black w-full max-w-sm"
          />

          {guest.avatar ? (
            <>
              <img
                src={guest.avatar.image}
                alt={guest.avatar.name}
                className="w-48 h-48 rounded-full border-4 border-pink-400 mb-2 object-contain"
              />
              <p className="capitalize mb-4">{guest.avatar.name}</p>
            </>
          ) : (
            <p className="mb-4 italic text-gray-400">{t("NO_AVATAR_SELECTED")}</p>
          )}

          <button
            onClick={() => chooseAvatar("guest", index)}
            className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg font-semibold"
            disabled={takenAvatars.includes(guest.avatar?.name || "")}
          >
            {t("CHOOSE_AVATAR")}
          </button>

          {/* Guest color selection */}
          <div className="mt-4">
            <label htmlFor={`guestColor-${index}`} className="block mb-2">{t("CHOOSE_COLOR")}</label>
            <select
              id={`guestColor-${index}`}
              value={guest.color || ""}
              onChange={(e) => handleColorChange(index, e.target.value)}
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
      ))}

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

      <div className="flex flex-col gap-6">
        <button
          onClick={() => startGameHandler("/start-tournament-game")}
          className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl"
          disabled={guests.some((g) => !g.color) || !userColor}
        >
          {t("START_PING_PONG")}
        </button>

        <button
          onClick={() => startGameHandler("/tic-tac-toe-tournament")}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl"
          disabled={guests.some((g) => !g.color) || !userColor}
        >
          {t("START_TIC_TAC_TOE")}
        </button>
      </div>
    </div>
  );
};

export default CustomazationTournamentPage;
