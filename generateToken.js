import "dotenv/config"; // Loads .env variables
import jwt from "jsonwebtoken";

// DEBUG: Check if the secret is loading
console.log("JWT_SECRET is:", process.env.JWT_SECRET);

const token = jwt.sign({ id: 1, username: "lucky" }, process.env.JWT_SECRET, {
  expiresIn: "1w",
});

console.log("🔐 Test Token:\n", token);
