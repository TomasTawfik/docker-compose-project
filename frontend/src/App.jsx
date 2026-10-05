import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Checkout from "./components/Checkout";
import OrderSuccess from "./components/OrderSuccess";
import AuthPage from "./components/AuthPage";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("foodhub_favorites") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  // Page navigation
  const [page, setPage] = useState("home");
  const [completedOrder, setCompletedOrder] = useState(null);
  const [authToken, setAuthToken] = useState(
    () => localStorage.getItem("foodhub_token")
  );
  const [authUser, setAuthUser] = useState(null);

  const categories = [
    { name: "Burgers", emoji: "🍔" },
    { name: "Pizza", emoji: "🍕" },
    { name: "Chicken", emoji: "🍗" },
    { name: "Sandwiches", emoji: "🥪" },
  ];

  const customerReviews = [
    {
      name: "Maya T.",
      text: "FoodHub made dinner feel effortless. The burger was hot, fresh, and exactly on time.",
    },
    {
      name: "Lucas R.",
      text: "The ordering experience is smooth and the food quality is consistently excellent.",
    },
    {
      name: "Alicia M.",
      text: "Fast delivery, tasty meals, and a clean checkout flow. I always come back here.",
    },
  ];

  useEffect(() => {
    localStorage.setItem("foodhub_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    let active = true;

    const loadCart = async () => {
      try {
        const headers = {};

        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_URL}/api/cart`, {
          headers,
        });
        const data = await response.json();

        if (!response.ok) {
          console.error("Failed to load cart:", data);
          return;
        }

        if (active) {
          setCart(
            Array.isArray(data)
              ? data.map((item) => ({
                  ...item,
                  price: Number(item.price),
                }))
              : []
          );
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    };

    const timer = setTimeout(loadCart, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [authToken]);

  useEffect(() => {
    if (!authToken) {
      return undefined;
    }

    let active = true;

    const loadAuthenticatedUser = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Session expired");
        }

        if (active) {
          setAuthUser(data.user);
        }
      } catch (error) {
        console.error("Failed to restore session:", error);

        if (active) {
          localStorage.removeItem("foodhub_token");
          setAuthToken(null);
          setAuthUser(null);
        }
      }
    };

    loadAuthenticatedUser();

    return () => {
      active = false;
    };
  }, [authToken]);

  /* =========================
     SEARCH + CATEGORY
  ========================= */

  useEffect(() => {
    let active = true;

    const timer = setTimeout(async () => {
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

        if (active) {
          setProducts(
            Array.isArray(data)
              ? data.map((product) => ({
                  ...product,
                  price: Number(product.price),
                }))
              : []
          );
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
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

  const scrollToProducts = () => {
    document
      .getElementById("products")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCategory = (categoryName) => {
    if (category === categoryName) {
      setCategory("");
    } else {
      setCategory(categoryName);
    }

    setTimeout(scrollToProducts, 80);
  };

  const toggleFavorite = (productId) => {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(productId)
        ? currentFavorites.filter((id) => id !== productId)
        : [...currentFavorites, productId]
    );
  };

  /* =========================
     ADD TO CART
  ========================= */

  const addToCart = async (productId) => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          productId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setCart(
        Array.isArray(data.cart)
          ? data.cart.map((item) => ({
              ...item,
              price: Number(item.price),
            }))
          : []
      );
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  /* =========================
     REMOVE FROM CART
  ========================= */

  const removeFromCart = async (productId) => {
    try {
      const headers = {};

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(
        `${API_URL}/api/cart/${productId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setCart(
        Array.isArray(data.cart)
          ? data.cart.map((item) => ({
              ...item,
              price: Number(item.price),
            }))
          : []
      );
    } catch (error) {
      console.error("Failed to remove product:", error);
    }
  };

  const updateCartQuantity = async (productId, direction) => {
    const currentItem = cart.find((item) => item.productId === productId);

    if (!currentItem) {
      return;
    }

    if (direction === "increase") {
      await addToCart(productId);
      return;
    }

    const nextQuantity = currentItem.quantity - 1;

    if (nextQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    await removeFromCart(productId);

    for (let index = 0; index < nextQuantity; index += 1) {
      await addToCart(productId);
    }
  };

  const handleAuthenticated = ({ accessToken, user }) => {
    localStorage.setItem("foodhub_token", accessToken);
    setAuthToken(accessToken);
    setAuthUser(user);
    setPage("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("foodhub_token");
    setAuthToken(null);
    setAuthUser(null);
    setPage("home");
  };

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const deliveryFee = cart.length > 0 ? 4.99 : 0;
  const cartTotal = cartSubtotal + deliveryFee;
  const featuredProducts = products.slice(0, 4);

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
        authToken={authToken}
        onBack={() => setPage("home")}
        onOrderSuccess={(order) => {
          setCompletedOrder(order);
          setCart([]);
          setPage("success");
        }}
      />
    );
  }

  if (page === "login" || page === "register") {
    return (
      <AuthPage
        initialMode={page}
        onBack={() => setPage("home")}
        onAuthenticated={handleAuthenticated}
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
        user={authUser}
        onLogin={() => setPage("login")}
        onLogout={handleLogout}
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
          <img
            src="/images/burger.jpg"
            alt="Delicious burger and fries"
            className="hero-food-image"
          />
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
            onClick={() => {
              setCategory("");
              setTimeout(scrollToProducts, 80);
            }}
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

            <h2>Best Sellers</h2>
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
          <div className="products-grid featured-products-grid">
            {(featuredProducts.length > 0 ? featuredProducts : products).map((product) => (
              <div
                className="product-card reveal-card"
                key={product.id}
              >
                <div className="product-image">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                  />

                  <button
                    className={`favorite ${
                      favorites.includes(product.id) ? "active" : ""
                    }`}
                    type="button"
                    onClick={() => toggleFavorite(product.id)}
                    aria-label={
                      favorites.includes(product.id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    {favorites.includes(product.id) ? "♥" : "♡"}
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
                      ${Number(product.price).toFixed(2)}
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
              <div className="empty-cart-icon">🛒</div>

              <h3>Your cart is empty</h3>

              <p>Add some delicious food to your cart.</p>

              <button
                className="primary-button"
                onClick={scrollToProducts}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="cart-container">
              <div className="cart-items">
                {cart.map((item) => {
                  const productInfo = products.find(
                    (product) => product.id === item.productId
                  );

                  return (
                    <div
                      className="cart-item"
                      key={item.productId}
                    >
                      <div className="cart-item-main">
                        <div className="cart-item-image-wrap">
                          <img
                            src={productInfo?.image || "/images/placeholder.jpg"}
                            alt={item.name}
                          />
                        </div>

                        <div className="cart-item-details">
                          <h3>{item.name}</h3>
                          <p className="unit-price">
                            ${Number(item.price).toFixed(2)} each
                          </p>

                          <div className="quantity-control">
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(item.productId, "decrease")
                              }
                              aria-label={`Decrease quantity for ${item.name}`}
                            >
                              −
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(item.productId, "increase")
                              }
                              aria-label={`Increase quantity for ${item.name}`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="cart-item-actions">
                        <strong>
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </strong>

                        <button
                          className="remove-button"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="order-summary-box">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>${cartSubtotal.toFixed(2)}</strong>
                </div>

                <div className="summary-row">
                  <span>Delivery</span>
                  <strong>${deliveryFee.toFixed(2)}</strong>
                </div>

                <div className="summary-row total-row">
                  <span>Total</span>
                  <strong>${cartTotal.toFixed(2)}</strong>
                </div>
              </div>

              <button
                className="primary-button checkout-button"
                onClick={() =>
                  setPage(authUser ? "checkout" : "login")
                }
              >
                Place Order
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="reviews-section section">
        <div className="section-header reviews-header">
          <div>
            <span className="section-label">TESTIMONIALS</span>
            <h2>Customer Reviews</h2>
          </div>
        </div>

        <div className="reviews-grid">
          {customerReviews.map((review) => (
            <div className="review-card reveal-card" key={review.name}>
              <div className="review-stars">★★★★★</div>
              <p>“{review.text}”</p>
              <div className="review-author">
                <span className="review-avatar">{review.name.charAt(0)}</span>
                <strong>{review.name}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <span className="section-label">READY TO ORDER?</span>
          <h2>Discover delicious food and get it delivered.</h2>
          <button className="primary-button" onClick={goToProducts}>
            Explore Menu
          </button>
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