import { useEffect, useState } from "react";
// import { AxiosError } from "axios"
import { Navigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppInfoIface } from "./context/app-info/interface";
import { getAppInfo } from "./service";
import {
  getUserProfile,
  getUsernameFromToken,
  updateProfileField,
  uploadProfilePicture,
} from "./service/userService";
import { AppInfoContext } from "./context/app-info/context";
import { authorised, unauthorised, general } from "./pages";
import { useUserActivityTracker } from "./service/useUserActivityTracker";
import { useAuth } from "./context/authContext";

import PongGame from "./pages/game/PongGame";

function App() {
  const [loading, setLoading] = useState(true);
  const [appInfo, setAppInfo] = useState<AppInfoIface | undefined>(undefined);

  useUserActivityTracker(!!appInfo); // Only track if user is logged in

  const { token } = useAuth();
  // Watch for token changes and fetch app info
  useEffect(() => {
    const fetchAppInfo = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const appInfo = await getAppInfo();
        setAppInfo(appInfo);
      } catch (err: any) {
        if (err.response?.status !== 401) {
          console.error(err);
        } else {
          // If token is invalid, clear it
          localStorage.removeItem("ping-pong-jwt");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppInfo();
  }, [token]);

  if (loading)
    return (
      <div>
        <p className="text-4xl font-bold mb-6">App is loading</p>
      </div>
    );

  return (
    <AppInfoContext.Provider value={appInfo}>
      <Router>
        <Routes>
          {appInfo ? (
            <>
              <Route path="/" element={<Navigate to="/menu" replace />} />
              <Route path="/menu" element={<authorised.MenuPage />} />
              <Route path="/profile" element={<authorised.ProfilePage />} />
              <Route
                path="/connections"
                element={<authorised.ConnectionsPage />}
              />
              <Route
                path="/customization"
                element={<authorised.CustomazationPage />}
              />
              <Route
                path="/customization-tournament"
                element={<authorised.CustomazationTournamentPage />}
              />
              <Route path="/gamestats" element={<authorised.GameStats />} />
              <Route path="/avatar" element={<general.AvatarPage />} />
              <Route
                path="/user/:username"
                element={<general.UserProfilePage />}
              />
              <Route
                path="/tic-tac-toe-duel"
                element={<authorised.TicTacToeDuel />}
              />
              // "/game/play?mode=duel"
              <Route path="/game/play" element={<PongGame />} />
            </>
          ) : (
            <>
              <Route path="/" element={<unauthorised.LandingPage />} />
              <Route path="/login" element={<unauthorised.LogInPage />} />
              <Route path="/register" element={<unauthorised.RegisterPage />} />
              <Route
                path="/reset-password"
                element={<unauthorised.ResetPasswordPage />}
              />
              <Route
                path="/change-password"
                element={<unauthorised.ChangePasswordPage />}
              />
              <Route
                path="/auth/google/callback"
                element={<unauthorised.GoogleCallback />}
              />
            </>
          )}
        </Routes>
      </Router>
    </AppInfoContext.Provider>
  );
}

export default App;
