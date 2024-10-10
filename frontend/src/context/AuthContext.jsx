// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const parsedToken = JSON.parse(atob(token.split(".")[1])); // Assuming JWT is used
      setUserId(parsedToken.userId); // Assuming the token contains the userId
      setIsAuthenticated(true);
    }
  }, []);

  const signIn = (token) => {
    localStorage.setItem("token", token);
    const parsedToken = JSON.parse(atob(token.split(".")[1]));
    setUserId(parsedToken.userId);
    setIsAuthenticated(true);
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
