// import React, { useState } from 'react';
// import './AddProduct.css';
// import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
// import CloseIcon from '@mui/icons-material/Close';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// const AddProduct = () => {
//   const [productName, setProductName] = useState('');
//   const [about, setAbout] = useState('');
//   const [variants, setVariants] = useState([
//     { size: '', price: '', originalPrice: '', stock: '' }
//   ]);
//   const [category, setCategory] = useState('');
//   const [sku, setSku] = useState('');
//   const [brand, setBrand] = useState('');
//   const [gender, setGender] = useState('');
//   const [dimensions, setDimensions] = useState('');
//   const [color, setColor] = useState('');
//   const [material, setMaterial] = useState('');
//   const [featuredProduct, setFeaturedProduct] = useState(false);
//   const [active, setActive] = useState(true);
//   const [images, setImages] = useState([null, null, null, null, null]);
//   const [subcategory, setSubcategory] = useState('');
//   const [careInstructions, setCareInstructions] = useState('');
//   const [ageRange, setAgeRange] = useState('');
//   const [weight, setWeight] = useState('');

//   // Validation states
//   const [errors, setErrors] = useState({});
//   const [showSuccessModal, setShowSuccessModal] = useState(false);


//   // Predefined options
//   const brandOptions = ['Humming Tone', 'Other'];
//   const colorOptions = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Pink', 'Purple', 'Orange', 'Brown', 'Gray', 'Multicolor'];
//   const materialOptions = ['Cotton', 'Polyester', 'Wool', 'Silk', 'Denim', 'Leather', 'Linen', 'Nylon', 'Rayon', 'Velvet', 'Mixed'];

//   // Validation function
//   const validateForm = () => {
//     const newErrors = {};

//     if (!productName.trim()) newErrors.productName = 'Product name is required';
//     if (!about.trim()) newErrors.about = 'Product description is required';
//     if (!category) newErrors.category = 'Category is required';
//     if (!gender) newErrors.gender = 'Gender is required';
//     if (!brand) newErrors.brand = 'Brand is required';
//     if (!color.trim()) newErrors.color = 'Color is required';
//     if (!material.trim()) newErrors.material = 'Material is required';
//     if (!sku.trim()) newErrors.sku = 'SKU is required';
//     if (!dimensions.trim()) newErrors.dimensions = 'Dimensions are required';

//     // Validate at least one image
//     if (!images[0]) {
//       newErrors.mainImage = 'Main product image is required';
//     }

