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
    image: "/avatars/boss_lady/d8f2538c-ab1b-4737-9ce0-8b9710bb9be5.png",
    description: "Curvy. Bossy. Unapologetic. Just pray she misses. 💅",
  },
  {
    name: "TheFinn",
    image: "/avatars/finn/8e4bdfe8-8fbb-4244-8f93-8c15c31408ee.png",
    description: "Glasses. Hoodie. Code by day, pong by night. 👓🧠",
  },
  {
    name: "StabIlity",
    image: "/avatars/stability/9e93c420-8eb5-41a7-b656-d2c813300962.png",
    description: "A sweet gamer girl... until she serves a perfect ping pong shot. Watch out she's ferocious! 🎮🏓",
  },
  {
    name: "JustBorn",
    image: "/avatars/just_born/f4bcae28-4391-4bd0-a032-d673a9068e28.png",
    description: "Sweet, cheerful, and totally clueless... until he finds himself in a ping pong match, where his Irresistable Vibes becomes his Secret Weapon! 🏓😂",
  },
  {
    name: "GangGanger",
    image: "/avatars/gang_ganger/6e904349-5ddc-45cd-866e-b9c78ff8b0ac.png",
    description: "Strong and patient... but when it's time for ping pong, he hits with power and precision. He’s a tough opponent! 💪🏓",
  },
  {
    name: "Maslina",
    image: "/avatars/maslina/bebdfcc5-f207-410c-8351-50a1549c34e3.png",
    description: "Smart and always smiling... just don’t expect him to wake up early for school. But when it's game time, he’s on point with his ping pong serve. 🏓🧠",
  },
  {
    name: "Inka",
    image: "/avatars/inka/0ca9dd53-13cf-4488-8705-c34e11f369ee.png",
    description: "An amiable coffee-lover... until a ping pong match heats up. Then he’s all focused, turning every game into a calm but deadly rally. ☕🏓",
  },
  {
    name: "VampBoy",
    image: "/avatars/vamp_boy/b821b969-96d0-40e7-a0b2-5cb2f2e2825a.png",
    description: "In his rock band by day, but when the ping pong table calls, he’s the stylish show-off who always hits the coolest shots. 🎸🏓",
  },
  {
    name: "TheBurek",
    image: "/avatars/burek/c24d84c4-f4c3-4d6e-b306-be19f7296d5a.png",
    description: "Never gets mad... but when it's ping pong time, he becomes the most cheerful challenger you’ve ever seen. Loveable and competitive! 🍰🏓",
  },
  {
    name: "TheFish",
    image: "/avatars/fish/2d44a0fd-b62b-421a-837d-c870a5468f5e.png",
    description: "A nature-loving, game-making girl, who’s also got the skills to make ping pong a work of art. Positive vibes all around! 🐾🏓",
  },
  {
    name: "WarMachine",
    image: "/avatars/war_machine/warmachine.webp",
    description: "Our baby girl, coding in her momma’s tummy... and already practicing her ping pong swings. She’s gonna rule the table one day! 👶🏓",
  },
];

export const AvatarPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as {
    target: "user" | "guest";
    guestIndex?: number;
    returnTo?: string;
  };

  const target = state?.target || "user";
  const guestIndex = state?.guestIndex ?? -1;
  const returnTo = state?.returnTo || "/customization";

  // 🧠 Load all selected avatars
  const selectedAvatars = new Set<string>();

  // Logged-in user avatar
  const userAvatar = JSON.parse(localStorage.getItem("userAvatar") || "null");
  if (userAvatar?.name && !(target === "user")) {
    selectedAvatars.add(userAvatar.name);
  }

  // Guests avatars
  const guests = JSON.parse(
    localStorage.getItem("tournamentGuests") || localStorage.getItem("guests") || "[]"
  );
  guests.forEach((g: any, i: number) => {
    if (g?.avatar?.name && !(target === "guest" && i === guestIndex)) {
      selectedAvatars.add(g.avatar.name);
    }
  });

  const handleSelect = (avatar: Avatar) => {
    const selectedAvatar = { name: avatar.name, image: avatar.image };

    navigate(returnTo, {
      state: {
        selectedAvatar,
        target,
        guestIndex,
        fromAvatar: true, // <- tells customization page not to reset
      },
    });
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center text-white p-8 flex flex-col items-center"
      style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
    >
      <button
        onClick={() => navigate(returnTo)}
        className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        🔙 Back
      </button>

      <h1 className="text-4xl font-bold text-center mb-10">🎨 Pick Your Fighter</h1>

      <div className="w-full max-w-2xl flex flex-col gap-10">
        {avatars.map((avatar) => {
          const isTaken = selectedAvatars.has(avatar.name);

          return (
            <div
              key={avatar.name}
              onClick={() => !isTaken && handleSelect(avatar)}
              className={`bg-gray-800 rounded-xl p-6 shadow-lg text-center transition-transform ${isTaken ? "opacity-40 pointer-events-none" : "cursor-pointer hover:scale-105"
                }`}
            >
              <img
                src={avatar.image}
                alt={avatar.name}
                className="w-full max-h-[400px] object-contain mb-4 rounded-md border-4 border-gray-700"
              />
              <h2 className="text-2xl font-bold mb-2">{avatar.name}</h2>
              <p className="text-gray-300 text-sm">{avatar.description}</p>
              {isTaken && (
                <p className="mt-2 text-red-400 text-sm font-semibold">Already taken</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarPage;
