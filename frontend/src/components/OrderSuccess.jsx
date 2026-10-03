import "./OrderSuccess.css";

function OrderSuccess({ order, onContinue }) {
  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>

        <p className="success-label">ORDER CONFIRMED</p>

        <h1>Thank You, {order.customerName}!</h1>

        <p className="success-message">
          Your order has been placed successfully.
          We have received your order and will start preparing it soon.
        </p>

        <div className="success-details">
          <div>
            <span>Order Number</span>
            <strong>#{order.id}</strong>
          </div>

          <div>
            <span>Total</span>
            <strong>${order.total.toFixed(2)}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong className="status">{order.status}</strong>
          </div>
        </div>

        <button className="continue-button" onClick={onContinue}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default OrderSuccess;