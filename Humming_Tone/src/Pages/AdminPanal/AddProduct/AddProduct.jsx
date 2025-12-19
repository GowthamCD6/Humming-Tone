import React, { useState } from 'react';
import './AddProduct.css';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';

const AddProduct = () => {
  const [productName, setProductName] = useState('');
  const [about, setAbout] = useState('');
  const [variants, setVariants] = useState([
    { size: '', price: '', originalPrice: '', stock: '' }
  ]);
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [gender, setGender] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [featuredProduct, setFeaturedProduct] = useState(false);
  const [active, setActive] = useState(true);
  const [images, setImages] = useState([null, null, null, null, null]);

  // Predefined options
  const brandOptions = ['Humming Tone', 'Other'];
  const colorOptions = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Pink', 'Purple', 'Orange', 'Brown', 'Gray', 'Multicolor'];
  const materialOptions = ['Cotton', 'Polyester', 'Wool', 'Silk', 'Denim', 'Leather', 'Linen', 'Nylon', 'Rayon', 'Velvet', 'Mixed'];

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

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images];
        newImages[index] = {
          file: file,
          preview: reader.result
        };
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const handleSubmit = () => {
    console.log('Product data:', {
      productName,
      about,
      variants,
      category,
      sku,
      brand,
      gender,
      dimensions,
      color,
      material,
      featuredProduct,
      active,
      images: images.filter(img => img !== null)
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
              <label htmlFor="gender">GENDER</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Mens">Mens</option>
                <option value="Childrens">Childrens</option>
                <option value="Baby">Baby</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="sku">SKU</label>
              <input
                type="text"
                id="sku"
                placeholder="Enter SKU"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="brand">BRAND</label>
              <select
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="">Select Brand</option>
                {brandOptions.map((brandOption) => (
                  <option key={brandOption} value={brandOption}>
                    {brandOption}
                  </option>
                ))}
              </select>
            </div>

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
              <label htmlFor="color">COLOR</label>
              <input
                type="text"
                id="color"
                list="color-options"
                placeholder="Select or type color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <datalist id="color-options">
                {colorOptions.map((colorOption) => (
                  <option key={colorOption} value={colorOption} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label htmlFor="material">MATERIAL</label>
              <input
                type="text"
                id="material"
                list="material-options"
                placeholder="Select or type material"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
              <datalist id="material-options">
                {materialOptions.map((materialOption) => (
                  <option key={materialOption} value={materialOption} />
                ))}
              </datalist>
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
          <h2 className="section-title">Product Images</h2>
          <p className="section-subtitle">Upload up to 5 images. First image will be the main product image.</p>
          
          <div className="images-upload-grid">
            {/* Main Image */}
            <div className="image-upload-box main-image">
              <input
                type="file"
                id="image-0"
                accept="image/*"
                onChange={(e) => handleImageUpload(0, e)}
                style={{ display: 'none' }}
              />
              {images[0] ? (
                <div className="image-preview">
                  <img src={images[0].preview} alt="Main product" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeImage(0)}
                  >
                    <CloseIcon />
                  </button>
                  <span className="image-badge">MAIN</span>
                </div>
              ) : (
                <label htmlFor="image-0" className="upload-placeholder">
                  <AddPhotoAlternateIcon className="upload-icon" />
                  <span className="upload-text">Main Image</span>
                  <span className="upload-subtext">Required</span>
                </label>
              )}
            </div>

            {/* Secondary Images */}
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="image-upload-box">
                <input
                  type="file"
                  id={`image-${index}`}
                  accept="image/*"
                  onChange={(e) => handleImageUpload(index, e)}
                  style={{ display: 'none' }}
                />
                {images[index] ? (
                  <div className="image-preview">
                    <img src={images[index].preview} alt={`Product ${index}`} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeImage(index)}
                    >
                      <CloseIcon />
                    </button>
                  </div>
                ) : (
                  <label htmlFor={`image-${index}`} className="upload-placeholder">
                    <AddPhotoAlternateIcon className="upload-icon" />
                    <span className="upload-text">Image {index}</span>
                    <span className="upload-subtext">Optional</span>
                  </label>
                )}
              </div>
            ))}
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