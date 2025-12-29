import React, { useState, useEffect } from 'react';
import './AdminCystamize.css';
import SuccessModal from '../../../../components/SuccessModal/SuccessModal';
import {
  getSiteContent,
  updateCustomize,
} from '../../../../utils/siteContentStore';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';

// Input Modal Component
const InputModal = ({ isOpen, title, fields, onClose, onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState(() => {
    const data = {};
    fields.forEach(field => {
      data[field.name] = initialData[field.name] || '';
    });
    return data;
  });

  useEffect(() => {
    if (isOpen) {
      const data = {};
      fields.forEach(field => {
        data[field.name] = initialData[field.name] || '';
      });
      setFormData(data);
    }
  }, [isOpen, initialData, fields]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-input-modal-overlay" onClick={onClose}>
      <div className="admin-input-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-input-modal-header">
          <h3>{title}</h3>
          <button className="admin-input-modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="admin-input-modal-form">
          {fields.map((field) => (
            <div key={field.name} className="admin-input-modal-field">
              <label htmlFor={field.name}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={field.rows || 3}
                />
              ) : field.type === 'file' ? (
                <div className="admin-file-input">
                  <input
                    type="file"
                    id={field.name}
                    name={field.name}
                    onChange={handleChange}
                    accept={field.accept || "image/*"}
                    required={field.required && !formData[field.name]}
                  />
                  {formData[field.name] && typeof formData[field.name] === 'string' && (
                    <div className="admin-file-preview">
                      <img src={formData[field.name]} alt="Current" style={{width: '80px', height: '80px', objectFit: 'cover'}} />
                      <div className="admin-file-preview-info">
                        <span className="admin-file-preview-label">Current Image</span>
                        <span className="admin-file-preview-name">Click to change</span>
                      </div>
                    </div>
                  )}
                  {formData[field.name] && formData[field.name] instanceof File && (
                    <div className="admin-file-preview">
                      <ImageIcon style={{fontSize: 40, color: '#1976d2'}} />
                      <div className="admin-file-preview-info">
                        <span className="admin-file-preview-label">New Image</span>
                        <span className="admin-file-preview-name">{formData[field.name].name}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type={field.type || 'text'}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <div className="admin-input-modal-actions">
            <button type="button" className="admin-customize-btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-customize-btn primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminCystamize = ({ onBack }) => {
  const initial = getSiteContent();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [error, setError] = useState('');
  
  // State for different modals
  const [productCategoryModal, setProductCategoryModal] = useState({
    open: false,
    data: null,
    index: null
  });
  
  const [variantModal, setVariantModal] = useState({
    open: false,
    categoryIndex: null,
    data: null,
    index: null
  });
  
  const [colorModal, setColorModal] = useState({
    open: false,
    data: null,
    index: null
  });
  
  const [materialModal, setMaterialModal] = useState({
    open: false,
    data: null,
    index: null
  });
  
  const [sizeModal, setSizeModal] = useState({
    open: false,
    data: null,
    index: null
  });
  
  const [galleryModal, setGalleryModal] = useState({
    open: false,
    data: null,
    index: null
  });

  const [customizeDraft, setCustomizeDraft] = useState(initial.customize || {
    productCategories: [],
    colors: [],
    materials: [],
    sizes: [],
    galleryDesigns: [],
  });

  // Load data on component mount
  useEffect(() => {
    const content = getSiteContent();
    setCustomizeDraft(content.customize || {
      productCategories: [],
      colors: [],
      materials: [],
      sizes: [],
      galleryDesigns: [],
    });
  }, []);

  const saveCustomize = async () => {
    try {
      setError('');
      await updateCustomize(customizeDraft);
      setModalMessage('Customize content saved successfully!');
      setModalOpen(true);
    } catch (e) {
      setError(e?.message || 'Failed to save customize content');
    }
  };

  // Product Category Handlers
  const handleAddProductCategory = () => {
    setProductCategoryModal({
      open: true,
      data: null,
      index: null
    });
  };

  const handleEditProductCategory = (index) => {
    setProductCategoryModal({
      open: true,
      data: customizeDraft.productCategories[index],
      index
    });
  };

  const handleSubmitProductCategory = async (formData) => {
    const id = formData.name.toLowerCase().replace(/\s+/g, '_');
    
    // Handle image upload
    let imageUrl = formData.image;
    if (formData.image instanceof File) {
      imageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(formData.image);
      });
    }
    
    if (productCategoryModal.index !== null) {
      // Edit existing category
      setCustomizeDraft(prev => {
        const categories = [...prev.productCategories];
        categories[productCategoryModal.index] = {
          ...categories[productCategoryModal.index],
          name: formData.name.toUpperCase(),
          description: formData.description,
          image: imageUrl,
          id,
        };
        return { ...prev, productCategories: categories };
      });
    } else {
      // Add new category
      setCustomizeDraft(prev => ({
        ...prev,
        productCategories: [
          ...(prev.productCategories || []),
          {
            id,
            name: formData.name.toUpperCase(),
            description: formData.description,
            image: imageUrl,
            variants: [],
          },
        ],
      }));
    }
  };

  const removeProductCategory = (index) => {
    if (!confirm('Remove this product category and all its variants?')) return;
    setCustomizeDraft(prev => ({
      ...prev,
      productCategories: prev.productCategories.filter((_, i) => i !== index),
    }));
  };

  // Variant Handlers
  const handleAddVariant = (categoryIndex) => {
    setVariantModal({
      open: true,
      categoryIndex,
      data: null,
      index: null
    });
  };

  const handleEditVariant = (categoryIndex, variantIndex) => {
    setVariantModal({
      open: true,
      categoryIndex,
      data: customizeDraft.productCategories[categoryIndex].variants[variantIndex],
      index: variantIndex
    });
  };

  const handleSubmitVariant = async (formData) => {
    const id = formData.name.toLowerCase().replace(/\s+/g, '_');
    
    // Handle image upload
    let imageUrl = formData.image;
    if (formData.image instanceof File) {
      imageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(formData.image);
      });
    }
    
    setCustomizeDraft(prev => {
      const categories = [...prev.productCategories];
      const variants = [...categories[variantModal.categoryIndex].variants];
      
      if (variantModal.index !== null) {
        // Edit existing variant
        variants[variantModal.index] = {
          ...variants[variantModal.index],
          id,
          name: formData.name,
          image: imageUrl,
        };
      } else {
        // Add new variant
        variants.push({
          id,
          name: formData.name,
          image: imageUrl,
        });
      }
      
      categories[variantModal.categoryIndex].variants = variants;
      return { ...prev, productCategories: categories };
    });
  };

  const removeVariant = (categoryIndex, variantIndex) => {
    if (!confirm('Remove this variant?')) return;
    setCustomizeDraft(prev => {
      const categories = [...prev.productCategories];
      categories[categoryIndex].variants = categories[categoryIndex].variants.filter(
        (_, i) => i !== variantIndex
      );
      return { ...prev, productCategories: categories };
    });
  };

  // Color Handlers
  const handleAddColor = () => {
    setColorModal({
      open: true,
      data: null,
      index: null
    });
  };

  const handleEditColor = (index) => {
    setColorModal({
      open: true,
      data: customizeDraft.colors[index],
      index
    });
  };

  const handleSubmitColor = (formData) => {
    const id = formData.name.toLowerCase().replace(/\s+/g, '_');
    
    if (colorModal.index !== null) {
      // Edit existing color
      setCustomizeDraft(prev => {
        const colors = [...prev.colors];
        colors[colorModal.index] = {
          ...colors[colorModal.index],
          id,
          name: formData.name,
          hex: formData.hex || '#FFFFFF',
        };
        return { ...prev, colors };
      });
    } else {
      // Add new color
      setCustomizeDraft(prev => ({
        ...prev,
        colors: [
          ...(prev.colors || []),
          {
            id,
            name: formData.name,
            hex: formData.hex || '#FFFFFF',
          },
        ],
      }));
    }
  };

  const removeColor = (index) => {
    if (!confirm('Remove this color?')) return;
    setCustomizeDraft(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  // Material Handlers
  const handleAddMaterial = () => {
    setMaterialModal({
      open: true,
      data: null,
      index: null
    });
  };

  const handleEditMaterial = (index) => {
    setMaterialModal({
      open: true,
      data: customizeDraft.materials[index],
      index
    });
  };

  const handleSubmitMaterial = async (formData) => {
    const id = formData.name.toLowerCase().replace(/\s+/g, '_');
    
    // Handle image upload
    let imageUrl = formData.image;
    if (formData.image instanceof File) {
      imageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(formData.image);
      });
    }
    
    if (materialModal.index !== null) {
      // Edit existing material
      setCustomizeDraft(prev => {
        const materials = [...prev.materials];
        materials[materialModal.index] = {
          ...materials[materialModal.index],
          id,
          name: formData.name,
          desc: formData.desc,
          image: imageUrl,
        };
        return { ...prev, materials };
      });
    } else {
      // Add new material
      setCustomizeDraft(prev => ({
        ...prev,
        materials: [
          ...(prev.materials || []),
          {
            id,
            name: formData.name,
            desc: formData.desc,
            image: imageUrl,
          },
        ],
      }));
    }
  };

  const removeMaterial = (index) => {
    if (!confirm('Remove this material?')) return;
    setCustomizeDraft(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  // Size Handlers
  const handleAddSize = () => {
    setSizeModal({
      open: true,
      data: null,
      index: null
    });
  };

  const handleEditSize = (index) => {
    setSizeModal({
      open: true,
      data: customizeDraft.sizes[index],
      index
    });
  };

  const handleSubmitSize = (formData) => {
    if (sizeModal.index !== null) {
      // Edit existing size
      setCustomizeDraft(prev => {
        const sizes = [...prev.sizes];
        sizes[sizeModal.index] = {
          ...sizes[sizeModal.index],
          id: formData.name,
          name: formData.name,
          chest: formData.chest,
          icon: 'looks_' + (formData.name.length === 1 ? formData.name.toLowerCase() : 'one')
        };
        return { ...prev, sizes };
      });
    } else {
      // Add new size
      setCustomizeDraft(prev => ({
        ...prev,
        sizes: [
          ...(prev.sizes || []),
          {
            id: formData.name,
            name: formData.name,
            chest: formData.chest,
            icon: 'looks_' + (formData.name.length === 1 ? formData.name.toLowerCase() : 'one'),
          },
        ],
      }));
    }
  };

  const removeSize = (index) => {
    if (!confirm('Remove this size?')) return;
    setCustomizeDraft(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  // Gallery Design Handlers
  const handleAddGalleryDesign = () => {
    setGalleryModal({
      open: true,
      data: null,
      index: null
    });
  };

  const handleEditGalleryDesign = (index) => {
    setGalleryModal({
      open: true,
      data: customizeDraft.galleryDesigns[index],
      index
    });
  };

  const handleSubmitGalleryDesign = async (formData) => {
    const id = formData.id || 'design' + Date.now();
    
    // Handle image upload
    let imageUrl = formData.image;
    if (formData.image instanceof File) {
      imageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(formData.image);
      });
    }
    
    if (galleryModal.index !== null) {
      // Edit existing design
      setCustomizeDraft(prev => {
        const galleryDesigns = [...prev.galleryDesigns];
        galleryDesigns[galleryModal.index] = {
          ...galleryDesigns[galleryModal.index],
          id,
          name: formData.name,
          image: imageUrl,
        };
        return { ...prev, galleryDesigns };
      });
    } else {
      // Add new design
      setCustomizeDraft(prev => ({
        ...prev,
        galleryDesigns: [
          ...(prev.galleryDesigns || []),
          {
            id,
            name: formData.name,
            image: imageUrl,
          },
        ],
      }));
    }
  };

  const removeGalleryDesign = (index) => {
    if (!confirm('Remove this gallery design?')) return;
    setCustomizeDraft(prev => ({
      ...prev,
      galleryDesigns: prev.galleryDesigns.filter((_, i) => i !== index),
    }));
  };

  return (
    <section className="admin-customize">
      <div className="admin-customize-header">
        <button className="admin-customize-back-btn" onClick={onBack}>
          <ArrowBackIcon />
          Back to Site Content
        </button>
        <h2 className="admin-customize-title">Customize Page Content Management</h2>
      </div>

      {error && (
        <div className="admin-customize-alert admin-customize-alert-error">{error}</div>
      )}

      <SuccessModal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />

      {/* Product Category Modal */}
      <InputModal
        isOpen={productCategoryModal.open}
        title={productCategoryModal.index !== null ? "Edit Product Category" : "Add Product Category"}
        fields={[
          { 
            name: 'name', 
            label: 'Category Name', 
            placeholder: 'e.g., T-SHIRTS',
            required: true 
          },
          { 
            name: 'description', 
            label: 'Description', 
            placeholder: 'Enter category description',
            type: 'textarea',
            rows: 3,
            required: true 
          },
          { 
            name: 'image', 
            label: 'Category Image', 
            type: 'file',
            accept: 'image/*',
            required: productCategoryModal.index === null
          },
        ]}
        initialData={productCategoryModal.data || {}}
        onClose={() => setProductCategoryModal({ open: false, data: null, index: null })}
        onSubmit={handleSubmitProductCategory}
      />

      {/* Variant Modal */}
      <InputModal
        isOpen={variantModal.open}
        title={variantModal.index !== null ? "Edit Variant" : "Add Variant"}
        fields={[
          { 
            name: 'name', 
            label: 'Variant Name', 
            placeholder: 'e.g., Round Neck',
            required: true 
          },
          { 
            name: 'image', 
            label: 'Variant Image', 
            type: 'file',
            accept: 'image/*',
            required: variantModal.index === null
          },
        ]}
        initialData={variantModal.data || {}}
        onClose={() => setVariantModal({ open: false, categoryIndex: null, data: null, index: null })}
        onSubmit={handleSubmitVariant}
      />

      {/* Color Modal */}
      <InputModal
        isOpen={colorModal.open}
        title={colorModal.index !== null ? "Edit Color" : "Add Color"}
        fields={[
          { 
            name: 'name', 
            label: 'Color Name', 
            placeholder: 'e.g., White',
            required: true 
          },
          { 
            name: 'hex', 
            label: 'Hex Color Code', 
            placeholder: '#FFFFFF',
            required: true 
          },
        ]}
        initialData={colorModal.data || {}}
        onClose={() => setColorModal({ open: false, data: null, index: null })}
        onSubmit={handleSubmitColor}
      />

      {/* Material Modal */}
      <InputModal
        isOpen={materialModal.open}
        title={materialModal.index !== null ? "Edit Material" : "Add Material"}
        fields={[
          { 
            name: 'name', 
            label: 'Material Name', 
            placeholder: 'e.g., Pure Cotton',
            required: true 
          },
          { 
            name: 'desc', 
            label: 'Description', 
            placeholder: 'Enter material description',
            type: 'textarea',
            rows: 3,
            required: true 
          },
          { 
            name: 'image', 
            label: 'Material Image', 
            type: 'file',
            accept: 'image/*',
            required: false 
          },
        ]}
        initialData={materialModal.data || {}}
        onClose={() => setMaterialModal({ open: false, data: null, index: null })}
        onSubmit={handleSubmitMaterial}
      />

      {/* Size Modal */}
      <InputModal
        isOpen={sizeModal.open}
        title={sizeModal.index !== null ? "Edit Size" : "Add Size"}
        fields={[
          { 
            name: 'name', 
            label: 'Size Name', 
            placeholder: 'e.g., M',
            required: true 
          },
          { 
            name: 'chest', 
            label: 'Chest Measurement', 
            placeholder: 'e.g., 38-40"',
            required: true 
          },
        ]}
        initialData={sizeModal.data || {}}
        onClose={() => setSizeModal({ open: false, data: null, index: null })}
        onSubmit={handleSubmitSize}
      />

      {/* Gallery Design Modal */}
      <InputModal
        isOpen={galleryModal.open}
        title={galleryModal.index !== null ? "Edit Gallery Design" : "Add Gallery Design"}
        fields={[
          { 
            name: 'name', 
            label: 'Design Name', 
            placeholder: 'e.g., Abstract Art',
            required: true 
          },
          { 
            name: 'image', 
            label: 'Design Image', 
            type: 'file',
            accept: 'image/*',
            required: galleryModal.index === null
          },
        ]}
        initialData={galleryModal.data || {}}
        onClose={() => setGalleryModal({ open: false, data: null, index: null })}
        onSubmit={handleSubmitGalleryDesign}
      />

      <div className="admin-customize-content">
        {/* Product Categories Section */}
        <div className="admin-customize-section">
          <h3 className="admin-customize-section-title">Product Categories</h3>
          <div className="admin-customize-categories-grid">
            {(customizeDraft?.productCategories || []).map((category, index) => (
              <div key={category.id} className="admin-customize-category-card">
                <div className="admin-customize-category-image-container">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="admin-customize-category-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="admin-customize-image-upload-placeholder">
                            <div class="admin-customize-upload-icon">📷</div>
                            <div class="admin-customize-upload-text">Click to upload image</div>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="admin-customize-image-upload-placeholder">
                      <div className="admin-customize-upload-icon">📷</div>
                      <div className="admin-customize-upload-text">Upload vertical image (280px height)</div>
                    </div>
                  )}
                </div>
                <div className="admin-customize-category-content">
                  <div className="admin-customize-category-header">
                    <h4>{category.name}</h4>
                    <div className="admin-customize-category-actions">
                      <button
                        className="admin-customize-btn small primary"
                        onClick={() => handleEditProductCategory(index)}
                        title="Edit Category"
                      >
                        <EditIcon fontSize="small" />
                      </button>
                      <button
                        className="admin-customize-btn small danger"
                        onClick={() => removeProductCategory(index)}
                        title="Delete Category"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  </div>
                  <p className="admin-customize-category-desc">{category.description}</p>
                  <div className="admin-customize-variants">
                    <h5>
                      Variants
                      <span className="admin-customize-variant-count">
                        {category.variants?.length || 0}
                      </span>
                    </h5>
                    {category.variants && category.variants.length > 0 ? (
                      <div className="admin-customize-variants-grid">
                        {category.variants.map((variant, vIndex) => (
                          <div key={variant.id} className="admin-customize-variant-card">
                            <div className="admin-customize-variant-image-container">
                              {variant.image ? (
                                <img
                                  src={variant.image}
                                  alt={variant.name}
                                  className="admin-customize-variant-image"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `
                                      <div class="admin-customize-image-upload-placeholder">
                                        <div class="admin-customize-upload-icon">🖼️</div>
                                      </div>
                                    `;
                                  }}
                                />
                              ) : (
                                <div className="admin-customize-image-upload-placeholder">
                                  <div className="admin-customize-upload-icon">🖼️</div>
                                </div>
                              )}
                            </div>
                            <div className="admin-customize-variant-body">
                              <p className="admin-customize-variant-name">{variant.name}</p>
                              <div className="admin-customize-variant-actions">
                                <button
                                  className="admin-customize-btn small icon-only primary"
                                  onClick={() => handleEditVariant(index, vIndex)}
                                  title="Edit Variant"
                                >
                                  <EditIcon fontSize="small" />
                                </button>
                                <button
                                  className="admin-customize-btn small icon-only danger"
                                  onClick={() => removeVariant(index, vIndex)}
                                  title="Delete Variant"
                                >
                                  <DeleteIcon fontSize="small" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="admin-customize-empty-state">
                        <div className="admin-customize-empty-state-icon">📦</div>
                        <div className="admin-customize-empty-state-text">No variants yet</div>
                      </div>
                    )}
                    <button
                      className="admin-customize-btn small secondary"
                      onClick={() => handleAddVariant(index)}
                    >
                      <AddIcon fontSize="small" />
                      Add Variant
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="admin-customize-btn secondary"
            onClick={handleAddProductCategory}
          >
            <AddIcon />
            Add Category
          </button>
        </div>

        {/* Colors Section */}
        <div className="admin-customize-section">
          <h3 className="admin-customize-section-title">Colors</h3>
          <div className="admin-customize-color-grid">
            {(customizeDraft?.colors || []).map((color, index) => (
              <div key={color.id} className="admin-customize-color-item">
                <div
                  className="admin-customize-color-swatch"
                  style={{ backgroundColor: color.hex }}
                ></div>
                <span>{color.name}</span>
                <div className="admin-customize-color-actions">
                  <button
                    className="admin-customize-btn small primary"
                    onClick={() => handleEditColor(index)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-customize-btn small danger"
                    onClick={() => removeColor(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            className="admin-customize-btn secondary"
            onClick={handleAddColor}
          >
            <AddIcon />
            Add Color
          </button>
        </div>

        {/* Materials Section */}
        <div className="admin-customize-section">
          <h3 className="admin-customize-section-title">Materials</h3>
          <div className="admin-customize-grid">
            {(customizeDraft?.materials || []).map((material, index) => (
              <div key={material.id} className="admin-customize-material-card">
                <div className="admin-customize-material-header">
                  <h4>{material.name}</h4>
                  <div className="admin-customize-material-actions">
                    <button
                      className="admin-customize-btn small primary"
                      onClick={() => handleEditMaterial(index)}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-customize-btn small danger"
                      onClick={() => removeMaterial(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </div>
                <p className="admin-customize-material-desc">{material.desc}</p>
              </div>
            ))}
          </div>
          <button
            className="admin-customize-btn secondary"
            onClick={handleAddMaterial}
          >
            <AddIcon />
            Add Material
          </button>
        </div>

        {/* Sizes Section */}
        <div className="admin-customize-section">
          <h3 className="admin-customize-section-title">Sizes</h3>
          <div className="admin-customize-size-grid">
            {(customizeDraft?.sizes || []).map((size, index) => (
              <div key={size.id} className="admin-customize-size-item">
                <div className="admin-customize-size-content">
                  <span className="admin-customize-size-name">{size.name}</span>
                  <span className="admin-customize-size-measurement">{size.chest}</span>
                </div>
                <div className="admin-customize-size-actions">
                  <button
                    className="admin-customize-btn small primary"
                    onClick={() => handleEditSize(index)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-customize-btn small danger"
                    onClick={() => removeSize(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            className="admin-customize-btn secondary"
            onClick={handleAddSize}
          >
            <AddIcon />
            Add Size
          </button>
        </div>

        {/* Gallery Designs Section */}
        <div className="admin-customize-section">
          <h3 className="admin-customize-section-title">Gallery Designs</h3>
          <div className="admin-customize-gallery-grid">
            {(customizeDraft?.galleryDesigns || []).map((design, index) => (
              <div key={design.id} className="admin-customize-gallery-item">
                {design.image ? (
                  <img
                    src={design.image}
                    alt={design.name}
                    className="admin-customize-gallery-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="admin-customize-image-upload-placeholder" style="height: 100%;">
                          <div class="admin-customize-upload-icon">🖼️</div>
                          <div class="admin-customize-upload-text">Click to upload image</div>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="admin-customize-image-upload-placeholder" style={{height: '100%'}}>
                    <div className="admin-customize-upload-icon">🖼️</div>
                    <div className="admin-customize-upload-text">Upload square image</div>
                  </div>
                )}
                <div className="admin-customize-gallery-overlay">
                  <span>{design.name}</span>
                  <div className="admin-customize-gallery-actions">
                    <button
                      className="admin-customize-btn small primary"
                      onClick={() => handleEditGalleryDesign(index)}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-customize-btn small danger"
                      onClick={() => removeGalleryDesign(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="admin-customize-btn secondary"
            onClick={handleAddGalleryDesign}
          >
            <AddIcon />
            Add Design
          </button>
        </div>

        <div className="admin-customize-actions">
          <button
            className="admin-customize-btn primary"
            onClick={saveCustomize}
          >
            <SaveIcon />
            Save All Changes
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdminCystamize;