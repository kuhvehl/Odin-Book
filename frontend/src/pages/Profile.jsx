import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CreatePost from "../components/CreatePost";
import Post from "../components/Post";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { userId } = useParams();
  const { isAuthenticated } = useAuth();

  // Move fetchUserAndPosts outside of useEffect so it's reusable
  const fetchUserAndPosts = async () => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem("token");
      const [userResponse, postsResponse] = await Promise.all([
        axios.get(`http://localhost:3000/api/protected/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:3000/api/posts/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setUser(userResponse.data);
      setPosts(postsResponse.data);
      setLoading(false);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to fetch user data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndPosts();
  }, [isAuthenticated, userId]);

  const handlePostCreated = () => {
    // Refetch posts after a new post is created
    fetchUserAndPosts();
  };

  if (!isAuthenticated) {
    return <h2>Please sign in to view profiles</h2>;
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>{user.name}&apos;s Profile</h1>
      <img src={user.avatarUrl} alt={`${user.name}'s profile photo`} />
      <p>Bio: {user.bio}</p>
      <p>Email: {user.email}</p>
      <h2>Posts</h2>
      {user.id === userId && <CreatePost onPostCreated={handlePostCreated} />}
      {posts.map((post) => (
        <Post key={post.id} post={post} onUpdate={fetchUserAndPosts} />
      ))}
    </div>
  );
};

export default Profile;
