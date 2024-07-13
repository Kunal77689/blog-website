const express = require("express");
const router = express.Router();

const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "blog_website",
  port: 5433,
  password: "176717",
});

const auth = require("../middleware/authenticateToken");

router.get("/", auth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM likes");
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/create", auth, async (req, res) => {
  try {
    const { post_id, user_id } = req.body;
    const queryText =
      "INSERT INTO likes (post_id, user_id) VALUES ($1, $2) RETURNING *";
    const { rows } = await pool.query(queryText, [post_id, user_id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/update/:likesid", auth, async (req, res) => {
  try {
    const { likesid } = req.params;
    const { post_id, user_id } = req.body;
    const querytext =
      "UPDATE likes SET post_id = $1, user_id = $2 where id = $3 RETURNING *";
    const { rows } = await pool.query(querytext, [post_id, user_id, likesid]);

    if (rows.length == 0) {
      res.status(404).json({ message: "Id not found" });
    }
    res.status(200).json({ message: "success", likes: rows[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ Message: "Internal server error" });
  }
});

router.post("/delete/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    querytext = "DELETE FROM likes WHERE id = $1 RETURNING *";
    const { rows } = await pool.query(querytext, [id]);
    if (rows.length == 0) {
      res.status(404).json({ message: "like not found" });
    }
    res.json({
      message: "like deleted successfully",
      deletedcategory: rows[0],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;
