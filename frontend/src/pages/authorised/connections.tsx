import { useNavigate } from 'react-router-dom';

export const ConnectionsPage = () => {
    const navigate = useNavigate();

    return (
        <div
            className="flex h-screen bg-gray-900 text-white relative bg-cover bg-center"
            style={{ backgroundImage: "url('/background/gray_background.jpg')" }}
        >
            {/* Back Button */}
            <button
                onClick={() => navigate("/menu")}
                className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white font-semibold shadow-md"
            >
                🔙 Back to Menu
            </button>

            <div className="flex flex-col justify-center items-center w-full text-center">
                <h1 className="text-5xl font-bold bg-black bg-opacity-60 px-6 py-4 rounded-lg">
                    Gang Connections 🤝
                </h1>
                <p className="mt-4 text-xl text-gray-200">
                    Find your squad, challenge your rivals. Loyalty not guaranteed.
                </p>
            </div>
        </div>
    );
};

export default ConnectionsPage;
