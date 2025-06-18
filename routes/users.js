import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "#db/client";

const usersRouter = express.Router();
console.log("JWT_SECRET is:", process.env.JWT_SECRET);

usersRouter.post("/login", async (req, res) => {
  console.log("👉 /users/login route HIT");

  const { username, password } = req.body;
  console.log("BODY:", req.body);

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required." });
  }

  try {
    const {
      rows: [user],
    } = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1w" }
    );

    console.log("✅ Generated token:", token); // OPTIONAL — helpful log

    res.json({ token }); // <== THIS sends the token back!
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed." });
  }
});

export default usersRouter;
