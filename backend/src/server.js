const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());

/* =========================
   PRODUCTS
========================= */

const products = [
  {
    id: 1,
    name: "Classic Burger",
    description:
      "Juicy beef burger with fresh vegetables and special sauce.",
    price: 8.99,
    category: "Burgers",
    image: "🍔",
  },
  {
    id: 2,
    name: "Italian Pizza",
    description:
      "Fresh pizza with tomato sauce, mozzarella and herbs.",
    price: 12.99,
    category: "Pizza",
    image: "🍕",
  },
  {
    id: 3,
    name: "Crispy Chicken",
    description:
      "Crispy chicken served with fresh vegetables and sauce.",
    price: 10.99,
    category: "Chicken",
    image: "🍗",
  },
  {
    id: 4,
    name: "Chicken Sandwich",
    description:
      "Grilled chicken with lettuce, tomato and special sauce.",
    price: 7.99,
    category: "Sandwiches",
    image: "🥪",
  },
];

/* =========================
   CART
========================= */

let cart = [];

/* =========================
   ORDERS
========================= */

let orders = [];

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
   GET PRODUCTS
========================= */

app.get("/api/products", (req, res) => {
  const { search, category } = req.query;

  let result = [...products];

  if (search) {
    result = result.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (category) {
    result = result.filter(
      (product) =>
        product.category.toLowerCase() === category.toLowerCase()
    );
  }

  res.json(result);
});

/* =========================
   GET PRODUCT BY ID
========================= */

app.get("/api/products/:id", (req, res) => {
  const product = products.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  res.json(product);
});

/* =========================
   GET CART
========================= */

app.get("/api/cart", (req, res) => {
  res.json(cart);
});

/* =========================
   ADD TO CART
========================= */

app.post("/api/cart", (req, res) => {
  const { productId } = req.body;

  const product = products.find(
    (item) => item.id === Number(productId)
  );

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const existingItem = cart.find(
    (item) => item.productId === product.id
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }

  res.status(201).json({
    message: "Product added to cart",
    cart,
  });
});

/* =========================
   REMOVE FROM CART
========================= */

app.delete("/api/cart/:productId", (req, res) => {
  const productId = Number(req.params.productId);

  cart = cart.filter(
    (item) => item.productId !== productId
  );

  res.json({
    message: "Product removed from cart",
    cart,
  });
});

/* =========================
   CREATE ORDER
========================= */

app.post("/api/orders", (req, res) => {
  const { customerName } = req.body;

  if (!customerName) {
    return res.status(400).json({
      message: "customerName is required",
    });
  }

  if (cart.length === 0) {
    return res.status(400).json({
      message: "Cart is empty",
    });
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order = {
    id: orders.length + 1,
    customerName,
    items: [...cart],
    total: Number(total.toFixed(2)),
    status: "pending",
    createdAt: new Date(),
  };

  orders.push(order);

  cart = [];

  res.status(201).json(order);
});

/* =========================
   GET ORDERS
========================= */

app.get("/api/orders", (req, res) => {
  res.json(orders);
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