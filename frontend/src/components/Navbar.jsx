import "./Navbar.css";

function Navbar({
  search,
  setSearch,
  cartCount,
  user,
  onLogin,
  onLogout,
}) {
  return (
    <nav className="navbar">
      <div className="navbar-container">

        <a href="/" className="logo">
          Food<span>Hub</span>
        </a>

        <div className="nav-links">
          <a
            href="/"
            className="nav-link active"
          >
            Home
          </a>

          <a
            href="#products"
            className="nav-link"
          >
            Products
          </a>

          <a
            href="#categories"
            className="nav-link"
          >
            Categories
          </a>
        </div>

        <div className="nav-actions">

          <div className="search-box">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search food..."
              value={search}
              onChange={setSearch}
            />
          </div>

          <a
            href="#cart"
            className="cart-button"
            title="Shopping Cart"
          >
            🛒

            {cartCount > 0 && (
              <span>{cartCount}</span>
            )}
          </a>

          {user ? (
            <>
              <span className="navbar-user">{user.name || user.email}</span>
              <button className="login-button" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="login-button" onClick={onLogin}>
              Login
            </button>
          )}

        </div>

      </div>
    </nav>
  );
}

export default Navbar;