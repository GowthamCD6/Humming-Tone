import React, { useState, useEffect } from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import ProductGridSkeleton from '../../../components/ProductSkeleton/ProductSkeleton';
import './Children\'s.css';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../../utils/apiConfig';

const Children = ({ onViewDetails: _onViewDetails = () => {} }) => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from the API for Children's category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `${API_BASE_URL}/user/fetch_products?gender=children`;
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
    <div className="childrens-product-card">
      <div className="childrens-product-image-container">
        <img 
          src={product.image} 
          alt={product.name} 
          className="childrens-product-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.opacity = '0.5';
          }}
        />
        <div className="childrens-product-hover-overlay">
          <Link  className="childrens-view-details-btn" to={`/usertab/details/${product.id}`}>VIEW DETAILS</Link>
        </div>
      </div>
      <div className="childrens-product-details">
        <h3 className="childrens-product-title">{product.name}</h3>
        <p className="childrens-product-brand">{product.brand || 'HummingTone'}</p>
        <p className="childrens-product-price">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <div className="childrens-collection-page">
      {/* Products Section - Conditional Rendering */}
      {loading ? (
        <div className="childrens-products-section">
          <div className="childrens-section-intro">
            <h2 className="childrens-section-heading">
              {selectedCategory ? `Children's ${selectedCategory}` : "Children's Collection"}
            </h2>
            <div className="childrens-heading-accent"></div>
          </div>
          <ProductGridSkeleton count={6} />
        </div>
      ) : products.length > 0 ? (
        <div className="childrens-products-section">
          <div className="childrens-section-intro">
            <h2 className="childrens-section-heading">
              {selectedCategory ? `Children's ${selectedCategory}` : "Children's Collection"}
            </h2>
            <div className="childrens-heading-accent"></div>
          </div>
          
          <div className="childrens-product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="childrens-no-products-container">
          <h2 className="childrens-no-products-title">No Products Found</h2>
          <p className="childrens-no-products-text">
            {selectedCategory ? (
              <>No products found in <strong>"{selectedCategory}"</strong>.<br />Try viewing the entire collection.</>
            ) : (
              <>Try adjusting your filters or browse our complete<br />collection.</>
            )}
          </p>
          <Link className="childrens-view-all-button" to="/usertab/children">VIEW ALL CHILDREN'S PRODUCTS</Link>
        </div>
      )}
      
      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default Children;
