import React, { useState, useEffect, useMemo } from 'react';
import './AddProduct.css';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import TuneIcon from '@mui/icons-material/Tune';
import LayersIcon from '@mui/icons-material/Layers';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { API_BASE_URL } from '../../../utils/apiConfig';

const AddProductAdmin = () => {
  const [productName, setProductName] = useState('');
  const [about, setAbout] = useState('');
  const [variants, setVariants] = useState([{ size: '', price: '', originalPrice: '', stock: '' }]);
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
  const [subcategory, setSubcategory] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [weight, setWeight] = useState('');

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Dynamic Options
  const [genderOptions, setGenderOptions] = useState([]);
  const [genderCategoryMap, setGenderCategoryMap] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [brandName, setBrandName] = useState('Humming Tone');

  const colorOptions = ['Black', 'White', 'Navy Blue', 'Beige', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Gray', 'Olive', 'Maroon', 'Multicolor'];
  const materialOptions = ['100% Premium Cotton', 'Organic Cotton', 'Polyester Blend', 'French Terry Cotton', 'Fleece Cotton', 'Wool Blend', 'Silk Blend', 'Denim', 'Linen Blend', 'Rayon', 'Velvet'];

  // Fetch genders and categories from backend
  useEffect(() => {
    const fetchGendersAndCategories = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/api/site-content/genders-categories`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (response.ok) {
          const data = await response.json();
          if (data.genders && data.genders.length > 0) {
            setGenderOptions(data.genders);
            setGenderCategoryMap(data.genderCategoryMap || {});
            setBrandName(data.brandName || 'Humming Tone');
            if (!brand) setBrand(data.brandName || 'Humming Tone');
          }
        }
      } catch (error) {
        console.error('Error fetching genders and categories from site content:', error);
      }
    };

    fetchGendersAndCategories();
  }, []);

  // Fetch dynamic categories directly from DB endpoint based on selected gender
  useEffect(() => {
    const fetchCategoriesFromDb = async () => {
      try {
        let url = `${API_BASE_URL}/user/fetch_categories`;
        if (gender && gender !== 'All') {
          url += `?gender=${encodeURIComponent(gender)}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const catList = await res.json();
          if (Array.isArray(catList) && catList.length > 0) {
            setCategoryOptions(catList.map(name => ({ name, slug: name })));
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching categories from db:', err);
      }

      // Fallback to site content map if DB query is empty
      if (gender && genderCategoryMap[gender]) {
        const mapped = Array.isArray(genderCategoryMap[gender]) ? genderCategoryMap[gender] : [];
        setCategoryOptions(mapped.map(c => typeof c === 'object' ? (c.name || c.slug || '') : String(c)));
      } else {
        const allCats = [];
        Object.values(genderCategoryMap).forEach(cats => {
          if (Array.isArray(cats)) {
            cats.forEach(c => {
              const catName = typeof c === 'object' ? (c.name || c.slug || '') : String(c);
              if (catName && !allCats.includes(catName)) {
                allCats.push(catName);
              }
            });
          }
        });
        setCategoryOptions(allCats);
      }
    };

    fetchCategoriesFromDb();
  }, [gender, genderCategoryMap]);

  // Live Summary Calculations
  const summaryStats = useMemo(() => {
    const totalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
    const validPrices = variants.map(v => parseFloat(v.price)).filter(p => !isNaN(p) && p > 0);
    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
    const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;
    const uploadedImagesCount = images.filter(Boolean).length;
    return { totalStock, minPrice, maxPrice, uploadedImagesCount };
  }, [variants, images]);

  const validateForm = () => {
    const newErrors = {};
    if (!productName.trim()) newErrors.productName = 'Product title is required';
    if (!about.trim()) newErrors.about = 'Description is required';
    if (!category) newErrors.category = 'Category is required';
    if (!gender) newErrors.gender = 'Gender is required';
    if (!brand) newErrors.brand = 'Brand is required';
    if (!color.trim()) newErrors.color = 'Color is required';
    if (!material.trim()) newErrors.material = 'Material is required';
    if (!sku.trim()) newErrors.sku = 'SKU is required';
    if (!dimensions.trim()) newErrors.dimensions = 'Dimensions are required';
    if (!images[0]) newErrors.mainImage = 'Primary product photo is required';

    variants.forEach((v, i) => {
      if (!v.size.trim()) newErrors[`variant_${i}_size`] = 'Size required';
      if (!v.price || parseFloat(v.price) <= 0) newErrors[`variant_${i}_price`] = 'Valid price required';
      if (!v.originalPrice || parseFloat(v.originalPrice) <= 0) newErrors[`variant_${i}_originalPrice`] = 'Valid MRP required';
      if (!v.stock || parseInt(v.stock, 10) < 0) newErrors[`variant_${i}_stock`] = 'Valid stock required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearFieldError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const addVariant = () => {
    setVariants([...variants, { size: '', price: '', originalPrice: '', stock: '' }]);
  };

  const removeVariant = (i) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, idx) => idx !== i));
    }
  };

  const updateVariant = (i, field, val) => {
    const newVariants = [...variants];
    newVariants[i][field] = val;
    setVariants(newVariants);
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images];
        newImages[index] = { file: file, preview: reader.result };
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", productName);
      formData.append("about", about);
      formData.append("sku", sku);
      formData.append("category", category);
      formData.append("subcategory", subcategory);
      formData.append("brand", brand);
      formData.append("color", color);
      formData.append("material", material);
      formData.append("care_instructions", careInstructions);
      formData.append("gender", gender.toLowerCase());
      formData.append("age_range", ageRange);
      formData.append("weight", weight);
      formData.append("dimensions", dimensions);
      formData.append("is_featured", featuredProduct ? 1 : 0);
      formData.append("is_active", active ? 1 : 0);

      const formattedVariants = variants.map(v => ({
        size: v.size,
        price: Number(v.price),
        original_price: Number(v.originalPrice),
        stock_quantity: Number(v.stock)
      }));
      formData.append("variants", JSON.stringify(formattedVariants));

      images.forEach(img => {
        if (img?.file) formData.append("images", img.file);
      });

      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/admin/add_product`, {
        method: "POST",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.message || "Database Error");

      setShowSuccessModal(true);
      setTimeout(() => {
        resetForm();
      }, 2500);

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setProductName('');
    setAbout('');
    setVariants([{ size: '', price: '', originalPrice: '', stock: '' }]);
    setCategory('');
    setSku('');
    setBrand(brandName || 'Humming Tone');
    setGender('');
    setDimensions('');
    setColor('');
    setMaterial('');
    setFeaturedProduct(false);
    setActive(true);
    setImages([null, null, null, null, null]);
    setSubcategory('');
    setCareInstructions('');
    setAgeRange('');
    setWeight('');
    setErrors({});
  };

  return (
    <div className="ap-container">

      {/* ===== 2-COLUMN MINIMAL LAYOUT ===== */}
      <div className="ap-layout-grid">

        {/* LEFT COLUMN: Main Form (62%) */}
        <div className="ap-main-col">

          {/* CARD 1: Basic Information */}
          <div className="ap-card">
            <div className="ap-card-header">
              <div className="ap-card-title-wrap">
                <span className="ap-card-icon ap-icon-blue"><Inventory2Icon fontSize="inherit" /></span>
                <h3 className="ap-card-title">Basic Information</h3>
              </div>
            </div>

            <div className="ap-card-body">
              <div className="ap-form-grid">
                <div className="ap-form-group full-width">
                  <label htmlFor="productName">PRODUCT TITLE <span className="req">*</span></label>
                  <input
                    type="text"
                    id="productName"
                    placeholder="e.g. Oversized Heavyweight Graphic T-Shirt"
                    value={productName}
                    onChange={(e) => { setProductName(e.target.value); clearFieldError('productName'); }}
                    className={`ap-input ${errors.productName ? 'input-error' : ''}`}
                  />
                  {errors.productName && <span className="ap-field-error">{errors.productName}</span>}
                </div>

                <div className="ap-form-group">
                  <label htmlFor="sku">SKU <span className="req">*</span></label>
                  <input
                    type="text"
                    id="sku"
                    placeholder="e.g. HT-OST-BLK-001"
                    value={sku}
                    onChange={(e) => { setSku(e.target.value.toUpperCase()); clearFieldError('sku'); }}
                    className={`ap-input font-mono ${errors.sku ? 'input-error' : ''}`}
                  />
                  {errors.sku && <span className="ap-field-error">{errors.sku}</span>}
                </div>

                <div className="ap-form-group">
                  <label htmlFor="brand">BRAND <span className="req">*</span></label>
                  <input
                    type="text"
                    id="brand"
                    list="brand-options"
                    placeholder="Brand name"
                    value={brand}
                    onChange={(e) => { setBrand(e.target.value); clearFieldError('brand'); }}
                    className={`ap-input ${errors.brand ? 'input-error' : ''}`}
                  />
                  <datalist id="brand-options">
                    <option value={brandName} />
                    <option value="Humming Tone" />
                  </datalist>
                  {errors.brand && <span className="ap-field-error">{errors.brand}</span>}
                </div>

                <div className="ap-form-group full-width">
                  <label htmlFor="about">DESCRIPTION <span className="req">*</span></label>
                  <textarea
                    id="about"
                    placeholder="Product details, fabric, fit, and styling tips..."
                    value={about}
                    onChange={(e) => { setAbout(e.target.value); clearFieldError('about'); }}
                    rows="3"
                    className={`ap-textarea ${errors.about ? 'input-error' : ''}`}
                  />
                  {errors.about && <span className="ap-field-error">{errors.about}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Pricing & Variants */}
          <div className="ap-card">
            <div className="ap-card-header">
              <div className="ap-card-title-wrap">
                <span className="ap-card-icon ap-icon-emerald"><TuneIcon fontSize="inherit" /></span>
                <h3 className="ap-card-title">Pricing & Variants</h3>
              </div>
              <button type="button" className="ap-btn ap-btn-sm ap-btn-outline" onClick={addVariant}>
                <AddIcon fontSize="small" /> Add Variant
              </button>
            </div>

            <div className="ap-card-body">
              <div className="ap-variants-container">
                {variants.map((variant, index) => {
                  const discountPercent = variant.originalPrice && variant.price && parseFloat(variant.originalPrice) > parseFloat(variant.price)
                    ? Math.round(((parseFloat(variant.originalPrice) - parseFloat(variant.price)) / parseFloat(variant.originalPrice)) * 100)
                    : null;

                  return (
                    <div key={index} className="ap-variant-card">
                      <div className="ap-variant-top">
                        <div className="ap-variant-tag">
                          <span className="ap-variant-idx">#{index + 1}</span>
                          <strong>Variant {variant.size ? `(${variant.size})` : ''}</strong>
                          {discountPercent && <span className="ap-discount-pill">{discountPercent}% OFF</span>}
                        </div>
                        {variants.length > 1 && (
                          <button
                            type="button"
                            className="ap-variant-del-btn"
                            onClick={() => removeVariant(index)}
                            title="Remove Variant"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </button>
                        )}
                      </div>

                      <div className="ap-variant-grid">
                        <div className="ap-form-group">
                          <label>SIZE <span className="req">*</span></label>
                          <input
                            type="text"
                            placeholder="S, M, L, XL"
                            value={variant.size}
                            onChange={(e) => { updateVariant(index, 'size', e.target.value.toUpperCase()); clearFieldError(`variant_${index}_size`); }}
                            className={`ap-input ${errors[`variant_${index}_size`] ? 'input-error' : ''}`}
                          />
                        </div>

                        <div className="ap-form-group">
                          <label>PRICE (₹) <span className="req">*</span></label>
                          <input
                            type="number"
                            placeholder="499"
                            value={variant.price}
                            onChange={(e) => { updateVariant(index, 'price', e.target.value); clearFieldError(`variant_${index}_price`); }}
                            className={`ap-input ${errors[`variant_${index}_price`] ? 'input-error' : ''}`}
                          />
                        </div>

                        <div className="ap-form-group">
                          <label>MRP (₹) <span className="req">*</span></label>
                          <input
                            type="number"
                            placeholder="999"
                            value={variant.originalPrice}
                            onChange={(e) => { updateVariant(index, 'originalPrice', e.target.value); clearFieldError(`variant_${index}_originalPrice`); }}
                            className={`ap-input ${errors[`variant_${index}_originalPrice`] ? 'input-error' : ''}`}
                          />
                        </div>

                        <div className="ap-form-group">
                          <label>STOCK <span className="req">*</span></label>
                          <input
                            type="number"
                            placeholder="50"
                            value={variant.stock}
                            onChange={(e) => { updateVariant(index, 'stock', e.target.value); clearFieldError(`variant_${index}_stock`); }}
                            className={`ap-input ${errors[`variant_${index}_stock`] ? 'input-error' : ''}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CARD 3: Category & Attributes */}
          <div className="ap-card">
            <div className="ap-card-header">
              <div className="ap-card-title-wrap">
                <span className="ap-card-icon ap-icon-purple"><CategoryIcon fontSize="inherit" /></span>
                <h3 className="ap-card-title">Category & Attributes</h3>
              </div>
            </div>

            <div className="ap-card-body">
              <div className="ap-form-grid">
                <div className="ap-form-group">
                  <label htmlFor="gender">GENDER <span className="req">*</span></label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => { setGender(e.target.value); clearFieldError('gender'); }}
                    className={`ap-select ${errors.gender ? 'input-error' : ''}`}
                  >
                    <option value="">Select Gender</option>
                    {genderOptions.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  {errors.gender && <span className="ap-field-error">{errors.gender}</span>}
                </div>

                <div className="ap-form-group">
                  <label htmlFor="category">CATEGORY <span className="req">*</span></label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); clearFieldError('category'); }}
                    className={`ap-select ${errors.category ? 'input-error' : ''}`}
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map((c, idx) => {
                      const label = typeof c === 'object' ? (c.name || c.slug || String(idx)) : String(c);
                      return (
                        <option key={idx} value={label}>{label}</option>
                      );
                    })}
                  </select>
                  {errors.category && <span className="ap-field-error">{errors.category}</span>}
                </div>

                <div className="ap-form-group">
                  <label htmlFor="subcategory">SUBCATEGORY</label>
                  <input
                    type="text"
                    id="subcategory"
                    placeholder="e.g. Drop Shoulder"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="ap-input"
                  />
                </div>

                <div className="ap-form-group">
                  <label htmlFor="ageRange">AGE RANGE</label>
                  <input
                    type="text"
                    id="ageRange"
                    placeholder="e.g. Adults, 18-35"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="ap-input"
                  />
                </div>

                <div className="ap-form-group">
                  <label htmlFor="color">COLOR <span className="req">*</span></label>
                  <input
                    type="text"
                    id="color"
                    list="color-options"
                    placeholder="Color name"
                    value={color}
                    onChange={(e) => { setColor(e.target.value); clearFieldError('color'); }}
                    className={`ap-input ${errors.color ? 'input-error' : ''}`}
                  />
                  <datalist id="color-options">
                    {colorOptions.map(c => <option key={c} value={c} />)}
                  </datalist>
                  {errors.color && <span className="ap-field-error">{errors.color}</span>}
                </div>

                <div className="ap-form-group">
                  <label htmlFor="material">MATERIAL <span className="req">*</span></label>
                  <input
                    type="text"
                    id="material"
                    list="material-options"
                    placeholder="e.g. 100% Cotton"
                    value={material}
                    onChange={(e) => { setMaterial(e.target.value); clearFieldError('material'); }}
                    className={`ap-input ${errors.material ? 'input-error' : ''}`}
                  />
                  <datalist id="material-options">
                    {materialOptions.map(m => <option key={m} value={m} />)}
                  </datalist>
                  {errors.material && <span className="ap-field-error">{errors.material}</span>}
                </div>

                <div className="ap-form-group">
                  <label htmlFor="dimensions">DIMENSIONS <span className="req">*</span></label>
                  <input
                    type="text"
                    id="dimensions"
                    placeholder="L x W x H"
                    value={dimensions}
                    onChange={(e) => { setDimensions(e.target.value); clearFieldError('dimensions'); }}
                    className={`ap-input ${errors.dimensions ? 'input-error' : ''}`}
                  />
                  {errors.dimensions && <span className="ap-field-error">{errors.dimensions}</span>}
                </div>

                <div className="ap-form-group">
                  <label htmlFor="weight">WEIGHT (KG)</label>
                  <input
                    type="number"
                    step="0.01"
                    id="weight"
                    placeholder="0.35"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="ap-input"
                  />
                </div>

                <div className="ap-form-group full-width">
                  <label htmlFor="careInstructions">CARE INSTRUCTIONS</label>
                  <textarea
                    id="careInstructions"
                    placeholder="Machine wash cold, do not bleach..."
                    value={careInstructions}
                    onChange={(e) => setCareInstructions(e.target.value)}
                    rows="2"
                    className="ap-textarea"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="ap-bottom-actions">
            <button type="button" className="ap-btn ap-btn-outline" onClick={resetForm} disabled={isSubmitting}>
              <RestartAltIcon fontSize="small" />
              Reset Form
            </button>
            <button type="button" className="ap-btn ap-btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
              <CloudUploadIcon fontSize="small" />
              {isSubmitting ? 'Publishing Product...' : 'Publish Product to Store'}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Media & Status Sidebar (38%) */}
        <div className="ap-side-col">

          {/* CARD 4: Product Media (Portrait 3:4 Aspect Ratio matching user panel) */}
          <div className="ap-card">
            <div className="ap-card-header">
              <div className="ap-card-title-wrap">
                <span className="ap-card-icon ap-icon-blue"><AddPhotoAlternateIcon fontSize="inherit" /></span>
                <h3 className="ap-card-title">Product Media</h3>
              </div>
              <span className="ap-badge-tag-sm">3:4 Aspect Ratio</span>
            </div>

            <div className="ap-card-body">
              {/* Primary 3:4 Hero Image Box */}
              <div className="ap-media-hero-container">
                <input
                  type="file"
                  id="image-0"
                  accept="image/*"
                  onChange={(e) => { handleImageUpload(0, e); clearFieldError('mainImage'); }}
                  style={{ display: 'none' }}
                />

                {images[0] ? (
                  <div className="ap-userpanel-img-box">
                    <img src={images[0].preview} alt="Main product" className="ap-userpanel-img" />
                    <span className="ap-main-pill">PRIMARY IMAGE</span>
                    <button type="button" className="ap-media-remove-btn" onClick={() => removeImage(0)}>
                      <CloseIcon fontSize="small" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="image-0" className={`ap-userpanel-placeholder ${errors.mainImage ? 'error-border' : ''}`}>
                    <AddPhotoAlternateIcon className="ap-upload-icon-large" />
                    <strong>Upload Primary Photo</strong>
                    <span>3:4 Portrait Fashion Ratio</span>
                    <span className="ap-badge-req">Required</span>
                  </label>
                )}
                {errors.mainImage && <span className="ap-field-error text-center">{errors.mainImage}</span>}
              </div>

              {/* Secondary Thumbnails */}
              <div className="ap-secondary-media-grid">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="ap-secondary-item">
                    <input
                      type="file"
                      id={`image-${i}`}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(i, e)}
                      style={{ display: 'none' }}
                    />
                    {images[i] ? (
                      <div className="ap-sub-preview-box">
                        <img src={images[i].preview} alt={`Angle ${i + 1}`} className="ap-userpanel-img" />
                        <button type="button" className="ap-sub-remove-btn" onClick={() => removeImage(i)}>
                          <CloseIcon fontSize="inherit" />
                        </button>
                      </div>
                    ) : (
                      <label htmlFor={`image-${i}`} className="ap-sub-placeholder">
                        <AddPhotoAlternateIcon fontSize="small" />
                        <span>Angle {i + 1}</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CARD 5: Publishing & Status */}
          <div className="ap-card">
            <div className="ap-card-header">
              <div className="ap-card-title-wrap">
                <span className="ap-card-icon ap-icon-gold"><VisibilityIcon fontSize="inherit" /></span>
                <h3 className="ap-card-title">Publishing & Status</h3>
              </div>
            </div>

            <div className="ap-card-body">
              <div className="ap-toggles-list">
                <label className={`ap-toggle-card ${active ? 'active-state' : ''}`}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                  <div className="ap-toggle-info">
                    <strong>Catalog Visibility</strong>
                    <p>Visible to customers in store</p>
                  </div>
                  <span className={`ap-status-badge ${active ? 'badge-green' : 'badge-gray'}`}>
                    {active ? 'ACTIVE' : 'DRAFT'}
                  </span>
                </label>

                <label className={`ap-toggle-card ${featuredProduct ? 'featured-state' : ''}`}>
                  <input
                    type="checkbox"
                    checked={featuredProduct}
                    onChange={(e) => setFeaturedProduct(e.target.checked)}
                  />
                  <div className="ap-toggle-info">
                    <strong>Featured Showcase</strong>
                    <p>Highlight on homepage slider</p>
                  </div>
                  <span className={`ap-status-badge ${featuredProduct ? 'badge-gold' : 'badge-gray'}`}>
                    {featuredProduct ? '★ FEATURED' : 'STANDARD'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* CARD 6: Live Summary Card */}
          <div className="ap-card ap-summary-card">
            <div className="ap-card-header">
              <div className="ap-card-title-wrap">
                <span className="ap-card-icon ap-icon-blue"><CheckCircleIcon fontSize="inherit" /></span>
                <h3 className="ap-card-title">Summary Snapshot</h3>
              </div>
            </div>

            <div className="ap-card-body">
              <div className="ap-snapshot-grid">
                <div className="ap-snapshot-item">
                  <span>VARIANTS</span>
                  <strong>{variants.length} SKU(s)</strong>
                </div>
                <div className="ap-snapshot-item">
                  <span>TOTAL STOCK</span>
                  <strong className="color-emerald">{summaryStats.totalStock} Units</strong>
                </div>
                <div className="ap-snapshot-item">
                  <span>PRICE RANGE</span>
                  <strong className="color-dark">
                    ₹{summaryStats.minPrice.toFixed(0)} {summaryStats.minPrice !== summaryStats.maxPrice ? `– ₹${summaryStats.maxPrice.toFixed(0)}` : ''}
                  </strong>
                </div>
                <div className="ap-snapshot-item">
                  <span>PHOTOS</span>
                  <strong>{summaryStats.uploadedImagesCount} / 5</strong>
                </div>
              </div>

              <button
                type="button"
                className="ap-btn ap-btn-primary full-width"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                <CloudUploadIcon fontSize="small" />
                {isSubmitting ? 'Publishing...' : 'Publish Product'}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ===== SUCCESS MODAL ===== */}
      {showSuccessModal && (
        <div className="ap-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ap-modal-header">
              <div className="ap-modal-icon-wrap">
                <CheckCircleIcon className="ap-success-icon" />
              </div>
              <h3 className="ap-modal-title">Product Added Successfully!</h3>
              <button className="ap-modal-close" onClick={() => setShowSuccessModal(false)}>
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <div className="ap-modal-body">
              <p className="ap-success-message">Your new product has been successfully saved to the catalog and inventory database.</p>
              <div className="ap-success-details">
                <span className="ap-product-name-display">{productName}</span>
                <span className="ap-success-sub">SKU: {sku || 'N/A'} • {variants.length} Variant(s) Created</span>
              </div>
            </div>
            <div className="ap-modal-footer">
              <button className="ap-btn ap-btn-primary" onClick={() => setShowSuccessModal(false)}>
                Add Another Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductAdmin;