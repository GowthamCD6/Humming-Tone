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
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  };

  const _checkIfInCart = (size) => {
    const cart = getCart();
    return cart.some((item) => String(item.id) === String(product?.id) && String(item.size).trim() === String(size).trim());
  };

  const addToCart = () => {
    if (!selectedSize || !product) return;

    const variant = sizes.find((v) => v.size === selectedSize) || {};
    const stock = Number(variant.stock_quantity != null ? variant.stock_quantity : (product.stock_quantity || 0));
    if (stock <= 0) return;

    const price = Number(variant.price != null ? variant.price : product.price);
    const cartItemId = `${product.id}-${selectedSize}-${product.color || "Default"}`;

    const cart = getCart();
    const existingIndex = cart.findIndex(
      (item) => String(item.id) === String(product.id) && String(item.size).trim() === String(selectedSize).trim()
    );

    let updatedCart;
    if (existingIndex > -1) {
      updatedCart = [...cart];
      const newQty = (Number(updatedCart[existingIndex].quantity) || 1) + Number(quantity || 1);
      updatedCart[existingIndex].quantity = Math.min(newQty, stock);
      updatedCart[existingIndex].price = price;
      updatedCart[existingIndex].stock = stock;
      updatedCart[existingIndex].cartItemId = cartItemId;
    } else {
      const cartItem = {
        cartItemId,
        id: product.id,
        name: product.name,
        brand: product.brand || "ATELIER COLLECTION",
        price,
        quantity: Math.min(Math.max(1, Number(quantity || 1)), stock),
        size: selectedSize,
        color: product.color || "Default",
        stock,
        image: productImages[0] || getImageUrl(product.image_path),
      };
      updatedCart = [...cart, cartItem];
    }

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart:updated"));
    setIsInCart(true);

    // Show the modal with product data
    setCartModalData({
      name: product.name,
      size: selectedSize,
      quantity: quantity,
      price,
      image: productImages[0] || getImageUrl(product.image_path),
    });
    setShowCartModal(true);
  };

  const removeFromCart = () => {
    if (!product || !selectedSize) return;
    const cart = getCart().filter(
      (item) => !(String(item.id) === String(product.id) && String(item.size).trim() === String(selectedSize).trim())
    );

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart:updated"));
    setIsInCart(false);
  };

  const handleBuyNow = () => {
    if (!selectedSize) return;

    const variant = sizes.find((v) => v.size === selectedSize);
    const stock = Number(variant?.stock_quantity != null ? variant.stock_quantity : (product.stock_quantity || 0));
    if (stock <= 0) return;

    const directItem = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: variant?.price || product.price,
      quantity: Math.min(quantity, stock),
      size: selectedSize,
      color: product.color || "Default",
      stock,
      image: productImages[0] || getImageUrl(product.image_path),
    };

    const user = JSON.parse(localStorage.getItem("customerUser") || "null");
    const token = localStorage.getItem("userToken");

    if (!user || !token || user?.email === 'guest@hummingtone.com') {
      setAuthModalOpen(true);
      return;
    }

    // Direct to checkout without adding to permanent cart
    navigate("/usertab/checkout", { state: { buyNowItem: directItem } });
  };

  /* ================= RECOMMENDATIONS ================= */
  const fetchRecommendations = async (categoryId, currentProductId) => {
    try {
      // Request extra products so after excluding the current product, exactly 4 cards are shown
      const res = await fetch(
        `${API_BASE_URL}/user/fetch_recommendations?page=1&limit=10`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category_id: categoryId,
            exclude_id: currentProductId,
            product_id: currentProductId,
          }),
        }
      );

      const data = await res.json();
      let list = (data.data || []).filter(
        (item) => String(item.id) !== String(currentProductId)
      );

      // If category has fewer than 4 other items, backfill from other active catalog products
      if (list.length < 4) {
        try {
          const allRes = await fetch(`${API_BASE_URL}/user/fetch_products`);
          const allData = await allRes.json();
          const allList = Array.isArray(allData) ? allData : allData?.data || [];
          const moreProducts = allList.filter(
            (item) =>
              String(item.id) !== String(currentProductId) &&
              !list.some((existing) => String(existing.id) === String(item.id))
          );
          list = [...list, ...moreProducts];
        } catch (backfillErr) {
          console.warn("Backfill recommendations error:", backfillErr);
        }
      }

      setRecommendedProducts(list.slice(0, 4));
    } catch (err) {
      console.error("fetchRecommendations error:", err);
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
          fetchRecommendations(data.category_id, data.id);
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

  const selectedVariant = sizes.find((s) => s.size === selectedSize) || null;
  const totalStock = sizes.reduce(
    (sum, v) => sum + Number(v.stock_quantity || 0),
    0
  );
  const currentStock = selectedVariant
    ? Number(selectedVariant.stock_quantity || 0)
    : totalStock;
  const isOutOfStock = selectedSize ? currentStock <= 0 : totalStock <= 0;

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

            {/* LIVE INVENTORY / STOCK DISPLAY BANNER */}
            <div className="stock-availability-card">
              {selectedVariant ? (
                selectedVariant.stock_quantity > 5 ? (
                  <div className="stock-badge in-stock">
                    <span className="stock-pulse-dot green-dot"></span>
                    <div className="stock-badge-info">
                      <span className="stock-primary-text">
                        In Stock: <strong>{selectedVariant.stock_quantity} units available</strong> for Size {selectedSize}
                      </span>
                      <span className="stock-secondary-text">
                        Total store inventory: {totalStock} items across all sizes
                      </span>
                    </div>
                  </div>
                ) : selectedVariant.stock_quantity > 0 ? (
                  <div className="stock-badge low-stock">
                    <span className="stock-pulse-dot amber-dot"></span>
                    <div className="stock-badge-info">
                      <span className="stock-primary-text">
                        <span className="urgency-flame">⚡</span> <strong>Only {selectedVariant.stock_quantity} left in stock</strong> for Size {selectedSize}!
                      </span>
                      <span className="stock-secondary-text">
                        High demand — order now before inventory sells out
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="stock-badge out-of-stock">
                    <span className="stock-pulse-dot red-dot"></span>
                    <div className="stock-badge-info">
                      <span className="stock-primary-text">
                        <strong>Out of Stock</strong> for Size {selectedSize}
                      </span>
                      <span className="stock-secondary-text">
                        Please select another available size from the store
                      </span>
                    </div>
                  </div>
                )
              ) : (
                <div className="stock-badge store-overview">
                  <span className="stock-pulse-dot blue-dot"></span>
                  <div className="stock-badge-info">
                    <span className="stock-primary-text">
                      Store Stock: <strong>{totalStock} units available</strong>
                    </span>
                    <span className="stock-secondary-text">
                      Select your size below to view exact variant inventory
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="selection-section">
              <div className="section-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="sub-title">Select Size</h3>
                <span className="stock-summary-tag">
                  {totalStock > 0 ? `${totalStock} total in store` : "Out of stock"}
                </span>
              </div>
              <div className="size-options">
                {sizes.map((v) => {
                  const stockNum = Number(v.stock_quantity || 0);
                  const isOut = stockNum <= 0;
                  const isLow = stockNum > 0 && stockNum <= 5;
                  return (
                    <button
                      key={v.size}
                      className={`size-btn ${
                        selectedSize === v.size ? "selected" : ""
                      } ${isOut ? "out-of-stock" : ""}`}
                      onClick={() => {
                        setSelectedSize(v.size);
                        if (stockNum > 0 && quantity > stockNum) {
                          setQuantity(stockNum);
                        } else if (stockNum <= 0) {
                          setQuantity(1);
                        }
                      }}
                    >
                      <span className="size-name">{v.size}</span>
                      <span className={`stock-tag ${isOut ? "out" : isLow ? "low" : "in"}`}>
                        {isOut
                          ? "0 in stock"
                          : isLow
                          ? `Only ${stockNum} left`
                          : `${stockNum} in stock`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedSize && (
                <div className="selected-size-info">
                  <span>Selected: <strong>{selectedSize}</strong> - ₹{sizes.find((s) => s.size === selectedSize)?.price}</span>
                  <span className="selected-size-stock-note">
                    {selectedVariant?.stock_quantity > 0
                      ? `(${selectedVariant.stock_quantity} available)`
                      : `(Out of stock)`}
                  </span>
                </div>
              )}
            </div>

            <div className="selection-section">
              <div className="section-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 className="sub-title" style={{ margin: 0 }}>Quantity</h3>
                {selectedVariant && (
                  <span className="quantity-stock-helper">
                    {currentStock > 0 ? (
                      <span>(Available in store: <strong>{currentStock}</strong>)</span>
                    ) : (
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>(Currently Sold Out)</span>
                    )}
                  </span>
                )}
              </div>
              <div className="quantity-ctrl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  aria-label="Decrease quantity"
                  style={{ opacity: quantity <= 1 || isOutOfStock ? 0.45 : 1 }}
                >
                  -
                </button>
                <input readOnly value={isOutOfStock ? 0 : quantity} />
                <button
                  onClick={() => {
                    if (selectedVariant && quantity >= currentStock) return;
                    setQuantity(quantity + 1);
                  }}
                  disabled={isOutOfStock || (selectedVariant && quantity >= currentStock)}
                  aria-label="Increase quantity"
                  style={{ opacity: isOutOfStock || (selectedVariant && quantity >= currentStock) ? 0.45 : 1 }}
                  title={selectedVariant && quantity >= currentStock ? `Maximum stock of ${currentStock} reached` : "Add more"}
                >
                  +
                </button>
              </div>
              {selectedVariant && quantity >= currentStock && currentStock > 0 && (
                <p className="max-stock-notice">
                  Maximum available stock ({currentStock} units) reached.
                </p>
              )}
            </div>

            <div className="product-action-buttons-group">
              <button
                className={`cart-submit-btn ${selectedSize && !isOutOfStock ? "enabled" : "disabled"}`}
                onClick={isInCart ? removeFromCart : addToCart}
                disabled={!selectedSize || isOutOfStock}
              >
                {!selectedSize
                  ? "SELECT SIZE TO ADD TO CART"
                  : isOutOfStock
                  ? "OUT OF STOCK"
                  : isInCart
                  ? "REMOVE FROM CART"
                  : "ADD TO CART"}
              </button>

              <button
                className={`buy-now-submit-btn ${selectedSize && !isOutOfStock ? "enabled" : "disabled"}`}
                onClick={handleBuyNow}
                disabled={!selectedSize || isOutOfStock}
              >
                {isOutOfStock ? "OUT OF STOCK" : "BUY IT NOW"}
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
          const variant = sizes.find((v) => v.size === selectedSize) || {};
          const directItem = {
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: variant?.price || product.price,
            quantity,
            size: selectedSize,
            color: product.color || "Default",
            stock: variant?.stock_quantity || 10,
            image: productImages[0] || getImageUrl(product.image_path),
          };
          navigate("/usertab/checkout", { state: { buyNowItem: directItem } });
        }}
      />
    </div>
  );
};

export default ProductDetailPage;