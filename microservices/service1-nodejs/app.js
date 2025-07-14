const express = require("express");
const app = express();
app.get("/", (req, res) => {
  res.send("Hello from Node.js Service!");
});
app.listen(3000, () => console.log("Service1 running on port 3000"));
