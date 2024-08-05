const express = require("express");
const postsRouter = require("./routes/posts");
const usersRoutes = require("./routes/users");
const commentsRoutes = require("./routes/commnets");
const categoryroutes = require("./routes/categories");
const categorylikes = require("./routes/likes");
const client = require("prom-client");
const app = express();
const port = 8000;
const cors = require("cors");

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ register: client.register });

const httpDuration = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000, 3000, 5000, 10000],
});

app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on("finish", () => {
    const route = req.route ? req.route.path : req.path;
    console.log(
      `Route: ${route}, Method: ${req.method}, Status: ${res.statusCode}`
    );
    end({
      route: route,
      method: req.method,
      code: res.statusCode,
    });
  });
  next();
});

const counter = new client.Counter({
  name: "api_hits",
  help: "Total number of API hits",
  labelNames: ["route"],
});

app.use((req, res, next) => {
  counter.inc({ route: req.path });
  next();
});

app.use(express.json());
app.use(cors());
//ROUTES
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  const metrics = await client.register.metrics();
  res.send(metrics);
});
app.use("/api/posts", postsRouter);
app.use("/api/users", usersRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/category", categoryroutes);
app.use("/api/likes", categorylikes);

//START SERVER
app.listen(port, () => {
  console.log("Server is running on http://localhost:%d", port);
});

//Testing automation
