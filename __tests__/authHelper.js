const request = require("supertest");
const express = require("express");
const categoriesRouter = require("../routes/categories");
const app = express();
app.use(express.json());
app.use("/categories", categoriesRouter);

async function getAuthToken(email, password) {
  const response = await request(app).post("/login").send({ email, password });
  if (response.statusCode === 200 && response.body.token) {
    return response.body.token;
  }
  throw new Error("Failed to obtain auth token");
}

module.exports = { getAuthToken };
