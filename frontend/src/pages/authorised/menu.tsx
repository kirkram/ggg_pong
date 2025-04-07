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
            className="w-full h-screen bg-cover bg-center flex items-center justify-center text-white relative"
            style={{
                backgroundImage: "url('/background/boy-table2.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Top Buttons */}
            <button
                onClick={handleLogout}
                className="absolute top-6 left-6 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-semibold shadow-md"
            >
                Ctrl + Alt + Bye 👋
            </button>

            <button
                onClick={() => navigate("/profile")}
                className="absolute top-6 right-6 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-semibold shadow-md"
            >
                Profile 📸
            </button>

            <button
                onClick={() => navigate("/connections")}
                className="absolute top-20 right-6 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-semibold shadow-md"
            >
                Check on your friends 👊
            </button>

            <button
                onClick={() => navigate("/gamestats")}
                className="absolute top-34 right-6 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-semibold shadow-md"
            >
                Game Stats 🏆
            </button>

            {/* Centered Content */}
            <div className="absolute bottom-6 left-6 bg-white bg-opacity-70 backdrop-blur-md p-10 rounded-2xl max-w-3xl text-center shadow-2xl">
                <h1 className="text-5xl font-extrabold text-orange-500 mb-6">
                    🏓 Gang Gang Game
                </h1>

                <p className="text-lg md:text-xl text-black mb-8 leading-relaxed">
                    Respect is earned, one smash at a time. 💥🏓 <br />
                    Miss the ball? That’s a crime. 🚨🤦‍♂️ <br />
                    Lose the match? Say goodbye to your pride. 👋😔 <br />
                    Win it all? You’re officially a legend. 🏆🔥 <br />
                    Step up, swing hard, and remember—this ain’t just ping pong, it’s a lifestyle. 👊🎯💯
                </p>

                <div className="flex flex-col md:flex-row gap-6 justify-center">
                    <button
                        onClick={() => navigate("/customization")}
                        className="bg-green-500 hover:bg-green-600 text-xl font-bold px-6 py-3 rounded-lg shadow-md w-60"
                    >
                        Ping Pong Duel 💥
                    </button>
                    <button
                        onClick={() => navigate("/tournament")}
                        className="bg-red-500 hover:bg-red-600 text-xl font-bold px-6 py-3 rounded-lg shadow-md w-60"
                    >
                        Tournament
                    </button>
                </div>
            </div>
        </div>
    );
};
