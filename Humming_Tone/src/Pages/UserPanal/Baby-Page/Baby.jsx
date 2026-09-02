import React, { useState, useEffect } from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import ProductGridSkeleton from '../../../components/ProductSkeleton/ProductSkeleton';
import ProductCard from '../../../components/ProductCard/ProductCard';
import './Baby.css';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../../utils/apiConfig';

const Baby = ({ onViewDetails: _onViewDetails = () => {} }) => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from the API for Baby category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `${API_BASE_URL}/user/fetch_products?gender=baby`;
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
    <div className="baby-collection-page">
      {/* Products Section - Conditional Rendering */}
      {loading ? (
        <div className="baby-products-section">
          <div className="baby-section-intro">
            <h2 className="baby-section-heading">
              {selectedCategory ? `Baby's ${selectedCategory}` : "Baby Collection"}
            </h2>
            <div className="baby-heading-accent"></div>
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      ) : products.length > 0 ? (
        <div className="baby-products-section">
          <div className="baby-section-intro">
            <h2 className="baby-section-heading">
              {selectedCategory ? `Baby's ${selectedCategory}` : "Baby Collection"}
            </h2>
            <div className="baby-heading-accent"></div>
          </div>
          
          <div className="luxury-editorial-grid baby-product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} fallbackCategory="BABY & TODDLERS" />
            ))}
          </div>
        </div>
      ) : (
        <div className="baby-no-products-container">
          <h2 className="baby-no-products-title">No Products Found</h2>
          <p className="baby-no-products-text">
            {selectedCategory ? (
              <>No products found in <strong>"{selectedCategory}"</strong>.<br />Try viewing the entire collection.</>
            ) : (
              <>Try adjusting your filters or browse our complete<br />collection.</>
            )}
          </p>
          <Link className="baby-view-all-button" to="/usertab/baby">VIEW ALL BABY PRODUCTS</Link>
        </div>
      )}
      
      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default Baby;
