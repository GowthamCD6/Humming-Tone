import React, { useState } from 'react';
// import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import AddToCartModal from '../Prodect-Details/Product-Buying modal/AddToCartModal';
import './customize.css';

const CustomizePage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const [selectedType, setSelectedType] = useState(''); 
  const [selectedVariant, setSelectedVariant] = useState(''); 
  const [selectedColor, setSelectedColor] = useState('');
  const [customColor, setCustomColor] = useState('#FFFFFF');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [designOption, setDesignOption] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedGalleryDesign, setSelectedGalleryDesign] = useState('');
  const [customText, setCustomText] = useState('');

  const [showCartModal, setShowCartModal] = useState(false);
  const [cartModalData, setCartModalData] = useState(null);

  // Placeholder Image URL
  const placeholderImg = "https://cdn-icons-png.flaticon.com/512/892/892458.png";

  // Product Data
  const productCategories = [
    { id: 'tshirts', name: 'T-SHIRTS', image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80", description: 'Classic cotton essentials', 
      variants: [
        { id: 'round', name: 'Round Neck', image: null },
        { id: 'vneck', name: 'V-Neck', image: null },
        { id: 'collar', name: 'Collar/Polo', image: null },
        { id: 'henley', name: 'Henley', image: null },
        { id: 'scoop', name: 'Scoop Neck', image: null },
        { id: 'sleeveless_t', name: 'Sleeveless', image: null },
      ]
    },
    { id: 'hoodies', name: 'HOODIES', image: null, description: 'Cozy & stylish outerwear',
      variants: [
        { id: 'pullover', name: 'Pullover', image: null },
        { id: 'zipup', name: 'Zip-Up', image: null },
        { id: 'sleeveless_h', name: 'Sleeveless/Gilet', image: null },
        { id: 'oversized', name: 'Oversized', image: null },
        { id: 'cropped_h', name: 'Cropped', image: null },
        { id: 'crop_hoodie', name: 'Crop Hoodie', image: null },
      ]
    },
    { id: 'sweatshirts', name: 'SWEATSHIRTS', image: null, description: 'Premium crew neck comfort',
      variants: [
        { id: 'crew', name: 'Crew Neck Standard', image: null },
      ]
    },
    { id: 'sportswear', name: 'SPORTSWEAR', image: null, description: 'High performance gear',
      variants: [
        { id: 'dryfit', name: 'Dry-fit Jersey T-Shirts', image: null },
        { id: 'athletic', name: 'Athletic Tops', image: null },
      ]
    },
  ];

  const colors = [
    { id: 'white', name: 'White', hex: '#FFFFFF' },
    { id: 'black', name: 'Black', hex: '#000000' },
    { id: 'navy', name: 'Navy Blue', hex: '#001F3F' },
    { id: 'red', name: 'Red', hex: '#FF4136' },
    { id: 'green', name: 'Green', hex: '#2ECC40' },
    { id: 'gray', name: 'Gray', hex: '#AAAAAA' },
    { id: 'yellow', name: 'Yellow', hex: '#FFDC00' },
    { id: 'purple', name: 'Purple', hex: '#B10DC9' },
    { id: 'orange', name: 'Orange', hex: '#FF851B' },
    { id: 'pink', name: 'Pink', hex: '#F012BE' },
    { id: 'brown', name: 'Brown', hex: '#8B4513' },
    { id: 'custom', name: 'Custom Color', hex: null },
  ];

  // Materials updated with Image property instead of icon
  const materials = [
    { id: 'cotton', name: 'Pure Cotton', desc: 'Soft & Breathable', image: null },
    { id: 'polyester', name: 'Polyester', desc: 'Durable & Quick-dry', image: null },
    { id: 'blend', name: 'Cotton Blend', desc: 'Best of Both', image: null },
    { id: 'premium', name: 'Premium Cotton', desc: 'Luxury Feel', image: null },
    { id: 'organic', name: 'Organic Cotton', desc: '100% Natural', image: null },
    { id: 'bamboo', name: 'Bamboo Fabric', desc: 'Eco-friendly', image: null },
  ];

  const sizes = [
    { id: 'XS', name: 'XS', chest: '32-34"', icon: 'looks_one' },
    { id: 'S', name: 'S', chest: '35-37"', icon: 'looks_two' },
    { id: 'M', name: 'M', chest: '38-40"', icon: 'looks_3' },
    { id: 'L', name: 'L', chest: '41-43"', icon: 'looks_4' },
    { id: 'XL', name: 'XL', chest: '44-46"', icon: 'looks_5' },
    { id: 'XXL', name: 'XXL', chest: '47-49"', icon: 'looks_6' },
    { id: '3XL', name: '3XL', chest: '50-52"', icon: 'exposure_plus_1' },
  ];

  const galleryDesigns = [
    { id: 'design1', name: 'Abstract Art', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop', preview: null },
    { id: 'design2', name: 'Geometric', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop', preview: null },
    { id: 'design3', name: 'Nature', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop', preview: null },
    { id: 'design4', name: 'Typography', image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&h=200&fit=crop', preview: null },
    { id: 'design5', name: 'Minimal', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop', preview: null },
    { id: 'design6', name: 'Vintage', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop', preview: null },
    { id: 'design7', name: 'Sports', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=200&fit=crop', preview: null },
    { id: 'design8', name: 'Music', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop', preview: null },
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorSelect = (colorId, hex) => {
    setSelectedColor(colorId);
    if (colorId !== 'custom' && hex) {
      setCustomColor(hex);
    }
  };

  const canProceedToNext = () => {
    switch(currentStep) {
      case 1: return selectedType !== '';
      case 2: return selectedVariant !== '';
      case 3: return selectedColor !== '';
      case 4: return selectedMaterial !== '';
      case 5: return selectedSize !== '';
      case 6: return designOption !== '' && (
        (designOption === 'upload' && (uploadedImage || customText)) ||
        (designOption === 'gallery' && selectedGalleryDesign)
      );
      default: return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    const customization = {
      type: selectedType,
      variant: selectedVariant,
      color: selectedColor === 'custom' ? customColor : selectedColor,
      material: selectedMaterial,
      size: selectedSize,
      design: designOption === 'upload' ? uploadedImage || customText : selectedGalleryDesign,
    };

    // Get selected category and variant names
    const selectedCategory = productCategories.find(c => c.id === selectedType);
    const selectedVariantData = selectedCategory?.variants.find(v => v.id === selectedVariant);
    const selectedColorData = colors.find(c => c.id === selectedColor);

    // Add to cart (you may need to adjust pricing logic)
    const customProduct = {
      id: `custom-${Date.now()}`,
      name: `Custom ${selectedCategory?.name || 'Product'}`,
      size: selectedSize,
      quantity: 1,
      price: 999, // Base price - you can calculate based on selections
      image: uploadedImage || selectedGalleryDesign || 'https://via.placeholder.com/400x500?text=Custom+Design'
    };

    // Store in cart
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(customProduct);
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart:updated'));

    console.log('Customization completed:', customization);

    // Show modal
    setCartModalData(customProduct);
    setShowCartModal(true);
  };

  const getCurrentVariants = () => {
    const category = productCategories.find(c => c.id === selectedType);
    return category ? category.variants : [];
  };

  const addDefaultSrc = (ev) => {
    ev.target.src = placeholderImg;
  };

  return (
    <div className="customize-page">
      <div className="customize-header">
        <h1 className="customize-title">Customize Your Product</h1>
        <p className="customize-subtitle">Create your unique design in 6 easy steps</p>
      </div>

      <div className="customize-divider"></div>

      <div className="progress-container">
        <div className="progress-steps">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}>
              <div className="progress-circle">
                <span className="material-icons">
                  {currentStep > step ? 'check_circle' : 
                   step === 1 ? 'category' : 
                   step === 2 ? 'style' : 
                   step === 3 ? 'palette' : 
                   step === 4 ? 'texture' : 
                   step === 5 ? 'straighten' : 'brush'}
                </span>
              </div>
              <span className="progress-label">
                {step === 1 && 'Type'}
                {step === 2 && 'Variant'}
                {step === 3 && 'Color'}
                {step === 4 && 'Material'}
                {step === 5 && 'Size'}
                {step === 6 && 'Design'}
              </span>
            </div>
          ))}
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(currentStep / 6) * 100}%` }}></div>
        </div>
      </div>

      <div className="customize-content">
        
        {/* Step 1: Type Selection */}
        {currentStep === 1 && (
          <div className="step-content">
            <h2 className="step-title">Select Product Category</h2>
            <div className="options-grid type-grid">
              {productCategories.map((type) => (
                <div
                  key={type.id}
                  className={`option-card ${selectedType === type.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedType(type.id);
                    setSelectedVariant(''); 
                  }}
                >
                  <div className="option-image-wrapper">
                    <img 
                      src={type.image || placeholderImg} 
                      alt={type.name} 
                      onError={addDefaultSrc}
                      className="option-card-image"
                    />
                  </div>
                  <div className="option-name">{type.name}</div>
                  <div className="option-desc">{type.description}</div>
                  {selectedType === type.id && (
                    <span className="material-icons check-icon">check_circle</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Variant Selection */}
        {currentStep === 2 && (
          <div className="step-content">
            <h2 className="step-title">Choose Your {selectedType.toUpperCase()} Variant</h2>
            <div className="options-grid type-grid">
              {getCurrentVariants().map((variant) => (
                <div
                  key={variant.id}
                  className={`option-card ${selectedVariant === variant.id ? 'selected' : ''}`}
                  onClick={() => setSelectedVariant(variant.id)}
                >
                  <div className="option-image-wrapper">
                    <img 
                      src={variant.image || placeholderImg} 
                      alt={variant.name} 
                      onError={addDefaultSrc}
                      className="option-card-image"
                    />
                  </div>
                  <div className="option-name">{variant.name}</div>
                  {selectedVariant === variant.id && (
                    <span className="material-icons check-icon">check_circle</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Color Selection */}
        {currentStep === 3 && (
          <div className="step-content">
            <h2 className="step-title">Choose Color</h2>
            <div className="options-grid color-grid">
              {colors.map((color) => (
                <div
                  key={color.id}
                  className={`option-card color-card ${selectedColor === color.id ? 'selected' : ''}`}
                  onClick={() => handleColorSelect(color.id, color.hex)}
                >
                  {color.id === 'custom' ? (
                    <div className="custom-color-picker">
                      <span className="material-icons color-picker-icon">colorize</span>
                      <label className="color-picker-label">
                        <input
                          type="color"
                          value={customColor}
                          onChange={(e) => {
                            setCustomColor(e.target.value);
                            setSelectedColor('custom');
                          }}
                          className="color-picker-input"
                        />
                      </label>
                    </div>
                  ) : (
                    <div 
                      className="color-swatch" 
                      style={{ 
                        backgroundColor: color.hex,
                        border: color.hex === '#FFFFFF' ? '2px solid #e5e5e5' : 'none'
                      }}
                    ></div>
                  )}
                  <div className="option-name">{color.name}</div>
                  {selectedColor === color.id && color.id !== 'custom' && (
                    <span className="material-icons check-icon">check_circle</span>
                  )}
                  {selectedColor === 'custom' && color.id === 'custom' && (
                    <div 
                      className="custom-color-preview" 
                      style={{ backgroundColor: customColor }}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Material Selection (Updated to show images) */}
        {currentStep === 4 && (
          <div className="step-content">
            <h2 className="step-title">Select Material</h2>
            <div className="options-grid material-grid">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className={`option-card material-card ${selectedMaterial === material.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMaterial(material.id)}
                >
                  <div className="option-image-wrapper">
                    <img 
                      src={material.image || placeholderImg} 
                      alt={material.name} 
                      onError={addDefaultSrc}
                      className="option-card-image"
                    />
                  </div>
                  <div className="option-name">{material.name}</div>
                  <div className="option-desc">{material.desc}</div>
                  {selectedMaterial === material.id && (
                    <span className="material-icons check-icon">check_circle</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Size Selection */}
        {currentStep === 5 && (
          <div className="step-content">
            <h2 className="step-title">Choose Size</h2>
            <div className="size-guide-note">
              <span className="material-icons">info</span>
              <span>Hover over size for measurements</span>
            </div>
            <div className="options-grid size-grid">
              {sizes.map((size) => (
                <div
                  key={size.id}
                  className={`option-card size-card ${selectedSize === size.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size.id)}
                  title={`Chest: ${size.chest}`}
                >
                  <span className="material-icons size-icon">{size.icon}</span>
                  <div className="size-label">{size.name}</div>
                  <div className="size-measurement">{size.chest}</div>
                  {selectedSize === size.id && (
                    <span className="material-icons check-icon-small">check_circle</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Design Selection */}
        {currentStep === 6 && (
          <div className="step-content">
            <h2 className="step-title">Add Your Design</h2>
            
            <div className="design-options">
              <button
                className={`design-option-btn ${designOption === 'upload' ? 'active' : ''}`}
                onClick={() => setDesignOption('upload')}
              >
                <span className="material-icons">file_upload</span>
                Upload Design / Add Text
              </button>
              <button
                className={`design-option-btn ${designOption === 'gallery' ? 'active' : ''}`}
                onClick={() => setDesignOption('gallery')}
              >
                <span className="material-icons">photo_library</span>
                Choose from Gallery
              </button>
            </div>

            {designOption === 'upload' && (
              <div className="upload-section">
                <div className="upload-area">
                  <input
                    type="file"
                    id="fileUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="fileUpload" className="upload-label">
                    {uploadedImage ? (
                      <div className="uploaded-image-container">
                        <img src={uploadedImage} alt="Uploaded" className="uploaded-preview" />
                        <button 
                          className="remove-image-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            setUploadedImage(null);
                          }}
                        >
                          <span className="material-icons">close</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="material-icons upload-icon">cloud_upload</span>
                        <p className="upload-text">Click to upload your design</p>
                        <p className="upload-subtext">PNG, JPG, SVG up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>

                <div className="text-section">
                  <h3 className="text-title">
                    <span className="material-icons">text_fields</span>
                    Or Add Custom Text
                  </h3>
                  <textarea
                    className="text-input"
                    placeholder="Enter your custom text here..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    rows="4"
                  />
                </div>
              </div>
            )}

            {designOption === 'gallery' && (
              <div className="gallery-section">
                <div className="gallery-grid">
                  {galleryDesigns.map((design) => (
                    <div
                      key={design.id}
                      className={`gallery-card ${selectedGalleryDesign === design.id ? 'selected' : ''}`}
                      onClick={() => setSelectedGalleryDesign(design.id)}
                    >
                      <img 
                        src={design.image} 
                        alt={design.name} 
                        className="gallery-preview-image"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/200x200?text=Design'}
                      />
                      <div className="gallery-name">{design.name}</div>
                      {selectedGalleryDesign === design.id && (
                        <span className="material-icons check-icon">check_circle</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navigation-buttons">
        {currentStep > 1 && (
          <button className="nav-btn back-btn" onClick={handleBack}>
            <span className="material-icons">arrow_back</span>
            Back
          </button>
        )}
        
        {currentStep < 6 ? (
          <button 
            className={`nav-btn next-btn ${!canProceedToNext() ? 'disabled' : ''}`}
            onClick={handleNext}
            disabled={!canProceedToNext()}
          >
            Next
            <span className="material-icons">arrow_forward</span>
          </button>
        ) : (
          <button 
            className={`nav-btn finish-btn ${!canProceedToNext() ? 'disabled' : ''}`}
            onClick={handleFinish}
            disabled={!canProceedToNext()}
          >
            <span className="material-icons">shopping_cart</span>
            Finish & Add to Cart
          </button>
        )}
      </div>

      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        productData={cartModalData}
      />
    </div>
  );
};

export default CustomizePage;
