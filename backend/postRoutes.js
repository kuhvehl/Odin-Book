const express = require("express");
const authenticateToken = require("./authMiddleware");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Create a new post
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await prisma.post.create({
      data: {
        content,
        authorId: req.user.userId,
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Error creating post" });
  }
});

// Get all posts (for the home feed)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching posts" });
  }
});

router.get("/feed", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        following: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const followingIds = user.following.map((followedUser) => followedUser.id);
    followingIds.push(user.id); // Include user's own posts

    const posts = await prisma.post.findMany({
      where: {
        authorId: {
          in: followingIds,
        },
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching personalized feed" });
  }
});

// Get a specific post
router.get("/:postId", authenticateToken, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.postId) },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Error fetching post" });
  }
});

// Update a post
router.put("/:postId", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.postId) },
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.authorId !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this post" });
    }
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(req.params.postId) },
      data: { content },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: "Error updating post" });
  }
});

// Delete a post
router.delete("/:postId", authenticateToken, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.postId) },
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.authorId !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this post" });
    }
    await prisma.post.delete({
      where: { id: parseInt(req.params.postId) },
    });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting post" });
  }
});

module.exports = router;
