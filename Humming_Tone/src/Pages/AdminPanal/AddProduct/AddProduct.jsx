import React, { useState } from 'react';
import './AddProduct.css';

const AddProduct = () => {
  const [productName, setProductName] = useState('');
  const [about, setAbout] = useState('');
  const [variants, setVariants] = useState([
    { size: '', price: '', originalPrice: '', stock: '' }
  ]);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [gender, setGender] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [featuredProduct, setFeaturedProduct] = useState(false);
  const [active, setActive] = useState(true);

  const addVariant = () => {
    setVariants([...variants, { size: '', price: '', originalPrice: '', stock: '' }]);
  };

  const removeVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleSubmit = () => {
    console.log('Product data:', {
      productName,
      about,
      variants,
      category,
      subcategory,
      brand,
      gender,
      dimensions,
      featuredProduct,
      active
    });
    alert('Product data logged to console!');
  };

  return (
    <div className="add-product-container">
      <header className="page-header">
        <h1>Add New Product</h1>
      </header>

      <div className="product-form">
        {/* Basic Information */}
        <section className="form-section">
          <h2 className="section-title">Basic Information</h2>
          
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="productName">PRODUCT NAME</label>
              <input
                type="text"
                id="productName"
                placeholder="Enter product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="about">PRODUCT DESCRIPTION</label>
              <textarea
                id="about"
                placeholder="Enter detailed product description"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows="5"
              />
            </div>
          </div>
        </section>

        {/* Category & Classification */}
        <section className="form-section">
          <h2 className="section-title">Category & Details</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="category">CATEGORY</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                <option value="Winter sets">Winter sets</option>
                <option value="T Shirts">T Shirts</option>
                <option value="Sleepingbags">Sleepingbags</option>
                <option value="Dresses">Dresses</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="subcategory">SUBCATEGORY</label>
              <input
                type="text"
                id="subcategory"
                placeholder="Enter subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="brand">BRAND</label>
              <input
                type="text"
                id="brand"
                placeholder="Enter brand name"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">GENDER</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Baby">Mens</option>
                <option value="Boys">Childrens</option>
                <option value="Girls">Kids</option>
                <option value="Unisex">Sports</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="dimensions">DIMENSIONS</label>
              <input
                type="text"
                id="dimensions"
                placeholder="Length x Width x Height"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Product Variants */}
        <section className="form-section">
          <h2 className="section-title">Product Variants</h2>
          
          {variants.map((variant, index) => (
            <div key={index} className="variant-card">
              <div className="variant-header">
                <span className="variant-number">Variant {index + 1}</span>
                {variants.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-icon"
                    onClick={() => removeVariant(index)}
                  >
                    ×
                  </button>
                )}
              </div>
              
              <div className="variant-fields">
                <div className="form-group">
                  <label>SIZE</label>
                  <input
                    type="text"
                    placeholder="S, M, L, XL"
                    value={variant.size}
                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>PRICE (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, 'price', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>ORIGINAL PRICE (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={variant.originalPrice}
                    onChange={(e) => updateVariant(index, 'originalPrice', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>STOCK</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="btn-add-variant" onClick={addVariant}>
            + ADD VARIANT
          </button>
        </section>

        {/* Product Images */}
        <section className="form-section">
          <h2 className="section-title">Product Media</h2>
          
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="images">PRODUCT IMAGES</label>
              <div className="file-upload-area">
                <input type="file" id="images" multiple accept="image/*" />
                <p className="help-text">Upload multiple images. First image will be the primary display image.</p>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="video">PRODUCT VIDEO (Optional)</label>
              <div className="file-upload-area">
                <input type="file" id="video" accept="video/mp4,video/mov,video/avi" />
                <p className="help-text">Supported formats: MP4, MOV, AVI</p>
              </div>
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="form-section">
          <h2 className="section-title">Product Status</h2>
          
          <div className="checkbox-grid">
            <label className="checkbox-card">
              <input
                type="checkbox"
                checked={featuredProduct}
                onChange={(e) => setFeaturedProduct(e.target.checked)}
              />
              <div className="checkbox-content">
                <span className="checkbox-title">FEATURED PRODUCT</span>
                <span className="checkbox-desc">Display this product in featured section</span>
              </div>
            </label>

            <label className="checkbox-card">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <div className="checkbox-content">
                <span className="checkbox-title">ACTIVE</span>
                <span className="checkbox-desc">Make this product visible to customers</span>
              </div>
            </label>
          </div>
        </section>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="button" className="btn-cancel">
            CANCEL
          </button>
          <button type="button" className="btn-submit" onClick={handleSubmit}>
            ADD PRODUCT
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;