import { useNavigate } from 'react-router-dom';
export { LogInPage } from "./login"
export { RegisterPage } from "./register"
export { ResetPasswordPage } from "./reset-password"
export { ChangePasswordPage } from "./change-password"

export const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div
            className="w-full h-screen bg-cover bg-center"
            style={{
                backgroundImage: "url(/background/girl-boy-angry2.jpg)",
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="relative h-screen w-full flex flex-col items-center pt-160 text-gray-900">
                {/* Content wrapper with a backdrop for visibility */}
                <div className="relative z-10 text-center px-6 bg-white bg-opacity-80 backdrop-blur-md rounded-xl p-6 shadow-2xl">
                    <h1 className="text-4xl md:text-5xl text-orange-600 font-extrabold mb-4 drop-shadow-lg">
                        🏓 Smash, Spin, Win – Gang Gang Gang Style! 🏓
                    </h1>

                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-6 text-gray-800 font-medium">
                        Test your reflexes and skills in the ultimate Ping Pong showdown!<br />
                        Join the competition, rise through the ranks, and become the ultimate champion.<br />
                        Enter the Ping-Pocalypse and show them who’s the boss!
                    </p>

                    <div className="flex justify-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition shadow-lg"
                            aria-label="Log in"
                        >
                            🎟 Join the Gang Gang Gang!
                        </button>
                    </div>
                </div>
            </div>
        </div>


    );
}

