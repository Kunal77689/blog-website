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

router.post("/updateUser/:id", async (req, res) => {
  const { id } = req.params;
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    profile_picture,
    bio,
  } = req.body;
  try {
    const queryText =
      "UPDATE users SET username=$1, email=$2, password=$3, first_name=$4, last_name=$5, profile_picture=$6, bio=$7 WHERE id=$8 RETURNING *";
    const { rows } = await pool.query(queryText, [
      username,
      email,
      password,
      first_name,
      last_name,
      profile_picture,
      bio,
      id,
    ]);
    if (rows.length === 0) {
      // If no rows were affected, the user with the specified ID doesn't exist
      return res.status(404).json({ message: "User not found" });
    }
    res.json(rows[0]); // Return the updated user
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Internal server error" });
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
