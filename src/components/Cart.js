import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';
import CheckoutButton from './CheckoutButton';
import PaymentSuccessModal from './PaymentSuccessModal';
import apiService from '../services/api';
import './Cart.css';
import '../styles/windows98.css';

const Cart = forwardRef(({ cart, isOpen, onClose, onUpdateQuantity, onRemoveItem, onClearCart, onRefreshProducts }, ref) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    billingCountry: '',
    sameAsBilling: true
  });

  const [errors, setErrors] = useState({});
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'payment', 'processing'
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    showPaymentSuccess: async (orderId) => {
      console.log('showPaymentSuccess called with orderId:', orderId);
      try {
        console.log('Fetching order details...');
        const orderData = await apiService.getOrder(orderId);
        console.log('Order data received:', orderData);
        setOrderDetails(orderData);
        setShowSuccessModal(true);
        console.log('Success modal should now be visible');
      } catch (error) {
        console.error('Failed to fetch order details:', error);
        // Show success modal anyway with basic info
        setOrderDetails({ 
          id: orderId, 
          totalAmount: 0,
          email: 'Unknown',
          firstName: 'Customer',
          lastName: '',
          createdAt: new Date().toISOString()
        });
        setShowSuccessModal(true);
        console.log('Fallback success modal should now be visible');
      }
    }
  }));

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'country'];
    
    if (!formData.sameAsBilling) {
      requiredFields.push('billingAddress', 'billingCity', 'billingState', 'billingZipCode', 'billingCountry');
    }

    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (validateForm()) {
      setPaymentStep('processing');
      setPaymentError('');
      
      const checkoutPayload = {
        cart: cart,
        total: calculateTotal(),
        customerInfo: formData,
        timestamp: new Date().toISOString()
      };

      try {
        // Create order first
        const orderData = await apiService.createOrder(checkoutPayload);

        if (orderData.success) {
          setOrderId(orderData.orderId);
          setOrderCreated(true);
          
          // Get Stripe configuration
          const configData = await apiService.getStripeConfig();
          
          // Initialize Stripe
          const stripePromiseInstance = loadStripe(configData.publishableKey);
          setStripePromise(stripePromiseInstance);
          
          setPaymentStep('payment');
        } else {
          setPaymentError(orderData.message || 'Failed to create order');
          setPaymentStep('form');
        }
      } catch (error) {
        setPaymentError(error.message || 'An error occurred while processing your order');
        setPaymentStep('form');
      }
    }
  };

  const handlePaymentIntentCheckout = async () => {
    if (!orderId) return;

    try {
      // Create payment intent
      const data = await apiService.createPaymentIntent({
        orderId: orderId,
        amount: calculateTotal(),
        currency: 'usd'
      });

      if (data.success) {
        setClientSecret(data.clientSecret);
      } else {
        setPaymentError(data.message || 'Failed to create payment intent');
      }
    } catch (error) {
      setPaymentError(error.message || 'An error occurred while setting up payment');
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    console.log('Payment succeeded:', paymentIntent);
    
    // Refresh products to update stock quantities
    if (onRefreshProducts) {
      onRefreshProducts();
    }
    
    try {
      // Fetch order details to show in success modal
      const orderData = await apiService.getOrder(orderId);
      setOrderDetails(orderData);
      setShowSuccessModal(true);
      setPaymentStep('form'); // Reset for next use
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      // Still show success but without detailed order info
      setOrderDetails({ 
        id: orderId, 
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        totalAmount: calculateTotal(),
        createdAt: new Date().toISOString()
      });
      setShowSuccessModal(true);
      setPaymentStep('form');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    setPaymentError(error.message || 'Payment failed');
  };

  const handleCheckoutSuccess = async () => {
    console.log('Checkout session created successfully');
    // The CheckoutButton component will handle the redirect
    // When user returns from Stripe, we need to check the payment status
    // This will be handled by URL parameters in the main app
  };

  const handleCheckoutError = (error) => {
    console.error('Checkout failed:', error);
    setPaymentError(error.message || 'Checkout failed');
  };

  const isFormValid = () => {
    const requiredFields = ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'country'];
    if (!formData.sameAsBilling) {
      requiredFields.push('billingAddress', 'billingCity', 'billingState', 'billingZipCode', 'billingCountry');
    }
    return requiredFields.every(field => formData[field].trim()) && /\S+@\S+\.\S+/.test(formData.email);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setOrderDetails(null);
    setOrderId(null);
    setOrderCreated(false);
    setClientSecret('');
    setPaymentError('');
    // Clear form data
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      billingAddress: '',
      billingCity: '',
      billingState: '',
      billingZipCode: '',
      billingCountry: '',
      sameAsBilling: true
    });
    // Close cart and clear cart items
    if (onClearCart) {
      onClearCart();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay">
      <div className="cart-sidebar">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="win98-button win98-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="cart-content">
          <div className="cart-items-section">
            {cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.image} alt={item.name} className="cart-item-image" />
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <p className="cart-item-price">${item.price}</p>
                        <div className="quantity-controls">
                          <button 
                            className="win98-button win98-quantity-btn"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button 
                            className="win98-button win98-quantity-btn"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (item.stockQuantity || 999)}
                            style={{
                              display: item.stockQuantity === 1 ? 'none' : 'inline-block'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="cart-item-total">
                        <p>${(item.price * item.quantity).toFixed(2)}</p>
                        <button 
                          className="win98-button"
                          onClick={() => onRemoveItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="cart-total">
                  <h3>Total: ${calculateTotal().toFixed(2)}</h3>
                </div>
              </>
            )}
          </div>

          {cart.length > 0 && (
            <div className="checkout-section">
              <h3>Checkout Information</h3>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`win98-input ${errors.email ? 'error' : ''}`}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`win98-input ${errors.firstName ? 'error' : ''}`}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`win98-input ${errors.lastName ? 'error' : ''}`}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  className={`win98-input ${errors.phone ? 'error' : ''}`}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <h4>Shipping Address</h4>
              
              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`win98-input ${errors.address ? 'error' : ''}`}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`win98-input ${errors.city ? 'error' : ''}`}
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`win98-input ${errors.state ? 'error' : ''}`}
                  />
                  {errors.state && <span className="error-message">{errors.state}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Zip Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`win98-input ${errors.zipCode ? 'error' : ''}`}
                  />
                  {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                </div>
                <div className="form-group">
                  <label>Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`win98-input ${errors.country ? 'error' : ''}`}
                  />
                  {errors.country && <span className="error-message">{errors.country}</span>}
                </div>
              </div>

              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="sameAsBilling"
                    checked={formData.sameAsBilling}
                    onChange={handleInputChange}
                    className="win98-checkbox"
                  />
                  Billing address is the same as shipping address
                </label>
              </div>

              {!formData.sameAsBilling && (
                <>
                  <h4>Billing Address</h4>
                  
                  <div className="form-group">
                    <label>Billing Address *</label>
                    <input
                      type="text"
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                      className={`win98-input ${errors.billingAddress ? 'error' : ''}`}
                    />
                    {errors.billingAddress && <span className="error-message">{errors.billingAddress}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Billing City *</label>
                      <input
                        type="text"
                        name="billingCity"
                        value={formData.billingCity}
                        onChange={handleInputChange}
                        className={`win98-input ${errors.billingCity ? 'error' : ''}`}
                      />
                      {errors.billingCity && <span className="error-message">{errors.billingCity}</span>}
                    </div>
                    <div className="form-group">
                      <label>Billing State *</label>
                      <input
                        type="text"
                        name="billingState"
                        value={formData.billingState}
                        onChange={handleInputChange}
                        className={`win98-input ${errors.billingState ? 'error' : ''}`}
                      />
                      {errors.billingState && <span className="error-message">{errors.billingState}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Billing Zip Code *</label>
                      <input
                        type="text"
                        name="billingZipCode"
                        value={formData.billingZipCode}
                        onChange={handleInputChange}
                        className={`win98-input ${errors.billingZipCode ? 'error' : ''}`}
                      />
                      {errors.billingZipCode && <span className="error-message">{errors.billingZipCode}</span>}
                    </div>
                    <div className="form-group">
                      <label>Billing Country *</label>
                      <input
                        type="text"
                        name="billingCountry"
                        value={formData.billingCountry}
                        onChange={handleInputChange}
                        className={`win98-input ${errors.billingCountry ? 'error' : ''}`}
                      />
                      {errors.billingCountry && <span className="error-message">{errors.billingCountry}</span>}
                    </div>
                  </div>
                </>
              )}

              {paymentError && (
                <div className="payment-error">
                  {paymentError}
                </div>
              )}

              {paymentStep === 'form' && (
                <button 
                  className={`win98-button win98-button-primary win98-button-large ${isFormValid() ? 'enabled' : 'disabled'}`}
                  onClick={handleCheckout}
                  disabled={!isFormValid()}
                >
                  Continue to Payment
                </button>
              )}

              {paymentStep === 'processing' && (
                <div className="processing-message">
                  <div className="spinner"></div>
                  <p>Creating your order...</p>
                </div>
              )}

              {paymentStep === 'payment' && stripePromise && (
                <div className="payment-options">
                  <h4>Choose Payment Method</h4>
                  
                  {/* Stripe Checkout Option */}
                  <CheckoutButton
                    orderId={orderId}
                    onCheckoutSuccess={handleCheckoutSuccess}
                    onCheckoutError={handleCheckoutError}
                  />

                  <div className="payment-divider">
                    <span>or</span>
                  </div>

                  {/* Card Payment Option */}
                  <button 
                    className="win98-button win98-button-success win98-button-large"
                    onClick={handlePaymentIntentCheckout}
                    disabled={!!clientSecret}
                  >
                    Pay with Card
                  </button>

                  {clientSecret && (
                    <Elements stripe={stripePromise}>
                      <PaymentForm
                        clientSecret={clientSecret}
                        orderId={orderId}
                        amount={calculateTotal()}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                      />
                    </Elements>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        orderDetails={orderDetails}
      />
    </div>
  );
});

Cart.displayName = 'Cart';

export default Cart;