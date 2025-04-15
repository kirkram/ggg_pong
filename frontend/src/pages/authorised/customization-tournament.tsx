import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { startGame } from "../../service";

interface AvatarInfo {
  name: string
  image: string
}

interface Guest {
  username: string
  avatar: AvatarInfo | null
}

export const CustomazationTournamentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [guestCount, setGuestCount] = useState<number>(() => {
    const stored = localStorage.getItem("guestCount");
    return stored ? parseInt(stored) : 1;
  });

  const [guests, setGuests] = useState<Guest[]>(() => {
    const stored = localStorage.getItem("tournamentGuests");
    return stored ? JSON.parse(stored) : [];
  });

  const [userAvatar, setUserAvatar] = useState<AvatarInfo | null>(() => {
    const saved = localStorage.getItem("userAvatar");
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

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const fromAvatar = location.state?.fromAvatar;

    if (!fromAvatar && !initialized) {
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("tournamentGuests");
      localStorage.removeItem("guestCount");
      setUserAvatar(null);
      setGuests([]);
      setGuestCount(1);
    }

    setInitialized(true);
  }, []);

  useEffect(() => {
    setGuests((prev) => {
      const updated = [...prev];
      while (updated.length < guestCount)
        updated.push({ username: "", avatar: null });
      while (updated.length > guestCount) updated.pop();
      localStorage.setItem("tournamentGuests", JSON.stringify(updated));
      return updated;
    });
    localStorage.setItem("guestCount", guestCount.toString());
  }, [guestCount]);

  useEffect(() => {
    const state = location.state as {
      selectedAvatar: AvatarInfo;
      target?: "user" | "guest";
      guestIndex: number;
      fromAvatar?: boolean;
    };

    if (state?.selectedAvatar) {
      if (state.target === "user") {
        setUserAvatar(state.selectedAvatar);
        localStorage.setItem("userAvatar", JSON.stringify(state.selectedAvatar));
      } else if (
        state.target === "guest" &&
        typeof state.guestIndex === "number"
      ) {
        setGuests((prev) => {
          const updated = [...prev];
          updated[state.guestIndex] = {
            ...updated[state.guestIndex],
            avatar: state.selectedAvatar,
          };
          localStorage.setItem("tournamentGuests", JSON.stringify(updated));
          return updated;
        });
      }

      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

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

  const startGameHandler = (targetRoute: string) => {
    const guestNames = guests.map((g) => g.username.trim().toLowerCase());
    const hasDuplicates = new Set(guestNames).size !== guestNames.length;
    if (hasDuplicates) return alert(t("GUEST_NAMES_MUST_BE_UNIQUE"));

    if (!userAvatar || guests.some((g) => !g.avatar || !g.username)) return;

    const payload = {
      user: loggedInUsername,
      userAvatar: userAvatar.name,
      guests: guests.map((g) => ({
        username: g.username,
        avatar: g.avatar!.name,
      })),
    };

    startGame(payload)
      .then(() => {
        navigate(targetRoute, {
          state: {
            user: loggedInUsername,
            userAvatar,
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
          {[1, 2, 3, 4].map((n) => (
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
        </div>
      ))}

      <div className="flex flex-col gap-6">
        <button
          onClick={() => startGameHandler("/start-tournament-game")}
          className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl"
        >
          {t("START_PING_PONG")}
        </button>

        <button
          onClick={() => startGameHandler("/tic-tac-toe-tournament")}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl text-2xl font-bold shadow-xl"
        >
          {t("START_TIC_TAC_TOE")}
        </button>
      </div>
    </div>
  );
};

export default CustomazationTournamentPage;
