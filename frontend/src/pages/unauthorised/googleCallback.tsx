import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { googleLoginAuth } from "../../service"; // Backend API call

export const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        try {
          // Send the code to your backend to exchange for tokens
          const response = await googleLoginAuth(code);
          localStorage.setItem("ping-pong-jwt", response.token); // Save the JWT
          navigate("/"); // Redirect to the home page or dashboard
        } catch (error) {
          navigate("/login"); // Redirect back to login on failure
        }
      } else {
        console.error("No code found in the URL");
        navigate("/login"); // Redirect back to login if no code is found
      }
    };

    handleGoogleCallback();
  }, [navigate]);

  return <div>Processing Google Login...</div>;
};

export default GoogleCallback;
