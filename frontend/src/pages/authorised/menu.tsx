import { useNavigate } from 'react-router-dom';
import { appLogout } from "../../service"

import {
    getUsernameFromToken
  } from '../../service/userService';

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
            console.error('No username found in the token');
            return;
        }
    
        try {
            const response = await appLogout({ username });
            console.log(response.message); // 'Logged out and status set to offline'
    
            localStorage.removeItem("ping-pong-jwt");
            navigate("/"); // Redirect to Landing Page after logout
            window.location.reload(); // Ensures state is reset
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };
    

    return (
        <div className="w-full h-screen flex relative">
            {/* Left side (Content) */}
            <div className="w-1/2 h-full flex flex-col items-start justify-center p-10 text-white relative z-10">
                {/* Top Buttons */}
                <button
                    onClick={handleLogout}
                    className="absolute top-6 left-6 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-semibold shadow-md"
                >
                    Ctrl + Alt + Bye 👋
                </button>

                {/* Centered Content */}
                <div className="bg-white bg-opacity-70 backdrop-blur-md p-10 rounded-2xl max-w-3xl text-center shadow-2xl">
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

                    {/* Stack buttons vertically */}
                    <div className="flex flex-col gap-6 justify-center items-center">
                        <button
                            onClick={() => navigate("/customization")}
                            className="bg-green-500 hover:bg-green-600 text-xl font-bold px-6 py-3 rounded-lg shadow-md w-60"
                        >
                            Duel 💥
                        </button>
                        <button
                            onClick={() => navigate("/customization-tournament")}
                            className="bg-red-500 hover:bg-red-600 text-xl font-bold px-6 py-3 rounded-lg shadow-md w-60"
                        >
                            Tournament
                        </button>
                    </div>
                </div>
            </div>

            {/* Right side (Background Image) */}
            <div
                className="w-1/2 h-full bg-cover bg-center"
                style={{
                    backgroundImage: "url('/background/small.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            ></div>

            {/* Top-right Buttons (Stacked vertically with space between them) */}
            <div className="flex flex-col gap-1 absolute top-6 right-6 z-20 space-y-4">
                <button
                    onClick={() => navigate("/profile")}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-semibold shadow-md"
                >
                    Mugshot & Street Cred 📸
                </button>

                <button
                    onClick={() => navigate("/connections")}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-semibold shadow-md"
                >
                    Check out the Gang! 👊
                </button>
            </div>
        </div>
    );
};
