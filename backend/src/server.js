const express = require("express");
const cors = require("cors");

const pool = require("./db");
const authMiddleware = require("./middleware/authMiddleware");
const authRoutes = require("./routes/auth");

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

/* =========================
   HEALTH
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "FoodHub API",
  });
});

/* =========================
   PRODUCTS
========================= */

// GET ALL PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const { search, category } = req.query;

    let query = `
      SELECT
        id,
        name,
        description,
        price,
        category,
        image
      FROM products
    `;

    const values = [];
    const conditions = [];

    if (search) {
      values.push(`%${search}%`);

      conditions.push(
        `(name ILIKE $${values.length}
          OR description ILIKE $${values.length})`
      );
    }

    if (category) {
      values.push(category);

      conditions.push(
        `category ILIKE $${values.length}`
      );
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY id`;

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch products:", error);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

// GET PRODUCT BY ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        description,
        price,
        category,
        image
      FROM products
      WHERE id = $1
      `,
      [productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to fetch product:", error);

    res.status(500).json({
      message: "Failed to fetch product",
    });
  }
});

/* =========================
   CART
========================= */

// For now we use a temporary guest cart.
// Later this will be connected to the authenticated user.
// CREATE GUEST CART IF IT DOES NOT EXIST
async function getGuestCart() {
  const existingCart = await pool.query(
    `
    SELECT id
    FROM carts
    ORDER BY id
    LIMIT 1
    `,
  );

  if (existingCart.rows.length > 0) {
    return existingCart.rows[0].id;
  }

  const newCart = await pool.query(
    `
    INSERT INTO carts
    DEFAULT VALUES
    RETURNING id
    `,
  );

  return newCart.rows[0].id;
}

