import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const parts = token.split(".");
        if (parts.length !== 3) {
          throw new Error("Invalid token format");
        }
        const payload = JSON.parse(atob(parts[1]));
        setUserId(payload.userId);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing token:", error);
        // Invalid token, clear it
        localStorage.removeItem("token");
      }
    }
  }, []);

  const parseToken = (token) => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid token format");
      }
      return JSON.parse(atob(parts[1]));
    } catch (error) {
      console.error("Error parsing token:", error);
      return null;
    }
  };

  const signIn = (token) => {
    if (token) {
      localStorage.setItem("token", token);
      const parsedToken = parseToken(token);
      if (parsedToken) {
        setUserId(parsedToken.userId);
        setIsAuthenticated(true);
      }
    }
  };

  const signUp = signIn; // signUp function is the same as signIn

  const signOut = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userId, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