//     // Validate variants
//     variants.forEach((variant, index) => {
//       if (!variant.size.trim()) newErrors[`variant_${index}_size`] = 'Size is required';
//       if (!variant.price || parseFloat(variant.price) <= 0) newErrors[`variant_${index}_price`] = 'Valid price is required';
//       if (!variant.originalPrice || parseFloat(variant.originalPrice) <= 0) newErrors[`variant_${index}_originalPrice`] = 'Valid original price is required';
//       if (!variant.stock || parseInt(variant.stock) < 0) newErrors[`variant_${index}_stock`] = 'Valid stock quantity is required';
//     });

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const clearFieldError = (fieldName) => {
//     if (errors[fieldName]) {
//       setErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors[fieldName];
//         return newErrors;
//       });
//     }
//   };

//   const addVariant = () => {
//     setVariants([...variants, { size: '', price: '', originalPrice: '', stock: '' }]);
//   };

//   const removeVariant = (index) => {
//     const newVariants = variants.filter((_, i) => i !== index);
//     setVariants(newVariants);
//   };

//   const updateVariant = (index, field, value) => {
//     const newVariants = [...variants];
//     newVariants[index][field] = value;
//     setVariants(newVariants);
//   };

//   const handleImageUpload = (index, e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         const newImages = [...images];
//         newImages[index] = {
//           file: file,
//           preview: reader.result
//         };
//         setImages(newImages);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const removeImage = (index) => {
//     const newImages = [...images];
//     newImages[index] = null;
//     setImages(newImages);
//   };

//   const handleSubmit = () => {
//     // Validate form before submission
//     if (!validateForm()) {
//       return;
//     }

//     const formData = new FormData();

//     const categorySlugMap = {
//       "Winter sets": "winter_sets",
//       "T Shirts": "t_shirts",
//       "Sleepingbags": "sleeping_bags",
//       "Dresses": "dresses"
//     };

//     // basic fields
//     formData.append("name", productName);
//     formData.append("about", about);
//     formData.append("sku", sku);
//     if (category) formData.append("category", categorySlugMap[category]);
//     if (subcategory) formData.append("subcategory", subcategory);
//     formData.append("brand", brand);
//     formData.append("color", color);
//     formData.append("material", material);
//     if (careInstructions) formData.append("care_instructions", careInstructions);
//     formData.append("gender", gender.toLowerCase()); // backend expects lowercase
//     if (ageRange) formData.append("age_range", ageRange);
//     if (weight) formData.append("weight", Number(weight));
//     formData.append("dimensions", dimensions);

//     // booleans → backend uses 0 / 1
//     formData.append("is_featured", featuredProduct ? 1 : 0);
//     formData.append("is_active", active ? 1 : 0);

//     // variants (IMPORTANT)
//     const formattedVariants = variants.map(v => ({
//       size: v.size,
//       price: Number(v.price),
//       original_price: Number(v.originalPrice),
//       stock_quantity: Number(v.stock)
//     }));

//     formData.append("variants", JSON.stringify(formattedVariants));

//     // images
//     images.forEach(img => {
//       if (img?.file) {
//         formData.append("images", img.file); // must match multer field name
//       }
//     });

//     // DEBUG (very important)
//     for (let pair of formData.entries()) {
//       console.log(pair[0], pair[1]);
//     }

//     // SEND
//     fetch("http://localhost:5000/admin/add_product", {
//       method: "POST",
//       body: formData
//     })
//       .then(res => res.json())
//       .then(data => {
//         console.log(data);
//         setShowSuccessModal(true);
//         // Reset form after successful submission
//         setTimeout(() => {
//           resetForm();
//         }, 2000);
//       })
//       .catch(err => {
//         console.error(err);
//         alert("Failed to add product");
//       });
//   };

//   const resetForm = () => {
//     setProductName('');
//     setAbout('');
//     setVariants([{ size: '', price: '', originalPrice: '', stock: '' }]);
//     setCategory('');
//     setSku('');
//     setBrand('');
//     setGender('');
//     setDimensions('');
//     setColor('');
//     setMaterial('');
//     setFeaturedProduct(false);
//     setActive(true);
//     setImages([null, null, null, null, null]);
//     setSubcategory('');
//     setCareInstructions('');
//     setAgeRange('');
//     setWeight('');
//     setErrors({});
//   };

//   return (
//     <div className="add-product-container">
//       <div className="product-form">
//         {/* Basic Information */}
//         <section className="form-section">
//           <h2 className="section-title">Basic Information</h2>
          
//           <div className="form-grid">
//             <div className="form-group full-width">
//               <label htmlFor="productName">PRODUCT NAME</label>
//               <input
//                 type="text"
//                 id="productName"
//                 placeholder="Enter product name"
//                 value={productName}
//                 onChange={(e) => {
//                   setProductName(e.target.value);
//                   clearFieldError('productName');
//                 }}
//                 className={errors.productName ? 'input-error' : ''}
//               />
//               {errors.productName && <div className="field-error">{errors.productName}</div>}
//             </div>

//             <div className="form-group full-width">
//               <label htmlFor="about">PRODUCT DESCRIPTION</label>
//               <textarea
//                 id="about"
//                 placeholder="Enter detailed product description"
//                 value={about}
//                 onChange={(e) => {
//                   setAbout(e.target.value);
//                   clearFieldError('about');
//                 }}
//                 rows="5"
//                 className={errors.about ? 'input-error' : ''}
//               />
//               {errors.about && <div className="field-error">{errors.about}</div>}
//             </div>
//           </div>
//         </section>

//         {/* Category & Classification */}
//         <section className="form-section">
//           <h2 className="section-title">Category & Details</h2>
          
//           <div className="form-grid">
//             <div className="form-group">
//               <label htmlFor="gender">GENDER</label>
//               <select
//                 id="gender"
//                 value={gender}
//                 onChange={(e) => {
//                   setGender(e.target.value);
//                   clearFieldError('gender');
//                 }}
//                 className={errors.gender ? 'input-error' : ''}
//               >
//                 <option value="">Select Gender</option>
//                 <option value="Men">Mens</option>
//                 <option value="Children">Childrens</option>
//                 <option value="Babies">Baby</option>
//                 <option value="Sports">Sports</option>
//               </select>
//               {errors.gender && <div className="field-error">{errors.gender}</div>}
//             </div>

//             <div className="form-group">
//               <label htmlFor="ageRange">AGE RANGE</label>
//               <input
//                 type="text"
//                 id="ageRange"
//                 placeholder="e.g. 2-4 years, 6-8 years"
//                 value={ageRange}
//                 onChange={(e) => setAgeRange(e.target.value)}
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="subcategory">SUBCATEGORY</label>
//               <input
//                 type="text"
//                 id="subcategory"
//                 placeholder="e.g. Full Sleeve, Half Sleeve"
//                 value={subcategory}
//                 onChange={(e) => setSubcategory(e.target.value)}
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="sku">SKU</label>
//               <input
//                 type="text"
//                 id="sku"
//                 placeholder="Enter SKU"
//                 value={sku}
//                 onChange={(e) => {
//                   setSku(e.target.value);
//                   clearFieldError('sku');
//                 }}
//                 className={errors.sku ? 'input-error' : ''}
//               />
//               {errors.sku && <div className="field-error">{errors.sku}</div>}
//             </div>

//             <div className="form-group full-width">
//               <label htmlFor="careInstructions">CARE INSTRUCTIONS</label>
//               <textarea
//                 id="careInstructions"
//                 placeholder="Wash cold, do not bleach"
//                 value={careInstructions}
//                 onChange={(e) => setCareInstructions(e.target.value)}
//                 rows="3"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="brand">BRAND</label>
//               <select
//                 id="brand"
//                 value={brand}
//                 onChange={(e) => {
//                   setBrand(e.target.value);
//                   clearFieldError('brand');
//                 }}
//                 className={errors.brand ? 'input-error' : ''}
//               >
//                 <option value="">Select Brand</option>
//                 {brandOptions.map((brandOption) => (
//                   <option key={brandOption} value={brandOption}>
//                     {brandOption}
//                   </option>
//                 ))}
//               </select>
//               {errors.brand && <div className="field-error">{errors.brand}</div>}
//             </div>

//             <div className="form-group">
//               <label htmlFor="category">CATEGORY</label>
//               <select
//                 id="category"
//                 value={category}
//                 onChange={(e) => {
//                   setCategory(e.target.value);
//                   clearFieldError('category');
//                 }}
//                 className={errors.category ? 'input-error' : ''}
//               >
//                 <option value="">Select Category</option>
//                 <option value="Winter sets">Winter sets</option>
//                 <option value="T Shirts">T Shirts</option>
//                 <option value="Sleepingbags">Sleepingbags</option>
//                 <option value="Dresses">Dresses</option>
//               </select>
//               {errors.category && <div className="field-error">{errors.category}</div>}
//             </div>

//             <div className="form-group">
//               <label htmlFor="color">COLOR</label>
//               <input
//                 type="text"
//                 id="color"
//                 list="color-options"
//                 placeholder="Select or type color"
//                 value={color}
//                 onChange={(e) => {
//                   setColor(e.target.value);
//                   clearFieldError('color');
//                 }}
//                 className={errors.color ? 'input-error' : ''}
//               />
//               <datalist id="color-options">
//                 {colorOptions.map((colorOption) => (
//                   <option key={colorOption} value={colorOption} />
//                 ))}
//               </datalist>
//               {errors.color && <div className="field-error">{errors.color}</div>}
//             </div>

//             <div className="form-group">
//               <label htmlFor="material">MATERIAL</label>
//               <input
//                 type="text"
//                 id="material"
//                 list="material-options"
//                 placeholder="Select or type material"
//                 value={material}
//                 onChange={(e) => {
//                   setMaterial(e.target.value);
//                   clearFieldError('material');
//                 }}
//                 className={errors.material ? 'input-error' : ''}
//               />
//               <datalist id="material-options">
//                 {materialOptions.map((materialOption) => (
//                   <option key={materialOption} value={materialOption} />
//                 ))}
//               </datalist>
//               {errors.material && <div className="field-error">{errors.material}</div>}
//             </div>

//             <div className="form-group full-width">
//               <label htmlFor="dimensions">DIMENSIONS</label>
//               <input
//                 type="text"
//                 id="dimensions"
//                 placeholder="Length x Width x Height"
//                 value={dimensions}
//                 onChange={(e) => {
//                   setDimensions(e.target.value);
//                   clearFieldError('dimensions');
//                 }}
//                 className={errors.dimensions ? 'input-error' : ''}
//               />
//               {errors.dimensions && <div className="field-error">{errors.dimensions}</div>}
//             </div>

//             <div className="form-group">
//               <label htmlFor="weight">WEIGHT (kg)</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 id="weight"
//                 placeholder="e.g. 0.75"
//                 value={weight}
//                 onChange={(e) => setWeight(e.target.value)}
//               />
//             </div>

//           </div>
//         </section>

//         {/* Product Variants */}
//         <section className="form-section">
//           <h2 className="section-title">Product Variants</h2>
          
//           {variants.map((variant, index) => (
//             <div key={index} className="variant-card">
//               <div className="variant-header">
//                 <span className="variant-number">Variant {index + 1}</span>
//                 {variants.length > 1 && (
//                   <button
//                     type="button"
//                     className="btn-remove-icon"
//                     onClick={() => removeVariant(index)}
//                   >
//                     ×
//                   </button>
//                 )}
//               </div>
              
//               <div className="variant-fields">
//                 <div className="form-group">
//                   <label>SIZE</label>
//                   <input
//                     type="text"
//                     placeholder="S, M, L, XL"
//                     value={variant.size}
//                     onChange={(e) => {
//                       updateVariant(index, 'size', e.target.value);
//                       clearFieldError(`variant_${index}_size`);
//                     }}
//                     className={errors[`variant_${index}_size`] ? 'input-error' : ''}
//                   />
//                   {errors[`variant_${index}_size`] && <div className="field-error">{errors[`variant_${index}_size`]}</div>}
//                 </div>

//                 <div className="form-group">
//                   <label>PRICE (₹)</label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     placeholder="0.00"
//                     value={variant.price}
//                     onChange={(e) => {
//                       updateVariant(index, 'price', e.target.value);
//                       clearFieldError(`variant_${index}_price`);
//                     }}
//                     className={errors[`variant_${index}_price`] ? 'input-error' : ''}
//                   />
//                   {errors[`variant_${index}_price`] && <div className="field-error">{errors[`variant_${index}_price`]}</div>}
//                 </div>

//                 <div className="form-group">
//                   <label>ORIGINAL PRICE (₹)</label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     placeholder="0.00"
//                     value={variant.originalPrice}
//                     onChange={(e) => {
//                       updateVariant(index, 'originalPrice', e.target.value);
//                       clearFieldError(`variant_${index}_originalPrice`);
//                     }}
//                     className={errors[`variant_${index}_originalPrice`] ? 'input-error' : ''}
//                   />
//                   {errors[`variant_${index}_originalPrice`] && <div className="field-error">{errors[`variant_${index}_originalPrice`]}</div>}
//                 </div>

//                 <div className="form-group">
//                   <label>STOCK</label>
//                   <input
//                     type="number"
//                     placeholder="0"
//                     value={variant.stock}
//                     onChange={(e) => {
//                       updateVariant(index, 'stock', e.target.value);
//                       clearFieldError(`variant_${index}_stock`);
//                     }}
//                     className={errors[`variant_${index}_stock`] ? 'input-error' : ''}
//                   />
//                   {errors[`variant_${index}_stock`] && <div className="field-error">{errors[`variant_${index}_stock`]}</div>}
//                 </div>
//               </div>
//             </div>
//           ))}

//           <button type="button" className="btn-add-variant" onClick={addVariant}>
//             + ADD VARIANT
//           </button>
//         </section>

//         {/* Product Images */}
//         <section className="form-section">
//           <h2 className="section-title">Product Images</h2>
//           <p className="section-subtitle">Upload up to 5 images. First image will be the main product image.</p>
          
//           <div className="images-upload-grid">
//             {/* Main Image */}
//             <div className={`image-upload-box main-image ${errors.mainImage ? 'upload-error' : ''}`}>
//               <input
//                 type="file"
//                 id="image-0"
//                 accept="image/*"
//                 onChange={(e) => {
//                   handleImageUpload(0, e);
//                   clearFieldError('mainImage');
//                 }}
//                 style={{ display: 'none' }}
//               />
//               {images[0] ? (
//                 <div className="image-preview">
//                   <img src={images[0].preview} alt="Main product" />
//                   <button
//                     type="button"
//                     className="remove-image-btn"
//                     onClick={() => removeImage(0)}
//                   >
//                     <CloseIcon />
//                   </button>
//                   <span className="image-badge">MAIN</span>
//                 </div>
//               ) : (
//                 <label htmlFor="image-0" className="upload-placeholder">
//                   <AddPhotoAlternateIcon className="upload-icon" />
//                   <span className="upload-text">Main Image</span>
//                   <span className="upload-subtext">Required</span>
//                 </label>
//               )}
//               {errors.mainImage && <div className="field-error">{errors.mainImage}</div>}
//             </div>

//             {/* Secondary Images */}
//             {[1, 2, 3, 4].map((index) => (
//               <div key={index} className="image-upload-box">
//                 <input
//                   type="file"
//                   id={`image-${index}`}
//                   accept="image/*"
//                   onChange={(e) => handleImageUpload(index, e)}
//                   style={{ display: 'none' }}
//                 />
//                 {images[index] ? (
//                   <div className="image-preview">
//                     <img src={images[index].preview} alt={`Product ${index}`} />
//                     <button
//                       type="button"
//                       className="remove-image-btn"
//                       onClick={() => removeImage(index)}
//                     >
//                       <CloseIcon />
//                     </button>
//                   </div>
//                 ) : (
//                   <label htmlFor={`image-${index}`} className="upload-placeholder">
//                     <AddPhotoAlternateIcon className="upload-icon" />
//                     <span className="upload-text">Image {index}</span>
//                     <span className="upload-subtext">Optional</span>
//                   </label>
//                 )}
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Status */}
//         <section className="form-section">
//           <h2 className="section-title">Product Status</h2>
          
