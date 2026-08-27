import React, { useState, useEffect } from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import ProductGridSkeleton from '../../../components/ProductSkeleton/ProductSkeleton';
import './Sports.css';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../../utils/apiConfig';

const Sports = ({ onViewDetails: _onViewDetails = () => {} }) => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from the API for Sports category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `${API_BASE_URL}/user/fetch_products?gender=sports`;
        if (selectedCategory) {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }
        const response = await axios.get(url);
        const fetchedProducts = response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),
          image: getImageUrl(product.image_path),
        }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="sports-product-card">
      <div className="sports-product-image-container">
        <img 
          src={product.image} 
          alt={product.name} 
          className="sports-product-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.opacity = '0.5';
          }}
        />
        <div className="sports-product-hover-overlay">
          <Link  className="sports-view-details-btn" to={`/usertab/details/${product.id}`}>VIEW DETAILS</Link>
        </div>
      </div>
      <div className="sports-product-details">
        <h3 className="sports-product-title">{product.name}</h3>
        <p className="sports-product-brand">{product.brand || 'HummingTone'}</p>
        <p className="sports-product-price">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <div className="sports-collection-page">
      {/* Products Section - Conditional Rendering */}
      {loading ? (
        <div className="sports-products-section">
          <div className="sports-section-intro">
            <h2 className="sports-section-heading">
              {selectedCategory ? `Sports ${selectedCategory}` : "Sports Collection"}
            </h2>
            <div className="sports-heading-accent"></div>
          </div>
          <ProductGridSkeleton count={6} />
        </div>
      ) : products.length > 0 ? (
        <div className="sports-products-section">
          <div className="sports-section-intro">
            <h2 className="sports-section-heading">
              {selectedCategory ? `Sports ${selectedCategory}` : "Sports Collection"}
            </h2>
            <div className="sports-heading-accent"></div>
          </div>
          
          <div className="sports-product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="sports-no-products-container">
          <h2 className="sports-no-products-title">No Products Found</h2>
          <p className="sports-no-products-text">
            {selectedCategory ? (
              <>No products found in <strong>"{selectedCategory}"</strong>.<br />Try viewing the entire collection.</>
            ) : (
              <>Try adjusting your filters or browse our complete<br />collection.</>
            )}
          </p>
          <Link className="sports-view-all-button" to="/usertab/sports">VIEW ALL SPORTS PRODUCTS</Link>
        </div>
      )}
      
      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default Sports;
