require("dotenv").config();

const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const auth = require("../middleware/authenticateToken");
const pool = new Pool({
  host: "localhost",
  user: "postgres",
  port: 5433,
  database: "blog_website",
  password: "176717",
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
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM USERS");
    res.json(rows);
  } catch (err) {
    console.log("Error: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/createUser", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      profile_picture,
      bio,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const querytext =
      "INSERT INTO users (username, email, password, first_name, last_name, profile_picture, bio) VALUES ($1,$2,$3,$4,$5, $6, $7) RETURNING *";
    const { rows } = await pool.query(querytext, [
      username,
      email,
      hashedPassword,
      first_name,
      last_name,
      profile_picture,
      bio,
    ]);
    console.log(rows[0]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    console.log(jwtSecret);
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/updateUser/:id", async (req, res) => {
  const { id } = req.params;
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    profile_picture,
    bio,
    avatar, // Added the avatar field
  } = req.body;

  try {
    const userToUpdate = {};
    if (username !== undefined) userToUpdate.username = username;
    if (email !== undefined) userToUpdate.email = email;
    if (password !== undefined) userToUpdate.password = password;
    if (first_name !== undefined) userToUpdate.first_name = first_name;
    if (last_name !== undefined) userToUpdate.last_name = last_name;
    if (profile_picture !== undefined)
      userToUpdate.profile_picture = profile_picture;
    if (bio !== undefined) userToUpdate.bio = bio;
    if (avatar !== undefined) userToUpdate.avatar = avatar; // Added the avatar field

    // Ensure at least one field is being updated
    if (Object.keys(userToUpdate).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    let queryText = "UPDATE users SET ";
    const values = [];

    // Construct the SET clause dynamically based on userToUpdate object
    const setClauses = Object.keys(userToUpdate).map((key, index) => {
      values.push(userToUpdate[key]);
      return `${key}=$${index + 1}`;
    });

    queryText += setClauses.join(", ");
    queryText += ` WHERE id=$${setClauses.length + 1} RETURNING *`;

    values.push(id);

    const { rows } = await pool.query(queryText, values);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]); // Return the updated user
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/getUserId/:email", async (req, res) => {
  const email = req.params;

  try {
    const result = await pool.query("SELECT id FROM users WHERE email = $1", [
      email.email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const user = result.rows[0];
    res.json({ user });
  } catch (err) {
    console.log(err);
    req.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getUserById/:userId", async (req, res) => {
  let userId = req.params;
  userId = userId.userId;
  userId = parseInt(userId);
  try {
    const query = "SELECT username FROM users WHERE id = $1";
    const result = await pool.query(query, [userId]);

    if (result.rows.length > 0) {
      res.status(200).json({ username: result.rows[0].username });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getUserByUsername/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await pool.query(query, [username]);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user by username:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/uploadAvatar", async (req, res) => {
  try {
    const { filename, filetype } = req.body;

    // Generate a signed URL for uploading the file to S3
    const params = {
      Bucket: "blog-app-bucket-s3",
      Key: filename,
      ContentType: filetype,
      Expires: 300, // URL expires in 5 minutes (300 seconds)
    };

    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

    res.json({ url: uploadUrl });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ message: "Failed to generate upload URL" });
  }
});

router.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const querytext = "DELETE FROM users WHERE id=$1 RETURNING *";
    const { rows } = await pool.query(querytext, [id]);
    if (rows.length === 0) {
      // If no rows were affected, the USER with the specified ID doesn't exist
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully", post: rows[0] }); // Return a success message and the deleted USER
  } catch (err) {
    console.error("Error deleting User:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;
