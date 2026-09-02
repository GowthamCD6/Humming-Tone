import React, { useState, useEffect } from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import ProductGridSkeleton from '../../../components/ProductSkeleton/ProductSkeleton';
import ProductCard from '../../../components/ProductCard/ProductCard';
import './Mens.css';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../../utils/apiConfig';

const Men = ({ onViewDetails: _onViewDetails = () => {} }) => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from the API for Men's category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `${API_BASE_URL}/user/fetch_products?gender=men`;
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

  return (
    <div className="mens-collection-page">
      {/* Products Section - Conditional Rendering */}
      {loading ? (
        <div className="mens-products-section">
          <div className="mens-section-intro">
            <h2 className="mens-section-heading">
              {selectedCategory ? `Men's ${selectedCategory}` : "Men's Collection"}
            </h2>
            <div className="mens-heading-accent"></div>
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      ) : products.length > 0 ? (
        <div className="mens-products-section">
          <div className="mens-section-intro">
            <h2 className="mens-section-heading">
              {selectedCategory ? `Men's ${selectedCategory}` : "Men's Collection"}
            </h2>
            <div className="mens-heading-accent"></div>
          </div>
          
          <div className="luxury-editorial-grid mens-product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} fallbackCategory="MEN'S COLLECTION" />
            ))}
          </div>
        </div>
      ) : (
        <div className="mens-no-products-container">
          <h2 className="mens-no-products-title">No Products Found</h2>
          <p className="mens-no-products-text">
            {selectedCategory ? (
              <>No products found in <strong>"{selectedCategory}"</strong>.<br />Try viewing the entire collection.</>
            ) : (
              <>Try adjusting your filters or browse our complete<br />collection.</>
            )}
          </p>
          <Link className="mens-view-all-button" to="/usertab/men">VIEW ALL MEN'S PRODUCTS</Link>
        </div>
      )}
      
      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default Men;
