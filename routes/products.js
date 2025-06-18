import express from "express";
import db from "#db/client";

const productsRouter = express.Router();

// GET /products — returns all products
productsRouter.get("/", async (req, res) => {
  console.log("👉 /products route HIT");

  try {
    const { rows: products } = await db.query(`SELECT * FROM products`);
    res.json(products);
  } catch (err) {
    console.error("GET /products error:", err);
    res.status(500).json({ error: "Could not get products." });
  }
});

// GET /products/:id — returns one product by id
productsRouter.get("/:id", async (req, res) => {
  console.log("👉 /products/:id route HIT");

  const { id } = req.params;

  try {
    const {
      rows: [product],
    } = await db.query(`SELECT * FROM products WHERE id = $1`, [id]);

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.json(product);
  } catch (err) {
    console.error("GET /products/:id error:", err);
    res.status(500).json({ error: "Could not get product." });
  }
});

export default productsRouter;
