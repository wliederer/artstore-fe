import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './PaymentForm.css';
import '../styles/windows98.css';

const PaymentForm = ({ clientSecret, orderId, onPaymentSuccess, onPaymentError, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    const card = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
      }
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
      onPaymentError(error);
    } else {
      // Payment succeeded
      setIsProcessing(false);
      onPaymentSuccess(paymentIntent);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'Arial, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  return (
    <div className="payment-form">
      <h3>Payment Information</h3>
      <form onSubmit={handleSubmit}>
        <div className="card-element-container">
          <CardElement options={cardElementOptions} />
        </div>
        
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
        
        <div className="payment-summary">
          <p><strong>Total: ${amount?.toFixed(2)}</strong></p>
        </div>

        <button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className={`win98-button win98-button-success win98-button-large ${isProcessing ? 'processing' : ''}`}
        >
          {isProcessing ? 'Processing...' : `Pay $${amount?.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;