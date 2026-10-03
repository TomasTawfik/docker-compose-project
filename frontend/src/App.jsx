import Navbar from "./components/Navbar";
import "./App.css";

const products = [
  {
    name: "Classic Burger",
    description: "Juicy beef burger with fresh vegetables and special sauce.",
    price: "$8.99",
    emoji: "🍔",
  },
  {
    name: "Italian Pizza",
    description: "Fresh pizza with tomato sauce, mozzarella and herbs.",
    price: "$12.99",
    emoji: "🍕",
  },
  {
    name: "Crispy Chicken",
    description: "Crispy chicken served with fresh vegetables and sauce.",
    price: "$10.99",
    emoji: "🍗",
  },
  {
    name: "Chicken Sandwich",
    description: "Grilled chicken with lettuce, tomato and special sauce.",
    price: "$7.99",
    emoji: "🥪",
  },
];

const categories = [
  { name: "Burgers", emoji: "🍔" },
  { name: "Pizza", emoji: "🍕" },
  { name: "Chicken", emoji: "🍗" },
  { name: "Drinks", emoji: "🥤" },
];

function App() {
  return (
    <div className="app">
      <Navbar />

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">🔥 Fresh & Delicious</span>

          <h1>
            Delicious food,
            <br />
            <span>delivered to you.</span>
          </h1>

          <p>
            Discover your favorite meals from FoodHub and enjoy fast,
            fresh delivery right to your door.
          </p>

          <div className="hero-buttons">
            <button className="primary-button">Order Now</button>
            <button className="secondary-button">Explore Menu</button>
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

      {/* Categories */}
      <section className="section" id="categories">
        <div className="section-header">
          <div>
            <span className="section-label">EXPLORE</span>
            <h2>Browse Categories</h2>
          </div>

          <a href="#products">View all →</a>
        </div>

        <div className="categories">
          {categories.map((category) => (
            <div className="category-card" key={category.name}>
              <div className="category-icon">{category.emoji}</div>
              <h3>{category.name}</h3>
              <span>Explore →</span>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="section products-section" id="products">
        <div className="section-header">
          <div>
            <span className="section-label">OUR MENU</span>
            <h2>Popular Products</h2>
          </div>

          <a href="#products">View all →</a>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <div className="product-card" key={product.name}>
              <div className="product-image">
                <span>{product.emoji}</span>
                <button className="favorite">♡</button>
              </div>

              <div className="product-info">
                <div className="rating">★★★★★</div>

                <h3>{product.name}</h3>

                <p>{product.description}</p>

                <div className="product-bottom">
                  <strong>{product.price}</strong>

                  <button className="add-button">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why FoodHub */}
      <section className="why-section">
        <div>
          <span className="section-label">WHY FOODHUB?</span>
          <h2>Everything you need for a great meal.</h2>
          <p>
            We make ordering food simple, fast and convenient.
            Choose your meal and let us take care of the rest.
          </p>
        </div>

        <div className="features">
          <div className="feature">
            <span>🚀</span>
            <div>
              <h3>Fast Delivery</h3>
              <p>Get your food delivered quickly.</p>
            </div>
          </div>

          <div className="feature">
            <span>🥗</span>
            <div>
              <h3>Fresh Food</h3>
              <p>Quality ingredients in every meal.</p>
            </div>
          </div>

          <div className="feature">
            <span>🔒</span>
            <div>
              <h3>Secure Ordering</h3>
              <p>Safe and simple ordering experience.</p>
            </div>
          </div>

          <div className="feature">
            <span>💳</span>
            <div>
              <h3>Easy Payment</h3>
              <p>Simple and convenient checkout.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-brand">
          <h2>Food<span>Hub</span></h2>
          <p>Your favorite food, delivered.</p>
        </div>

        <div className="footer-links">
          <a href="/">Home</a>
          <a href="#products">Products</a>
          <a href="#products">Categories</a>
          <a href="/">Contact</a>
        </div>

        <p className="copyright">
          © 2026 FoodHub. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;