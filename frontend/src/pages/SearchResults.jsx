// src/pages/SearchResults.jsx
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchResults = async () => {
      if (!isAuthenticated) return;

      const query = new URLSearchParams(location.search).get("q");
      if (!query) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/api/users/search?q=${encodeURIComponent(
            query
          )}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setResults(response.data);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch search results");
        setLoading(false);
      }
    };

    fetchResults();
  }, [isAuthenticated, location.search]);

  if (!isAuthenticated) {
    return <h2>Please sign in to search users</h2>;
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>Search Results</h1>
      {results.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {results.map((user) => (
            <li key={user.id}>
              <Link to={`/profile/${user.id}`}>
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  width="50"
                  height="50"
                />
                {user.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchResults;