//           <div className="checkbox-grid">
//             <label className="checkbox-card">
//               <input
//                 type="checkbox"
//                 checked={featuredProduct}
//                 onChange={(e) => setFeaturedProduct(e.target.checked)}
//               />
//               <div className="checkbox-content">
//                 <span className="checkbox-title">FEATURED PRODUCT</span>
//                 <span className="checkbox-desc">Display this product in featured section</span>
//               </div>
//             </label>

//             <label className="checkbox-card">
//               <input
//                 type="checkbox"
//                 checked={active}
//                 onChange={(e) => setActive(e.target.checked)}
//               />
//               <div className="checkbox-content">
//                 <span className="checkbox-title">ACTIVE</span>
//                 <span className="checkbox-desc">Make this product visible to customers</span>
//               </div>
//             </label>
//           </div>
//         </section>

//         {/* Submit Button */}
//         <div className="form-actions">
//           <button type="button" className="btn-cancel">
//             CANCEL
//           </button>
//           <button type="button" className="btn-submit" onClick={handleSubmit}>
//             ADD PRODUCT
//           </button>
//         </div>
//       </div>

//       {/* Success Modal */}
//       {showSuccessModal && (
//         <div className="ap-modal-overlay" onClick={() => setShowSuccessModal(false)}>
//           <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="ap-modal-header">
//               <CheckCircleIcon className="success-icon" />
//               <h3 className="ap-modal-title">Product Added Successfully!</h3>
//               <button
//                 className="ap-modal-close"
//                 onClick={() => setShowSuccessModal(false)}
//               >
//                 <CloseIcon />
//               </button>
//             </div>
//             <div className="ap-modal-body">
//               <p className="success-message">
//                 Your product has been successfully added to the catalog.
//               </p>
//               <div className="success-details">
//                 <span className="product-name-display">{productName}</span>
//                 <span className="success-sub">has been saved and is now available for management.</span>
//               </div>
//             </div>
//             <div className="ap-modal-footer">
//               <button
//                 className="btn-primary"
//                 onClick={() => setShowSuccessModal(false)}
//               >
//                 Continue
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddProduct;


