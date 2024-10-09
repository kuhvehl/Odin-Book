const express = require("express");
const userRoutes = require("./userRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello, Odin-Book!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
