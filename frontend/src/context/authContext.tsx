import { createContext, useContext, useState } from "react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem("ping-pong-jwt")
  );

  const setToken = (token: string | null) => {
    if (token) {
      localStorage.setItem("ping-pong-jwt", token);
    } else {
      localStorage.removeItem("ping-pong-jwt");
    }
    setTokenState(token);
  };

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
