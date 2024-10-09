const express = require("express");
const userRoutes = require("./userRoutes");
const protectedRoutes = require("./protectedRoutes");
const postRoutes = require("./postRoutes");
const followRoutes = require("./followRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/follow", followRoutes);

app.get("/", (req, res) => {
  res.send("Hello, Odin-Book!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
