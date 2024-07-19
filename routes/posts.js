const express = require("express");
const router = express.Router();

const { Pool } = require("pg");

const pool = new Pool({
  host: "database-test1.cvwmqagie4rf.us-east-2.rds.amazonaws.com",
  user: "postgres",
  port: 5432,
  database: "postgres",
  password: "password176717",
  ssl: {
    rejectUnauthorized: false, // Accept self-signed certificates (change if needed)
  },
});

const AWS = require("aws-sdk");
AWS.config.update({ signatureVersion: "v4" });

AWS.config.update({
  region: "us-east-2",
});

AWS.config.credentials = new AWS.SharedIniFileCredentials({
  profile: "default",
});

const s3 = new AWS.S3();

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

const auth = require("../middleware/authenticateToken");

router.get("/", auth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM posts");
    res.json(rows);
  } catch (err) {
    console.error("Error getting posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/create", auth, async (req, res) => {
  const { title, content, user_id, post_image } = req.body; // Assuming title and content are provided in the request body
  const time = formattedTimestamp;
  console.log(time);
  try {
    // Insert the new post into the database
    const queryText =
      "INSERT INTO posts (title, content, user_id, created_at, updated_at, post_image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
    const { rows } = await pool.query(queryText, [
      title,
      content,
      user_id,
      time,
      time,
      post_image,
    ]);

    res.status(201).json(rows[0]); // Return the created post
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/update/:postId", auth, async (req, res) => {
  const { postId } = req.params; // Extract postId from the request parameters
  const { title, content } = req.body; // Extract title and content from the request body
  try {
    const time = formattedTimestamp;
    // Update the post in the database
    const queryText =
      "UPDATE posts SET title = $1, content = $2, updated_at = $3 WHERE id = $4 RETURNING *";
    const { rows } = await pool.query(queryText, [
      title,
      content,
      time,
      postId,
    ]);
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

router.post("/uploadPostImage", (req, res) => {
  const { filename, filetype } = req.body;
  const s3Params = {
    Bucket: "blog-app-bucket-s3",
    Key: filename,
    Expires: 300,
    ContentType: filetype,
  };

  s3.getSignedUrl("putObject", s3Params, (err, url) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
    res.json({ url });
  });
});

router.post("/delete/:postId", auth, async (req, res) => {
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
