import React, { useState, useEffect } from "react";
import "./AdminCystamize.css";
import SuccessModal from "../../../../components/SuccessModal/SuccessModal";
import {
  getSiteContent,
  updateCustomize,
} from "../../../../utils/siteContentStore";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import CategoryIcon from "@mui/icons-material/Category";
import PaletteIcon from "@mui/icons-material/Palette";
import TextureIcon from "@mui/icons-material/Texture";
import StraightenIcon from "@mui/icons-material/Straighten";
import CollectionsIcon from "@mui/icons-material/Collections";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Input Modal Component
const InputModal = ({
  isOpen,
  title,
  fields,
  onClose,
  onSubmit,
  initialData = {},
}) => {
  const [formData, setFormData] = useState(() => {
    const data = {};
    fields.forEach((field) => {
      data[field.name] = initialData[field.name] || "";
    });
    return data;
  });

  useEffect(() => {
    if (isOpen) {
      const data = {};
      fields.forEach((field) => {
        data[field.name] = initialData[field.name] || "";
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
    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0] || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
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
              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={field.rows || 3}
                />
              ) : field.type === "file" ? (
                <div className="admin-file-input">
                  <input
                    type="file"
                    id={field.name}
                    name={field.name}
                    onChange={handleChange}
                    accept={field.accept || "image/*"}
                    required={field.required && !formData[field.name]}
                  />
                  {formData[field.name] &&
                    typeof formData[field.name] === "string" && (
                      <div className="admin-file-preview">
                        <div className="admin-file-preview-thumb admin-passport-frame">
                          <img
                            src={formData[field.name]}
                            alt="Current"
                            className="admin-file-preview-img"
                          />
                        </div>
                        <div className="admin-file-preview-info">
                          <span className="admin-file-preview-label">
                            Current Image
                          </span>
                          <span className="admin-file-preview-name">
                            Click to change
                          </span>
                        </div>
                      </div>
                    )}
                  {formData[field.name] &&
                    formData[field.name] instanceof File && (
                      <div className="admin-file-preview">
                        <div className="admin-file-preview-thumb admin-passport-frame">
                          <ImageIcon className="admin-file-preview-icon" />
                        </div>
                        <div className="admin-file-preview-info">
                          <span className="admin-file-preview-label">
                            New Image
                          </span>
                          <span className="admin-file-preview-name">
                            {formData[field.name].name}
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <input
                  type={field.type || "text"}
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
            <button
              type="button"
              className="admin-customize-btn
secondary"
              onClick={onClose}
            >
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
  const [modalMessage, setModalMessage] = useState("");
  const [error, setError] = useState("");
  const [expandedSection, setExpandedSection] = useState(null);

  // Toggle section expand/collapse
  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // State for different modals
  const [productCategoryModal, setProductCategoryModal] = useState({
    open: false,
    data: null,
    index: null,
  });

  const [variantModal, setVariantModal] = useState({
    open: false,
    categoryIndex: null,
    data: null,
    index: null,
  });

  const [colorModal, setColorModal] = useState({
    open: false,
    data: null,
    index: null,
  });

  const [materialModal, setMaterialModal] = useState({
    open: false,
    data: null,
    index: null,
  });

  const [sizeModal, setSizeModal] = useState({
    open: false,
    data: null,
    index: null,
  });

  const [galleryModal, setGalleryModal] = useState({
    open: false,
    data: null,
    index: null,
  });

  const [customizeDraft, setCustomizeDraft] = useState(
    initial.customize || {
      productCategories: [],
      colors: [],
      materials: [],
      sizes: [],
      galleryDesigns: [],
    }
  );

  // Load data on component mount
  useEffect(() => {
    const content = getSiteContent();
    setCustomizeDraft(
      content.customize || {
        productCategories: [],
        colors: [],
        materials: [],
        sizes: [],
        galleryDesigns: [],
      }
    );
  }, []);

  const saveCustomize = async () => {
    try {
      setError("");
      await updateCustomize(customizeDraft);
      setModalMessage("Customize content saved successfully!");
      setModalOpen(true);
    } catch (e) {
      setError(e?.message || "Failed to save customize content");
    }
  };

  // Product Category Handlers
  const handleAddProductCategory = () => {
    setProductCategoryModal({
      open: true,
      data: null,
      index: null,
    });
  };

  const handleEditProductCategory = (index) => {
    setProductCategoryModal({
      open: true,
      data: customizeDraft.productCategories[index],
      index,
    });
  };

  const handleSubmitProductCategory = async (formData) => {
    const id = formData.name.toLowerCase().replace(/\s+/g, "_");

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
      setCustomizeDraft((prev) => {
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
      setCustomizeDraft((prev) => ({
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
    if (!confirm("Remove this product category and all its variants?")) return;
    setCustomizeDraft((prev) => ({
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
      index: null,
    });
  };

  const handleEditVariant = (categoryIndex, variantIndex) => {
    setVariantModal({
      open: true,
      categoryIndex,
      data: customizeDraft.productCategories[categoryIndex].variants[
        variantIndex
      ],
      index: variantIndex,
    });
  };

  const handleSubmitVariant = async (formData) => {
    const id = formData.name.toLowerCase().replace(/\s+/g, "_");

    // Handle image upload
    let imageUrl = formData.image;
    if (formData.image instanceof File) {
      imageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(formData.image);
      });
    }

    setCustomizeDraft((prev) => {
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
    if (!confirm("Remove this variant?")) return;
    setCustomizeDraft((prev) => {
      const categories = [...prev.productCategories];
      categories[categoryIndex].variants = categories[
        categoryIndex
      ].variants.filter((_, i) => i !== variantIndex);
      return { ...prev, productCategories: categories };
    });
  };

  // Color Handlers
  const handleAddColor = () => {
    setColorModal({
      open: true,
      data: null,
      index: null,
    });
  };

  const handleEditColor = (index) => {
    setColorModal({
      open: true,
      data: customizeDraft.colors[index],
      index,
    });
  };

  const handleSubmitColor = (formData) => {
    const id = formData.name.toLowerCase().replace(/\s+/g, "_");

    if (colorModal.index !== null) {
      // Edit existing color
      setCustomizeDraft((prev) => {
        const colors = [...prev.colors];
        colors[colorModal.index] = {
          ...colors[colorModal.index],
          id,
          name: formData.name,
          hex: formData.hex || "#FFFFFF",
        };
        return { ...prev, colors };
      });
    } else {
      // Add new color
      setCustomizeDraft((prev) => ({
        ...prev,
        colors: [
          ...(prev.colors || []),
          {
            id,
            name: formData.name,
            hex: formData.hex || "#FFFFFF",
          },
        ],
      }));
    }
  };

  const removeColor = (index) => {
    if (!confirm("Remove this color?")) return;
    setCustomizeDraft((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  // Material Handlers
  const handleAddMaterial = () => {
    setMaterialModal({
      open: true,
      data: null,
      index: null,
    });
  };

  const handleEditMaterial = (index) => {
    setMaterialModal({
      open: true,
      data: customizeDraft.materials[index],
      index,
    });
  };

  const handleSubmitMaterial = async (formData) => {
    const id = formData.name.toLowerCase().replace(/\s+/g, "_");

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
      setCustomizeDraft((prev) => {
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
      setCustomizeDraft((prev) => ({
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
    if (!confirm("Remove this material?")) return;
    setCustomizeDraft((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  // Size Handlers
  const handleAddSize = () => {
    setSizeModal({
      open: true,
      data: null,
      index: null,
    });
  };

  const handleEditSize = (index) => {
    setSizeModal({
      open: true,
      data: customizeDraft.sizes[index],
      index,
    });
  };

  const handleSubmitSize = (formData) => {
    if (sizeModal.index !== null) {
      // Edit existing size
      setCustomizeDraft((prev) => {
        const sizes = [...prev.sizes];
        sizes[sizeModal.index] = {
          ...sizes[sizeModal.index],
          id: formData.name,
          name: formData.name,
          chest: formData.chest,
          icon:
            "looks_" +
            (formData.name.length === 1 ? formData.name.toLowerCase() : "one"),
        };
        return { ...prev, sizes };
      });
    } else {
      // Add new size
      setCustomizeDraft((prev) => ({
        ...prev,
        sizes: [
          ...(prev.sizes || []),
          {
            id: formData.name,
            name: formData.name,
            chest: formData.chest,
            icon:
              "looks_" +
              (formData.name.length === 1
                ? formData.name.toLowerCase()
                : "one"),
          },
        ],
      }));
    }
  };

  const removeSize = (index) => {
    if (!confirm("Remove this size?")) return;
    setCustomizeDraft((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  // Gallery Design Handlers
  const handleAddGalleryDesign = () => {
    setGalleryModal({
      open: true,
      data: null,
      index: null,
    });
  };

  const handleEditGalleryDesign = (index) => {
    setGalleryModal({
      open: true,
      data: customizeDraft.galleryDesigns[index],
      index,
    });
  };

  const handleSubmitGalleryDesign = async (formData) => {
    const id = formData.id || "design" + Date.now();

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
      setCustomizeDraft((prev) => {
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
      setCustomizeDraft((prev) => ({
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
    if (!confirm("Remove this gallery design? ")) return;
    setCustomizeDraft((prev) => ({
      ...prev,
      galleryDesigns: prev.galleryDesigns.filter((_, i) => i !== index),
    }));
  };

  return (
    <section className="admin-customize">
      {error && (
        <div
          className="admin-customize-alert
admin-customize-alert-error"
        >
          {error}
        </div>
      )}

      <SuccessModal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />

      {/* Product Category Modal */}
      <InputModal
        isOpen={productCategoryModal.open}
        title={
          productCategoryModal.index !== null
            ? "Edit Product Category"
            : "Add Product Category"
        }
        fields={[
          {
            name: "name",
            label: "Category Name",
            placeholder: "e.g., T-SHIRTS",
            required: true,
          },
          {
            name: "description",
            label: "Description",
            placeholder: "Enter category description",
            type: "textarea",
            rows: 3,
            required: true,
          },
          {
            name: "image",
            label: "Category Image (Any Size)",
            type: "file",
            accept: "image/*",
            required: productCategoryModal.index === null,
          },
        ]}
        initialData={productCategoryModal.data || {}}
        onClose={() =>
          setProductCategoryModal({ open: false, data: null, index: null })
        }
        onSubmit={handleSubmitProductCategory}
      />

      {/* Variant Modal */}
      <InputModal
        isOpen={variantModal.open}
        title={variantModal.index !== null ? "Edit Variant" : "Add Variant"}
        fields={[
          {
            name: "name",
            label: "Variant Name",
            placeholder: "e.g., Round Neck",
            required: true,
          },
          {
            name: "image",
            label: "Variant Image (Passport Size)",
            type: "file",
            accept: "image/*",
            required: variantModal.index === null,
          },
        ]}
        initialData={variantModal.data || {}}
        onClose={() =>
          setVariantModal({
            open: false,
            categoryIndex: null,
            data: null,
            index: null,
          })
        }
        onSubmit={handleSubmitVariant}
      />

      {/* Color Modal */}
      <InputModal
        isOpen={colorModal.open}
        title={colorModal.index !== null ? "Edit Color" : "Add Color"}
        fields={[
          {
            name: "name",
            label: "Color Name",
            placeholder: "e.g., White",
            required: true,
          },
          {
            name: "hex",
            label: "Hex Color Code",
            placeholder: "#FFFFFF",
            required: true,
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
            name: "name",
            label: "Material Name",
            placeholder: "e. g., Pure Cotton",
            required: true,
          },
          {
            name: "desc",
            label: "Description",
            placeholder: "Enter material description",
            type: "textarea",
            rows: 3,
            required: true,
          },
          {
            name: "image",
            label: "Material Image (Passport Size - Optional)",
            type: "file",
            accept: "image/*",
            required: false,
          },
        ]}
        initialData={materialModal.data || {}}
        onClose={() =>
          setMaterialModal({ open: false, data: null, index: null })
        }
        onSubmit={handleSubmitMaterial}
      />

      {/* Size Modal */}
      <InputModal
        isOpen={sizeModal.open}
        title={sizeModal.index !== null ? "Edit Size" : "Add Size"}
        fields={[
          {
            name: "name",
            label: "Size Name",
            placeholder: "e.g., M",
            required: true,
          },
          {
            name: "chest",
            label: "Chest Measurement",
            placeholder: 'e.g., 38-40"',
            required: true,
          },
        ]}
        initialData={sizeModal.data || {}}
        onClose={() => setSizeModal({ open: false, data: null, index: null })}
        onSubmit={handleSubmitSize}
      />

      {/* Gallery Design Modal */}
      <InputModal
        isOpen={galleryModal.open}
        title={
          galleryModal.index !== null
            ? "Edit Gallery Design"
            : "Add Gallery Design"
        }
        fields={[
          {
            name: "name",
            label: "Design Name",
            placeholder: "e.g., Abstract Art",
            required: true,
          },
          {
            name: "image",
            label: "Design Image (Passport Size)",
            type: "file",
            accept: "image/*",
            required: galleryModal.index === null,
          },
        ]}
        initialData={galleryModal.data || {}}
        onClose={() =>
          setGalleryModal({ open: false, data: null, index: null })
        }
        onSubmit={handleSubmitGalleryDesign}
      />

      <div className="admin-customize-content">
        {/* Product Categories Section */}
        <div className={`admin-customize-section ${expandedSection === 'categories' ? 'expanded' : ''}`}>
          <div className="admin-customize-section-header" onClick={() => toggleSection('categories')}>
            <div className="admin-customize-section-icon-wrapper">
              <CategoryIcon />
            </div>
            <div className="admin-customize-section-info">
              <h3 className="admin-customize-section-title">Product Categories</h3>
              <p className="admin-customize-section-desc">Manage product types and their variants</p>
              <div className="admin-customize-section-status">
                <CheckCircleIcon className="status-icon" />
                <span>{customizeDraft?.productCategories?.length || 0} Categories</span>
              </div>
            </div>
            <div className="admin-customize-section-toggle">
              <ExpandMoreIcon className={`admin-customize-arrow ${expandedSection === 'categories' ? 'rotated' : ''}`} />
            </div>
          </div>

          {expandedSection === 'categories' && (
            <div className="admin-customize-section-content">
              <div className="admin-customize-section-actions">
                <button
                  className="admin-customize-btn primary"
                  onClick={(e) => { e.stopPropagation(); handleAddProductCategory(); }}
                >
                  <AddIcon />
                  Add Category
                </button>
              </div>

              {(customizeDraft?.productCategories || []).length > 0 ? (
                <div className="admin-customize-categories-list">
                  {customizeDraft.productCategories.map((category, index) => (
                    <div
                      key={category.id}
                      className="admin-customize-category-card"
                >
                  {/* Category Image - Horizontal Rectangle */}
                  <div className="admin-customize-category-image-wrapper">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="admin-customize-category-image"
                        onError={(e) => {
                          e.target.style.display = "none";

                          e.target.parentElement.classList.add(
                            "admin-customize-image-error"
                          );
                        }}
                      />
                    ) : (
                      <div className="admin-customize-image-placeholder">
                        <ImageIcon style={{ fontSize: 48, color: "#cbd5e0" }} />
                        <span>No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Category Info */}
                  <div className="admin-customize-category-info">
                    <div className="admin-customize-category-main">
                      <div>
                        <h4 className="admin-customize-category-name">
                          {category.name}
                        </h4>
                        <p className="admin-customize-category-desc">
                          {category.description}
                        </p>
                      </div>
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

                    {/* Variants Section */}
                    <div className="admin-customize-variants-section">
                      <div className="admin-customize-variants-header">
                        <h5>
                          Variants
                          <span className="admin-customize-badge">
                            {category.variants?.length || 0}
                          </span>
                        </h5>
                        <button
                          className="admin-customize-btn small secondary"
                          onClick={() => handleAddVariant(index)}
                        >
                          <AddIcon fontSize="small" />
                          Add
                        </button>
                      </div>

                      {category.variants && category.variants.length > 0 ? (
                        <div className="admin-customize-variants-list">
                          {category.variants.map((variant, vIndex) => (
                            <div
                              key={variant.id}
                              className="admin-customize-variant-item"
                            >
                              <div className="admin-customize-variant-image-wrapper">
                                {variant.image ? (
                                  <img
                                    src={variant.image}
                                    alt={variant.name}
                                    className="admin-customize-variant-image"
                                  />
                                ) : (
                                  <div className="admin-customize-image-placeholder small">
                                    <ImageIcon style={{ fontSize: 24 }} />
                                  </div>
                                )}
                              </div>
                              <span className="admin-customize-variant-name">
                                {variant.name}
                              </span>
                              <div className="admin-customize-variant-actions">
                                <button
                                  className="admin-customize-btn
icon-btn primary"
                                  onClick={() =>
                                    handleEditVariant(index, vIndex)
                                  }
                                  title="Edit"
                                >
                                  <EditIcon fontSize="small" />
                                </button>
                                <button
                                  className="admin-customize-btn
icon-btn danger"
                                  onClick={() => removeVariant(index, vIndex)}
                                  title="Delete"
                                >
                                  <DeleteIcon fontSize="small" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="admin-customize-empty-state small">
                          <span>No variants yet</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-customize-empty-state">
              <CategoryIcon className="admin-customize-empty-icon" />
              <p>No product categories yet</p>
              <span>Click "Add Category" to get started</span>
            </div>
          )}

              <div className="admin-customize-section-footer">
                <button className="admin-customize-btn primary" onClick={saveCustomize}>
                  <SaveIcon /> Save Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Colors Section */}
        <div className={`admin-customize-section ${expandedSection === 'colors' ? 'expanded' : ''}`}>
          <div className="admin-customize-section-header" onClick={() => toggleSection('colors')}>
            <div className="admin-customize-section-icon-wrapper">
              <PaletteIcon />
            </div>
            <div className="admin-customize-section-info">
              <h3 className="admin-customize-section-title">Colors</h3>
              <p className="admin-customize-section-desc">Available color options for products</p>
              <div className="admin-customize-section-status">
                <CheckCircleIcon className="status-icon" />
                <span>{customizeDraft?.colors?.length || 0} Colors</span>
              </div>
            </div>
            <div className="admin-customize-section-toggle">
              <ExpandMoreIcon className={`admin-customize-arrow ${expandedSection === 'colors' ? 'rotated' : ''}`} />
            </div>
          </div>

          {expandedSection === 'colors' && (
            <div className="admin-customize-section-content">
              <div className="admin-customize-section-actions">
                <button
                  className="admin-customize-btn primary"
                  onClick={(e) => { e.stopPropagation(); handleAddColor(); }}
                >
                  <AddIcon />
                  Add Color
                </button>
              </div>

              {(customizeDraft?.colors || []).length > 0 ? (
                <div className="admin-customize-items-grid">
                  {customizeDraft.colors.map((color, index) => (
                    <div key={color.id} className="admin-customize-color-card">
                      <div
                        className="admin-customize-color-swatch"
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      <div className="admin-customize-color-info">
                        <span className="admin-customize-color-name">
                          {color.name}
                        </span>
                        <span className="admin-customize-color-hex">
                      {color.hex}
                    </span>
                  </div>
                  <div className="admin-customize-item-actions">
                    <button
                      className="admin-customize-btn icon-btn primary"
                      onClick={() => handleEditColor(index)}
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    <button
                      className="admin-customize-btn icon-btn danger"
                      onClick={() => removeColor(index)}
                      title="Delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-customize-empty-state">
              <PaletteIcon className="admin-customize-empty-icon" />
              <p>No colors yet</p>
            </div>
          )}

              <div className="admin-customize-section-footer">
                <button className="admin-customize-btn primary" onClick={saveCustomize}>
                  <SaveIcon /> Save Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Materials Section */}
        <div className={`admin-customize-section ${expandedSection === 'materials' ? 'expanded' : ''}`}>
          <div className="admin-customize-section-header" onClick={() => toggleSection('materials')}>
            <div className="admin-customize-section-icon-wrapper">
              <TextureIcon />
            </div>
            <div className="admin-customize-section-info">
              <h3 className="admin-customize-section-title">Materials</h3>
              <p className="admin-customize-section-desc">Fabric and material options</p>
              <div className="admin-customize-section-status">
                <CheckCircleIcon className="status-icon" />
                <span>{customizeDraft?.materials?.length || 0} Materials</span>
              </div>
            </div>
            <div className="admin-customize-section-toggle">
              <ExpandMoreIcon className={`admin-customize-arrow ${expandedSection === 'materials' ? 'rotated' : ''}`} />
            </div>
          </div>

          {expandedSection === 'materials' && (
            <div className="admin-customize-section-content">
              <div className="admin-customize-section-actions">
                <button
                  className="admin-customize-btn primary"
                  onClick={(e) => { e.stopPropagation(); handleAddMaterial(); }}
                >
                  <AddIcon />
                  Add Material
                </button>
              </div>

              {(customizeDraft?.materials || []).length > 0 ? (
                <div className="admin-customize-materials-list">
                  {customizeDraft.materials.map((material, index) => (
                    <div
                      key={material.id}
                      className="admin-customize-material-card"
                    >
                  <div className="admin-customize-material-image-wrapper">
                    {material.image ? (
                      <img
                        src={material.image}
                        alt={material.name}
                        className="admin-customize-material-image"
                      />
                    ) : (
                      <div className="admin-customize-image-placeholder">
                        <ImageIcon style={{ fontSize: 48, color: "#cbd5e0" }} />
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="admin-customize-material-info">
                    <h4>{material.name}</h4>
                    <p>{material.desc}</p>
                  </div>
                  <div className="admin-customize-item-actions">
                    <button
                      className="admin-customize-btn small primary"
                      onClick={() => handleEditMaterial(index)}
                    >
                      <EditIcon fontSize="small" />
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
              ))}
            </div>
          ) : (
            <div className="admin-customize-empty-state">
              <TextureIcon className="admin-customize-empty-icon" />
              <p>No materials yet</p>
            </div>
          )}

              <div className="admin-customize-section-footer">
                <button className="admin-customize-btn primary" onClick={saveCustomize}>
                  <SaveIcon /> Save Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sizes Section */}
        <div className={`admin-customize-section ${expandedSection === 'sizes' ? 'expanded' : ''}`}>
          <div className="admin-customize-section-header" onClick={() => toggleSection('sizes')}>
            <div className="admin-customize-section-icon-wrapper">
              <StraightenIcon />
            </div>
            <div className="admin-customize-section-info">
              <h3 className="admin-customize-section-title">Sizes</h3>
              <p className="admin-customize-section-desc">Size options with measurements</p>
              <div className="admin-customize-section-status">
                <CheckCircleIcon className="status-icon" />
                <span>{customizeDraft?.sizes?.length || 0} Sizes</span>
              </div>
            </div>
            <div className="admin-customize-section-toggle">
              <ExpandMoreIcon className={`admin-customize-arrow ${expandedSection === 'sizes' ? 'rotated' : ''}`} />
            </div>
          </div>

          {expandedSection === 'sizes' && (
            <div className="admin-customize-section-content">
              <div className="admin-customize-section-actions">
                <button
                  className="admin-customize-btn primary"
                  onClick={(e) => { e.stopPropagation(); handleAddSize(); }}
                >
                  <AddIcon />
                  Add Size
                </button>
              </div>

              {(customizeDraft?.sizes || []).length > 0 ? (
                <div className="admin-customize-items-grid">
                  {customizeDraft.sizes.map((size, index) => (
                    <div key={size.id} className="admin-customize-size-card">
                      <div className="admin-customize-size-badge">{size.name}</div>
                      <div className="admin-customize-size-info">
                        <span className="admin-customize-size-label">Chest</span>
                        <span className="admin-customize-size-value">
                          {size.chest}
                        </span>
                      </div>
                      <div className="admin-customize-item-actions">
                        <button
                          className="admin-customize-btn icon-btn primary"
                          onClick={() => handleEditSize(index)}
                          title="Edit"
                        >
                          <EditIcon fontSize="small" />
                        </button>
                        <button
                          className="admin-customize-btn icon-btn danger"
                          onClick={() => removeSize(index)}
                          title="Delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-customize-empty-state">
                  <StraightenIcon className="admin-customize-empty-icon" />
                  <p>No sizes yet</p>
                </div>
              )}

              <div className="admin-customize-section-footer">
                <button className="admin-customize-btn primary" onClick={saveCustomize}>
                  <SaveIcon /> Save Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Gallery Designs Section */}
        <div className={`admin-customize-section ${expandedSection === 'gallery' ? 'expanded' : ''}`}>
          <div className="admin-customize-section-header" onClick={() => toggleSection('gallery')}>
            <div className="admin-customize-section-icon-wrapper">
              <CollectionsIcon />
            </div>
            <div className="admin-customize-section-info">
              <h3 className="admin-customize-section-title">Gallery Designs</h3>
              <p className="admin-customize-section-desc">Pre-made design templates</p>
              <div className="admin-customize-section-status">
                <CheckCircleIcon className="status-icon" />
                <span>{customizeDraft?.galleryDesigns?.length || 0} Designs</span>
              </div>
            </div>
            <div className="admin-customize-section-toggle">
              <ExpandMoreIcon className={`admin-customize-arrow ${expandedSection === 'gallery' ? 'rotated' : ''}`} />
            </div>
          </div>

          {expandedSection === 'gallery' && (
            <div className="admin-customize-section-content">
              <div className="admin-customize-section-actions">
                <button
                  className="admin-customize-btn primary"
                  onClick={(e) => { e.stopPropagation(); handleAddGalleryDesign(); }}
                >
                  <AddIcon />
                  Add Design
                </button>
              </div>

              {(customizeDraft?.galleryDesigns || []).length > 0 ? (
                <div className="admin-customize-gallery-list">
                  {customizeDraft.galleryDesigns.map((design, index) => (
                    <div key={design.id} className="admin-customize-gallery-card">
                      <div className="admin-customize-gallery-image-wrapper">
                        {design.image ? (
                      <img
                        src={design.image}
                        alt={design.name}
                        className="admin-customize-gallery-image"
                      />
                    ) : (
                      <div className="admin-customize-image-placeholder">
                        <ImageIcon style={{ fontSize: 48 }} />
                      </div>
                    )}
                  </div>
                  <div className="admin-customize-gallery-info">
                    <span className="admin-customize-gallery-name">
                      {design.name}
                    </span>
                    <div className="admin-customize-item-actions">
                      <button
                        className="admin-customize-btn small primary"
                        onClick={() => handleEditGalleryDesign(index)}
                      >
                        <EditIcon fontSize="small" />
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
          ) : (
            <div className="admin-customize-empty-state">
              <CollectionsIcon className="admin-customize-empty-icon" />
              <p>No gallery designs yet</p>
            </div>
          )}

              <div className="admin-customize-section-footer">
                <button className="admin-customize-btn primary" onClick={saveCustomize}>
                  <SaveIcon /> Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminCystamize;
