// Google OAuth Client ID
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID; // Add your Client ID here
const redirectUri = "http://localhost:5173/auth/google/callback"; // The redirect URI you defined in your backend

const googleLogin = () => {
  const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    include_granted_scopes: "true",
    access_type: "offline",
    prompt: "consent",
  });

  window.location.href = `${baseUrl}?${params.toString()}`;
};

const GoogleAuthButton: React.FC = () => {
  return (
    <button
      className="w-full bg-blue-500 mt-2 text-white py-3 rounded"
      onClick={googleLogin}
    >
      Sign in with Google
    </button>
  );
};

export default GoogleAuthButton;
