import { useNavigate, useLocation } from "react-router-dom";

interface Avatar {
  name: string;
  image: string;
  description: string;
}

const avatars: Avatar[] = [
  {
    name: "QueenOfTheSpoons",
    image: "/avatars/queen_of_spoons/6f6e1f9c-7ea1-4902-a844-a3292cc6954d.png",
    description: "A sweet athletic girl... until she grabs her spoon. Then she turns into a seductive ping pong sorceress. 🍨",
  },
  {
    name: "BossLady",
    image: "/avatars/boss_lady/0d87db21-5aa8-4550-81cf-29bf82a76217.png",
    description: "Curvy. Bossy. Unapologetic. Just pray she misses. 💅",
  },
  {
    name: "TheFinn",
    image: "/avatars/finn/8e4bdfe8-8fbb-4244-8f93-8c15c31408ee.png",
    description: "Glasses. Hoodie. Code by day, pong by night. 👓🧠",
  },
];

export const AvatarPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const target = (location.state as { target: "user" | "guest" })?.target || "user";

  // Get previously selected avatars
  const selectedUserAvatar = JSON.parse(localStorage.getItem("userAvatar") || "null");
  const selectedGuestAvatar = JSON.parse(localStorage.getItem("guestAvatar") || "null");

  const takenAvatar = target === "user" ? selectedGuestAvatar?.name : selectedUserAvatar?.name;

  const handleSelect = (avatar: Avatar) => {
    navigate("/customization", {
      state: { selectedAvatar: { name: avatar.name, image: avatar.image }, target },
    });
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center text-white p-8 flex flex-col items-center"
      style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
    >
      <button
        onClick={() => navigate('/customization')}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 Back to Customization
      </button>

      <h1 className="text-4xl font-bold text-center mb-10">🎨 Pick Your Fighter</h1>

      <div className="w-full max-w-2xl flex flex-col gap-10">
        {avatars.map((avatar) => {
          const isTaken = avatar.name === takenAvatar;

          return (
            <div
              key={avatar.name}
              onClick={() => !isTaken && handleSelect(avatar)}
              className={`bg-gray-800 rounded-xl p-6 shadow-lg text-center transition-transform ${
                isTaken ? "opacity-40 pointer-events-none" : "cursor-pointer hover:scale-105"
              }`}
            >
              <img
                src={avatar.image}
                alt={avatar.name}
                className="w-full max-h-[400px] object-contain mb-4 rounded-md border-4 border-gray-700"
              />
              <h2 className="text-2xl font-bold mb-2">{avatar.name}</h2>
              <p className="text-gray-300 text-sm">{avatar.description}</p>
              {isTaken && <p className="mt-2 text-red-400 text-sm font-semibold">Already taken</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarPage;
