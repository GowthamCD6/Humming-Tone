import React, { useState } from 'react';
import demoImage from '../../../assets/demo.jpeg';

const ProductDetailPage = () => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const productImages = [demoImage, demoImage, demoImage, demoImage];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const product = {
    title: "Blue set",
    price: "400.00",
    originalPrice: "1,200.00",
    sku: "BLUCA8637",
    brand: "Care and dare",
    category: "Winter sets",
    gender: "Baby",
    color: "Navy, blue, white",
    material: "Cotton",
    description: "This sweet baby outfit combines cozy comfort with cool, modern style. The color-block sweatshirt features a handsome navy top, a soft sky-blue middle, and creamy white sleeves, complete with a cute pocket accent with the words 'MAKING TODAY AN AMAZING DAY' embroidered. It's perfectly paired with coordinating, comfy blue jogger pants that include stylish cargo pockets."
  };

  const relatedProducts = [
    { id: 1, name: "Stitch set", price: "400.00", brand: "Care and dare" },
    { id: 2, name: "Mickey hoodie set", price: "450.00", brand: "Care and dare" },
    { id: 3, name: "Bear set", price: "400.00", brand: "Care and dare" }
  ];

  const sizes = ["S", "M", "L", "XL"];

  return (
    <div className="userpanal-product-details-page">
      <style>{pageStyles}</style>

      <div className="container">
        <div className="product-detail-layout">
          
          {/* LEFT SIDE: STICKY GALLERY */}
          <div className="product-gallery-container">
            <div className="sticky-wrapper">
              <div className="product-main-image">
                <img src={productImages[activeImageIndex]} alt={product.title} loading="eager" />
              </div>
              <div className="thumbnail-gallery">
                {productImages.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    className={`thumbnail ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View product image ${idx + 1}`}
                  >
                    <img src={src} alt={`${product.title} thumbnail ${idx + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: SCROLLING CONTENT */}
          <div className="product-info-container">
            <h1 className="product-title">{product.title}</h1>
            
            <div className="price-section">
              <div className="dynamic-price">₹{product.price}</div>
              <div className="original-price">Original: ₹{product.originalPrice}</div>
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
                <span className="value">{product.category}</span>
              </div>
              <div className="meta-item">
                <span className="label">GENDER</span>
                <span className="value">{product.gender}</span>
              </div>
            </div>

            <div className="selection-section">
              <h3 className="sub-title">Select Size</h3>
              <div className="size-options">
                {sizes.map(size => (
                  <button 
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    <span className="size-name">{size}</span>
                    <span className="stock-tag">IN STOCK</span>
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
              <p className="availability-msg">Select a size to see availability</p>
            </div>

            <button className={`cart-submit-btn ${selectedSize ? 'enabled' : ''}`}>
              {selectedSize ? 'ADD TO CART' : 'SELECT SIZE TO ADD TO CART'}
            </button>

            <div className="description-box">
              <h3 className="sub-title">About this item</h3>
              <p>{product.description}</p>
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

        {/* FULL WIDTH RELATED PRODUCTS SECTION - OUTSIDE GRID */}
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
    </div>
  );
};

const pageStyles = `
  .userpanal-product-details-page {
    font-family: 'Inter', sans-serif;
    background: #fff;
    color: #1a1a1a;
    min-height: 100vh;
  }

  .userpanal-product-details-page .container {
    max-width: 1300px;
    margin: 0 auto;
    padding: 0 40px;
  }

  /* CRITICAL: Layout with proper sticky behavior */
  .userpanal-product-details-page .product-detail-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    padding: 60px 0;
    align-items: flex-start;
  }

  /* Left Column: Sticky Gallery */
  .userpanal-product-details-page .product-gallery-container {
    position: sticky;
    top: calc(var(--user-header-height, 100px) + 1px);
    align-self: flex-start;
    height: fit-content;
  }

  .userpanal-product-details-page .product-main-image {
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    margin-bottom: 20px;
    aspect-ratio: 0.85;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .userpanal-product-details-page .product-main-image img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .userpanal-product-details-page .image-placeholder {
    color: #999;
    font-size: 1.2rem;
    font-weight: 500;
  }

  .userpanal-product-details-page .thumbnail-gallery {
    display: flex;
    gap: 12px;
  }

  .userpanal-product-details-page .thumbnail {
    width: 80px;
    height: 80px;
    border: 1px solid #eee;
    cursor: pointer;
    background: #f9f9f9;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .userpanal-product-details-page button.thumbnail {
    appearance: none;
    border-radius: 0;
  }

  .userpanal-product-details-page .thumbnail img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .userpanal-product-details-page .thumbnail.active { 
    border: 2px solid #1a1a1a; 
  }

  .userpanal-product-details-page .thumb-placeholder {
    color: #999;
    font-size: 0.9rem;
  }

  /* Right Column: Natural scrolling content */
  .userpanal-product-details-page .product-info-container {
    /* No special positioning - flows naturally */
  }

  .userpanal-product-details-page .product-title {
    font-family: 'Playfair Display', serif;
    font-size: 3.2rem;
    font-weight: 400;
    margin-bottom: 20px;
    line-height: 1.2;
  }

  .userpanal-product-details-page .price-section { 
    margin-bottom: 40px; 
  }

  .userpanal-product-details-page .dynamic-price { 
    font-size: 2.8rem; 
    font-weight: 600; 
  }

  .userpanal-product-details-page .original-price { 
    color: #999; 
    text-decoration: line-through; 
    font-size: 1.3rem; 
    margin-top: 5px; 
  }

  .userpanal-product-details-page .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    background: #fafafa;
    padding: 25px;
    border: 1px solid #f0f0f0;
    margin-bottom: 40px;
  }

  .userpanal-product-details-page .meta-item .label { 
    display: block; 
    font-size: 0.8rem; 
    color: #999; 
    text-transform: uppercase; 
    letter-spacing: 1px; 
    margin-bottom: 5px;
  }

  .userpanal-product-details-page .meta-item .value { 
    font-size: 1.1rem; 
    font-weight: 500; 
  }

  .userpanal-product-details-page .selection-section {
    margin-bottom: 40px;
  }

  .userpanal-product-details-page .sub-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    font-weight: 400;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }

  .userpanal-product-details-page .size-options { 
    display: flex; 
    gap: 15px; 
  }

  .userpanal-product-details-page .size-btn {
    flex: 1;
    background: white;
    border: 2px solid #eee;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
  }

  .userpanal-product-details-page .size-btn:hover { 
    border-color: #1a1a1a; 
  }

  .userpanal-product-details-page .size-btn.selected { 
    border-color: #1a1a1a; 
    background: #1a1a1a; 
    color: white; 
  }

  .userpanal-product-details-page .size-name { 
    display: block; 
    font-size: 1.2rem; 
    font-weight: 600; 
    margin-bottom: 5px;
  }

  .userpanal-product-details-page .stock-tag { 
    font-size: 0.7rem; 
    color: #27ae60; 
  }

  .userpanal-product-details-page .size-btn.selected .stock-tag { 
    color: white; 
  }

  .userpanal-product-details-page .quantity-ctrl { 
    display: inline-flex; 
    border: 2px solid #eee; 
    margin-bottom: 15px; 
  }

  .userpanal-product-details-page .quantity-ctrl button { 
    width: 60px; 
    height: 50px; 
    background: none; 
    border: none; 
    font-size: 1.5rem; 
    cursor: pointer;
    transition: background 0.2s;
  }

  .userpanal-product-details-page .quantity-ctrl button:hover {
    background: #f5f5f5;
  }

  .userpanal-product-details-page .quantity-ctrl input { 
    width: 80px; 
    text-align: center; 
    border: none; 
    font-size: 1.2rem; 
    font-weight: 600; 
  }

  .userpanal-product-details-page .availability-msg { 
    font-size: 0.8rem; 
    color: #666; 
    text-transform: uppercase; 
  }

  .userpanal-product-details-page .cart-submit-btn {
    width: 100%;
    padding: 20px;
    background: #ccc;
    color: white;
    border: none;
    font-weight: 600;
    letter-spacing: 2px;
    cursor: not-allowed;
    margin-bottom: 60px;
    transition: all 0.3s ease;
  }

  .userpanal-product-details-page .cart-submit-btn.enabled { 
    background: #1a1a1a; 
    cursor: pointer; 
  }

  .userpanal-product-details-page .cart-submit-btn.enabled:hover {
    background: #333;
  }

  .userpanal-product-details-page .description-box {
    margin-bottom: 40px;
  }

  .userpanal-product-details-page .description-box p { 
    line-height: 1.8; 
    color: #555; 
    font-size: 1.1rem; 
  }

  .userpanal-product-details-page .product-details-card { 
    background: #fafafa; 
    padding: 30px; 
    border: 1px solid #eee;
    margin-bottom: 60px;
  }

  .userpanal-product-details-page .detail-row { 
    margin-bottom: 15px; 
  }

  .userpanal-product-details-page .detail-row:last-child {
    margin-bottom: 0;
  }

  .userpanal-product-details-page .detail-row .label { 
    color: #999; 
    font-size: 0.9rem; 
    margin-right: 10px; 
  }

  .userpanal-product-details-page .detail-row .value { 
    font-weight: 600; 
  }

  /* FULL WIDTH Related Products Section - Outside grid layout */
  .userpanal-product-details-page .related-section { 
    padding: 80px 0; 
    border-top: 1px solid #eee; 
    text-align: center; 
    margin-bottom: 80px;
    width: 100%;
  }

  .userpanal-product-details-page .related-heading { 
    font-family: 'Playfair Display', serif; 
    font-size: 2.8rem; 
    font-weight: 400; 
    margin-bottom: 15px; 
  }
  
  .userpanal-product-details-page .related-divider { 
    width: 60px; 
    height: 2px; 
    background: #1a1a1a; 
    margin: 0 auto 50px; 
  }

  .userpanal-product-details-page .related-grid { 
    display: grid; 
    grid-template-columns: repeat(3, 1fr); 
    gap: 3rem; 
    margin-bottom: 60px;
    max-width: 1300px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .userpanal-product-details-page .related-card {
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    position: relative;
    cursor: pointer;
  }

  .userpanal-product-details-page .related-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(26,26,26,0.02), rgba(26,26,26,0));
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
    z-index: 1;
  }

  .userpanal-product-details-page .related-card:hover::before {
    opacity: 1;
  }

  .userpanal-product-details-page .related-card:hover {
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.12);
    transform: translateY(-12px);
  }

  .userpanal-product-details-page .related-product-image-container {
    position: relative;
    height: 400px;
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .userpanal-product-details-page .related-product-image-container img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .userpanal-product-details-page .related-img-placeholder {
    color: #999;
    font-size: 1.1rem;
    transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .userpanal-product-details-page .related-card:hover .related-img-placeholder {
    transform: scale(1.08);
  }

  .userpanal-product-details-page .related-product-hover-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 2rem;
    z-index: 2;
  }

  .userpanal-product-details-page .related-card:hover .related-product-hover-overlay {
    opacity: 1;
  }

  .userpanal-product-details-page .related-view-details-btn {
    background: #ffffff;
    color: #1a1a1a;
    border: 2px solid transparent;
    padding: 12px 32px;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.08em;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    border-radius: 2px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    text-transform: uppercase;
    transform: translateY(20px);
    position: relative;
    overflow: hidden;
  }

  .userpanal-product-details-page .related-view-details-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  .userpanal-product-details-page .related-view-details-btn:hover::before {
    width: 300px;
    height: 300px;
  }

  .userpanal-product-details-page .related-card:hover .related-view-details-btn {
    transform: translateY(0);
  }

  .userpanal-product-details-page .related-view-details-btn:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
    background: #1a1a1a;
    color: #ffffff;
  }

  .userpanal-product-details-page .related-product-details {
    padding: 2.2rem;
    text-align: center;
    background-color: #ffffff;
  }

  .userpanal-product-details-page .related-product-title {
    font-family: 'Playfair Display', serif;
    font-size: 23px;
    font-weight: 500;
    margin-bottom: 11px;
    color: #1a1a1a;
    line-height: 1.4;
    letter-spacing: 0.01em;
    transition: color 0.3s ease;
  }

  .userpanal-product-details-page .related-card:hover .related-product-title {
    color: #000;
  }

  .userpanal-product-details-page .related-product-brand {
    font-family: 'Poppins', sans-serif;
    font-size: 15px;
    color: #a0a0a0;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 17px;
    font-weight: 500;
  }

  .userpanal-product-details-page .related-product-price {
    font-family: 'Poppins', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .userpanal-product-details-page .view-more-products {
    background: #1a1a1a;
    color: white;
    padding: 15px 40px;
    border: none;
    font-weight: 600;
    letter-spacing: 1px;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .userpanal-product-details-page .view-more-products:hover {
    background: #333;
  }

  @media (max-width: 1024px) {
    .userpanal-product-details-page .related-grid { 
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }
  }

  @media (max-width: 900px) {
    .userpanal-product-details-page .product-detail-layout { 
      grid-template-columns: 1fr; 
      gap: 40px;
    }
    
    .userpanal-product-details-page .product-gallery-container { 
      position: relative; 
      top: 0; 
    }

    .userpanal-product-details-page .container {
      padding: 0 20px;
    }

    .userpanal-product-details-page .product-title {
      font-size: 2.4rem;
    }

    .userpanal-product-details-page .related-grid { 
      grid-template-columns: 1fr;
    }
  }
`;

export default ProductDetailPage;