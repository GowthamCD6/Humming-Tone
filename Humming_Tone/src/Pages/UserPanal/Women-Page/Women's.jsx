import React, { useState, useEffect } from 'react';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import ProductGridSkeleton from '../../../components/ProductSkeleton/ProductSkeleton';
import './Women.css';
import { getGenderOptions } from '../../../utils/siteContentStore';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../../utils/apiConfig';

const Women = ({ onViewDetails: _onViewDetails = () => {} }) => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from the API for Women's category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `${API_BASE_URL}/user/fetch_products?gender=women`;
        if (selectedCategory) {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }
        const response = await axios.get(url);

        const fetchedProducts = response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),
          image: getImageUrl(product.image_path)
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

  const ProductCard = ({ product }) => (
    <div className="women-product-card">
      <div className="women-product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="women-product-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.opacity = '0.5';
          }}
        />
        <div className="women-product-hover-overlay">
          <Link
            className="women-view-details-btn"
            to={`/usertab/details/${product.id}`}
          >
            VIEW DETAILS
          </Link>
        </div>
      </div>
      <div className="women-product-details">
        <h3 className="women-product-title">{product.name}</h3>
        <p className="women-product-brand">{product.brand || 'HummingTone'}</p>
        <p className="women-product-price">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <div className="women-collection-page">
      {/* Products Section - Conditional Rendering */}
      {loading ? (
        <div className="women-products-section">
          <div className="women-section-intro">
            <h2 className="women-section-heading">
              {selectedCategory ? `Women's ${selectedCategory}` : "Women's Collection"}
            </h2>
            <div className="women-heading-accent"></div>
          </div>
          <ProductGridSkeleton count={6} />
        </div>
      ) : products.length > 0 ? (
        <div className="women-products-section">
          <div className="women-section-intro">
            <h2 className="women-section-heading">
              {selectedCategory ? `Women's ${selectedCategory}` : "Women's Collection"}
            </h2>
            <div className="women-heading-accent"></div>
          </div>

          <div className="women-product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="women-no-products-container">
          <h2 className="women-no-products-title">No Products Found</h2>
          <p className="women-no-products-text">
            {selectedCategory ? (
              <>No products found in <strong>"{selectedCategory}"</strong>.<br />Try viewing the entire collection.</>
            ) : (
              <>Try adjusting your filters or browse our complete<br />collection.</>
            )}
          </p>
          <Link className="women-view-all-button" to="/usertab/women">VIEW ALL WOMEN'S PRODUCTS</Link>
        </div>
      )}

      <UserFooter />
    </div>
  );
};

export default Women;