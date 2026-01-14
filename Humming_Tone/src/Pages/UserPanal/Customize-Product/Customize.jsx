// import React, { useState } from 'react';
// // import UserFooter from '../../../components/User-Footer-Card/UserFooter';
// import AddToCartModal from '../Prodect-Details/Product-Buying modal/AddToCartModal';
// import './customize.css';

// const CustomizePage = () => {
//   const [currentStep, setCurrentStep] = useState(1);
  
//   const [selectedType, setSelectedType] = useState(''); 
//   const [selectedVariant, setSelectedVariant] = useState(''); 
//   const [selectedColor, setSelectedColor] = useState('');
//   const [customColor, setCustomColor] = useState('#FFFFFF');
//   const [selectedMaterial, setSelectedMaterial] = useState('');
//   const [selectedSize, setSelectedSize] = useState('');
//   const [designOption, setDesignOption] = useState('');
//   const [uploadedImage, setUploadedImage] = useState(null);
//   const [selectedGalleryDesign, setSelectedGalleryDesign] = useState('');
//   const [customText, setCustomText] = useState('');

//   const [showCartModal, setShowCartModal] = useState(false);
//   const [cartModalData, setCartModalData] = useState(null);

//   // Placeholder Image URL
//   const placeholderImg = "https://cdn-icons-png.flaticon.com/512/892/892458.png";

//   // Product Data
//   const productCategories = [
//     { id: 'tshirts', name: 'T-SHIRTS', image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80", description: 'Classic cotton essentials', 
//       variants: [
//         { id: 'round', name: 'Round Neck', image: null },
//         { id: 'vneck', name: 'V-Neck', image: null },
//         { id: 'collar', name: 'Collar/Polo', image: null },
//         { id: 'henley', name: 'Henley', image: null },
//         { id: 'scoop', name: 'Scoop Neck', image: null },
//         { id: 'sleeveless_t', name: 'Sleeveless', image: null },
//       ]
//     },
//     { id: 'hoodies', name: 'HOODIES', image: null, description: 'Cozy & stylish outerwear',
//       variants: [
//         { id: 'pullover', name: 'Pullover', image: null },
//         { id: 'zipup', name: 'Zip-Up', image: null },
//         { id: 'sleeveless_h', name: 'Sleeveless/Gilet', image: null },
//         { id: 'oversized', name: 'Oversized', image: null },
//         { id: 'cropped_h', name: 'Cropped', image: null },
//         { id: 'crop_hoodie', name: 'Crop Hoodie', image: null },
//       ]
//     },
//     { id: 'sweatshirts', name: 'SWEATSHIRTS', image: null, description: 'Premium crew neck comfort',
//       variants: [
//         { id: 'crew', name: 'Crew Neck Standard', image: null },
//       ]
//     },
//     { id: 'sportswear', name: 'SPORTSWEAR', image: null, description: 'High performance gear',
//       variants: [
//         { id: 'dryfit', name: 'Dry-fit Jersey T-Shirts', image: null },
//         { id: 'athletic', name: 'Athletic Tops', image: null },
//       ]
//     },
//   ];

//   const colors = [
//     { id: 'white', name: 'White', hex: '#FFFFFF' },
//     { id: 'black', name: 'Black', hex: '#000000' },
//     { id: 'navy', name: 'Navy Blue', hex: '#001F3F' },
//     { id: 'red', name: 'Red', hex: '#FF4136' },
//     { id: 'green', name: 'Green', hex: '#2ECC40' },
//     { id: 'gray', name: 'Gray', hex: '#AAAAAA' },
//     { id: 'yellow', name: 'Yellow', hex: '#FFDC00' },
//     { id: 'purple', name: 'Purple', hex: '#B10DC9' },
//     { id: 'orange', name: 'Orange', hex: '#FF851B' },
//     { id: 'pink', name: 'Pink', hex: '#F012BE' },
//     { id: 'brown', name: 'Brown', hex: '#8B4513' },
//     { id: 'custom', name: 'Custom Color', hex: null },
//   ];

//   // Materials updated with Image property instead of icon
//   const materials = [
//     { id: 'cotton', name: 'Pure Cotton', desc: 'Soft & Breathable', image: null },
//     { id: 'polyester', name: 'Polyester', desc: 'Durable & Quick-dry', image: null },
//     { id: 'blend', name: 'Cotton Blend', desc: 'Best of Both', image: null },
//     { id: 'premium', name: 'Premium Cotton', desc: 'Luxury Feel', image: null },
//     { id: 'organic', name: 'Organic Cotton', desc: '100% Natural', image: null },
//     { id: 'bamboo', name: 'Bamboo Fabric', desc: 'Eco-friendly', image: null },
//   ];

