import React, { useState} from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import './Customize.css';

const CustomizePage = () => {
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);
  
  // Customization options
  const [selectedType, setSelectedType] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [customColor, setCustomColor] = useState('#FFFFFF');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [designOption, setDesignOption] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedGalleryDesign, setSelectedGalleryDesign] = useState('');
  const [customText, setCustomText] = useState('');

  // Product options with Material Icons
  const tshirtTypes = [
    { id: 'round', name: 'Round Neck', icon: 'checkroom', description: 'Classic everyday style' },
    { id: 'collar', name: 'Collar T-Shirt', icon: 'business_center', description: 'Professional look' },
    { id: 'vneck', name: 'V-Neck', icon: 'airline_seat_recline_normal', description: 'Modern & trendy' },
    { id: 'polo', name: 'Polo Shirt', icon: 'sports_golf', description: 'Smart casual' },
    { id: 'henley', name: 'Henley', icon: 'sentiment_satisfied', description: 'Buttoned placket' },
    { id: 'raglan', name: 'Raglan', icon: 'sports_baseball', description: 'Athletic style' },
    { id: 'tank', name: 'Tank Top', icon: 'fitness_center', description: 'Sleeveless comfort' },
    { id: 'long', name: 'Long Sleeve', icon: 'air', description: 'Full coverage' },
  ];

  // Preset colors with custom option
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

  const materials = [
    { id: 'cotton', name: 'Pure Cotton', desc: 'Soft & Breathable', icon: 'eco' },
    { id: 'polyester', name: 'Polyester', desc: 'Durable & Quick-dry', icon: 'water_drop' },
    { id: 'blend', name: 'Cotton Blend', desc: 'Best of Both', icon: 'merge' },
    { id: 'premium', name: 'Premium Cotton', desc: 'Luxury Feel', icon: 'workspace_premium' },
    { id: 'organic', name: 'Organic Cotton', desc: '100% Natural', icon: 'nature' },
    { id: 'bamboo', name: 'Bamboo Fabric', desc: 'Eco-friendly', icon: 'forest' },
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
    { id: 'design1', name: 'Abstract Art', icon: 'palette', preview: null },
    { id: 'design2', name: 'Geometric', icon: 'change_history', preview: null },
    { id: 'design3', name: 'Nature', icon: 'nature_people', preview: null },
    { id: 'design4', name: 'Typography', icon: 'text_fields', preview: null },
    { id: 'design5', name: 'Minimal', icon: 'circle', preview: null },
    { id: 'design6', name: 'Vintage', icon: 'radio', preview: null },
    { id: 'design7', name: 'Sports', icon: 'sports_soccer', preview: null },
    { id: 'design8', name: 'Music', icon: 'music_note', preview: null },
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
      case 2: return selectedColor !== '';
      case 3: return selectedMaterial !== '';
      case 4: return selectedSize !== '';
      case 5: return designOption !== '' && (
        (designOption === 'upload' && (uploadedImage || customText)) ||
        (designOption === 'gallery' && selectedGalleryDesign)
      );
      default: return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < 5) {
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
      color: selectedColor === 'custom' ? customColor : selectedColor,
      material: selectedMaterial,
      size: selectedSize,
      design: designOption === 'upload' ? uploadedImage || customText : selectedGalleryDesign,
    };
    console.log('Customization completed:', customization);
    alert('Your custom product has been created! Redirecting to cart...');
  };

  return (
    <div className="customize-page">
      {/* Header */}
      <div className="customize-header">
        <h1 className="customize-title">Customize Your Product</h1>
        <p className="customize-subtitle">Create your unique design in 5 easy steps</p>
      </div>

      <div className="customize-divider"></div>

      {/* Progress Indicator */}
      <div className="progress-container">
        <div className="progress-steps">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}>
              <div className="progress-circle">
                <span className="material-icons">
                  {currentStep > step ? 'check_circle' : step === 1 ? 'checkroom' : step === 2 ? 'palette' : step === 3 ? 'category' : step === 4 ? 'straighten' : 'brush'}
                </span>
              </div>
              <span className="progress-label">
                {step === 1 && 'Type'}
                {step === 2 && 'Color'}
                {step === 3 && 'Material'}
                {step === 4 && 'Size'}
                {step === 5 && 'Design'}
              </span>
            </div>
          ))}
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(currentStep / 5) * 100}%` }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="customize-content">
        
        {/* Step 1: Type Selection */}
        {currentStep === 1 && (
          <div className="step-content">
            <h2 className="step-title">Select T-Shirt Type</h2>
            <div className="options-grid type-grid">
              {tshirtTypes.map((type) => (
                <div
                  key={type.id}
                  className={`option-card ${selectedType === type.id ? 'selected' : ''}`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <span className="material-icons option-icon">{type.icon}</span>
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

        {/* Step 2: Color Selection */}
        {currentStep === 2 && (
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

        {/* Step 3: Material Selection */}
        {currentStep === 3 && (
          <div className="step-content">
            <h2 className="step-title">Select Material</h2>
            <div className="options-grid material-grid">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className={`option-card material-card ${selectedMaterial === material.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMaterial(material.id)}
                >
                  <span className="material-icons option-icon">{material.icon}</span>
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

        {/* Step 4: Size Selection */}
        {currentStep === 4 && (
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

        {/* Step 5: Design Selection */}
        {currentStep === 5 && (
          <div className="step-content">
            <h2 className="step-title">Add Your Design</h2>
            
            {/* Design Option Selector */}
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

            {/* Upload Section */}
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

            {/* Gallery Section */}
            {designOption === 'gallery' && (
              <div className="gallery-section">
                <div className="gallery-grid">
                  {galleryDesigns.map((design) => (
                    <div
                      key={design.id}
                      className={`gallery-card ${selectedGalleryDesign === design.id ? 'selected' : ''}`}
                      onClick={() => setSelectedGalleryDesign(design.id)}
                    >
                      <span className="material-icons gallery-preview">{design.icon}</span>
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

      {/* Navigation Buttons */}
      <div className="navigation-buttons">
        {currentStep > 1 && (
          <button className="nav-btn back-btn" onClick={handleBack}>
            <span className="material-icons">arrow_back</span>
            Back
          </button>
        )}
        
        {currentStep < 5 ? (
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

      {/* Footer */}
      <UserFooter />
    </div>
  );
};

export default CustomizePage;