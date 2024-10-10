const express = require("express");
const authenticateToken = require("./authMiddleware");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

async function getPostWithLikes(postId, userId) {
  return prisma.post
    .findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        likes: {
          select: { userId: true },
        },
        _count: {
          select: { likes: true },
        },
      },
    })
    .then((post) => {
      if (!post) return null;
      return {
        ...post,
        likeCount: post._count.likes,
        isLiked: post.likes.some((like) => like.userId === userId),
        likes: undefined,
        _count: undefined,
      };
    });
}

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
          select: { id: true, name: true, avatarUrl: true },
        },
        likes: {
          select: { userId: true },
        },
        _count: {
          select: { likes: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const postsWithLikeInfo = posts.map((post) => ({
      ...post,
      likeCount: post._count.likes,
      isLiked: post.likes.some((like) => like.userId === req.user.userId),
      likes: undefined,
      _count: undefined,
    }));

    res.json(postsWithLikeInfo);
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
        likes: {
          select: { userId: true },
        },
        _count: {
          select: { likes: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const postsWithLikeInfo = posts.map((post) => ({
      ...post,
      likeCount: post._count.likes,
      isLiked: post.likes.some((like) => like.userId === req.user.userId),
      likes: undefined,
      _count: undefined,
    }));

    res.json(postsWithLikeInfo);
  } catch (error) {
    res.status(500).json({ error: "Error fetching personalized feed" });
  }
});

router.post("/:postId/like", authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user.userId;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId,
        },
      },
    });

    if (existingLike) {
      return res.status(400).json({ error: "Post already liked" });
    }

    await prisma.like.create({
      data: {
        userId: userId,
        postId: postId,
      },
    });

    const updatedPost = await getPostWithLikes(postId, userId);
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: "Error liking post" });
  }
});

// Unlike a post
router.delete("/:postId/like", authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user.userId;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId,
        },
      },
    });

    if (!existingLike) {
      return res.status(400).json({ error: "Post not liked" });
    }

    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId,
        },
      },
    });

    const updatedPost = await getPostWithLikes(postId, userId);
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: "Error unliking post" });
  }
});

// Get a specific post
router.get("/:postId", authenticateToken, async (req, res) => {
  try {
    const post = await getPostWithLikes(
      parseInt(req.params.postId),
      req.user.userId
    );
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
