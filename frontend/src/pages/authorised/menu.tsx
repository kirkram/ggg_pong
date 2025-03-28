import { useNavigate } from 'react-router-dom';

export const MenuPage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("ping-pong-jwt");
        navigate("/"); // Redirect to Landing Page after logout
        window.location.reload(); // Ensures state is reset
    };

    return (
        <div
            className="flex h-screen bg-gray-900 text-white relative bg-cover bg-center"
            style={{ backgroundImage: "url('/menu-background.png')" }} // Make sure the image path is correct
        >
            {/* Left Section - Title and Text */}
            <div className="flex flex-col justify-center items-start p-12 w-2/3">
                {/* Logout Button - Top Left */}
                <button
                    onClick={handleLogout}
                    className="absolute top-6 left-6 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-semibold shadow-md"
                >
                    Ctrl + Alt + Bye 👋
                </button>

                <h1 className="text-6xl font-bold mb-6 bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                    🏓 Gang Gang Game
                </h1>
                <p className="text-2xl text-gray-100">
                    Respect is earned, one smash at a time. 💥🏓 <br/>
                    Miss the ball? That’s a crime. 🚨🤦‍♂️ <br/>
                    Lose the match? Say goodbye to your pride. 👋😔 <br/>
                    Win it all? You’re officially a legend. 🏆🔥 <br/>
                    Step up, swing hard, and remember—this ain’t just ping pong, it’s a lifestyle. 👊🎯💯

                </p>
            </div>

            {/* Right Section - Menu and Buttons */}
            <div className="flex justify-center items-center w-1/3 h-auto absolute right-0 top-1/2 transform -translate-y-1/2">
                {/* Menu Container */}
                <div className="bg-gray-800 bg-opacity-80 p-8 rounded-2xl shadow-lg w-full max-w-xs">
                    {/* Menu Options */}
                    <div className="flex flex-col space-y-6 items-center">
                        <button
                            onClick={() => navigate("/game")}
                            className="w-full bg-green-500 hover:bg-green-600 text-2xl py-4 rounded-lg font-semibold shadow-md"
                        >
                            Ping Pong Duel 💥
                        </button>
                        <button
                            onClick={() => navigate("/tournament")}
                            className="w-full bg-red-500 hover:bg-red-600 text-2xl py-4 rounded-lg font-semibold shadow-md"
                        >
                            Tournament
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Button - Top Right */}
            <button
                onClick={() => navigate("/profile")}
                className="absolute top-6 right-6 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-semibold shadow-md"
            >
                Mugshot & Street Cred 📸

            </button>

            {/* "Check out the Gang!" Button - Positioned below the Profile button with more space */}
            <button
                onClick={() => navigate("/profile")}
                className="absolute top-20 right-6 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-semibold shadow-md"
            >
                Check out the Gang! 👊
            </button>
        </div>
    );
};
