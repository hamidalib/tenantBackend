const express = require("express");
const bcrypt = require("bcrypt");
const sql = require("mssql");
const pool = require("./db");

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const request = await pool.connect();
    const checkUser = await request
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM Users WHERE Username = @username");
    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await request
      .request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, hashedPassword)
      .query(
        "INSERT INTO Users (Username, PasswordHash) VALUES (@username, @password)"
      );

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const request = await pool.connect();
    const userResult = await request
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM Users WHERE Username = @username");

    if (userResult.recordset.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = userResult.recordset[0];
    const passwordMatch = await bcrypt.compare(password, user.PasswordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // You can generate a JWT here if needed

    res.status(200).json({ message: "Login successful!" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
