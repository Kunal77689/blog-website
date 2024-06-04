const express = require("express");
const router = express.Router();

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "blog_website",
  password: "176717", // Make sure to enclose password in quotes
  port: 5433,
});

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM posts");
    res.json(rows);
  } catch (err) {
    console.error("Error getting posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/create", async (req, res) => {
  const { title, content } = req.body; // Assuming title and content are provided in the request body
  try {
    // Insert the new post into the database
    const queryText =
      "INSERT INTO posts (title, content) VALUES ($1, $2) RETURNING *";
    const { rows } = await pool.query(queryText, [title, content]);

    res.status(201).json(rows[0]); // Return the created post
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/update/:postId", async (req, res) => {
  const { postId } = req.params; // Extract postId from the request parameters
  const { title, content } = req.body; // Extract title and content from the request body
  try {
    // Update the post in the database
    const queryText =
      "UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *";
    const { rows } = await pool.query(queryText, [title, content, postId]);
    if (rows.length === 0) {
      // If no rows were affected, the post with the specified ID doesn't exist
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(rows[0]); // Return the updated post
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/delete/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const querytext = "DELETE FROM posts WHERE id = $1 RETURNING *";
    const { rows } = await pool.query(querytext, [postId]);
    if (rows.length === 0) {
      // If no rows were affected, the post with the specified ID doesn't exist
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted successfully", post: rows[0] }); // Return a success message and the deleted post
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
