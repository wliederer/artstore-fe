import React from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

const ProductGrid = ({ products, onProductClick }) => {
  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onProductClick={onProductClick}
        />
      ))}
    </div>
  );
};

export default ProductGrid;