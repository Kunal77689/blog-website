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
    querytext = "INSERT INTO categories (name) VALUES ($1) RETURNING *";
    const { rows } = await pool.query(querytext, [name]);
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
    const queryText =
      "UPDATE categories SET name = $1 where id = $2 RETURNING *";
    const { rows } = await pool.query(queryText, [name, categoryid]);
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
