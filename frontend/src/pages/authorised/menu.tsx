import { useNavigate } from "react-router-dom";
// import { appLogout } from "../../service"

import { getUsernameFromToken } from "../../service/userService";

export const MenuPage = () => {
  const navigate = useNavigate();

  // const handleLogout = () => {
  //     localStorage.removeItem("ping-pong-jwt");
  //     navigate("/"); // Redirect to Landing Page after logout
  //     window.location.reload(); // Ensures state is reset
  // };

  // const handleLogout = async () => {
  //     try {
  //         const response = await appLogout({ username });
  //         console.log(response.message); // 'Logged out and status set to offline'

  //         localStorage.removeItem("ping-pong-jwt");
  //         navigate("/"); // Redirect to Landing Page after logout
  //         window.location.reload(); // Ensures state is reset
  //     } catch (error) {
  //         console.error('Error logging out:', error);
  //     }
  // };

  const handleLogout = async () => {
    const username = getUsernameFromToken();

    if (!username) {
      console.error("No username found in the token");
      return;
    }

    try {
      // const response = await appLogout({ username });
      // console.log(response.message); // 'Logged out and status set to offline'

      localStorage.removeItem("ping-pong-jwt");
      navigate("/"); // Redirect to Landing Page after logout
      window.location.reload(); // Ensures state is reset
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <div className="w-full h-screen flex relative min-h-200 min-w-150">
        {/* Left side (Content) */}
        <div className="w-2/5 h-full min-w-100 flex flex-col items-center justify-center p-7 text-gray-100relative z-10">
          {/* News Ticker */}
          <div className="w-full bg-white text-gray-800 text-lg font-semibold rounded-lg mb-6 overflow-hidden">
            <div className="animate-marquee whitespace-nowrap">
              <span className="mr-10">
                Respect is earned, one smash at a time. 💥🏓
                &nbsp;&nbsp;|&nbsp;&nbsp; Miss the ball? That’s a crime. 🚨🤦‍♂️
                &nbsp;&nbsp;|&nbsp;&nbsp; Lose the match? Say goodbye to your
                pride. 👋😔 &nbsp;&nbsp;|&nbsp;&nbsp; Win it all? You’re
                officially a legend. 🏆🔥 &nbsp;&nbsp;|&nbsp;&nbsp; Step up,
                swing hard, and remember—this ain’t just ping pong, it’s a
                lifestyle. 👊🎯💯
              </span>
            </div>
          </div>

          {/* Top Buttons */}
          <button
            onClick={handleLogout}
            className="absolute top-6 left-6 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-gray-100 font-semibold shadow-md"
          >
            Log Out 👋
          </button>

          {/* Centered Content */}
          <div className="bg-white flex flex-col min-h-90 justify-center items-center mb-15 bg-opacity-70 backdrop-blur-md p-10 rounded-2xl max-w-3xl text-center shadow-2xl">
            <h1 className="text-5xl font-extrabold text-orange-500 mb-6">
              🏓 Gang Gang Game
            </h1>

            {/* Stack buttons vertically */}
            <div className="flex flex-col gap-6 justify-center items-center">
              <button
                onClick={() => navigate("/customization")}
                className="bg-green-500  text-gray-100 hover:bg-green-600 text-xl font-bold px-6 py-3 rounded-lg shadow-md w-60"
              >
                Duel 💥
              </button>
              <button
                onClick={() => navigate("/customization-tournament")}
                className="bg-red-500  text-gray-100 hover:bg-red-600 text-xl font-bold px-6 py-3 rounded-lg shadow-md w-60"
              >
                Tournament
              </button>
            </div>
          </div>
        </div>

        {/* Right side (Background Image) */}
        <div
          className="w-3/5 h-full bg-cover bg-center"
          style={{
            backgroundImage: "url('/background/small.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>

        {/* Top-right Buttons (Stacked vertically with space between them) */}
        <div className="flex flex-col gap-1 absolute top-6 right-6 z-20 space-y-4">
          <ul className="space-y-3 text-l font-bold text-center">
            <li>
              <a
                href=""
                onClick={() => navigate("/profile")}
                className="bg-red-500 block rounded-lg px-4 py-2  text-gray-100 hover:bg-red-600"
              >
                User Profile 📸
              </a>
            </li>

            <li>
              <a
                href=""
                onClick={() => navigate("/connections")}
                className=" bg-red-500 block rounded-lg px-4 py-2 text-gray-100 hover:bg-red-600"
              >
                Your Friends 👊
              </a>
            </li>

            <li>
              <a
                href=""
                onClick={() => navigate("/gamestats")}
                className=" bg-red-500 block rounded-lg px-4 py-2 text-white  hover:bg-red-600 "
              >
                Game Stats 🏆
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
