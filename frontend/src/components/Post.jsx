/* eslint-disable react/prop-types */
// src/components/Post.jsx
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Post = ({ post, onUpdate }) => {
  const [comment, setComment] = useState("");
  const { userId } = useAuth();

  const isLiked = post.isLiked;

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      if (isLiked) {
        // Unlike the post
        await axios.delete(`http://localhost:3000/api/posts/${post.id}/like`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Like the post
        await axios.post(
          `http://localhost:3000/api/posts/${post.id}/like`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      onUpdate(); // Refresh the post data
    } catch (error) {
      console.error("Failed to toggle like on post:", error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/api/posts/${post.id}/comments`,
        { content: comment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComment("");
      onUpdate();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  return (
    <div>
      <h3>
        <Link to={`/profile/${userId}`}>{post.author.name}</Link>
      </h3>
      <p>{post.content}</p>
      <button onClick={handleLike}>{isLiked ? "Unlike" : "Like"}</button>
      <p>Likes: {post.likeCount}</p>
      <h4>Comments:</h4>
      {post.comments.map((comment) => (
        <div key={comment.id}>
          <p>
            <strong>{comment.user.name}:</strong> {comment.content}
          </p>
        </div>
      ))}
      <form onSubmit={handleComment}>
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          required
        />
        <button type="submit">Comment</button>
      </form>
    </div>
  );
};

export default Post;
