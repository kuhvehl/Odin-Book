// src/components/Header.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { isAuthenticated, userId, signOut } = useAuth();

  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {isAuthenticated ? (
            <>
              <li>
                <Link to={`/profile/${userId}`}>Profile</Link>
              </li>
              <li>
                <button onClick={signOut}>Sign Out</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/signin">Sign In</Link>
              </li>
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
