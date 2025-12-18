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
  const [gender, setGender] = useState('Men');
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
        <h1>Add Product</h1>
      </header>

      <div className="product-form">
        <section className="form-section">
          <h2>Add New Product</h2>
          
          <div className="section-content">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="productName">PRODUCT NAME:*</label>
              <input
                type="text"
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="about">ABOUT:*</label>
              <textarea
                id="about"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows="6"
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h3>Product Variants (Sizes & Prices)*</h3>
          
          {variants.map((variant, index) => (
            <div key={index} className="variant-row">
              <div className="variant-fields">
                <div className="form-group">
                  <label>SIZE:*</label>
                  <input
                    type="text"
                    placeholder="S, M, L, XL"
                    value={variant.size}
                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>PRICE:*</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, 'price', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>ORIGINAL PRICE:</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={variant.originalPrice}
                    onChange={(e) => updateVariant(index, 'originalPrice', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>STOCK:*</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                  />
                </div>
              </div>

              {variants.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeVariant(index)}
                >
                  REMOVE
                </button>
              )}
            </div>
          ))}

          <button type="button" className="btn-add-variant" onClick={addVariant}>
            ADD ANOTHER SIZE
          </button>
        </section>

        <section className="form-section">
          <h3>Product Images*</h3>
          
          <div className="form-group">
            <label htmlFor="images">PRODUCT IMAGES:*</label>
            <input type="file" id="images" multiple accept="image/*" />
            <p className="help-text">You can select multiple images. First image will be set as primary.</p>
          </div>
        </section>

        <section className="form-section">
          <h3>Category & Classification</h3>
          
          <div className="form-group">
            <label htmlFor="category">CATEGORY:*</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="footwear">Footwear</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subcategory">SUBCATEGORY:</label>
            <input
              type="text"
              id="subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="brand">BRAND:*</label>
            <input
              type="text"
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">GENDER:*</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
        </section>

        <section className="form-section">
          <h3>Product Details</h3>
          
          <div className="form-group">
            <label htmlFor="dimensions">DIMENSIONS:</label>
            <input
              type="text"
              id="dimensions"
              placeholder="Length x Width x Height"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
            />
          </div>
        </section>

        <section className="form-section">
          <h3>Status</h3>
          
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={featuredProduct}
                onChange={(e) => setFeaturedProduct(e.target.checked)}
              />
              <span>FEATURED PRODUCT</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span>ACTIVE</span>
            </label>
          </div>
        </section>

        <section className="form-section">
          <h3>Media</h3>
          
          <div className="form-group">
            <label htmlFor="video">PRODUCT VIDEO:</label>
            <input type="file" id="video" accept="video/mp4,video/mov,video/avi" />
            <p className="help-text">Optional field. Allowed formats: mp4, mov, avi</p>
          </div>
        </section>

        <button type="button" className="btn-submit" onClick={handleSubmit}>
          ADD PRODUCT
        </button>
      </div>
    </div>
  );
};

export default AddProduct;