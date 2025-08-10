import React, { useState } from 'react';
import apiService from '../services/api';
import './CheckoutButton.css';
import '../styles/windows98.css';

const CheckoutButton = ({ orderId, onCheckoutSuccess, onCheckoutError, disabled, children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      // Create checkout session with backend
      const data = await apiService.createCheckoutSession({
        orderId: orderId
      });

      if (data.success) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        onCheckoutError(new Error(data.message || 'Failed to create checkout session'));
      }
    } catch (error) {
      onCheckoutError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      className={`retro-button retro-button-primary retro-button-large ${isLoading ? 'loading' : ''}`}
      onClick={handleCheckout}
      disabled={disabled || isLoading}
    >
      {isLoading ? 'Creating Checkout...' : (children || 'Checkout with Stripe')}
    </button>
  );
};

export default CheckoutButton;