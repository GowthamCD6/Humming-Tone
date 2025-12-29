import React, { useState } from 'react';
import demoImage from '../../../assets/demo.jpeg';

const ProductDetailPage = () => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

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
    <div className="premium-product-wrapper">
      <style>{pageStyles}</style>

      <div className="container">
        <div className="product-detail-layout">
          
          {/* LEFT SIDE: STICKY GALLERY */}
          <div className="product-gallery-container">
            <div className="sticky-wrapper">
              <div className="product-main-image">
                <img src={demoImage} alt="Blue set main" />
              </div>
              <div className="thumbnail-gallery">
                <div className="thumbnail active"><img src={demoImage} alt="thumb1" /></div>
                <div className="thumbnail"><img src={demoImage} alt="thumb2" /></div>
                <div className="thumbnail"><img src={demoImage} alt="thumb3" /></div>
                <div className="thumbnail"><img src={demoImage} alt="thumb4" /></div>
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

        {/* BOTTOM SECTION: RELATED PRODUCTS */}
        <section className="related-section">
          <h2 className="related-heading">You May Also Like</h2>
          <div className="related-divider"></div>
          
          <div className="related-grid">
            {relatedProducts.map(item => (
              <div className="related-card" key={item.id}>
                <div className="related-product-image-container">
                  <img 
                    src={demoImage} 
                    alt={item.name} 
                    className="related-product-img"
                  />
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

          <button className="view-more-products">VIEW MORE BABY PRODUCTS</button>
        </section>
      </div>
    </div>
  );
};

// INTERNAL CSS
const pageStyles = `
  .premium-product-wrapper {
    font-family: 'Inter', sans-serif;
    background: #fff;
    color: #1a1a1a;
  }

  .container {
    max-width: 1300px;
    margin: 0 auto;
    padding: 0 40px;
  }

  /* Layout Logic */
  .product-detail-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    padding: 60px 0;
    align-items: start; /* Crucial for sticky */
  }

  /* Sticky Left Column */
  .product-gallery-container {
    position: sticky;
    top: 40px;
  }

  .product-main-image {
    background: #f5f5f5;
    margin-bottom: 20px;
  }

  .product-main-image img {
    width: 100%;
    display: block;
  }

  .thumbnail-gallery {
    display: flex;
    gap: 12px;
  }

  .thumbnail {
    width: 80px;
    height: 80px;
    border: 1px solid #eee;
    cursor: pointer;
  }

  .thumbnail.active { border: 2px solid #1a1a1a; }
  .thumbnail img { width: 100%; height: 100%; object-fit: cover; }

  /* Scrolling Right Column */
  .product-title {
    font-family: 'Playfair Display', serif;
    font-size: 3.2rem;
    font-weight: 400;
    margin-bottom: 20px;
  }

  .price-section { margin-bottom: 40px; }
  .dynamic-price { font-size: 2.8rem; font-weight: 600; }
  .original-price { color: #999; text-decoration: line-through; font-size: 1.3rem; margin-top: 5px; }

  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    background: #fafafa;
    padding: 25px;
    border: 1px solid #f0f0f0;
    margin-bottom: 40px;
  }

  .meta-item .label { display: block; font-size: 0.8rem; color: #999; text-transform: uppercase; letter-spacing: 1px; }
  .meta-item .value { font-size: 1.1rem; font-weight: 500; }

  .sub-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    font-weight: 400;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }

  /* Size Selection */
  .size-options { display: flex; gap: 15px; margin-bottom: 40px; }
  .size-btn {
    flex: 1;
    background: white;
    border: 2px solid #eee;
    padding: 15px;
    cursor: pointer;
    transition: 0.3s;
    text-align: center;
  }

  .size-btn:hover { border-color: #1a1a1a; }
  .size-btn.selected { border-color: #1a1a1a; background: #1a1a1a; color: white; }
  .size-name { display: block; font-size: 1.2rem; font-weight: 600; }
  .stock-tag { font-size: 0.7rem; color: #27ae60; }
  .size-btn.selected .stock-tag { color: white; }

  /* Quantity */
  .quantity-ctrl { display: inline-flex; border: 2px solid #eee; margin-bottom: 15px; }
  .quantity-ctrl button { width: 60px; height: 50px; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
  .quantity-ctrl input { width: 80px; text-align: center; border: none; font-size: 1.2rem; font-weight: 600; }
  .availability-msg { font-size: 0.8rem; color: #666; text-transform: uppercase; margin-bottom: 40px; }

  /* Submit Button */
  .cart-submit-btn {
    width: 100%;
    padding: 20px;
    background: #ccc;
    color: white;
    border: none;
    font-weight: 600;
    letter-spacing: 2px;
    cursor: not-allowed;
    margin-bottom: 60px;
  }

  .cart-submit-btn.enabled { background: #1a1a1a; cursor: pointer; }

  .description-box p { line-height: 1.8; color: #555; font-size: 1.1rem; margin-bottom: 40px; }

  .product-details-card { background: #fafafa; padding: 30px; border: 1px solid #eee; }
  .detail-row { margin-bottom: 15px; }
  .detail-row .label { color: #999; font-size: 0.9rem; margin-right: 10px; }
  .detail-row .value { font-weight: 600; }

  /* Related Products Section */
  .related-section { 
    margin-top: 100px; 
    padding: 80px 0; 
    border-top: 1px solid #eee; 
    text-align: center; 
  }

  .related-heading { 
    font-family: 'Playfair Display', serif; 
    font-size: 2.8rem; 
    font-weight: 400; 
    margin-bottom: 15px; 
  }
  
  .related-divider { 
    width: 60px; 
    height: 2px; 
    background: #1a1a1a; 
    margin: 0 auto 50px; 
  }

  .related-grid { 
    display: grid; 
    grid-template-columns: repeat(3, 380px); 
    gap: 5.5rem; 
    margin-bottom: 60px;
    justify-content: center;
  }
  
  .related-card {
    background: #ffffff;
    border-radius: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    position: relative;
    cursor: pointer;
    max-width: 380px;
    width: 100%;
  }

  .related-card::before {
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

  .related-card:hover::before {
    opacity: 1;
  }

  .related-card:hover {
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.12);
    transform: translateY(-12px);
  }

  .related-product-image-container {
    position: relative;
    height: 440px;
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    overflow: hidden;
  }

  .related-product-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
    filter: grayscale(0.1);
    will-change: transform;
  }

  .related-card:hover .related-product-img {
    transform: scale(1.08);
    filter: grayscale(0);
  }

  .related-product-hover-overlay {
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

  .related-card:hover .related-product-hover-overlay {
    opacity: 1;
  }

  .related-view-details-btn {
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
    font-family: 'Poppins', sans-serif;
    transform: translateY(20px);
    position: relative;
    overflow: hidden;
  }

  .related-view-details-btn::before {
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

  .related-view-details-btn:hover::before {
    width: 300px;
    height: 300px;
  }

  .related-card:hover .related-view-details-btn {
    transform: translateY(0);
  }

  .related-view-details-btn:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
    background: #1a1a1a;
    color: #ffffff;
  }

  .related-product-details {
    padding: 2rem;
    text-align: center;
    background-color: #ffffff;
    position: relative;
  }

  .related-product-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #1a1a1a;
    line-height: 1.3;
    letter-spacing: -0.01em;
    transition: color 0.3s ease;
  }

  .related-card:hover .related-product-title {
    color: #666;
  }

  .related-product-brand {
    font-size: 11px;
    color: #999;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .related-product-price {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: -0.01em;
  }

  .view-more-products {
    background: #1a1a1a;
    color: white;
    padding: 15px 40px;
    border: none;
    font-weight: 600;
    letter-spacing: 1px;
    cursor: pointer;
  }

  @media (max-width: 900px) {
    .product-detail-layout { grid-template-columns: 1fr; }
    .product-gallery-container { position: relative; top: 0; }
    .related-grid { grid-template-columns: 1fr; }
  }
`;

export default ProductDetailPage;