import { useState } from "react";
import "./AuthPage.css";

const API_URL = import.meta.env.VITE_API_URL;

function AuthPage({ initialMode, onBack, onAuthenticated }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegistering = mode === "register";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/auth/${isRegistering ? "register" : "login"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isRegistering
              ? { name, email, password }
              : { email, password }
          ),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      if (isRegistering) {
        setMode("login");
        setPassword("");
        setNotice("Account created. Sign in to continue.");
        return;
      }

      onAuthenticated(data);
    } catch (requestError) {
      setError(requestError.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isRegistering ? "login" : "register");
    setError("");
    setNotice("");
  };

  return (
    <main className="auth-page">
      <section className="auth-container">
        <button className="auth-back-button" onClick={onBack}>
          ← Back to FoodHub
        </button>

        <div className="auth-header">
          <p>{isRegistering ? "CREATE ACCOUNT" : "WELCOME BACK"}</p>
          <h1>{isRegistering ? "Join FoodHub" : "Sign in to FoodHub"}</h1>
          <span>
            {isRegistering
              ? "Create an account to place and track your orders."
              : "Sign in to continue with your order."}
          </span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={120}
              />
            </>
          )}

          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={isRegistering ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={isRegistering ? 8 : undefined}
          />

          {error && <p className="auth-error" role="alert">{error}</p>}
          {notice && <p className="auth-notice" role="status">{notice}</p>}

          <button className="auth-submit-button" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegistering
                ? "Create Account"
                : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegistering ? "Already have an account?" : "New to FoodHub?"}{" "}
          <button type="button" onClick={switchMode}>
            {isRegistering ? "Login" : "Create an account"}
          </button>
        </p>
      </section>
    </main>
  );
}

export default AuthPage;