// GET CART
app.get("/api/cart", async (req, res) => {
  try {
    const cartId = await getGuestCart();

    const result = await pool.query(
      `
      SELECT
        ci.product_id AS "productId",
        p.name,
        p.price,
        ci.quantity
      FROM cart_items ci
      JOIN products p
        ON p.id = ci.product_id
      WHERE ci.cart_id = $1
      ORDER BY ci.id
      `,
      [cartId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch cart:", error);

    res.status(500).json({
      message: "Failed to fetch cart",
    });
  }
});

// ADD PRODUCT TO CART
app.post("/api/cart", async (req, res) => {
  const client = await pool.connect();

  try {
    const { productId } = req.body;

    const numericProductId = Number(productId);

    if (!Number.isInteger(numericProductId)) {
      return res.status(400).json({
        message: "Invalid productId",
      });
    }

    // Check product
    const productResult = await client.query(
      `
      SELECT
        id,
        name,
        price
      FROM products
      WHERE id = $1
      `,
      [numericProductId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const product = productResult.rows[0];

    await client.query("BEGIN");

    const cartId = await getGuestCart();

    const existingItem = await client.query(
      `
      SELECT id, quantity
      FROM cart_items
      WHERE cart_id = $1
        AND product_id = $2
      FOR UPDATE
      `,
      [cartId, numericProductId]
    );

    if (existingItem.rows.length > 0) {
      await client.query(
        `
        UPDATE cart_items
        SET quantity = quantity + 1
        WHERE id = $1
        `,
        [existingItem.rows[0].id]
      );
    } else {
      await client.query(
        `
        INSERT INTO cart_items
          (cart_id, product_id, quantity)
        VALUES
          ($1, $2, 1)
        `,
        [cartId, numericProductId]
      );
    }

    await client.query("COMMIT");

    const cartResult = await pool.query(
      `
      SELECT
        ci.product_id AS "productId",
        p.name,
        p.price,
        ci.quantity
      FROM cart_items ci
      JOIN products p
        ON p.id = ci.product_id
      WHERE ci.cart_id = $1
      ORDER BY ci.id
      `,
      [cartId]
    );

    res.status(201).json({
      message: "Product added to cart",
      cart: cartResult.rows,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Failed to add product to cart:", error);

    res.status(500).json({
      message: "Failed to add product to cart",
    });
  } finally {
    client.release();
  }
});

// REMOVE PRODUCT FROM CART
app.delete("/api/cart/:productId", async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const cartId = await getGuestCart();

    await pool.query(
      `
      DELETE FROM cart_items
      WHERE cart_id = $1
        AND product_id = $2
      `,
      [cartId, productId]
    );

    const result = await pool.query(
      `
      SELECT
        ci.product_id AS "productId",
        p.name,
        p.price,
        ci.quantity
      FROM cart_items ci
      JOIN products p
        ON p.id = ci.product_id
      WHERE ci.cart_id = $1
      ORDER BY ci.id
      `,
      [cartId]
    );

    res.json({
      message: "Product removed from cart",
      cart: result.rows,
    });
  } catch (error) {
    console.error("Failed to remove product from cart:", error);

    res.status(500).json({
      message: "Failed to remove product from cart",
    });
  }
});

/* =========================
   ORDERS
========================= */

// CREATE ORDER
app.post("/api/orders", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const { customerName } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        message: "customerName is required",
      });
    }

    await client.query("BEGIN");

    const cartId = await getGuestCart();

    // Get cart items
    const cartResult = await client.query(
      `
      SELECT
        ci.product_id,
        ci.quantity,
        p.name,
        p.price
      FROM cart_items ci
      JOIN products p
        ON p.id = ci.product_id
      WHERE ci.cart_id = $1
      ORDER BY ci.id
      `,
      [cartId]
    );

    if (cartResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // Calculate total
    const total = cartResult.rows.reduce(
      (sum, item) =>
        sum + Number(item.price) * item.quantity,
      0
    );

    // Create order
    const orderResult = await client.query(
      `
      INSERT INTO orders
        (user_id, customer_name, total, status)
      VALUES
        ($1, $2, $3, 'pending')
      RETURNING
        id,
        customer_name AS "customerName",
        total,
        status,
        created_at AS "createdAt"
      `,
      [
        req.user.id,
        customerName.trim(),
        total.toFixed(2),
      ]
    );

    const order = orderResult.rows[0];

    // Create order items
    for (const item of cartResult.rows) {
      await client.query(
        `
        INSERT INTO order_items
          (order_id, product_id, quantity, unit_price)
        VALUES
          ($1, $2, $3, $4)
        `,
        [
          order.id,
          item.product_id,
          item.quantity,
          item.price,
        ]
      );
    }

    // Clear cart
    await client.query(
      `
      DELETE FROM cart_items
      WHERE cart_id = $1
      `,
      [cartId]
    );

    await client.query("COMMIT");

    // Return complete order
    const itemsResult = await pool.query(
      `
      SELECT
        oi.product_id AS "productId",
        p.name,
        oi.quantity,
        oi.unit_price AS "price"
      FROM order_items oi
      JOIN products p
        ON p.id = oi.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.id
      `,
      [order.id]
    );

    res.status(201).json({
      id: order.id,
      customerName: order.customerName,
      items: itemsResult.rows,
      total: Number(order.total),
      status: order.status,
      createdAt: order.createdAt,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Failed to create order:", error);

    res.status(500).json({
      message: "Failed to create order",
    });
  } finally {
    client.release();
  }
});

// GET ORDERS
app.get("/api/orders", authMiddleware, async (req, res) => {
  try {
    const ordersResult = await pool.query(
      `
      SELECT
        id,
        customer_name AS "customerName",
        total,
        status,
        created_at AS "createdAt"
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    const orders = [];

    for (const order of ordersResult.rows) {
      const itemsResult = await pool.query(
        `
        SELECT
          oi.product_id AS "productId",
          p.name,
          oi.quantity,
          oi.unit_price AS "price"
        FROM order_items oi
        JOIN products p
          ON p.id = oi.product_id
        WHERE oi.order_id = $1
        ORDER BY oi.id
        `,
        [order.id]
      );

      orders.push({
        ...order,
        total: Number(order.total),
        items: itemsResult.rows,
      });
    }

    res.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
});

/* =========================
   404
========================= */

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(
    `FoodHub API running on http://localhost:${PORT}`
  );
});