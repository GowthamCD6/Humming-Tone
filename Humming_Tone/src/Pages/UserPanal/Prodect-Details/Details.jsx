import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import demoImage from '../../../assets/demo.jpeg';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './Details.css';

const ProductDetailPage = () => {
  const { id } = useParams();

  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [sizes, setSizes] = useState([]);

  const relatedProducts = [ { id: 1, name: "Stitch set", price: "400.00", brand: "Care and dare" }, { id: 2, name: "Mickey hoodie set", price: "450.00", brand: "Care and dare" }, { id: 3, name: "Bear set", price: "400.00", brand: "Care and dare" } ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/admin/fetch_variants/${id}`);
        const data = await res.json();

        setProduct(data);

        /* ---- IMAGES (primary first) ---- */
        if (data.images && data.images.length > 0) {
          const sortedImages = [...data.images].sort(
            (a, b) => b.is_primary - a.is_primary
          );
          setProductImages(
            sortedImages.map(img => `http://localhost:5000/${img.image_path}`)
          );
        }

        /* ---- SIZES FROM VARIANTS ---- */
        if (data.variants) {
          setSizes(data.variants);
        }

      } catch (err) {
        console.error(err);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) return null;

  return (
    <div className="userpanal-product-details-page">
      <div className="container">
        <div className="product-detail-layout">

          {/* LEFT SIDE: STICKY GALLERY */}
          <div className="product-gallery-container">
            <div className="sticky-wrapper">
              <div className="product-main-image">
                <img
                  src={productImages[activeImageIndex] || demoImage}
                  alt={product.name}
                  loading="eager"
                />
              </div>

              <div className="thumbnail-gallery">
                {productImages.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`thumbnail ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={src} alt="thumbnail" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: SCROLLING CONTENT */}
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
              <div className="meta-item">
                <span className="label">SKU</span>
                <span className="value">{product.sku}</span>
              </div>
              <div className="meta-item">
                <span className="label">BRAND</span>
                <span className="value">{product.brand}</span>
              </div>
              <div className="meta-item">
                <span className="label">CATEGORY</span>
                <span className="value">{product.category_name}</span>
              </div>
              <div className="meta-item">
                <span className="label">GENDER</span>
                <span className="value">{product.gender}</span>
              </div>
              <div className="meta-item full-width">
                <span className="label">SUBCATEGORY</span>
                <span className="value">{product.subcategory}</span>
              </div>
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
                    <span className="size-name">{v.size}</span>
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
                <input type="text" value={quantity} readOnly />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <button className={`cart-submit-btn ${selectedSize ? 'enabled' : ''}`}>
              {selectedSize ? 'ADD TO CART' : 'SELECT SIZE TO ADD TO CART'}
            </button>

            <div className="description-box">
              <h3 className="sub-title">About this item</h3>
              <p>{product.about}</p>
            </div>

            <div className="care-box">
              <h3 className="sub-title">Care Instructions</h3>
              <p>{product.care_instructions}</p>
            </div>

            <div className="product-details-card">
              <h3 className="sub-title">Product Details</h3>
              <div className="detail-row">
                <span className="label">COLOR</span>
                <span className="value">{product.color}</span>
              </div>
              <div className="detail-row">
                <span className="label">MATERIAL</span>
                <span className="value">{product.material}</span>
              </div>
            </div>
          </div>
        </div>

        <section className="related-section">
          <h2 className="related-heading">You May Also Like</h2>
          <div className="related-divider"></div>
          
          <div className="related-grid">
            {relatedProducts.map(item => (
              <div className="related-card" key={item.id}>
                <div className="related-product-image-container">
                  <img src={demoImage} alt={item.name} loading="lazy" />
                  <div className="related-product-hover-overlay">
                    <button className="related-view-details-btn">VIEW DETAILS</button>
                  </div>
                </div>
                <div className="related-product-details">
                  <h3 className="related-product-title">{item.name}</h3>
                  <p className="related-product-brand">{item.brand}</p>
                  <p className="related-product-price">₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="view-more-products">VIEW MORE ALL-PRODUCTS</button>
        </section>

      </div>

      <UserFooter />
    </div>
  );
};

export default ProductDetailPage;



