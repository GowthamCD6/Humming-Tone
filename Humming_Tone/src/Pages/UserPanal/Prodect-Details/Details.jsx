import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import AddToCartModal from './Product-Buying modal/AddToCartModal';
import './Details.css';

const ProductDetailPage = () => {
  const { id } = useParams();

  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [sizes, setSizes] = useState([]);

  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const [isInCart, setIsInCart] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartModalData, setCartModalData] = useState(null);

  /* ================= CART HELPERS ================= */
  const getCart = () => {
    return JSON.parse(localStorage.getItem('cart')) || [];
  };

  const checkIfInCart = (size) => {
    const cart = getCart();
    return cart.some(
      item => item.id === product.id && item.size === size
    );
  };

  const addToCart = () => {
    if (!selectedSize) return;

    const variant = sizes.find(v => v.size === selectedSize);

    const cartItem = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: variant.price,
      quantity,
      size: selectedSize,
      color: product.color || 'Default',
      stock: variant.stock_quantity,
      image: productImages[0] || demoImage
    };

    const cart = getCart();
    cart.push(cartItem);

    localStorage.setItem('cart', JSON.stringify(cart));
    setIsInCart(true);

    // Show the modal with product data
    setCartModalData({
      name: product.name,
      size: selectedSize,
      quantity: quantity,
      price: variant.price,
      image: productImages[0] || demoImage
    });
    setShowCartModal(true);
  };

  const removeFromCart = () => {
    const cart = getCart().filter(
      item => !(item.id === product.id && item.size === selectedSize)
    );

    localStorage.setItem('cart', JSON.stringify(cart));
    setIsInCart(false);
  };

  /* ================= PRODUCT DETAILS ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/admin/fetch_variants/${id}`
        );
        const data = await res.json();

        setProduct(data);

        if (data.images?.length) {
          const sortedImages = [...data.images].sort(
            (a, b) => b.is_primary - a.is_primary
          );
          setProductImages(
            sortedImages.map(img => `http://localhost:5000/${img.image_path}`)
          );
        }

        if (data.variants) {
          setSizes(data.variants);
        }

        fetchRecommendations(data.category_id);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProduct();
  }, [id]);

  /* ================= CHECK CART ON SIZE CHANGE ================= */
  useEffect(() => {
    if (product && selectedSize) {
      setIsInCart(checkIfInCart(selectedSize));
    }
  }, [selectedSize, product]);

  /* ================= RECOMMENDATIONS ================= */
  const fetchRecommendations = async (categoryId) => {
    try {
      const res = await fetch(
        'http://localhost:5000/user/fetch_recommendations?page=1&limit=3',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ category_id: categoryId })
        }
      );

      const data = await res.json();
      setRecommendedProducts(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (!product) return null;

  return (
    <div className="userpanal-product-details-page">
      <div className="container">
        <div className="product-detail-layout">

          {/* LEFT */}
          <div className="product-gallery-container">
            <div className="sticky-wrapper">
              <div className="product-main-image">
                <img
                  src={productImages[activeImageIndex] || demoImage}
                  alt={product.name}
                />
              </div>

              <div className="thumbnail-gallery">
                {productImages.map((src, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={src} alt="thumb" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="product-info-container">
            <h1 className="product-title">{product.name}</h1>

            <div className="price-section">
              <div className="dynamic-price">
                ₹{sizes.find(s => s.size === selectedSize)?.price || sizes[0]?.price}
              </div>
              <div className="original-price">
                Original: ₹{sizes.find(s => s.size === selectedSize)?.original_price || sizes[0]?.original_price}
              </div>
            </div>

            <div className="meta-grid">
              <div className="meta-item"><span className="label">SKU</span><span>{product.sku}</span></div>
              <div className="meta-item"><span className="label">BRAND</span><span>{product.brand}</span></div>
              <div className="meta-item"><span className="label">CATEGORY</span><span>{product.category_name}</span></div>
              <div className="meta-item"><span className="label">GENDER</span><span>{product.gender}</span></div>
              <div className="meta-item full-width"><span className="label">SUBCATEGORY</span><span>{product.subcategory}</span></div>
            </div>

            <div className="selection-section">
              <h3 className="sub-title">Select Size</h3>
              <div className="size-options">
                {sizes.map(v => (
                  <button
                    key={v.size}
                    className={`size-btn ${selectedSize === v.size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(v.size)}
                  >
                    <span>{v.size}</span>
                    <span className="stock-tag">
                      {v.stock_quantity > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="selection-section">
              <h3 className="sub-title">Quantity</h3>
              <div className="quantity-ctrl">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input readOnly value={quantity} />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <button
              className={`cart-submit-btn ${selectedSize ? 'enabled' : ''}`}
              onClick={isInCart ? removeFromCart : addToCart}
              disabled={!selectedSize}
            >
              {!selectedSize
                ? 'SELECT SIZE TO ADD TO CART'
                : isInCart
                ? 'REMOVE FROM CART'
                : 'ADD TO CART'}
            </button>

            <div className="description-box">
              <h3 className="sub-title">About this item</h3>
              <p>{product.about}</p>
            </div>

            <div className="care-box">
              <h3 className="sub-title">Care Instructions</h3>
              <p>{product.care_instructions}</p>
            </div>
          </div>
        </div>

        {/* ================= YOU MAY ALSO LIKE ================= */}
        <section className="related-section">
          <h2 className="related-heading">You May Also Like</h2>
          <div className="related-divider"></div>

          <div className="related-grid">
            {recommendedProducts.map(item => (
              <div className="related-card" key={item.id}>
                <div className="related-product-image-container">
                  <img
                    src={`http://localhost:5000/${item.image_path}`}
                    alt={item.name}
                  />
                  <div className="related-product-hover-overlay">
                    <button className="related-view-details-btn">
                      VIEW DETAILS
                    </button>
                  </div>
                </div>
                <div className="related-product-details">
                  <h3>{item.name}</h3>
                  <p>{item.brand}</p>
                  <p>₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="view-more-products">
            VIEW MORE ALL-PRODUCTS
          </button>
        </section>
      </div>

      <UserFooter />

      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        productData={cartModalData}
      />
    </div>
  );
};

export default ProductDetailPage;
