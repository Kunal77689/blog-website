const express = require("express");
const postsRouter = require("./routes/posts");
const usersRoutes = require("./routes/users");

const app = express();
const port = 3000;

app.use(express.json());

//ROUTES
app.use("/api/posts", postsRouter);
app.use("/api/users", usersRoutes);

//START SERVER
app.listen(port, () => {
  console.log("Server is running on http://localhost:%d", port);
});
