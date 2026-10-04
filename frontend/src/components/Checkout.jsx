import { useState } from "react";
import "./Checkout.css";

const API_URL = import.meta.env.VITE_API_URL;

function Checkout({ cart, onBack, onOrderSuccess }) {
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!customerName.trim()) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      onOrderSuccess(data);
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <button className="back-button" onClick={onBack}>
          ← Back to Cart
        </button>

        <div className="checkout-header">
          <p>CHECKOUT</p>
          <h1>Complete Your Order</h1>
          <span>Enter your information to place your order.</span>
        </div>

        <div className="checkout-content">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>Customer Information</h2>

            <label htmlFor="customerName">Full Name</label>

            <input
              id="customerName"
              type="text"
              placeholder="Enter your name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              required
            />

            <button
              type="submit"
              className="confirm-order-button"
              disabled={loading}
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>

          <div className="order-summary">
            <h2>Order Summary</h2>

            {cart.map((item) => (
              <div className="summary-item" key={item.productId}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.quantity} × ${Number(item.price).toFixed(2)}
                  </span>
                </div>

                <strong>
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </strong>
              </div>
            ))}

            <div className="summary-total">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;