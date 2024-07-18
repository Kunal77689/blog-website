const express = require("express");
const router = express.Router();

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
    const time = formattedTimestamp;
    const queryText =
      "INSERT INTO likes (post_id, user_id, created_at) VALUES ($1, $2, $3) RETURNING *";
    const { rows } = await pool.query(queryText, [post_id, user_id, time]);
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

router.delete("/delete", auth, async (req, res) => {
  try {
    const { post_id, user_id } = req.query;

    if (!post_id || !user_id) {
      return res
        .status(400)
        .json({ message: "post_id and user_id are required" });
    }

    const queryText =
      "DELETE FROM likes WHERE post_id = $1 AND user_id = $2 RETURNING *";
    const { rows } = await pool.query(queryText, [post_id, user_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "like not found" });
    }

    res.json({
      message: "like deleted successfully",
      deletedLike: rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/top-liked-posts", auth, async (req, res) => {
  try {
    const queryText = `
        SELECT post_id, COUNT(*) as like_count
        FROM likes
        GROUP BY post_id
        ORDER BY like_count DESC
        LIMIT 5;
      `;
    const { rows } = await pool.query(queryText);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching top liked posts:", err);
    res.status(500).json("Internal server error");
  }
});

router.get("/user/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { rows } = await pool.query(
      "SELECT post_id FROM likes WHERE user_id = $1",
      [userId]
    );
    const likedPosts = rows.map((row) => row.post_id);
    res.json({ likedPosts });
  } catch (err) {
    console.log(err);
    res.status(500).json("Internal server error");
  }
});
module.exports = router;
