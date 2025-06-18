-- TODO
DROP TABLE IF EXISTS orders_products;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL NOT NULL
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  note TEXT,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE orders_products (
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  PRIMARY KEY (order_id, product_id)
);
