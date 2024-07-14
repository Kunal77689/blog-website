const express = require("express");

const router = express.Router();

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "blog_website",
  password: "176717",
  port: 5433,
});

const auth = require("../middleware/authenticateToken");

function formatTimestamp(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  // Construct the formatted date string
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;

  return formattedDate;
}

const currentTimestamp = new Date();
const formattedTimestamp = formatTimestamp(currentTimestamp);

router.get("/", auth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categories");
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json("Internal server error");
  }
});

router.post("/create", auth, async (req, res) => {
  try {
    const { name } = req.body;
    const time = formattedTimestamp;
    querytext =
      "INSERT INTO categories (name, created_at, updated_at) VALUES ($1, $2, $3) RETURNING *";
    const { rows } = await pool.query(querytext, [name, time, time]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json("Internal server error");
  }
});

router.post("/update/:categoryid", auth, async (req, res) => {
  try {
    const { categoryid } = req.params;
    const { name } = req.body;
    const time = formattedTimestamp;
    ("UPDATE categories SET name = $1, updated_at = $2 where id = $3 RETURNING *");
    const { rows } = await pool.query(queryText, [name, time, categoryid]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json("Internal server error");
  }
});

router.post("/delete/:categoryid", auth, async (req, res) => {
  try {
    const { categoryid } = req.params;
    querytext = "DELETE FROM categories WHERE id = $1 RETURNING *";
    const { rows } = await pool.query(querytext, [categoryid]);
    if (rows.length == 0) {
      res.status(404).json({ message: "Category not found" });
    }
    res.json({
      message: "Category deleted successfully",
      deletedcategory: rows[0],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