//   const sizes = [
//     { id: 'XS', name: 'XS', chest: '32-34"', icon: 'looks_one' },
//     { id: 'S', name: 'S', chest: '35-37"', icon: 'looks_two' },
//     { id: 'M', name: 'M', chest: '38-40"', icon: 'looks_3' },
//     { id: 'L', name: 'L', chest: '41-43"', icon: 'looks_4' },
//     { id: 'XL', name: 'XL', chest: '44-46"', icon: 'looks_5' },
//     { id: 'XXL', name: 'XXL', chest: '47-49"', icon: 'looks_6' },
//     { id: '3XL', name: '3XL', chest: '50-52"', icon: 'exposure_plus_1' },
//   ];

//   const galleryDesigns = [
//     { id: 'design1', name: 'Abstract Art', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop', preview: null },
//     { id: 'design2', name: 'Geometric', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop', preview: null },
//     { id: 'design3', name: 'Nature', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop', preview: null },
//     { id: 'design4', name: 'Typography', image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&h=200&fit=crop', preview: null },
//     { id: 'design5', name: 'Minimal', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop', preview: null },
//     { id: 'design6', name: 'Vintage', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop', preview: null },
//     { id: 'design7', name: 'Sports', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=200&fit=crop', preview: null },
//     { id: 'design8', name: 'Music', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop', preview: null },
//   ];

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         alert('File size must be less than 5MB');
//         return;
//       }
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setUploadedImage(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleColorSelect = (colorId, hex) => {
//     setSelectedColor(colorId);
//     if (colorId !== 'custom' && hex) {
//       setCustomColor(hex);
//     }
//   };

//   const canProceedToNext = () => {
//     switch(currentStep) {
//       case 1: return selectedType !== '';
//       case 2: return selectedVariant !== '';
//       case 3: return selectedColor !== '';
//       case 4: return selectedMaterial !== '';
//       case 5: return selectedSize !== '';
//       case 6: return designOption !== '' && (
//         (designOption === 'upload' && (uploadedImage || customText)) ||
//         (designOption === 'gallery' && selectedGalleryDesign)
//       );
//       default: return false;
//     }
//   };

//   const handleNext = () => {
//     if (canProceedToNext() && currentStep < 6) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const handleBack = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const handleFinish = () => {
//     const customization = {
//       type: selectedType,
//       variant: selectedVariant,
//       color: selectedColor === 'custom' ? customColor : selectedColor,
//       material: selectedMaterial,
//       size: selectedSize,
//       design: designOption === 'upload' ? uploadedImage || customText : selectedGalleryDesign,
//     };

//     // Get selected category and variant names
//     const selectedCategory = productCategories.find(c => c.id === selectedType);
//     const selectedVariantData = selectedCategory?.variants.find(v => v.id === selectedVariant);
//     const selectedColorData = colors.find(c => c.id === selectedColor);

//     // Add to cart (you may need to adjust pricing logic)
//     const customProduct = {
//       id: `custom-${Date.now()}`,
//       name: `Custom ${selectedCategory?.name || 'Product'}`,
//       size: selectedSize,
//       quantity: 1,
//       price: 999, // Base price - you can calculate based on selections
//       image: uploadedImage || selectedGalleryDesign || 'https://via.placeholder.com/400x500?text=Custom+Design'
//     };

//     // Store in cart
//     const cart = JSON.parse(localStorage.getItem('cart')) || [];
//     cart.push(customProduct);
//     localStorage.setItem('cart', JSON.stringify(cart));
//     window.dispatchEvent(new Event('cart:updated'));

//     console.log('Customization completed:', customization);

//     // Show modal
//     setCartModalData(customProduct);
//     setShowCartModal(true);
//   };

//   const getCurrentVariants = () => {
//     const category = productCategories.find(c => c.id === selectedType);
//     return category ? category.variants : [];
//   };

//   const addDefaultSrc = (ev) => {
//     ev.target.src = placeholderImg;
//   };

//   return (
//     <div className="customize-page">
//       <div className="customize-header">
//         <h1 className="customize-title">Customize Your Product</h1>
//         <p className="customize-subtitle">Create your unique design in 6 easy steps</p>
//       </div>

//       <div className="customize-divider"></div>

//       <div className="progress-container">
//         <div className="progress-steps">
//           {[1, 2, 3, 4, 5, 6].map((step) => (
//             <div key={step} className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}>
//               <div className="progress-circle">
//                 <span className="material-icons">
//                   {currentStep > step ? 'check_circle' : 
//                    step === 1 ? 'category' : 
//                    step === 2 ? 'style' : 
//                    step === 3 ? 'palette' : 
//                    step === 4 ? 'texture' : 
//                    step === 5 ? 'straighten' : 'brush'}
//                 </span>
//               </div>
//               <span className="progress-label">
//                 {step === 1 && 'Type'}
//                 {step === 2 && 'Variant'}
//                 {step === 3 && 'Color'}
//                 {step === 4 && 'Material'}
//                 {step === 5 && 'Size'}
//                 {step === 6 && 'Design'}
//               </span>
//             </div>
//           ))}
//         </div>
//         <div className="progress-bar">
//           <div className="progress-fill" style={{ width: `${(currentStep / 6) * 100}%` }}></div>
//         </div>
//       </div>

//       <div className="customize-content">
        
//         {/* Step 1: Type Selection */}
//         {currentStep === 1 && (
//           <div className="step-content">
//             <h2 className="step-title">Select Product Category</h2>
//             <div className="options-grid type-grid">
//               {productCategories.map((type) => (
//                 <div
//                   key={type.id}
//                   className={`option-card ${selectedType === type.id ? 'selected' : ''}`}
//                   onClick={() => {
//                     setSelectedType(type.id);
//                     setSelectedVariant(''); 
//                   }}
//                 >
//                   <div className="option-image-wrapper">
//                     <img 
//                       src={type.image || placeholderImg} 
//                       alt={type.name} 
//                       onError={addDefaultSrc}
//                       className="option-card-image"
//                     />
//                   </div>
//                   <div className="option-name">{type.name}</div>
//                   <div className="option-desc">{type.description}</div>
//                   {selectedType === type.id && (
//                     <span className="material-icons check-icon">check_circle</span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Step 2: Variant Selection */}
//         {currentStep === 2 && (
//           <div className="step-content">
//             <h2 className="step-title">Choose Your {selectedType.toUpperCase()} Variant</h2>
//             <div className="options-grid type-grid">
//               {getCurrentVariants().map((variant) => (
//                 <div
//                   key={variant.id}
//                   className={`option-card ${selectedVariant === variant.id ? 'selected' : ''}`}
//                   onClick={() => setSelectedVariant(variant.id)}
//                 >
//                   <div className="option-image-wrapper">
//                     <img 
//                       src={variant.image || placeholderImg} 
//                       alt={variant.name} 
//                       onError={addDefaultSrc}
//                       className="option-card-image"
//                     />
//                   </div>
//                   <div className="option-name">{variant.name}</div>
//                   {selectedVariant === variant.id && (
//                     <span className="material-icons check-icon">check_circle</span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Step 3: Color Selection */}
//         {currentStep === 3 && (
//           <div className="step-content">
//             <h2 className="step-title">Choose Color</h2>
//             <div className="options-grid color-grid">
//               {colors.map((color) => (
//                 <div
//                   key={color.id}
//                   className={`option-card color-card ${selectedColor === color.id ? 'selected' : ''}`}
//                   onClick={() => handleColorSelect(color.id, color.hex)}
//                 >
//                   {color.id === 'custom' ? (
//                     <div className="custom-color-picker">
//                       <span className="material-icons color-picker-icon">colorize</span>
//                       <label className="color-picker-label">
//                         <input
//                           type="color"
//                           value={customColor}
//                           onChange={(e) => {
//                             setCustomColor(e.target.value);
//                             setSelectedColor('custom');
//                           }}
//                           className="color-picker-input"
//                         />
//                       </label>
//                     </div>
//                   ) : (
//                     <div 
//                       className="color-swatch" 
//                       style={{ 
//                         backgroundColor: color.hex,
//                         border: color.hex === '#FFFFFF' ? '2px solid #e5e5e5' : 'none'
//                       }}
//                     ></div>
//                   )}
//                   <div className="option-name">{color.name}</div>
//                   {selectedColor === color.id && color.id !== 'custom' && (
//                     <span className="material-icons check-icon">check_circle</span>
//                   )}
//                   {selectedColor === 'custom' && color.id === 'custom' && (
//                     <div 
//                       className="custom-color-preview" 
//                       style={{ backgroundColor: customColor }}
//                     ></div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Step 4: Material Selection (Updated to show images) */}
//         {currentStep === 4 && (
//           <div className="step-content">
//             <h2 className="step-title">Select Material</h2>
//             <div className="options-grid material-grid">
//               {materials.map((material) => (
//                 <div
//                   key={material.id}
//                   className={`option-card material-card ${selectedMaterial === material.id ? 'selected' : ''}`}
//                   onClick={() => setSelectedMaterial(material.id)}
//                 >
//                   <div className="option-image-wrapper">
//                     <img 
//                       src={material.image || placeholderImg} 
//                       alt={material.name} 
//                       onError={addDefaultSrc}
//                       className="option-card-image"
//                     />
//                   </div>
//                   <div className="option-name">{material.name}</div>
//                   <div className="option-desc">{material.desc}</div>
//                   {selectedMaterial === material.id && (
//                     <span className="material-icons check-icon">check_circle</span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Step 5: Size Selection */}
//         {currentStep === 5 && (
//           <div className="step-content">
//             <h2 className="step-title">Choose Size</h2>
//             <div className="size-guide-note">
//               <span className="material-icons">info</span>
//               <span>Hover over size for measurements</span>
//             </div>
//             <div className="options-grid size-grid">
//               {sizes.map((size) => (
//                 <div
//                   key={size.id}
//                   className={`option-card size-card ${selectedSize === size.id ? 'selected' : ''}`}
//                   onClick={() => setSelectedSize(size.id)}
//                   title={`Chest: ${size.chest}`}
//                 >
//                   <span className="material-icons size-icon">{size.icon}</span>
//                   <div className="size-label">{size.name}</div>
//                   <div className="size-measurement">{size.chest}</div>
//                   {selectedSize === size.id && (
//                     <span className="material-icons check-icon-small">check_circle</span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Step 6: Design Selection */}
//         {currentStep === 6 && (
//           <div className="step-content">
//             <h2 className="step-title">Add Your Design</h2>
            
//             <div className="design-options">
//               <button
//                 className={`design-option-btn ${designOption === 'upload' ? 'active' : ''}`}
//                 onClick={() => setDesignOption('upload')}
//               >
//                 <span className="material-icons">file_upload</span>
//                 Upload Design / Add Text
//               </button>
//               <button
//                 className={`design-option-btn ${designOption === 'gallery' ? 'active' : ''}`}
//                 onClick={() => setDesignOption('gallery')}
//               >
//                 <span className="material-icons">photo_library</span>
//                 Choose from Gallery
//               </button>
//             </div>

//             {designOption === 'upload' && (
//               <div className="upload-section">
//                 <div className="upload-area">
//                   <input
//                     type="file"
//                     id="fileUpload"
//                     accept="image/*"
//                     onChange={handleImageUpload}
//                     style={{ display: 'none' }}
//                   />
//                   <label htmlFor="fileUpload" className="upload-label">
//                     {uploadedImage ? (
//                       <div className="uploaded-image-container">
//                         <img src={uploadedImage} alt="Uploaded" className="uploaded-preview" />
//                         <button 
//                           className="remove-image-btn"
//                           onClick={(e) => {
//                             e.preventDefault();
//                             setUploadedImage(null);
//                           }}
//                         >
//                           <span className="material-icons">close</span>
//                         </button>
//                       </div>
//                     ) : (
//                       <>
//                         <span className="material-icons upload-icon">cloud_upload</span>
//                         <p className="upload-text">Click to upload your design</p>
//                         <p className="upload-subtext">PNG, JPG, SVG up to 5MB</p>
//                       </>
//                     )}
//                   </label>
//                 </div>

//                 <div className="text-section">
//                   <h3 className="text-title">
//                     <span className="material-icons">text_fields</span>
//                     Or Add Custom Text
//                   </h3>
//                   <textarea
//                     className="text-input"
//                     placeholder="Enter your custom text here..."
//                     value={customText}
//                     onChange={(e) => setCustomText(e.target.value)}
//                     rows="4"
//                   />
//                 </div>
//               </div>
//             )}

//             {designOption === 'gallery' && (
//               <div className="gallery-section">
//                 <div className="gallery-grid">
//                   {galleryDesigns.map((design) => (
//                     <div
//                       key={design.id}
//                       className={`gallery-card ${selectedGalleryDesign === design.id ? 'selected' : ''}`}
//                       onClick={() => setSelectedGalleryDesign(design.id)}
//                     >
//                       <img 
//                         src={design.image} 
//                         alt={design.name} 
//                         className="gallery-preview-image"
//                         onError={(e) => e.target.src = 'https://via.placeholder.com/200x200?text=Design'}
//                       />
//                       <div className="gallery-name">{design.name}</div>
//                       {selectedGalleryDesign === design.id && (
//                         <span className="material-icons check-icon">check_circle</span>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       <div className="navigation-buttons">
//         {currentStep > 1 && (
//           <button className="nav-btn back-btn" onClick={handleBack}>
//             <span className="material-icons">arrow_back</span>
//             Back
//           </button>
//         )}
        
//         {currentStep < 6 ? (
//           <button 
//             className={`nav-btn next-btn ${!canProceedToNext() ? 'disabled' : ''}`}
//             onClick={handleNext}
//             disabled={!canProceedToNext()}
//           >
//             Next
//             <span className="material-icons">arrow_forward</span>
//           </button>
//         ) : (
//           <button 
//             className={`nav-btn finish-btn ${!canProceedToNext() ? 'disabled' : ''}`}
//             onClick={handleFinish}
//             disabled={!canProceedToNext()}
//           >
//             <span className="material-icons">shopping_cart</span>
//             Finish & Add to Cart
//           </button>
//         )}
//       </div>

//       {/* Add to Cart Modal */}
//       <AddToCartModal
//         isOpen={showCartModal}
//         onClose={() => setShowCartModal(false)}
//         productData={cartModalData}
//       />
//     </div>
//   );
// };

// export default CustomizePage;
// TshirtCustomizer.jsx
// TshirtCustomizer.jsx
import React, { useState, useEffect, useRef } from 'react';
import TShirtSVG from './../../../components/CustomizeT-shirt/TShirtSVG';
import HoodieSVG from './../../../components/CustomizeT-shirt/HoodieSVG';
import LongSleeveSVG from './../../../components/CustomizeT-shirt/LongSleeveSVG';
import PoloShirtSVG from './../../../components/CustomizeT-shirt/PoloSVG';
import './Customize.css';

const TshirtCustomizer = () => {
  // Product types with detailed specifications
  const [productTypes] = useState([
    { 
      id: 1, 
      name: 'Classic T-Shirt', 
      type: 'tshirt', 
      basePrice: 25, 
      sleeve: 'Half Sleeve',
      fabric: '100% Cotton',
      fit: 'Regular Fit',
      component: TShirtSVG
    },
    { 
      id: 2, 
      name: 'Premium Hoodie', 
      type: 'hoodie', 
      basePrice: 45, 
      sleeve: 'Full Sleeve',
      fabric: 'Cotton Blend',
      fit: 'Oversized Fit',
      component: HoodieSVG
    },
    { 
      id: 3, 
      name: 'Long Sleeve Shirt', 
      type: 'longsleeve', 
      basePrice: 32, 
      sleeve: 'Full Sleeve',
      fabric: 'Premium Cotton',
      fit: 'Slim Fit',
      component: LongSleeveSVG
    },
    { 
      id: 4, 
      name: 'Polo Shirt', 
      type: 'polo', 
      basePrice: 35, 
      sleeve: 'Half Sleeve',
      fabric: 'Piqué Cotton',
      fit: 'Classic Fit',
      component: PoloShirtSVG
    }
  ]);

  // State management
  const [selectedProduct, setSelectedProduct] = useState(1);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [selectedSize, setSelectedSize] = useState('M');
  const [totalPrice, setTotalPrice] = useState(25.00);
  const [designSide, setDesignSide] = useState('front');
  
  // Design states
  const [frontDesign, setFrontDesign] = useState(null);
  const [backDesign, setBackDesign] = useState(null);
  const [designType, setDesignType] = useState('text');
  const [designText, setDesignText] = useState('YOUR DESIGN HERE');
  const [textColor, setTextColor] = useState('#333333');
  const [textSize, setTextSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [isBold, setIsBold] = useState(true);
  
  // Upload states
  const [uploadedImages, setUploadedImages] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  
  // Refs
  const fileInputRef = useRef(null);

  // Color options with color codes
  const colorOptions = [
    { name: 'White', value: '#FFFFFF', textColor: '#333333' },
    { name: 'Black', value: '#333333', textColor: '#FFFFFF' },
    { name: 'Red', value: '#FF3B30', textColor: '#FFFFFF' },
    { name: 'Royal Blue', value: '#007AFF', textColor: '#FFFFFF' },
    { name: 'Forest Green', value: '#34C759', textColor: '#FFFFFF' },
    { name: 'Heather Gray', value: '#8E8E93', textColor: '#333333' },
    { name: 'Navy Blue', value: '#0A2472', textColor: '#FFFFFF' },
    { name: 'Burgundy', value: '#800020', textColor: '#FFFFFF' },
    { name: 'Mustard Yellow', value: '#FFCC00', textColor: '#333333' },
    { name: 'Light Pink', value: '#FFAFCC', textColor: '#333333' }
  ];

  // Size options with measurements
  const sizeOptions = [
    { label: 'XS', chest: '34-36"' },
    { label: 'S', chest: '36-38"' },
    { label: 'M', chest: '40-42"' },
    { label: 'L', chest: '42-44"' },
    { label: 'XL', chest: '46-48"' },
    { label: 'XXL', chest: '50-52"' }
  ];

  // Font options
  const fontOptions = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Lato', value: 'Lato, sans-serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Courier New', value: 'Courier New, monospace' }
  ];

  // Calculate price
  useEffect(() => {
    const baseProduct = productTypes.find(p => p.id === selectedProduct);
    let price = baseProduct?.basePrice || 25;
    
    // Size premium
    const sizeLabels = sizeOptions.map(s => s.label);
    const sizeIndex = sizeLabels.indexOf(selectedSize);
    const sizePremium = [0, 0, 0, 2, 3, 5];
    price += sizePremium[sizeIndex] || 0;
    
    // Design premium
    if ((frontDesign || backDesign) && designType === 'image') {
      price += 8; // Premium for custom images
    } else if ((frontDesign || backDesign) && designType === 'text') {
      price += 3; // Small premium for custom text
    }
    
    setTotalPrice(price.toFixed(2));
  }, [selectedProduct, selectedSize, designType, frontDesign, backDesign]);

  // Get current product
  const getCurrentProduct = () => {
    return productTypes.find(p => p.id === selectedProduct);
  };

  // Get current design
  const getCurrentDesign = () => {
    return designSide === 'front' ? frontDesign : backDesign;
  };

  // Handle product change
  const handleProductChange = (productId) => {
    setSelectedProduct(productId);
  };

  // Handle color change
  const handleColorChange = (color) => {
    setSelectedColor(color);
    // Auto-adjust text color for contrast
    const selectedColorObj = colorOptions.find(c => c.value === color);
    if (selectedColorObj && designType === 'text') {
      setTextColor(selectedColorObj.textColor);
    }
  };

  // Handle size change
  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  // Handle design type change
  const handleDesignTypeChange = (type) => {
    setDesignType(type);
    if (type === 'text') {
      setDesignText('YOUR DESIGN HERE');
    }
  };

  // Update text design
  const updateTextDesign = () => {
    const design = {
      type: 'text',
      content: designText,
      color: textColor,
      size: textSize,
      font: fontFamily,
      bold: isBold
    };
    
    if (designSide === 'front') {
      setFrontDesign(design);
    } else {
      setBackDesign(design);
    }
  };

  // Handle text change
  const handleTextChange = (text) => {
    setDesignText(text);
    updateTextDesign();
  };

  // Handle text style change
  const handleTextStyleChange = (property, value) => {
    switch (property) {
      case 'color':
        setTextColor(value);
        break;
      case 'size':
        setTextSize(value);
        break;
      case 'font':
        setFontFamily(value);
        break;
      case 'bold':
        setIsBold(value);
        break;
      default:
        break;
    }
    updateTextDesign();
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      size: (file.size / 1024).toFixed(1) + ' KB'
    }));
    
    setUploadedImages(prev => [...prev, ...newImages]);
    
    // Auto-select first uploaded image
    if (newImages.length > 0) {
      selectUploadedImage(newImages[0].url);
    }
  };

  // Select uploaded image
  const selectUploadedImage = (imageUrl) => {
    setActiveImage(imageUrl);
    const design = { 
      type: 'image', 
      content: imageUrl,
      scale: 1,
      position: { x: 0, y: 0 }
    };
    
    if (designSide === 'front') {
      setFrontDesign(design);
    } else {
      setBackDesign(design);
    }
  };

  // Clear current design
  const clearCurrentDesign = () => {
    if (designSide === 'front') {
      setFrontDesign(null);
    } else {
      setBackDesign(null);
    }
  };

  // Clear all designs
  const clearAllDesigns = () => {
    setFrontDesign(null);
    setBackDesign(null);
    setDesignText('YOUR DESIGN HERE');
  };

  // Trigger file upload
  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  // Save design
  const saveDesign = () => {
    const design = {
      id: Date.now(),
      product: selectedProduct,
      color: selectedColor,
      size: selectedSize,
      frontDesign,
      backDesign,
      price: totalPrice,
      timestamp: new Date().toISOString()
    };
    
    const savedDesigns = JSON.parse(localStorage.getItem('customDesigns') || '[]');
    savedDesigns.push(design);
    localStorage.setItem('customDesigns', JSON.stringify(savedDesigns));
    
    alert('Design saved successfully! You can access it later from Saved Designs.');
  };

  // Add to cart
  const addToCart = () => {
    const product = getCurrentProduct();
    const cartItem = {
      productId: selectedProduct,
      productName: product.name,
      color: colorOptions.find(c => c.value === selectedColor)?.name,
      size: selectedSize,
      frontDesign: frontDesign ? 'Custom Design' : 'None',
      backDesign: backDesign ? 'Custom Design' : 'None',
      designType: designType,
      price: totalPrice,
      quantity: 1
    };
    
    // In real app, you would use Redux or Context
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    alert(`Added to cart: ${cartItem.productName} - $${cartItem.price}`);
  };

  // Get current Product Component
  const ProductComponent = getCurrentProduct().component;

  return (
    <div className="tshirt-customizer">
      <div className="customizer-header">
        <h1>T-Shirt Customizer Studio</h1>
        <p>Design your perfect custom apparel with real-time preview</p>
      </div>

      <div className="customizer-grid">
        {/* Left Column - Product Preview */}
        <div className="preview-column">
          <div className="preview-container">
            <div className="preview-header">
              <h2>Live Preview</h2>
              <div className="side-toggle">
                <button
                  className={`side-btn ${designSide === 'front' ? 'active' : ''}`}
                  onClick={() => setDesignSide('front')}
                >
                  <span className="btn-icon">👕</span>
                  Front Design
                </button>
                <button
                  className={`side-btn ${designSide === 'back' ? 'active' : ''}`}
                  onClick={() => setDesignSide('back')}
                >
                  <span className="btn-icon">👚</span>
                  Back Design
                </button>
              </div>
            </div>

            <div className="product-preview">
              <div className="preview-wrapper">
                <ProductComponent
                  color={selectedColor}
                  design={getCurrentDesign()}
                  side={designSide}
                />
              </div>
              
              <div className="preview-info">
                <div className="info-row">
                  <span>Currently Editing:</span>
                  <strong className="editing-side">{designSide.toUpperCase()} SIDE</strong>
                </div>
                <div className="info-row">
                  <span>Design Type:</span>
                  <strong>{getCurrentDesign()?.type?.toUpperCase() || 'NONE'}</strong>
                </div>
              </div>
            </div>

            {/* Design Controls */}
            <div className="design-controls-panel">
              <div className="design-type-selector">
                <div className="type-tabs">
                  <button
                    className={`type-tab ${designType === 'text' ? 'active' : ''}`}
                    onClick={() => handleDesignTypeChange('text')}
                  >
                    Text Design
                  </button>
                  <button
                    className={`type-tab ${designType === 'image' ? 'active' : ''}`}
                    onClick={() => handleDesignTypeChange('image')}
                  >
                    Upload Image
                  </button>
                </div>
              </div>

              {designType === 'text' ? (
                <div className="text-design-panel">
                  <div className="text-input-group">
                    <label htmlFor="designText">Your Text:</label>
                    <input
                      id="designText"
                      type="text"
                      value={designText}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder="Enter your custom text here"
                      className="text-input"
                      maxLength="50"
                    />
                    <div className="char-count">{designText.length}/50</div>
                  </div>

                  <div className="text-style-controls">
                    <div className="style-group">
                      <label>Text Color</label>
                      <div className="color-picker-wrapper">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => handleTextStyleChange('color', e.target.value)}
                          className="color-picker"
                        />
                        <span className="color-value">{textColor}</span>
                      </div>
                    </div>

                    <div className="style-group">
                      <label>Font Size: {textSize}px</label>
                      <input
                        type="range"
                        min="12"
                        max="48"
                        value={textSize}
                        onChange={(e) => handleTextStyleChange('size', parseInt(e.target.value))}
                        className="size-slider"
                      />
                    </div>

                    <div className="style-group">
                      <label>Font Family</label>
                      <select
                        value={fontFamily}
                        onChange={(e) => handleTextStyleChange('font', e.target.value)}
                        className="font-select"
                      >
                        {fontOptions.map(font => (
                          <option key={font.value} value={font.value}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="style-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={isBold}
                          onChange={(e) => handleTextStyleChange('bold', e.target.checked)}
                          className="bold-checkbox"
                        />
                        <span className="checkbox-custom"></span>
                        Bold Text
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="image-upload-panel">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="file-input-hidden"
                  />
                  
                  <div className="upload-area" onClick={triggerFileUpload}>
                    <div className="upload-icon">📁</div>
                    <div className="upload-text">
                      <strong>Click to upload images</strong>
                      <p>PNG, JPG, SVG up to 5MB each</p>
                    </div>
                    <button className="upload-button">Browse Files</button>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="uploaded-images-section">
                      <h4>Your Uploads ({uploadedImages.length})</h4>
                      <div className="image-grid">
                        {uploadedImages.map(img => (
                          <div
                            key={img.id}
                            className={`image-thumbnail ${activeImage === img.url ? 'active' : ''}`}
                            onClick={() => selectUploadedImage(img.url)}
                          >
                            <img src={img.url} alt={img.name} className="thumbnail-image" />
                            <div className="thumbnail-info">
                              <div className="image-name">{img.name}</div>
                              <div className="image-size">{img.size}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="design-actions">
                <button className="btn-clear" onClick={clearCurrentDesign}>
                  Clear {designSide} Design
                </button>
                <button className="btn-clear-all" onClick={clearAllDesigns}>
                  Clear All Designs
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customization Options */}
        <div className="options-column">
          {/* Product Selection */}
          <div className="options-section">
            <h3 className="section-title">SELECT PRODUCT TYPE</h3>
            <div className="product-selection-grid">
              {productTypes.map(product => {
                const ProductIcon = product.component;
                return (
                  <div
                    key={product.id}
                    className={`product-selection-card ${selectedProduct === product.id ? 'selected' : ''}`}
                    onClick={() => handleProductChange(product.id)}
                  >
                    <div className="product-icon-container">
                      <ProductIcon color="#FFFFFF" design={null} side="front" />
                    </div>
                    <div className="product-info">
                      <h4 className="product-name">{product.name}</h4>
                      <div className="product-price">${product.basePrice}</div>
                      <div className="product-specs">
                        <span className="spec">{product.sleeve}</span>
                        <span className="spec">{product.fabric}</span>
                        <span className="spec">{product.fit}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div className="options-section">
            <h3 className="section-title">PRODUCT COLOR</h3>
            <div className="color-selection-grid">
              {colorOptions.map(color => (
                <div
                  key={color.value}
                  className={`color-option ${selectedColor === color.value ? 'selected' : ''}`}
                  onClick={() => handleColorChange(color.value)}
                  title={color.name}
                >
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="color-name">{color.name}</span>
                </div>
              ))}
            </div>
            <div className="current-selection-display">
              Selected: <span className="selected-color-name">{colorOptions.find(c => c.value === selectedColor)?.name}</span>
            </div>
          </div>

          {/* Size Selection */}
          <div className="options-section">
            <h3 className="section-title">SELECT SIZE</h3>
            <div className="size-selection-grid">
              {sizeOptions.map(size => (
                <div
                  key={size.label}
                  className={`size-option ${selectedSize === size.label ? 'selected' : ''}`}
                  onClick={() => handleSizeChange(size.label)}
                >
                  <div className="size-label">{size.label}</div>
                  <div className="size-measurement">{size.chest}</div>
                </div>
              ))}
            </div>
            <div className="size-guide-link">
              <a href="#size-guide">View Size Guide →</a>
            </div>
          </div>

          {/* Design Layers */}
          <div className="options-section">
            <h3 className="section-title">DESIGN LAYERS</h3>
            <div className="layers-container">
              <div className="layer-item">
                <div className="layer-header">
                  <span className="layer-title">Front Design</span>
                  <button 
                    className="layer-edit-btn"
                    onClick={() => setDesignSide('front')}
                  >
                    {frontDesign ? 'Edit' : 'Add Design'}
                  </button>
                </div>
                <div className="layer-content">
                  {frontDesign ? (
                    <div className="layer-preview-small">
                      {frontDesign.type === 'text' ? (
                        <div className="text-preview" style={{
                          color: frontDesign.color,
                          fontSize: '14px',
                          fontFamily: frontDesign.font,
                          fontWeight: frontDesign.bold ? 'bold' : 'normal'
                        }}>
                          {frontDesign.content}
                        </div>
                      ) : (
                        <img src={frontDesign.content} alt="Front design" className="image-preview" />
                      )}
                    </div>
                  ) : (
                    <div className="layer-empty">No design added</div>
                  )}
                </div>
              </div>

              <div className="layer-item">
                <div className="layer-header">
                  <span className="layer-title">Back Design</span>
                  <button 
                    className="layer-edit-btn"
                    onClick={() => setDesignSide('back')}
                  >
                    {backDesign ? 'Edit' : 'Add Design'}
                  </button>
                </div>
                <div className="layer-content">
                  {backDesign ? (
                    <div className="layer-preview-small">
                      {backDesign.type === 'text' ? (
                        <div className="text-preview" style={{
                          color: backDesign.color,
                          fontSize: '14px',
                          fontFamily: backDesign.font,
                          fontWeight: backDesign.bold ? 'bold' : 'normal'
                        }}>
                          {backDesign.content}
                        </div>
                      ) : (
                        <img src={backDesign.content} alt="Back design" className="image-preview" />
                      )}
                    </div>
                  ) : (
                    <div className="layer-empty">No design added</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="options-section price-summary">
            <h3 className="section-title">PRICE SUMMARY</h3>
            <div className="price-details">
              <div className="price-row">
                <span>Base Price:</span>
                <span>${getCurrentProduct().basePrice}.00</span>
              </div>
              <div className="price-row">
                <span>Size ({selectedSize}):</span>
                <span>
                  ${sizeOptions.find(s => s.label === selectedSize) ? 
                    ['XS','S','M','L','XL','XXL'].indexOf(selectedSize) > 2 ? 
                    (['XS','S','M','L','XL','XXL'].indexOf(selectedSize) - 2) * 2 : 0 
                    : 0}.00
                </span>
              </div>
              <div className="price-row">
                <span>Custom Design:</span>
                <span>
                  ${((frontDesign || backDesign) && designType === 'image') ? '8.00' : 
                    ((frontDesign || backDesign) && designType === 'text') ? '3.00' : '0.00'}
                </span>
              </div>
              <div className="price-total">
                <span>TOTAL:</span>
                <span className="total-amount">${totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons-section">
            <button className="btn-add-to-cart" onClick={addToCart}>
              <span className="btn-icon">🛒</span>
              Add to Cart - ${totalPrice}
            </button>
            <button className="btn-save-design" onClick={saveDesign}>
              <span className="btn-icon">💾</span>
              Save Design for Later
            </button>
          </div>

          {/* Instructions */}
          <div className="instructions-section">
            <h4>How to Customize:</h4>
            <ol className="instructions-list">
              <li><strong>Choose Product:</strong> Select T-Shirt, Hoodie, Long Sleeve, or Polo</li>
              <li><strong>Pick Color:</strong> Choose from 10+ colors</li>
              <li><strong>Select Size:</strong> XS to XXL with measurements</li>
              <li><strong>Add Design:</strong> Switch between Front/Back and add text or upload image</li>
              <li><strong>Preview & Order:</strong> See real-time preview and add to cart</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TshirtCustomizer;