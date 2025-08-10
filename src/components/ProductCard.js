import React, { useState } from 'react';
import './ProductCard.css';
import '../styles/windows98.css';

const ProductCard = ({ product, onProductClick }) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (e) => {
    e.stopPropagation();
    const value = parseInt(e.target.value) || 1;
    const maxQuantity = product.stockQuantity || 999;
    setQuantity(Math.max(1, Math.min(value, maxQuantity)));
  };

  const increaseQuantity = (e) => {
    e.stopPropagation();
    if (quantity < (product.stockQuantity || 999)) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = (e) => {
    e.stopPropagation();
    setQuantity(prev => Math.max(1, prev - 1));
  };

  // Check if product is sold out
  const isSoldOut = product.stockQuantity === 0;
  const isLimitedStock = product.stockQuantity === 1;

  return (
    <div className={`product-card ${isSoldOut ? 'sold-out' : ''}`} onClick={() => !isSoldOut && onProductClick(product, quantity)}>
      <div className="product-image-container">
        <img 
          src={product.image} 
          alt={product.name}
          className="product-image"
        />
        {isSoldOut && (
          <div className="sold-out-banner">
            <span>SOLD OUT</span>
          </div>
        )}
      </div>
      <div className="product-details">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">${product.price}</p>
        {product.description && (
          <p className="product-description">{product.description}</p>
        )}
        
        {isSoldOut ? (
          <div className="sold-out-message">
            <span>Currently unavailable</span>
          </div>
        ) : isLimitedStock ? (
          <div className="add-to-cart-only" onClick={(e) => e.stopPropagation()}>
            <button 
              className="retro-button retro-button-primary"
              onClick={() => onProductClick(product, 1)}
            >
              ADD TO CART - ${product.price}
            </button>
          </div>
        ) : (
          <div className="quantity-controls" onClick={(e) => e.stopPropagation()}>
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
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;