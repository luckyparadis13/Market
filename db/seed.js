import db from "#db/client";
import bcrypt from "bcrypt";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  console.log("🌱 Clearing old data...");

  await db.query(`DELETE FROM orders_products;`);
  await db.query(`DELETE FROM orders;`);
  await db.query(`DELETE FROM users;`);
  await db.query(`DELETE FROM products;`);

  console.log("🌱 Seeding products...");

  const productTitles = [
    "Shampoo",
    "Conditioner",
    "Hairspray",
    "Hair Oil",
    "Texture Spray",
    "Curl Cream",
    "Leave-in Conditioner",
    "Dry Shampoo",
    "Styling Gel",
    "Hair Mask",
  ];

  const products = [];

  for (let i = 0; i < productTitles.length; i++) {
    const {
      rows: [product],
    } = await db.query(
      `INSERT INTO products (title, description, price)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        productTitles[i],
        `Description for ${productTitles[i]}`,
        (10 + i * 2).toFixed(2),
      ]
    );
    products.push(product);
  }

  console.log("🌱 Seeded products:", products.length);

  console.log("🌱 Seeding user...");

  const hashedPassword = await bcrypt.hash("magic123", 10);

  const {
    rows: [user],
  } = await db.query(
    `INSERT INTO users (username, password)
     VALUES ($1, $2)
     RETURNING *`,
    ["testuser", hashedPassword]
  );

  console.log("🌱 Seeded user:", user.username);

  console.log("🌱 Creating order...");

  const {
    rows: [order],
  } = await db.query(
    `INSERT INTO orders (date, note, user_id)
     VALUES (CURRENT_DATE, 'First order', $1)
     RETURNING *`,
    [user.id]
  );

  console.log("🌱 Order id:", order.id);

  console.log("🌱 Adding 5 products to order...");

  for (let i = 0; i < 5; i++) {
    await db.query(
      `INSERT INTO orders_products (order_id, product_id, quantity)
       VALUES ($1, $2, $3)`,
      [order.id, products[i].id, 1]
    );
  }

  console.log("🌱 All done! 5 products added to order.");
}
