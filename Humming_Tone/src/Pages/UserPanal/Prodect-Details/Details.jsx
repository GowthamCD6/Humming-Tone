import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SITE_ASSETS } from "../../../utils/siteAssets";
import UserFooter from "../../../components/User-Footer-Card/UserFooter";

const demoImage = SITE_ASSETS.demoProduct;
import AddToCartModal from "./Product-Buying modal/AddToCartModal";
import ProductReviews from "./ReviewsSection/ProductReviews";
import AuthModal from "../../../components/AuthModal/AuthModal";
import ProductCard from "../../../components/ProductCard/ProductCard";
import "./Details.css";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, getImageUrl } from "../../../utils/apiConfig";
import { fetchSiteContent, getSiteContent } from "../../../utils/siteContentStore";
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [gstRate, setGstRate] = useState(() => {
    const cached = getSiteContent();
    return Number(cached?.gstRate != null ? cached.gstRate : (cached?.footer?.gstRate || 5));
  });

  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [sizes, setSizes] = useState([]);

  useEffect(() => {
    fetchSiteContent().then((data) => {
      if (data) {
        setGstRate(Number(data.gstRate != null ? data.gstRate : (data.footer?.gstRate || 5)));
      }
    }).catch(() => {});
  }, []);

  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const [isInCart, setIsInCart] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartModalData, setCartModalData] = useState(null);

  /* ================= CART HELPERS ================= */
  const getCart = () => {
    return JSON.parse(localStorage.getItem("cart")) || [];
  };

  const _checkIfInCart = (size) => {
    const cart = getCart();
    return cart.some((item) => item.id === product.id && item.size === size);
  };

  const addToCart = () => {
    if (!selectedSize) return;

    const variant = sizes.find((v) => v.size === selectedSize);

    const cartItem = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: variant.price,
      quantity,
      size: selectedSize,
      color: product.color || "Default",
      stock: variant.stock_quantity,
      image: productImages[0] || getImageUrl(product.image_path),
    };

    const cart = getCart();
    cart.push(cartItem);

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart:updated"));
    setIsInCart(true);

    // Show the modal with product data
    setCartModalData({
      name: product.name,
      size: selectedSize,
      quantity: quantity,
      price: variant.price,
      image: productImages[0] || getImageUrl(product.image_path),
    });
    setShowCartModal(true);
  };

  const removeFromCart = () => {
    const cart = getCart().filter(
      (item) => !(item.id === product.id && item.size === selectedSize)
    );

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart:updated"));
    setIsInCart(false);
  };

  const handleBuyNow = () => {
    if (!selectedSize) return;

    const variant = sizes.find((v) => v.size === selectedSize);

    const directItem = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: variant.price,
      quantity,
      size: selectedSize,
      color: product.color || "Default",
      stock: variant.stock_quantity,
      image: productImages[0] || getImageUrl(product.image_path),
    };

    // Ensure item is in the cart
    const cart = getCart();
    const existingIndex = cart.findIndex((item) => item.id === product.id && item.size === selectedSize);
    if (existingIndex > -1) {
      cart[existingIndex].quantity = quantity;
    } else {
      cart.push(directItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart:updated"));

    const user = JSON.parse(localStorage.getItem("customerUser") || "null");
    const token = localStorage.getItem("userToken");

    if (!user || !token || user?.email === 'guest@hummingtone.com') {
      setAuthModalOpen(true);
      return;
    }

    // Navigate straight to checkout
    navigate("/usertab/checkout");
  };

  /* ================= RECOMMENDATIONS ================= */
  const fetchRecommendations = async (categoryId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/user/fetch_recommendations?page=1&limit=3`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category_id: categoryId }),
        }
      );

      const data = await res.json();
      setRecommendedProducts(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FETCH PRODUCT DETAILS ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/user/fetch_products_details/${id}`
        );
        const data = await res.json();

        setProduct(data);

        // Sorting images by display_order
        if (data.images && data.images.length > 0) {
          const sortedImages = data.images.sort(
            (a, b) => a.display_order - b.display_order
          );
          setProductImages(
            sortedImages.map((img) => getImageUrl(img.image_path))
          );
        }

        if (data.variants && data.variants.length > 0) {
          setSizes(data.variants);
          // Default select the first in-stock variant, or first variant available
          const inStockVariant = data.variants.find((v) => Number(v.stock_quantity) > 0) || data.variants[0];
          if (inStockVariant) {
            setSelectedSize(inStockVariant.size);
          }
        }

        if (data.category_id) {
          fetchRecommendations(data.category_id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProduct();
  }, [id]);

  /* ================= CHECK CART ON SIZE CHANGE ================= */
  useEffect(() => {
    if (product && selectedSize) {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const inCart = cart.some((item) => item.id === product.id && item.size === selectedSize);
      requestAnimationFrame(() => setIsInCart(inCart));
    }
  }, [selectedSize, product]);

  if (!product) {
    return (
      <div className="userpanal-product-details-page">
        <div className="container">
          <div className="product-detail-layout">
            <div className="product-gallery-container">
              <div className="skeleton-box skeleton-shimmer" style={{ width: '100%', aspectRatio: '0.85', borderRadius: '4px' }} />
            </div>
            <div className="product-info-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="skeleton-box skeleton-shimmer" style={{ width: '30%', height: '14px' }} />
              <div className="skeleton-box skeleton-shimmer" style={{ width: '80%', height: '32px' }} />
              <div className="skeleton-box skeleton-shimmer" style={{ width: '25%', height: '24px' }} />
              <div className="skeleton-box skeleton-shimmer" style={{ width: '100%', height: '100px', marginTop: '16px' }} />
              <div className="skeleton-box skeleton-shimmer" style={{ width: '100%', height: '50px', marginTop: '24px' }} />
            </div>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

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
                    className={`thumbnail ${
                      idx === activeImageIndex ? "active" : ""
                    }`}
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
              <div className="dynamic-price-row" style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                <div className="dynamic-price">
                  ₹
                  {sizes.find((s) => s.size === selectedSize)?.price ||
                    sizes[0]?.price}
                </div>
                <div className="original-price">
                  Original: ₹
                  {sizes.find((s) => s.size === selectedSize)?.original_price ||
                    sizes[0]?.original_price}
                </div>
              </div>
              <div className="gst-inclusive-tag" style={{ marginTop: '6px', fontSize: '0.88rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✓ Inclusive of all taxes (includes {gstRate}% GST)</span>
              </div>
            </div>

            <div className="product-meta-strip">
              {product.brand && (
                <div className="meta-pill">
                  <span className="meta-pill-label">Brand:</span>
                  <span className="meta-pill-val">{product.brand}</span>
                </div>
              )}
              {product.category_name && (
                <div className="meta-pill">
                  <span className="meta-pill-label">Category:</span>
                  <span className="meta-pill-val">{product.category_name}</span>
                </div>
              )}
              {product.subcategory && (
                <div className="meta-pill">
                  <span className="meta-pill-label">Style:</span>
                  <span className="meta-pill-val">{product.subcategory}</span>
                </div>
              )}
              {product.gender && (
                <div className="meta-pill">
                  <span className="meta-pill-label">Gender:</span>
                  <span className="meta-pill-val">{product.gender}</span>
                </div>
              )}
              {product.sku && (
                <div className="meta-pill sku-pill">
                  <span className="meta-pill-label">SKU:</span>
                  <span className="meta-pill-val">{product.sku}</span>
                </div>
              )}
            </div>

            <div className="selection-section">
              <h3 className="sub-title">Select Size</h3>
              <div className="size-options">
                {sizes.map((v) => (
                  <button
                    key={v.size}
                    className={`size-btn ${
                      selectedSize === v.size ? "selected" : ""
                    }`}
                    onClick={() => setSelectedSize(v.size)}
                  >
                    <span className="size-name">{v.size}</span>
                    <span className="stock-tag">
                      {v.stock_quantity > 0 ? "IN STOCK" : "OUT OF STOCK"}
                    </span>
                  </button>
                ))}
              </div>

              {selectedSize && (
                <div className="selected-size-info">
                  Selected: {selectedSize} - ₹
                  {sizes.find((s) => s.size === selectedSize)?.price}
                </div>
              )}
            </div>

            <div className="selection-section">
              <h3 className="sub-title">Quantity</h3>
              <div className="quantity-ctrl">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  -
                </button>
                <input readOnly value={quantity} />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <div className="product-action-buttons-group">
              <button
                className={`cart-submit-btn ${selectedSize ? "enabled" : ""}`}
                onClick={isInCart ? removeFromCart : addToCart}
                disabled={!selectedSize}
              >
                {!selectedSize
                  ? "SELECT SIZE TO ADD TO CART"
                  : isInCart
                  ? "REMOVE FROM CART"
                  : "ADD TO CART"}
              </button>

              <button
                className={`buy-now-submit-btn ${selectedSize ? "enabled" : ""}`}
                onClick={handleBuyNow}
                disabled={!selectedSize}
              >
                BUY IT NOW
              </button>
            </div>

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

        {/* ================= CUSTOMER REVIEWS ================= */}
        <ProductReviews productId={product.id} productName={product.name} />

        {/* ================= YOU MAY ALSO LIKE ================= */}
        {recommendedProducts.length > 0 && (
          <section className="related-section">
            <h2 className="related-heading">You May Also Like</h2>
            <div className="related-divider"></div>

            <div className="luxury-editorial-grid related-grid">
              {recommendedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>

            <button
              className="view-more-products"
              onClick={() => navigate('/usertab/all-products')}
            >
              VIEW MORE ALL-PRODUCTS
            </button>
          </section>
        )}
      </div>

      <UserFooter />

      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        productData={cartModalData}
      />

      {/* Google Auth Modal for Buy Now Gate */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={() => {
          setAuthModalOpen(false);
          navigate("/usertab/checkout");
        }}
      />
    </div>
  );
};

export default ProductDetailPage;