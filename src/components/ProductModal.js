import React, { useState, useEffect } from 'react';
import './ProductModal.css';
import '../styles/windows98.css';

const ProductModal = ({ product, quantity: initialQuantity, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(initialQuantity || 1);

  useEffect(() => {
    setQuantity(initialQuantity || 1);
  }, [initialQuantity, product]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const maxQuantity = product.stockQuantity || 999;
    setQuantity(Math.max(1, Math.min(value, maxQuantity)));
  };

  const increaseQuantity = () => {
    if (quantity < (product.stockQuantity || 999)) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="retro-button retro-close-button" onClick={onClose}>×</button>
        
        <div className="modal-product">
          <div className="modal-image-container">
            <img 
              src={product.image} 
              alt={product.name}
              className="modal-image"
            />
          </div>
          
          <div className="modal-details">
            <div className="modal-info">
              <h2 className="modal-product-name">{product.name}</h2>
              <p className="modal-product-price">${product.price}</p>
              <p className="modal-product-category">{product.category}</p>
              {product.description && (
                <p className="modal-product-description">{product.description}</p>
              )}
              {product.stockQuantity && (
                <p className="modal-stock-info">
                  {product.stockQuantity === 1 ? (
                    <span className="stock-low">Last one available!</span>
                  ) : product.stockQuantity <= 5 ? (
                    <span className="stock-low">Only {product.stockQuantity} left in stock</span>
                  ) : (
                    <span className="stock-available">{product.stockQuantity} in stock</span>
                  )}
                </p>
              )}
            </div>
            
            <div className="modal-actions">
              <div className="modal-quantity-controls">
                <span className="quantity-label">Quantity:</span>
                <div className="quantity-selector">
                  <button 
                    className="retro-button retro-quantity-btn" 
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={handleQuantityChange}
                    className="retro-input retro-quantity-input"
                    min="1"
                    max={product.stockQuantity || 999}
                  />
                  <button 
                    className="retro-button retro-quantity-btn" 
                    onClick={increaseQuantity}
                    disabled={quantity >= (product.stockQuantity || 999)}
                    style={{
                      display: product.stockQuantity === 1 ? 'none' : 'block'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <button className="retro-button retro-button-primary retro-button-large" onClick={handleAddToCart}>
                ADD TO CART - ${(product.price * quantity).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;