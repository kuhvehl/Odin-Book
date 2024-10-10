// src/pages/Home.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import CreatePost from "../components/CreatePost";
import Post from "../components/Post";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();

  const fetchPosts = async () => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/posts/feed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data);
      setLoading(false);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to fetch posts");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [isAuthenticated]);

  const handlePostCreated = () => {
    fetchPosts(); // Now fetchPosts is accessible here
  };

  if (!isAuthenticated) {
    return <h2>Please sign in to view your feed</h2>;
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>Your Feed</h1>
      <CreatePost onPostCreated={handlePostCreated} />
      {posts.length === 0 ? (
        <p>No posts to show. Try following some users!</p>
      ) : (
        posts.map((post) => (
          <Post key={post.id} post={post} onUpdate={fetchPosts} />
        ))
      )}
    </div>
  );
};

export default Home;