import React, { useState } from 'react';
import './AddProduct.css';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const AddProduct = () => {
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const brandOptions = ['Humming Tone', 'Other'];
  const colorOptions = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Pink', 'Purple', 'Orange', 'Brown', 'Gray', 'Multicolor'];
  const materialOptions = ['Cotton', 'Polyester', 'Wool', 'Silk', 'Denim', 'Leather', 'Linen', 'Nylon', 'Rayon', 'Velvet', 'Mixed'];

  const validateForm = () => {
    const newErrors = {};
    if (!productName.trim()) newErrors.productName = 'Product name is required';
    if (!about.trim()) newErrors.about = 'Product description is required';
    if (!category) newErrors.category = 'Category is required';
    if (!gender) newErrors.gender = 'Gender is required';
    if (!brand) newErrors.brand = 'Brand is required';
    if (!color.trim()) newErrors.color = 'Color is required';
    if (!material.trim()) newErrors.material = 'Material is required';
    if (!sku.trim()) newErrors.sku = 'SKU is required';
    if (!dimensions.trim()) newErrors.dimensions = 'Dimensions are required';
    if (!images[0]) newErrors.mainImage = 'Main product image is required';
    variants.forEach((v, i) => {
      if (!v.size.trim()) newErrors[`variant_${i}_size`] = 'Size is required';
      if (!v.price || parseFloat(v.price) <= 0) newErrors[`variant_${i}_price`] = 'Valid price is required';
      if (!v.originalPrice || parseFloat(v.originalPrice) <= 0) newErrors[`variant_${i}_originalPrice`] = 'Valid original price is required';
      if (!v.stock || parseInt(v.stock) < 0) newErrors[`variant_${i}_stock`] = 'Valid stock quantity is required';
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

  const addVariant = () => setVariants([...variants, { size: '', price: '', originalPrice: '', stock: '' }]);
  const removeVariant = (i) => setVariants(variants.filter((_, idx) => idx !== i));
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

  const handleSubmit = () => {
    if (!validateForm()) return;

    const formData = new FormData();
    const categorySlugMap = { "Winter sets": "winter_sets", "T Shirts": "t_shirts", "Sleepingbags": "sleeping_bags", "Dresses": "dresses" };

    formData.append("name", productName);
    formData.append("about", about);
    formData.append("sku", sku);
    formData.append("category", categorySlugMap[category] || category);
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

    images.forEach(img => { if (img?.file) formData.append("images", img.file); });

    fetch("http://localhost:5000/admin/add_product", {
      method: "POST",
      body: formData
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Database Error");
      return data;
    })
    .then(() => {
      setShowSuccessModal(true);
      setTimeout(() => resetForm(), 2500);
    })
    .catch(err => alert("Error: " + err.message));
  };

  const resetForm = () => {
    setProductName(''); setAbout(''); setVariants([{ size: '', price: '', originalPrice: '', stock: '' }]);
    setCategory(''); setSku(''); setBrand(''); setGender(''); setDimensions(''); setColor('');
    setMaterial(''); setFeaturedProduct(false); setActive(true); setImages([null, null, null, null, null]);
    setSubcategory(''); setCareInstructions(''); setAgeRange(''); setWeight(''); setErrors({});
  };

  return (
    <div className="add-product-container">
      <div className="product-form">
        <section className="form-section">
          <h2 className="section-title">Basic Information</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="productName">PRODUCT NAME</label>
              <input type="text" id="productName" placeholder="Enter product name" value={productName} onChange={(e) => { setProductName(e.target.value); clearFieldError('productName'); }} className={errors.productName ? 'input-error' : ''} />
              {errors.productName && <div className="field-error">{errors.productName}</div>}
            </div>
            <div className="form-group full-width">
              <label htmlFor="about">PRODUCT DESCRIPTION</label>
              <textarea id="about" placeholder="Enter detailed product description" value={about} onChange={(e) => { setAbout(e.target.value); clearFieldError('about'); }} rows="5" className={errors.about ? 'input-error' : ''} />
              {errors.about && <div className="field-error">{errors.about}</div>}
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-title">Category & Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="gender">GENDER</label>
              <select id="gender" value={gender} onChange={(e) => { setGender(e.target.value); clearFieldError('gender'); }} className={errors.gender ? 'input-error' : ''} >
                <option value="">Select Gender</option>
                <option value="Men">Mens</option>
                <option value="Children">Childrens</option>
                <option value="Babies">Baby</option>
                <option value="Sports">Sports</option>
              </select>
              {errors.gender && <div className="field-error">{errors.gender}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="ageRange">AGE RANGE</label>
              <input type="text" id="ageRange" placeholder="e.g. 2-4 years, 6-8 years" value={ageRange} onChange={(e) => setAgeRange(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="subcategory">SUBCATEGORY</label>
              <input type="text" id="subcategory" placeholder="e.g. Full Sleeve, Half Sleeve" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="sku">SKU</label>
              <input type="text" id="sku" placeholder="Enter SKU" value={sku} onChange={(e) => { setSku(e.target.value); clearFieldError('sku'); }} className={errors.sku ? 'input-error' : ''} />
              {errors.sku && <div className="field-error">{errors.sku}</div>}
            </div>
            <div className="form-group full-width">
              <label htmlFor="careInstructions">CARE INSTRUCTIONS</label>
              <textarea id="careInstructions" placeholder="Wash cold, do not bleach" value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} rows="3" />
            </div>
            <div className="form-group">
              <label htmlFor="brand">BRAND</label>
              <select id="brand" value={brand} onChange={(e) => { setBrand(e.target.value); clearFieldError('brand'); }} className={errors.brand ? 'input-error' : ''} >
                <option value="">Select Brand</option>
                {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              {errors.brand && <div className="field-error">{errors.brand}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="category">CATEGORY</label>
              <select id="category" value={category} onChange={(e) => { setCategory(e.target.value); clearFieldError('category'); }} className={errors.category ? 'input-error' : ''} >
                <option value="">Select Category</option>
                <option value="Winter sets">Winter sets</option>
                <option value="T Shirts">T Shirts</option>
                <option value="Sleepingbags">Sleepingbags</option>
                <option value="Dresses">Dresses</option>
              </select>
              {errors.category && <div className="field-error">{errors.category}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="color">COLOR</label>
              <input type="text" id="color" list="color-options" placeholder="Select or type color" value={color} onChange={(e) => { setColor(e.target.value); clearFieldError('color'); }} className={errors.color ? 'input-error' : ''} />
              <datalist id="color-options">{colorOptions.map(c => <option key={c} value={c} />)}</datalist>
              {errors.color && <div className="field-error">{errors.color}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="material">MATERIAL</label>
              <input type="text" id="material" list="material-options" placeholder="Select or type material" value={material} onChange={(e) => { setMaterial(e.target.value); clearFieldError('material'); }} className={errors.material ? 'input-error' : ''} />
              <datalist id="material-options">{materialOptions.map(m => <option key={m} value={m} />)}</datalist>
              {errors.material && <div className="field-error">{errors.material}</div>}
            </div>
            <div className="form-group full-width">
              <label htmlFor="dimensions">DIMENSIONS</label>
              <input type="text" id="dimensions" placeholder="Length x Width x Height" value={dimensions} onChange={(e) => { setDimensions(e.target.value); clearFieldError('dimensions'); }} className={errors.dimensions ? 'input-error' : ''} />
              {errors.dimensions && <div className="field-error">{errors.dimensions}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="weight">WEIGHT (kg)</label>
              <input type="number" step="0.01" id="weight" placeholder="e.g. 0.75" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-title">Product Variants</h2>
          {variants.map((variant, index) => (
            <div key={index} className="variant-card">
              <div className="variant-header">
                <span className="variant-number">Variant {index + 1}</span>
                {variants.length > 1 && <button type="button" className="btn-remove-icon" onClick={() => removeVariant(index)}>×</button>}
              </div>
              <div className="variant-fields">
                <div className="form-group">
                  <label>SIZE</label>
                  <input type="text" placeholder="S, M, L, XL" value={variant.size} onChange={(e) => { updateVariant(index, 'size', e.target.value); clearFieldError(`variant_${index}_size`); }} className={errors[`variant_${index}_size`] ? 'input-error' : ''} />
                </div>
                <div className="form-group">
                  <label>PRICE (₹)</label>
                  <input type="number" placeholder="0.00" value={variant.price} onChange={(e) => { updateVariant(index, 'price', e.target.value); clearFieldError(`variant_${index}_price`); }} className={errors[`variant_${index}_price`] ? 'input-error' : ''} />
                </div>
                <div className="form-group">
                  <label>ORIGINAL PRICE (₹)</label>
                  <input type="number" placeholder="0.00" value={variant.originalPrice} onChange={(e) => { updateVariant(index, 'originalPrice', e.target.value); clearFieldError(`variant_${index}_originalPrice`); }} className={errors[`variant_${index}_originalPrice`] ? 'input-error' : ''} />
                </div>
                <div className="form-group">
                  <label>STOCK</label>
                  <input type="number" placeholder="0" value={variant.stock} onChange={(e) => { updateVariant(index, 'stock', e.target.value); clearFieldError(`variant_${index}_stock`); }} className={errors[`variant_${index}_stock`] ? 'input-error' : ''} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="btn-add-variant" onClick={addVariant}>+ ADD VARIANT</button>
        </section>

        <section className="form-section">
          <h2 className="section-title">Product Images</h2>
          <p className="section-subtitle">Upload up to 5 images. First image will be the main product image.</p>
          <div className="images-upload-grid">
            <div className={`image-upload-box main-image ${errors.mainImage ? 'upload-error' : ''}`}>
              <input type="file" id="image-0" accept="image/*" onChange={(e) => { handleImageUpload(0, e); clearFieldError('mainImage'); }} style={{ display: 'none' }} />
              {images[0] ? (
                <div className="image-preview">
                  <img src={images[0].preview} alt="Main product" />
                  <button type="button" className="remove-image-btn" onClick={() => removeImage(0)}><CloseIcon /></button>
                  <span className="image-badge">MAIN</span>
                </div>
              ) : (
                <label htmlFor="image-0" className="upload-placeholder"><AddPhotoAlternateIcon className="upload-icon" /><span className="upload-text">Main Image</span><span className="upload-subtext">Required</span></label>
              )}
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="image-upload-box">
                <input type="file" id={`image-${i}`} accept="image/*" onChange={(e) => handleImageUpload(i, e)} style={{ display: 'none' }} />
                {images[i] ? (
                  <div className="image-preview">
                    <img src={images[i].preview} alt={`Product ${i}`} />
                    <button type="button" className="remove-image-btn" onClick={() => removeImage(i)}><CloseIcon /></button>
                  </div>
                ) : (
                  <label htmlFor={`image-${i}`} className="upload-placeholder"><AddPhotoAlternateIcon className="upload-icon" /><span className="upload-text">Image {i}</span><span className="upload-subtext">Optional</span></label>
                )}
              </div>
            ))}
          </div>
          {errors.mainImage && <div className="field-error">{errors.mainImage}</div>}
        </section>

        <section className="form-section">
          <h2 className="section-title">Product Status</h2>
          <div className="checkbox-grid">
            <label className="checkbox-card">
              <input type="checkbox" checked={featuredProduct} onChange={(e) => setFeaturedProduct(e.target.checked)} />
              <div className="checkbox-content"><span className="checkbox-title">FEATURED PRODUCT</span><span className="checkbox-desc">Display this product in featured section</span></div>
            </label>
            <label className="checkbox-card">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <div className="checkbox-content"><span className="checkbox-title">ACTIVE</span><span className="checkbox-desc">Make this product visible to customers</span></div>
            </label>
          </div>
        </section>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={resetForm}>CANCEL</button>
          <button type="button" className="btn-submit" onClick={handleSubmit}>ADD PRODUCT</button>
        </div>
      </div>

      {showSuccessModal && (
        <div className="ap-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ap-modal-header">
              <CheckCircleIcon className="success-icon" />
              <h3 className="ap-modal-title">Product Added Successfully!</h3>
              <button className="ap-modal-close" onClick={() => setShowSuccessModal(false)}><CloseIcon /></button>
            </div>
            <div className="ap-modal-body">
              <p className="success-message">Your product has been successfully added to the catalog.</p>
              <div className="success-details">
                <span className="product-name-display">{productName}</span>
                <span className="success-sub">has been saved and is now available for management.</span>
              </div>
            </div>
            <div className="ap-modal-footer">
              <button className="btn-primary" onClick={() => setShowSuccessModal(false)}>Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;