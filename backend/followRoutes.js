const express = require("express");
const authenticateToken = require("./authMiddleware");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Follow a user
router.post("/:userId", authenticateToken, async (req, res) => {
  try {
    const userToFollow = await prisma.user.findUnique({
      where: { id: parseInt(req.params.userId) },
    });

    if (!userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }

    if (req.user.userId === userToFollow.id) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        following: {
          connect: { id: userToFollow.id },
        },
      },
    });

    res.json({ message: "User followed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error following user" });
  }
});

// Unfollow a user
router.delete("/:userId", authenticateToken, async (req, res) => {
  try {
    const userToUnfollow = await prisma.user.findUnique({
      where: { id: parseInt(req.params.userId) },
    });

    if (!userToUnfollow) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        following: {
          disconnect: { id: userToUnfollow.id },
        },
      },
    });

    res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error unfollowing user" });
  }
});

// Get followers of a user
router.get("/:userId/followers", authenticateToken, async (req, res) => {
  try {
    const followers = await prisma.user.findUnique({
      where: { id: parseInt(req.params.userId) },
      select: {
        followers: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    if (!followers) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(followers.followers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching followers" });
  }
});

// Get users followed by a user
router.get("/:userId/following", authenticateToken, async (req, res) => {
  try {
    const following = await prisma.user.findUnique({
      where: { id: parseInt(req.params.userId) },
      select: {
        following: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    if (!following) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(following.following);
  } catch (error) {
    res.status(500).json({ error: "Error fetching following users" });
  }
});

module.exports = router;
