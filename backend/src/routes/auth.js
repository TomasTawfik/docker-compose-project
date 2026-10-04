const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      message: "Name, email, and password are required",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return res.status(400).json({
      message: "Enter a valid email address",
    });
  }

  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({
      message: "Password must be at least 8 characters and no more than 72 bytes",
    });
  }

  try {
    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(email) = $1
      `,
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING
        id,
        name,
        email,
        created_at AS "createdAt"
      `,
      [name.trim(), normalizedEmail, passwordHash]
    );

    return res.status(201).json({
      message: "Registration successful",
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    console.error("Failed to register user:", error);

    return res.status(500).json({
      message: "Failed to register user",
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: "Authentication is not configured",
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, name, email, password_hash
      FROM users
      WHERE LOWER(email) = $1
      `,
      [email.trim().toLowerCase()]
    );

    const user = result.rows[0];
    const passwordMatches = user?.password_hash
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const accessToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      {
        subject: String(user.id),
        expiresIn: "1d",
      }
    );

    return res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Failed to log in user:", error);

    return res.status(500).json({
      message: "Failed to log in",
    });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, email
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Failed to fetch authenticated user:", error);

    return res.status(500).json({
      message: "Failed to fetch authenticated user",
    });
  }
});

module.exports = router;