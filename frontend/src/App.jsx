import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Checkout from "./components/Checkout";
import OrderSuccess from "./components/OrderSuccess";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  // Page navigation
  const [page, setPage] = useState("home");
  const [completedOrder, setCompletedOrder] = useState(null);

  const categories = [
    { name: "Burgers", emoji: "🍔" },
    { name: "Pizza", emoji: "🍕" },
    { name: "Chicken", emoji: "🍗" },
    { name: "Sandwiches", emoji: "🥪" },
  ];

  /* =========================
     LOAD PRODUCTS
  ========================= */

  const loadProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search) {
        params.append("search", search);
      }

      if (category) {
        params.append("category", category);
      }

      const response = await fetch(
        `${API_URL}/api/products?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to load products:", data);
        return;
      }

      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOAD CART
  ========================= */

  const loadCart = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cart`);

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to load cart:", data);
        return;
      }

      setCart(data);
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  };

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    loadCart();
  }, []);

  /* =========================
     SEARCH + CATEGORY
  ========================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category]);

  /* =========================
     SEARCH
  ========================= */

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  /* =========================
     CATEGORY
  ========================= */

  const handleCategory = (categoryName) => {
    if (category === categoryName) {
      setCategory("");
    } else {
      setCategory(categoryName);
    }
  };

  /* =========================
     ADD TO CART
  ========================= */

  const addToCart = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setCart(data.cart);
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  /* =========================
     REMOVE FROM CART
  ========================= */

  const removeFromCart = async (productId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/cart/${productId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setCart(data.cart);
    } catch (error) {
      console.error("Failed to remove product:", error);
    }
  };

  /* =========================
     GO TO PRODUCTS
  ========================= */

  const goToProducts = () => {
    document
      .getElementById("products")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  /* =========================
     CHECKOUT PAGE
  ========================= */

  if (page === "checkout") {
    return (
      <Checkout
        cart={cart}
        onBack={() => setPage("home")}
        onOrderSuccess={(order) => {
          setCompletedOrder(order);
          setCart([]);
          setPage("success");
        }}
      />
    );
  }

  /* =========================
     ORDER SUCCESS PAGE
  ========================= */

  if (page === "success") {
    return (
      <OrderSuccess
        order={completedOrder}
        onContinue={() => {
          setPage("home");
        }}
      />
    );
  }

  /* =========================
     HOME PAGE
  ========================= */

  return (
    <div className="app">
      <Navbar
        search={search}
        setSearch={handleSearch}
        cartCount={cart.reduce(
          (total, item) => total + item.quantity,
          0
        )}
      />

      {/* =========================
          HERO
      ========================= */}

      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">
            🔥 Fresh & Delicious
          </span>

          <h1>
            Delicious food,
            <br />
            <span>delivered to you.</span>
          </h1>

          <p>
            Discover your favorite meals from FoodHub and enjoy
            fast, fresh delivery right to your door.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-button"
              onClick={goToProducts}
            >
              Order Now
            </button>

            <button
              className="secondary-button"
              onClick={goToProducts}
            >
              Explore Menu
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <strong>500+</strong>
              <span>Meals</span>
            </div>

            <div>
              <strong>50+</strong>
              <span>Restaurants</span>
            </div>

            <div>
              <strong>4.9</strong>
              <span>Rating ⭐</span>
            </div>
          </div>
        </div>

        <div className="hero-food">
          <div className="food-circle">
            <span>🍔</span>
          </div>

          <div className="floating-card card-one">
            ⭐ 4.9 Rating
          </div>

          <div className="floating-card card-two">
            🚀 Fast Delivery
          </div>
        </div>
      </section>

      {/* =========================
          CATEGORIES
      ========================= */}

      <section className="section" id="categories">
        <div className="section-header">
          <div>
            <span className="section-label">
              EXPLORE
            </span>

            <h2>Browse Categories</h2>
          </div>

          <button
            className="clear-filter"
            onClick={() => setCategory("")}
          >
            View all →
          </button>
        </div>

        <div className="categories">
          {categories.map((item) => (
            <button
              className={`category-card ${
                category === item.name ? "selected" : ""
              }`}
              key={item.name}
              onClick={() => handleCategory(item.name)}
            >
              <div className="category-icon">
                {item.emoji}
              </div>

              <h3>{item.name}</h3>

              <span>Explore →</span>
            </button>
          ))}
        </div>
      </section>

      {/* =========================
          PRODUCTS
      ========================= */}

      <section
        className="section products-section"
        id="products"
      >
        <div className="section-header">
          <div>
            <span className="section-label">
              OUR MENU
            </span>

            <h2>Popular Products</h2>
          </div>

          <span>
            {products.length} products
          </span>
        </div>

        {loading ? (
          <div className="loading">
            Loading products...
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div
                className="product-card"
                key={product.id}
              >
                <div className="product-image">
                  <span>{product.image}</span>

                  <button
                    className="favorite"
                    type="button"
                    onClick={() =>
                      alert(
                        "Favorites will be connected later."
                      )
                    }
                  >
                    ♡
                  </button>
                </div>

                <div className="product-info">
                  <div className="rating">
                    ★★★★★
                  </div>

                  <h3>{product.name}</h3>

                  <p>{product.description}</p>

                  <div className="product-bottom">
                    <strong>
                      ${product.price.toFixed(2)}
                    </strong>

                    <button
                      className="add-button"
                      onClick={() =>
                        addToCart(product.id)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="empty">
            No products found.
          </div>
        )}
      </section>

      {/* =========================
          CART
      ========================= */}

      <section
        className="cart-section"
        id="cart"
      >
        <div className="section">
          <div className="section-header">
            <div>
              <span className="section-label">
                YOUR ORDER
              </span>

              <h2>Shopping Cart</h2>
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart">
              🛒

              <h3>Your cart is empty</h3>

              <p>
                Add some delicious food to your cart.
              </p>
            </div>
          ) : (
            <div className="cart-container">
              {cart.map((item) => (
                <div
                  className="cart-item"
                  key={item.productId}
                >
                  <div>
                    <h3>{item.name}</h3>

                    <p>
                      ${item.price.toFixed(2)} ×{" "}
                      {item.quantity}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      removeFromCart(item.productId)
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                className="primary-button checkout-button"
                onClick={() => setPage("checkout")}
              >
                Place Order
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================
          WHY FOODHUB
      ========================= */}

      <section className="why-section">
        <div>
          <span className="section-label">
            WHY FOODHUB?
          </span>

          <h2>
            Everything you need for a great meal.
          </h2>

          <p>
            We make ordering food simple, fast and
            convenient.
          </p>
        </div>

        <div className="features">
          <div className="feature">
            <span>🚀</span>

            <div>
              <h3>Fast Delivery</h3>
              <p>
                Get your food delivered quickly.
              </p>
            </div>
          </div>

          <div className="feature">
            <span>🥗</span>

            <div>
              <h3>Fresh Food</h3>
              <p>
                Quality ingredients in every meal.
              </p>
            </div>
          </div>

          <div className="feature">
            <span>🔒</span>

            <div>
              <h3>Secure Ordering</h3>
              <p>
                Safe and simple ordering experience.
              </p>
            </div>
          </div>

          <div className="feature">
            <span>💳</span>

            <div>
              <h3>Easy Payment</h3>
              <p>
                Simple and convenient checkout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer>
        <div className="footer-brand">
          <h2>
            Food<span>Hub</span>
          </h2>

          <p>
            Your favorite food, delivered.
          </p>
        </div>

        <div className="footer-links">
          <a href="/">Home</a>

          <a href="#products">
            Products
          </a>

          <a href="#categories">
            Categories
          </a>

          <a href="#cart">
            Cart
          </a>
        </div>

        <p className="copyright">
          © 2026 FoodHub. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;