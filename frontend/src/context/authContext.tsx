import { createContext, useContext, useState } from "react";
import { getAppInfo } from "../service";
import { AppInfoIface } from "../context/app-info/interface";
import { useEffect } from "react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  appInfo: AppInfoIface | undefined;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem("ping-pong-jwt")
  );
  const [appInfo, setAppInfo] = useState<AppInfoIface | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const setToken = (token: string | null) => {
    if (token) {
      localStorage.setItem("ping-pong-jwt", token);
    } else {
      localStorage.removeItem("ping-pong-jwt");
    }
    setTokenState(token);
  };

  useEffect(() => {
    const fetchAppInfo = async () => {
      console.debug("get into use effect again");
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

  return (
    <AuthContext.Provider value={{ token, setToken, appInfo, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
