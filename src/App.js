import React, { useState, useEffect, useRef } from 'react';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import Cart from './components/Cart';
import PaymentSuccessModal from './components/PaymentSuccessModal';
import InstagramIcon from './components/InstagramIcon';
import ColorThemeSwitcher from './components/ColorThemeSwitcher';
import apiService from './services/api';
import './App.css';
import './styles/retro-modern.css';
import './components/InstagramIcon.css';

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrderDetails, setSuccessOrderDetails] = useState(null);
  const cartRef = useRef();

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const productsData = await apiService.getProducts();
      setProducts(productsData);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products from API on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle URL parameters for Stripe checkout return
  useEffect(() => {
    const handleStripeReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      const orderId = urlParams.get('order_id');
      const success = urlParams.get('success');
      const canceled = urlParams.get('canceled');

      if (success === 'true' && orderId) {
        // Payment was successful
        console.log('Payment successful, order ID:', orderId);
        console.log('cartRef.current:', cartRef.current);
        
        // Clear cart and refresh products
        setCart([]);
        await fetchProducts();
        
        // Show success modal directly
        try {
          console.log('Fetching order details for success modal...');
          const orderData = await apiService.getOrder(orderId);
          console.log('Order data received:', orderData);
          setSuccessOrderDetails(orderData);
          setShowSuccessModal(true);
          console.log('Success modal should now be visible');
        } catch (error) {
          console.error('Failed to fetch order details:', error);
          // Show success modal anyway with basic info
          setSuccessOrderDetails({ 
            orderId: orderId, 
            totalAmount: 0,
            email: 'Unknown',
            firstName: 'Customer',
            lastName: '',
            createdAt: new Date().toISOString()
          });
          setShowSuccessModal(true);
          console.log('Fallback success modal should now be visible');
        }
        
        // Clean up URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } else if (canceled === 'true') {
        // Payment was canceled
        console.log('Payment canceled');
        
        // Clean up URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    };

    handleStripeReturn();
  }, []);

  const handleProductClick = (product, quantity) => {
    setSelectedProduct(product);
    setSelectedQuantity(quantity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setSelectedQuantity(1);
  };

  const handleAddToCart = (product, quantity) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        const newQuantity = Math.min(
          existingItem.quantity + quantity, 
          product.stockQuantity || 999
        );
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === productId) {
          const maxQuantity = item.stockQuantity || 999;
          const validQuantity = Math.min(newQuantity, maxQuantity);
          return { ...item, quantity: validQuantity };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleCartClose = () => {
    setIsCartOpen(false);
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessOrderDetails(null);
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="App">
      <header className="header">
        <div className="header-left">
          <h1 className="store-title">Free Sticker dot org</h1>
          <div className="header-social">
            <ColorThemeSwitcher className="header-theme-switcher" />
            <InstagramIcon 
              size={28} 
              href="https://instagram.com/total_willcall" 
              className="header-instagram"
            />
          </div>
        </div>
        {cartItemCount > 0 && (
          <div className="cart-indicator" onClick={handleCartClick}>
            <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="m1 1 4 4 2.68 13.39a1 1 0 0 0 1 .61h9.72a1 1 0 0 0 1-.61L23 6H6"></path>
            </svg>
            {cartItemCount}
          </div>
        )}
      </header>
      <main className="main-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-message">
              <h2>Oops! Something went wrong</h2>
              <p>{error}</p>
              <button 
                className="retro-button retro-button-primary"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-container">
            <h2>No products available</h2>
            <p>Check back later for new arrivals!</p>
          </div>
        ) : (
          <ProductGrid 
            products={products} 
            onProductClick={handleProductClick}
          />
        )}
      </main>
      
      <ProductModal
        product={selectedProduct}
        quantity={selectedQuantity}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
      />
      
      <Cart
        ref={cartRef}
        cart={cart}
        isOpen={isCartOpen}
        onClose={handleCartClose}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onRefreshProducts={fetchProducts}
      />
      
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        orderDetails={successOrderDetails}
      />
    </div>
  );
}

export default App;
