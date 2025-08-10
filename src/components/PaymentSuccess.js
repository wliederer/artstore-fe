import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import './PaymentSuccess.css';
import '../styles/windows98.css';

const PaymentSuccess = () => {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const orderId = urlParams.get('order_id');

    if (sessionId) {
      // Fetch session details from backend
      apiService.getSessionStatus(sessionId)
        .then(data => {
          if (data.success) {
            setSessionData({
              ...data,
              orderId: orderId
            });
          } else {
            setError(data.message || 'Failed to retrieve payment information');
          }
        })
        .catch(err => {
          setError(err.message || 'An error occurred while retrieving payment information');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="payment-success">
        <div className="loading">
          <div className="spinner"></div>
          <p>Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-success">
        <div className="error">
          <div className="error-icon">❌</div>
          <h2>Payment Verification Failed</h2>
          <p>{error}</p>
          <button className="win98-button win98-button-primary" onClick={() => window.location.href = '/'}>Return to Store</button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success">
      <div className="success-content">
        <div className="success-icon">✅</div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. Your order has been confirmed.</p>
        
        {sessionData && (
          <div className="order-details">
            <h3>Order Details</h3>
            <div className="detail-row">
              <span>Order ID:</span>
              <span>#{sessionData.orderId}</span>
            </div>
            <div className="detail-row">
              <span>Payment Status:</span>
              <span className="status-paid">{sessionData.paymentStatus}</span>
            </div>
            {sessionData.customerEmail && (
              <div className="detail-row">
                <span>Email:</span>
                <span>{sessionData.customerEmail}</span>
              </div>
            )}
          </div>
        )}

        <div className="actions">
          <button 
            className="win98-button win98-button-primary win98-button-large"
            onClick={() => window.location.href = '/'}
          >
            Continue Shopping
          </button>
          {sessionData?.orderId && (
            <button 
              className="win98-button win98-button-large"
              onClick={() => window.location.href = `/orders/${sessionData.orderId}`}
            >
              View Order Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;