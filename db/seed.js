import db from "./client.js";
import bcrypt from "bcrypt";

await db.connect();

await seed();

await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  // Clear existing data (optional but recommended)
  await db.query(`DELETE FROM orders_products`);
  await db.query(`DELETE FROM orders`);
  await db.query(`DELETE FROM products`);
  await db.query(`DELETE FROM users`);

  // Create one user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const {
    rows: [user],
  } = await db.query(
    `INSERT INTO users (username, password)
     VALUES ($1, $2)
     RETURNING *`,
    ["testuser", hashedPassword]
  );

  // Create 10 products
  const productValues = [];
  for (let i = 1; i <= 10; i++) {
    productValues.push(
      db.query(
        `INSERT INTO products (title, description, price)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [`Product ${i}`, `Description for product ${i}`, i * 10]
      )
    );
  }

  const productResults = await Promise.all(productValues);
  const products = productResults.map((res) => res.rows[0]);

  // Create 1 order for the user
  const {
    rows: [order],
  } = await db.query(
    `INSERT INTO orders (date, note, user_id)
     VALUES (CURRENT_DATE, 'First order', $1)
     RETURNING *`,
    [user.id]
  );

  // Add 5 products to that order
  for (let i = 0; i < 5; i++) {
    await db.query(
      `INSERT INTO orders_products (order_id, product_id, quantity)
       VALUES ($1, $2, $3)`,
      [order.id, products[i].id, i + 1]
    );
  }
}
