const express = require("express");
const router = express.Router();

const { Pool } = require("pg");
const auth = require("../middleware/authenticateToken");

const pool = new Pool({
  host: "database-1.cvwmqagie4rf.us-east-2.rds.amazonaws.com",
  user: "postgres",
  port: 5432,
  database: "postgres",
  password: "password176717",
  ssl: {
    rejectUnauthorized: false, // Accept self-signed certificates (change if needed)
  },
});

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM comments");
    res.json(rows);
  } catch (err) {
    console.error("Error getting comments:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/create", auth, async (req, res) => {
  const { post_id, user_id, content } = req.body;
  try {
    const queryText =
      "INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *";
    const { rows } = await pool.query(queryText, [post_id, user_id, content]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/update/:commentid", auth, async (req, res) => {
  const { commentid } = req.params;
  const { post_id, user_id, content } = req.body;
  try {
    // Update the comment in the database
    const queryText =
      "UPDATE comments SET post_id = $1, user_id = $2, content = $3 WHERE id = $4 RETURNING *";
    const { rows } = await pool.query(queryText, [
      post_id,
      user_id,
      content,
      commentid,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating comment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/delete/:commentid", auth, async (req, res) => {
  const { commentid } = req.params;
  try {
    const querytext = "DELETE FROM comments WHERE id = $1 RETURNING *";
    const { rows } = await pool.query(querytext, [commentid]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json({ message: "Comment deleted successfully", post: rows[0] });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
