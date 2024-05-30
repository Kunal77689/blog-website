const express = require("express");
const postsRouter = require("./routes/posts");

const app = express();
const port = 3000;

app.use(express.json());

//ROUTES
app.use("/api/posts", postsRouter);

//START SERVER
app.listen(port, () => {
  console.log("Server is running on http://localhost:%d", port);
});
