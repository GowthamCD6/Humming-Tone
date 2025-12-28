import React, { useState } from 'react';

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
                <img src="https://images.unsplash.com/photo-1522771917647-7bc2c7ee9fde?q=80&w=2000&auto=format&fit=crop" alt="Blue set main" />
              </div>
              <div className="thumbnail-gallery">
                <div className="thumbnail active"><img src="https://images.unsplash.com/photo-1522771917647-7bc2c7ee9fde?w=150" alt="thumb1" /></div>
                <div className="thumbnail"><img src="https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=150" alt="thumb2" /></div>
                <div className="thumbnail"><img src="https://images.unsplash.com/photo-1519233912133-fa669f984627?w=150" alt="thumb3" /></div>
                <div className="thumbnail"><img src="https://images.unsplash.com/photo-1555009393-f20bdb245c4d?w=150" alt="thumb4" /></div>
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
                <div className="related-img-holder"></div>
                <div className="related-body">
                  <h4>{item.name}</h4>
                  <p className="rel-price">₹{item.price}</p>
                  <p className="rel-brand">{item.brand}</p>
                  <button className="view-details-btn">VIEW DETAILS</button>
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

  .related-heading { font-family: 'Playfair Display', serif; font-size: 2.8rem; font-weight: 400; margin-bottom: 15px; }
  .related-divider { width: 60px; height: 2px; background: #1a1a1a; margin: 0 auto 50px; }

  .related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 60px; }
  
  .related-card { text-align: left; background: #fff; border: 1px solid #f9f9f9; transition: 0.4s; }
  .related-card:hover { transform: translateY(-10px); box-shadow: 0 15px 35px rgba(0,0,0,0.05); }
  
  .related-img-holder { width: 100%; height: 380px; background: #f5f5f5; }
  .related-body { padding: 25px; }
  .related-body h4 { font-size: 1.3rem; margin: 0 0 10px 0; }
  .rel-price { font-size: 1.5rem; font-weight: 700; margin-bottom: 10px; }
  .rel-brand { color: #888; font-size: 0.9rem; margin-bottom: 20px; }
  
  .view-details-btn { 
    width: 100%; 
    padding: 12px; 
    background: white; 
    border: 1px solid #1a1a1a; 
    font-weight: 600; 
    cursor: pointer; 
    transition: 0.3s;
  }
  .view-details-btn:hover { background: #1a1a1a; color: white; }

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