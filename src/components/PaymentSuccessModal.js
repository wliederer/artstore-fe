import React from 'react';
import './PaymentSuccessModal.css';
import '../styles/windows98.css';

const PaymentSuccessModal = ({ isOpen, onClose, orderDetails }) => {
  if (!isOpen || !orderDetails) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content success-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header success-header">
          <div className="success-icon">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <h2>Payment Successful!</h2>
          <p>Thank you for your purchase. Your order has been confirmed.</p>
        </div>

        <div className="modal-body">
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="order-info">
              <div className="info-row">
                <span className="label">Order Number:</span>
                <span className="value">#{orderDetails.orderId}</span>
              </div>
              <div className="info-row">
                <span className="label">Order Date:</span>
                <span className="value">{formatDate(orderDetails.createdAt)}</span>
              </div>
              <div className="info-row">
                <span className="label">Customer:</span>
                <span className="value">{orderDetails.firstName} {orderDetails.lastName}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{orderDetails.email}</span>
              </div>
              {orderDetails.phone && (
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span className="value">{orderDetails.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="items-section">
            <h4>Items Ordered</h4>
            <div className="items-list">
              {orderDetails.orderItems?.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-details">
                    <span className="item-name">{item.product?.name || 'Product'}</span>
                    <span className="item-quantity">Qty: {item.quantity}</span>
                  </div>
                  <div className="item-price">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="shipping-section">
            <h4>Shipping Address</h4>
            <div className="shipping-address">
              <div>{orderDetails.firstName} {orderDetails.lastName}</div>
              <div>{orderDetails.address}</div>
              <div>{orderDetails.city}, {orderDetails.state} {orderDetails.zipCode}</div>
            </div>
          </div>

          <div className="total-section">
            <div className="total-row">
              <span className="total-label">Total Amount:</span>
              <span className="total-amount">{formatPrice(orderDetails.totalAmount)}</span>
            </div>
          </div>

          <div className="confirmation-message">
            <div className="message-box">
              <h4>What's Next?</h4>
              <p>
                🎉 Your payment has been successfully processed!<br/>
                📧 A confirmation email has been sent to {orderDetails.email}<br/>
                📦 We'll send you shipping updates as your order is processed<br/>
                ❓ Questions? Contact us at freestickerdotorg@gmail.com
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="win98-button win98-button-primary win98-button-large" onClick={onClose}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;