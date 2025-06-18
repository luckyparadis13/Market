import express from "express";
import db from "#db/client";
import jwt from "jsonwebtoken";

const ordersRouter = express.Router();

// Middleware — require token
function requireUser(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token missing or malformed." });
  }
  try {
    const token = auth.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}

// GET /orders — all orders for logged-in user
ordersRouter.get("/", requireUser, async (req, res) => {
  console.log("👉 /orders route HIT");

  try {
    const { rows: orders } = await db.query(
      `SELECT * FROM orders WHERE user_id = $1`,
      [req.user.id]
    );

    res.json(orders);
  } catch (err) {
    console.error("GET /orders error:", err);
    res.status(500).json({ error: "Could not get orders." });
  }
});

// POST /orders — create new order
ordersRouter.post("/", requireUser, async (req, res) => {
  console.log("👉 POST /orders route HIT");

  const { date, note } = req.body;

  if (!date) {
    return res.status(400).json({ error: "Date required." });
  }

  try {
    const {
      rows: [order],
    } = await db.query(
      `INSERT INTO orders (date, note, user_id) VALUES ($1, $2, $3) RETURNING *`,
      [date, note || "", req.user.id]
    );

    res.status(201).json(order);
  } catch (err) {
    console.error("POST /orders error:", err);
    res.status(500).json({ error: "Could not create order." });
  }
});

// GET /orders/:id — specific order
ordersRouter.get("/:id", requireUser, async (req, res) => {
  console.log("👉 GET /orders/:id HIT");

  const { id } = req.params;

  try {
    const {
      rows: [order],
    } = await db.query(`SELECT * FROM orders WHERE id = $1`, [id]);

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (order.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden." });
    }

    res.json(order);
  } catch (err) {
    console.error("GET /orders/:id error:", err);
    res.status(500).json({ error: "Could not get order." });
  }
});

export default ordersRouter;
