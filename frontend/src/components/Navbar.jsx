import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">

        <a href="/" className="logo">
          Food<span>Hub</span>
        </a>

        <div className="nav-links">
          <a href="/" className="nav-link active">
            Home
          </a>

          <a href="#products" className="nav-link">
            Products
          </a>

          <a href="#categories" className="nav-link">
            Categories
          </a>
        </div>

        <div className="nav-actions">

          <button className="search-button" title="Search">
            🔍
          </button>

          <button className="cart-button" title="Shopping Cart">
            🛒
            <span>2</span>
          </button>

          <button className="login-button">
            Login
          </button>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;