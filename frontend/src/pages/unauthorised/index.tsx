import { useNavigate } from 'react-router-dom';
export { LogInPage } from "./login"
export { RegisterPage } from "./register"
export { ResetPasswordPage } from "./reset-password"
export { ChangePasswordPage } from "./change-password"

export const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div class="w-full h-screen bg-cover bg-center" style={{ backgroundImage: "url(/pingpong-bg.jpg)", backgroundSize: "100%" }}>
            <div className="relative h-screen w-full flex flex-col items-center justify-center bg-cover bg-center text-gray-900">

                <div className="relative z-10 text-center px-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
                    🏓 Smash, Spin, Win – Gang Gang Gang Style! 🏓
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-6 text-gray-900">
                        Test your reflexes and skills in the ultimate Ping Pong showdown!
                        Join the competition, rise through the ranks, and become the ultimate champion.
                        Enter the Ping-Pocalypse and show them who’s the boss!
                    </p>

                    <div className="place-content-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition shadow-lg mr-4"
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

