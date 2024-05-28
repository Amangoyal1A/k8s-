const express = require("express");
const app = express();
const PORT = 8200;

app.get("/", (req, res) => {
  res.send("<h1>Welcome to k8s server here is my pods</h1>");
});

app.get("/err", (req, res) => {
  res.status(404).send("<h1>Error 404</h1>");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
