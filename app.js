const express = require("express");
const postsRouter = require("./routes/posts");
const usersRoutes = require("./routes/users");
const commentsRoutes = require("./routes/commnets");
const categoryroutes = require("./routes/categories");
const categorylikes = require("./routes/likes");
const app = express();
const port = 3000;
const cors = require("cors");

app.use(express.json());
app.use(cors());
//ROUTES
app.use("/api/posts", postsRouter);
app.use("/api/users", usersRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/category", categoryroutes);
app.use("/api/likes", categorylikes);

//START SERVER
app.listen(port, () => {
  console.log("Server is running on http://localhost:%d", port);
});
