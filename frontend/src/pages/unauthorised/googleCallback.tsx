import { use, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { googleLoginAuth } from "../../service"; // Backend API call
import { useAuth } from "../../context/authContext";

export const GoogleCallback = () => {
  const navigate = useNavigate();

  const { setToken } = useAuth();

  //this is to prevent double calls in Strict Mode
  //this works because StrictMode doesn’t reset module-level variables between renders
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const handleGoogleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        try {
          // Send the code to your backend to exchange for tokens
          const response = await googleLoginAuth(code);
          // console.debug(
          //   "The response from the api for a google callback: ",
          //   response
          // );
          // localStorage.setItem("ping-pong-jwt", response.token); // Save the JWT
          setToken(response.token);
          navigate("/menu"); // Redirect to the home page or dashboard
          // window.location.href = "/menu";
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
