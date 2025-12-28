import React, { useState, useEffect } from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import demoImage from '../../../assets/demo.jpeg';
import './Details.css';

const  ProductDetail = ({ product: selectedProduct }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showCartPopup, setShowCartPopup] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const baseProduct = {
    name: 'stitch set',
    price: 400.00,
    originalPrice: 1200.00,
    sku: 'STICA1272',
    brand: 'Care and dare',
    category: 'Winter sets',
    gender: 'Baby',
    color: 'Blue',
    description: 'The two-tone navy and blue sweatshirt features a cheerful graphic of Stitch, complete with contrast white sleeves for extra flair. Paired with matching navy joggers that have fun blue paneling and a small Stitch detail, this cozy outfit is perfect for your little experiment\'s next adventure. And this set is the ultimate comfort!',
    images: [
      demoImage,
      demoImage,
      demoImage,
      demoImage
    ],
    sizes: [
      { size: '24-36 months', stock: 'IN STOCK', available: true },
      { size: '3-6 months', stock: 'IN STOCK', available: true },
      { size: '9-12 months', stock: 'IN STOCK', available: true }
    ]
  };

  const relatedProducts = [
    {
      id: 1,
      name: 'Bear set',
      price: 400.00,
      brand: 'Care and dare',
      image: '/api/placeholder/400/500'
    },
    {
      id: 2,
      name: 'Mickey hoodie set',
      price: 450.00,
      brand: 'Care and dare',
      image: '/api/placeholder/400/500'
    },
    {
      id: 3,
      name: 'Blue set',
      price: 400.00,
      brand: 'Care and dare',
      image: '/api/placeholder/400/500'
    }
  ];

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (selectedSize) {
      setShowCartPopup(true);
    }
  };

  const closePopup = () => {
    setShowCartPopup(false);
  };

  const mainImage = selectedProduct && selectedProduct.image
    ? (selectedProduct.image === 'demo' ? demoImage : selectedProduct.image)
    : baseProduct.images[0];

  const product = {
    ...baseProduct,
    ...(selectedProduct || {}),
    images: [mainImage, mainImage, mainImage, mainImage],
  };

  return (
    <div className="product-detail-container">
      {/* Product Detail Section */}
      <div className="product-detail">
        {/* Product Gallery */}
        <div className="product-gallery">
          <div className="product-main-image">
            <img src={product.images[selectedImage]} alt={product.name} />
          </div>
          
          {/* Thumbnail Gallery */}
          <div className="thumbnail-gallery">
            {product.images.map((img, index) => (
              <div
                key={index}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img src={img} alt={`Thumbnail ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>

          {/* Price Section */}
          <div className="product-price-section">
            <div className="dynamic-price">₹{product.price.toFixed(2)}</div>
            <div className="original-price">Original: ₹{product.originalPrice.toFixed(2)}</div>
          </div>

          {/* Product Meta Grid */}
          <div className="product-meta-grid">
            <div className="meta-item">
              <div className="meta-label">SKU</div>
              <div className="meta-value">{product.sku}</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">BRAND</div>
              <div className="meta-value">{product.brand}</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">CATEGORY</div>
              <div className="meta-value">{product.category}</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">GENDER</div>
              <div className="meta-value">{product.gender}</div>
            </div>
          </div>

          {/* Size Selection */}
          <div className="variant-selection">
            <h3 className="section-title">Select Size</h3>
            <div className="variant-options">
              {product.sizes.map((item, index) => (
                <div
                  key={index}
                  className={`variant-option ${selectedSize === item.size ? 'selected' : ''} ${!item.available ? 'out-of-stock' : ''}`}
                  onClick={() => item.available && setSelectedSize(item.size)}
                >
                  <div className="variant-size">{item.size}</div>
                  <div className="variant-stock">{item.stock}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity Section */}
          <div className="quantity-section">
            <h3 className="section-title">Quantity</h3>
            <div className="quantity-selector">
              <button
                className="quantity-btn"
                onClick={() => handleQuantityChange('decrease')}
                disabled={quantity <= 1}
              >
                −
              </button>
              <input
                type="number"
                className="quantity-input"
                value={quantity}
                readOnly
              />
              <button
                className="quantity-btn"
                onClick={() => handleQuantityChange('increase')}
              >
                +
              </button>
            </div>
            {!selectedSize && (
              <div className="stock-info">SELECT A SIZE TO SEE AVAILABILITY</div>
            )}
          </div>

          {/* Add to Cart Button */}
          <div className="add-to-cart-section">
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={!selectedSize}
            >
              {selectedSize ? 'ADD TO CART' : 'SELECT SIZE TO ADD TO CART'}
            </button>
          </div>

          {/* About This Item */}
          <div className="product-description">
            <h3>About this item</h3>
            <div className="description-content">
              <p>{product.description}</p>
            </div>
          </div>

          {/* Product Details */}
          <div className="additional-details">
            <h3 className="section-title">Product Details</h3>
            <div className="detail-grid">
              <div className="meta-item">
                <div className="meta-label">COLOR</div>
                <div className="meta-value">{product.color}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="related-products">
        <h2 className="section-title">You May Also Like</h2>
        <div className="related-grid">
          {relatedProducts.map((item) => (
            <div key={item.id} className="related-product-card">
              <div className="related-product-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="related-product-info">
                <h3 className="related-product-name">{item.name}</h3>
                <div className="related-product-price">₹{item.price.toFixed(2)}</div>
                <div className="meta-value">{item.brand}</div>
                <button className="popup-btn">VIEW DETAILS</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button className="popup-btn primary">VIEW MORE BABY PRODUCTS</button>
        </div>
      </div>

      {/* Cart Popup */}
      {showCartPopup && (
        <>
          <div className="overlay" onClick={closePopup}></div>
          <div className="cart-popup">
            <h3>Added to Cart!</h3>
            <p>Your item has been successfully added to the cart.</p>
            <div className="popup-product-info">
              <div className="popup-product-image">
                <img src={product.images[0]} alt={product.name} />
              </div>
              <div className="popup-product-details">
                <div className="popup-product-name">{product.name}</div>
                <div>Size: {selectedSize}</div>
                <div>Quantity: {quantity}</div>
                <div>Price: ₹{(product.price * quantity).toFixed(2)}</div>
              </div>
            </div>
            <div className="popup-actions">
              <button className="popup-btn" onClick={closePopup}>
                CONTINUE SHOPPING
              </button>
              <button className="popup-btn primary">
                GO TO CART
              </button>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default ProductDetail;