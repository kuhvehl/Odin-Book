const express = require("express");
const authenticateToken = require("./authMiddleware");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        location: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user profile" });
  }
});

router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, bio, location, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, bio, location, avatarUrl },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        location: true,
        avatarUrl: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Error updating user profile" });
  }
});

router.get("/profile/:userId", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.userId) },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        location: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user profile" });
  }
});

module.exports = router;
