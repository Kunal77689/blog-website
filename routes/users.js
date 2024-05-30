const express = require("express");
const router = express.Router();

const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  username: "postgres",
  port: 5433,
  database: "blog_website",
  password: 176717,
});

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM USERS");
    res.json(rows);
  } catch (err) {
    console.log("Error: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
