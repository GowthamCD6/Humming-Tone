import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Palette,
  Sparkles,
  Search,
  Filter,
  Check,
  Tag,
  DollarSign,
  Ruler
} from "lucide-react";
import { API_BASE_URL } from "../../../utils/apiConfig";
import "./ManageCustomize.css";

// Toast notification component matching ManageProduct theme
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`mc-toast mc-toast-${type}`}>
      <span>{message}</span>
      <button className="mc-toast-close" onClick={onClose}>×</button>
    </div>
  );
}

// Modal Component for Plain T-Shirt Add & Edit
function PlainTshirtModal({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  initialData = null,
}) {
  const [formData, setFormData] = useState({
    color_name: "",
    color_hex: "#FFFFFF",
    name: "",
    base_price: "699",
    display_order: "0",
  });

  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState("");
  const [backPreview, setBackPreview] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          color_name: initialData.color_name || "",
          color_hex: initialData.color_hex || "#FFFFFF",
          name: initialData.name || "",
          base_price: initialData.base_price || "699",
          display_order: initialData.display_order || "0",
        });
        setFrontPreview(initialData.front_image || "");
        setBackPreview(initialData.back_image || "");
      } else {
        setFormData({
          color_name: "",
          color_hex: "#FFFFFF",
          name: "",
          base_price: "699",
          display_order: "0",
        });
        setFrontPreview("");
        setBackPreview("");
      }
      setFrontFile(null);
      setBackFile(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFrontFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFrontFile(file);
      setFrontPreview(URL.createObjectURL(file));
    }
  };

  const handleBackFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackFile(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!initialData && (!frontFile || !backFile)) {
      alert("Please choose both a Front View image and a Back View image.");
      return;
    }

    const data = new FormData();
    if (initialData?.id) {
      data.append("id", initialData.id);
    }
    data.append("color_name", formData.color_name.trim());
    data.append("color_hex", formData.color_hex);
    data.append("name", (formData.name || formData.color_name).trim());
    data.append("base_price", formData.base_price);
    data.append("display_order", formData.display_order);

    if (frontFile) {
      data.append("front_image", frontFile);
    } else if (initialData?.front_image) {
      data.append("front_image", initialData.front_image);
    }

    if (backFile) {
      data.append("back_image", backFile);
    } else if (initialData?.back_image) {
      data.append("back_image", initialData.back_image);
    }

    onSubmit(data);
  };

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mc-modal-header">
          <div>
            <h3 className="mc-modal-title">
              {initialData ? "Edit Plain T-Shirt Color" : "Add Plain T-Shirt Color"}
            </h3>
            <p className="mc-modal-sub">Upload real 2D front and back images for the customizer canvas.</p>
          </div>
          <button className="mc-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mc-modal-form">
          <div className="mc-form-grid">
            <div className="mc-form-group">
              <label>Color Name <span className="req">*</span></label>
              <input
                type="text"
                name="color_name"
                value={formData.color_name}
                onChange={handleChange}
                placeholder="e.g., Pure White, Jet Black, Navy Blue"
                required
                className="mc-input"
              />
            </div>

            <div className="mc-form-group">
              <label>Color Hex / Swatch <span className="req">*</span></label>
              <div className="mc-color-input-wrap">
                <input
                  type="color"
                  name="color_hex"
                  value={formData.color_hex || "#FFFFFF"}
                  onChange={handleChange}
                  className="mc-color-picker"
                />
                <input
                  type="text"
                  name="color_hex"
                  value={formData.color_hex}
                  onChange={handleChange}
                  placeholder="#FFFFFF"
                  required
                  className="mc-input mc-hex-text"
                />
              </div>
            </div>

            <div className="mc-form-group">
              <label>Garment Base Price (₹) <span className="req">*</span></label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleChange}
                placeholder="699"
                required
                min="0"
                className="mc-input"
              />
            </div>

            <div className="mc-form-group">
              <label>Display Title (Optional)</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Classic Plain Crewneck"
                className="mc-input"
              />
            </div>
          </div>

          <div className="mc-images-upload-row">
            {/* Front View */}
            <div className="mc-upload-card">
              <span className="mc-upload-label">
                FRONT VIEW IMAGE {initialData ? "" : <span className="req">*</span>}
              </span>
              <div className="mc-preview-box">
                {frontPreview ? (
                  <img src={frontPreview} alt="Front View Preview" />
                ) : (
                  <div className="mc-preview-placeholder">
                    <Eye size={24} />
                    <span>No Front Image</span>
                  </div>
                )}
              </div>
              <label className="mc-file-btn">
                <span>{frontPreview ? "Replace Front Image" : "Upload Front Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFrontFileChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {/* Back View */}
            <div className="mc-upload-card">
              <span className="mc-upload-label">
                BACK VIEW IMAGE {initialData ? "" : <span className="req">*</span>}
              </span>
              <div className="mc-preview-box">
                {backPreview ? (
                  <img src={backPreview} alt="Back View Preview" />
                ) : (
                  <div className="mc-preview-placeholder">
                    <Eye size={24} />
                    <span>No Back Image</span>
                  </div>
                )}
              </div>
              <label className="mc-file-btn">
                <span>{backPreview ? "Replace Back Image" : "Upload Back Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackFileChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          <div className="mc-modal-actions">
            <button
              type="button"
              className="mc-btn mc-btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="mc-btn mc-btn-primary"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : initialData ? "Update T-Shirt" : "Add T-Shirt Color"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Component for Preset Designs / Artwork Add & Edit
function DesignModal({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  initialData = null,
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "Vintage & Retro",
    price: "0",
    display_order: "0",
    is_active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const DESIGN_CATEGORIES = [
    "Vintage & Retro",
    "Streetwear",
    "Badges & Seals",
    "Minimalist",
    "Typography",
    "Animals & Nature",
    "Anime & Pop",
    "Sports & Fitness",
    "Geometric & Abstract",
  ];

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          category: initialData.category || "Vintage & Retro",
          price: String(initialData.price ?? "0"),
          display_order: String(initialData.display_order ?? "0"),
          is_active: initialData.is_active === 1 || initialData.is_active === true,
        });
        setImagePreview(initialData.image_url || "");
      } else {
        setFormData({
          name: "",
          category: "Vintage & Retro",
          price: "0",
          display_order: "0",
          is_active: true,
        });
        setImagePreview("");
      }
      setImageFile(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!initialData && !imageFile && !imagePreview) {
      alert("Please upload a design or motif image (PNG, SVG, JPG).");
      return;
    }

    const data = new FormData();
    if (initialData?.id) {
      data.append("id", initialData.id);
    }
    data.append("name", formData.name.trim());
    data.append("category", formData.category.trim());
    data.append("price", formData.price);
    data.append("display_order", formData.display_order);
    data.append("is_active", formData.is_active ? "1" : "0");

    if (imageFile) {
      data.append("image", imageFile);
    } else if (initialData?.image_url) {
      data.append("image_url", initialData.image_url);
    }

    onSubmit(data);
  };

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal mc-modal-design" onClick={(e) => e.stopPropagation()}>
        <div className="mc-modal-header">
          <div>
            <h3 className="mc-modal-title">
              {initialData ? "Edit Artwork / Design" : "Add Preset Artwork & Motif"}
            </h3>
            <p className="mc-modal-sub">
              Upload artwork that customers can add to their t-shirt in the customizer studio.
            </p>
          </div>
          <button className="mc-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mc-modal-form">
          <div className="mc-form-grid">
            <div className="mc-form-group">
              <label>Design / Motif Name <span className="req">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Vintage Eagle Crest, Cyber Wave"
                required
                className="mc-input"
              />
            </div>

            <div className="mc-form-group">
              <label>Category <span className="req">*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mc-input mc-select"
                required
              >
                {DESIGN_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="mc-form-group">
              <label>Extra Surcharge (₹) <span className="helper">(0 for Free)</span></label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="mc-input"
              />
            </div>

            <div className="mc-form-group">
              <label>Display Sort Order</label>
              <input
                type="number"
                name="display_order"
                value={formData.display_order}
                onChange={handleChange}
                placeholder="0"
                className="mc-input"
              />
            </div>
          </div>

          {/* Artwork Upload Area */}
          <div className="mc-design-upload-box">
            <label className="mc-upload-label">
              ARTWORK / GRAPHIC FILE {initialData ? "" : <span className="req">*</span>}
            </label>
            <div className="mc-design-preview-checkerboard">
              {imagePreview ? (
                <img src={imagePreview} alt="Design Preview" />
              ) : (
                <div className="mc-preview-placeholder">
                  <Sparkles size={28} />
                  <span>Upload transparent PNG, SVG, or high-res graphic</span>
                </div>
              )}
            </div>
            <label className="mc-file-btn full">
              <span>{imagePreview ? "Replace Artwork File" : "Choose Artwork File (PNG/SVG/JPG)"}</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <div className="mc-checkbox-group">
            <label className="mc-checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <span>Publish and show immediately in User Customizer Studio</span>
            </label>
          </div>

          <div className="mc-modal-actions">
            <button
              type="button"
              className="mc-btn mc-btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="mc-btn mc-btn-primary"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : initialData ? "Update Design" : "Save & Publish Design"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Component for Fabric Material Add & Edit
function MaterialModal({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  initialData = null,
}) {
  const [formData, setFormData] = useState({
    name: "",
    fabric_weight: "180 GSM",
    description: "",
    price_adjustment: "0",
    display_order: "0",
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          fabric_weight: initialData.fabric_weight || "180 GSM",
          description: initialData.description || "",
          price_adjustment: String(initialData.price_adjustment ?? 0),
          display_order: String(initialData.display_order ?? 0),
          is_active: initialData.is_active === 1 || initialData.is_active === true,
        });
      } else {
        setFormData({
          name: "",
          fabric_weight: "180 GSM",
          description: "",
          price_adjustment: "0",
          display_order: "0",
          is_active: true,
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a material name.");
      return;
    }

    const payload = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      name: formData.name.trim(),
      fabric_weight: formData.fabric_weight.trim(),
      description: formData.description.trim(),
      price_adjustment: Number(formData.price_adjustment || 0),
      display_order: Number(formData.display_order || 0),
      is_active: formData.is_active ? 1 : 0,
    };

    onSubmit(payload);
  };

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mc-modal-header">
          <div>
            <h3 className="mc-modal-title">
              {initialData ? "Edit Fabric Material" : "Add Fabric Material"}
            </h3>
            <p className="mc-modal-sub">
              Configure apparel fabric options for customer selection in the customizer.
            </p>
          </div>
          <button className="mc-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mc-modal-form">
          <div className="mc-form-grid">
            <div className="mc-form-group">
              <label>Material Name <span className="req">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., 100% Bio-Washed Combed Cotton"
                required
                className="mc-input"
              />
            </div>

            <div className="mc-form-group">
              <label>Fabric Weight / GSM Badge</label>
              <input
                type="text"
                name="fabric_weight"
                value={formData.fabric_weight}
                onChange={handleChange}
                placeholder="e.g., 180 GSM, 220 GSM"
                className="mc-input"
              />
            </div>

            <div className="mc-form-group">
              <label>Price Surcharge (₹) <span className="helper">(0 for Standard)</span></label>
              <input
                type="number"
                name="price_adjustment"
                value={formData.price_adjustment}
                onChange={handleChange}
                min="0"
                step="10"
                className="mc-input"
              />
            </div>

            <div className="mc-form-group">
              <label>Display Priority Order</label>
              <input
                type="number"
                name="display_order"
                value={formData.display_order}
                onChange={handleChange}
                min="0"
                className="mc-input"
              />
            </div>
          </div>

          <div className="mc-form-group" style={{ marginTop: 14 }}>
            <label>Fabric Description & Texture Details</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="e.g., Ultra-soft ring-spun combed cotton. Breathable, pre-shrunk, ideal for everyday luxury drape."
              className="mc-input mc-textarea"
            />
          </div>

          <div className="mc-checkbox-group" style={{ marginTop: 14 }}>
            <label className="mc-checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <span>Publish and show immediately in User Customizer Studio</span>
            </label>
          </div>

          <div className="mc-modal-actions">
            <button
              type="button"
              className="mc-btn mc-btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="mc-btn mc-btn-primary"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : initialData ? "Update Material" : "Save Material"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Component for Size Add & Edit
function SizeModal({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  initialData = null,
}) {
  const [formData, setFormData] = useState({
    name: "",
    chest: "",
    length: "",
    shoulder: "",
    price_adjustment: "0",
    display_order: "0",
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          chest: initialData.chest || "",
          length: initialData.length || "",
          shoulder: initialData.shoulder || "",
          price_adjustment: String(initialData.price_adjustment ?? 0),
          display_order: String(initialData.display_order ?? 0),
          is_active: initialData.is_active === 1 || initialData.is_active === true,
        });
      } else {
        setFormData({
          name: "",
          chest: "",
          length: "",
          shoulder: "",
          price_adjustment: "0",
          display_order: "0",
          is_active: true,
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a size label (e.g. XS, S, M, L, XL, XXL, 3XL).");
      return;
    }

    const payload = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      name: formData.name.trim().toUpperCase(),
      chest: formData.chest.trim(),
      length: formData.length.trim(),
      shoulder: formData.shoulder.trim(),
      price_adjustment: Number(formData.price_adjustment || 0),
      display_order: Number(formData.display_order || 0),
      is_active: formData.is_active ? 1 : 0,
    };

    onSubmit(payload);
  };

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mc-modal-header">
          <div>
            <h3 className="mc-modal-title">
              {initialData ? "Edit Apparel Size" : "Add Apparel Size"}
            </h3>
            <p className="mc-modal-sub">
              Define sizing dimensions and measurements for customer fitting.
            </p>
          </div>
          <button className="mc-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mc-modal-form">
          <div className="mc-form-grid">
            <div className="mc-form-group">
              <label>Size Code / Label <span className="req">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., XS, S, M, L, XL, XXL, 3XL"
                required
                className="mc-input"
              />
            </div>

            <div className="mc-form-group">
              <label>Chest Dimension</label>
              <input
                type="text"
                name="chest"
                value={formData.chest}
                onChange={handleChange}
                placeholder='e.g., 38-40"'
                className="mc-input"
              />
            </div>

            <div className="mc-form-group">
              <label>Body Length</label>
              <input
                type="text"
                name="length"
                value={formData.length}
                onChange={handleChange}
                placeholder='e.g., 28.5"'
                className="mc-input"
              />
            </div>

            <div className="mc-form-group">
              <label>Shoulder Width</label>
              <input
                type="text"
                name="shoulder"
                value={formData.shoulder}
                onChange={handleChange}
                placeholder='e.g., 18.5"'
                className="mc-input"
              />
            </div>

            <div className="mc-form-group">
              <label>Price Surcharge (₹) <span className="helper">(0 for standard)</span></label>
              <input
                type="number"
                name="price_adjustment"
                value={formData.price_adjustment}
                onChange={handleChange}
                min="0"
                step="10"
                className="mc-input"
              />
            </div>

            <div className="mc-form-group">
              <label>Display Priority Order</label>
              <input
                type="number"
                name="display_order"
                value={formData.display_order}
                onChange={handleChange}
                min="0"
                className="mc-input"
              />
            </div>
          </div>

          <div className="mc-checkbox-group" style={{ marginTop: 14 }}>
            <label className="mc-checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <span>Publish and show immediately in User Customizer Studio</span>
            </label>
          </div>

          <div className="mc-modal-actions">
            <button
              type="button"
              className="mc-btn mc-btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="mc-btn mc-btn-primary"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : initialData ? "Update Size" : "Save Size"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  isOpen,
  title,
  itemName,
  description,
  onClose,
  onConfirm,
  isDeleting,
}) {
  if (!isOpen) return null;

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal mc-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="mc-delete-icon-wrap">
          <AlertTriangle size={32} />
        </div>
        <h3 className="mc-delete-title">{title}</h3>
        <p className="mc-delete-desc">
          Are you sure you want to delete <strong>{itemName}</strong>?
          {description || " This item will no longer appear in the storefront customer studio."}
        </p>

        <div className="mc-modal-actions center">
          <button
            type="button"
            className="mc-btn mc-btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="mc-btn mc-btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageCustomize() {
  // Navigation tabs: 'plain-tshirts' | 'designs' | 'materials' | 'sizes'
  const [activeTab, setActiveTab] = useState("plain-tshirts");

  // Plain T-Shirts state
  const [plainTshirts, setPlainTshirts] = useState([]);
  const [isLoadingTshirts, setIsLoadingTshirts] = useState(true);

  // Preset Designs state
  const [designs, setDesigns] = useState([]);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(true);
  const [designSearch, setDesignSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Fabric & Materials state
  const [materials, setMaterials] = useState([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);

  // Sizes & Fit Guide state
  const [sizes, setSizes] = useState([]);
  const [isLoadingSizes, setIsLoadingSizes] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Modals
  const [tshirtModal, setTshirtModal] = useState({ open: false, data: null });
  const [designModal, setDesignModal] = useState({ open: false, data: null });
  const [materialModal, setMaterialModal] = useState({ open: false, data: null });
  const [sizeModal, setSizeModal] = useState({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    type: "tshirt", // 'tshirt' | 'design' | 'material' | 'size'
    item: null,
  });

  // Load Plain T-Shirts
  const loadPlainTshirts = async () => {
    try {
      setIsLoadingTshirts(true);
      const res = await fetch(`${API_BASE_URL}/api/site-content/customize/plain-tshirts`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.tshirts)) {
        setPlainTshirts(data.tshirts);
      }
    } catch (err) {
      console.error("Failed to load plain tshirts:", err);
      addToast("Failed to load plain t-shirts: " + err.message, "error");
    } finally {
      setIsLoadingTshirts(false);
    }
  };

  // Load Preset Designs
  const loadDesigns = async () => {
    try {
      setIsLoadingDesigns(true);
      const res = await fetch(`${API_BASE_URL}/api/site-content/customize/designs?admin=true`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.designs)) {
        setDesigns(data.designs);
      }
    } catch (err) {
      console.error("Failed to load designs:", err);
      addToast("Failed to load designs: " + err.message, "error");
    } finally {
      setIsLoadingDesigns(false);
    }
  };

  // Load Fabric & Materials
  const loadMaterials = async () => {
    try {
      setIsLoadingMaterials(true);
      const res = await fetch(`${API_BASE_URL}/api/site-content/customize/materials?admin=true`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.materials)) {
        setMaterials(data.materials);
      }
    } catch (err) {
      console.error("Failed to load materials:", err);
      addToast("Failed to load materials: " + err.message, "error");
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  // Load Sizes & Fit Specs
  const loadSizes = async () => {
    try {
      setIsLoadingSizes(true);
      const res = await fetch(`${API_BASE_URL}/api/site-content/customize/sizes?admin=true`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.sizes)) {
        setSizes(data.sizes);
      }
    } catch (err) {
      console.error("Failed to load sizes:", err);
      addToast("Failed to load sizes: " + err.message, "error");
    } finally {
      setIsLoadingSizes(false);
    }
  };

  useEffect(() => {
    loadPlainTshirts();
    loadDesigns();
    loadMaterials();
    loadSizes();
  }, []);

  // Plain T-Shirt Handlers
  const handleSaveTshirt = async (formData) => {
    try {
      setIsSaving(true);
      const res = await fetch(`${API_BASE_URL}/api/site-content/customize/plain-tshirts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save plain t-shirt");
      }

      addToast(data.message || "Plain T-Shirt saved successfully!");
      setTshirtModal({ open: false, data: null });
      await loadPlainTshirts();
    } catch (err) {
      console.error("Save error:", err);
      addToast(err.message || "Failed to save plain t-shirt", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Design Handlers
  const handleSaveDesign = async (formData) => {
    try {
      setIsSaving(true);
      const res = await fetch(`${API_BASE_URL}/api/site-content/customize/designs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save design");
      }

      addToast(data.message || "Design saved successfully!");
      setDesignModal({ open: false, data: null });
      await loadDesigns();
    } catch (err) {
      console.error("Save design error:", err);
      addToast(err.message || "Failed to save design", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDesignStatus = async (design) => {
    try {
      const nextStatus = design.is_active === 1 ? 0 : 1;
      const res = await fetch(
        `${API_BASE_URL}/api/site-content/customize/designs/${design.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({ is_active: nextStatus }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }
      setDesigns((prev) =>
        prev.map((d) => (d.id === design.id ? { ...d, is_active: nextStatus } : d))
      );
      addToast(`Design "${design.name}" ${nextStatus ? "activated" : "deactivated"}`);
    } catch (err) {
      addToast(err.message || "Failed to toggle status", "error");
    }
  };

  // Material Handlers
  const handleSaveMaterial = async (payload) => {
    try {
      setIsSaving(true);
      const res = await fetch(`${API_BASE_URL}/api/site-content/customize/materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save material");
      }

      addToast(data.message || "Material saved successfully!");
      setMaterialModal({ open: false, data: null });
      await loadMaterials();
    } catch (err) {
      console.error("Save material error:", err);
      addToast(err.message || "Failed to save material", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMaterialStatus = async (material) => {
    try {
      const nextStatus = material.is_active === 1 ? 0 : 1;
      const res = await fetch(
        `${API_BASE_URL}/api/site-content/customize/materials/${material.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({ is_active: nextStatus }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update material status");
      }
      setMaterials((prev) =>
        prev.map((m) => (m.id === material.id ? { ...m, is_active: nextStatus } : m))
      );
      addToast(`Material "${material.name}" ${nextStatus ? "activated" : "deactivated"}`);
    } catch (err) {
      addToast(err.message || "Failed to toggle material status", "error");
    }
  };

  // Size Handlers
  const handleSaveSize = async (payload) => {
    try {
      setIsSaving(true);
      const res = await fetch(`${API_BASE_URL}/api/site-content/customize/sizes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save size");
      }

      addToast(data.message || "Size specification saved successfully!");
      setSizeModal({ open: false, data: null });
      await loadSizes();
    } catch (err) {
      console.error("Save size error:", err);
      addToast(err.message || "Failed to save size", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSizeStatus = async (size) => {
    try {
      const nextStatus = size.is_active === 1 ? 0 : 1;
      const res = await fetch(
        `${API_BASE_URL}/api/site-content/customize/sizes/${size.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({ is_active: nextStatus }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update size status");
      }
      setSizes((prev) =>
        prev.map((s) => (s.id === size.id ? { ...s, is_active: nextStatus } : s))
      );
      addToast(`Size "${size.name}" ${nextStatus ? "activated" : "deactivated"}`);
    } catch (err) {
      addToast(err.message || "Failed to toggle size status", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.item) return;
    try {
      setIsDeleting(true);
      let endpoint = "";
      if (deleteModal.type === "tshirt") {
        endpoint = `${API_BASE_URL}/api/site-content/customize/plain-tshirts/${deleteModal.item.id}`;
      } else if (deleteModal.type === "design") {
        endpoint = `${API_BASE_URL}/api/site-content/customize/designs/${deleteModal.item.id}`;
      } else if (deleteModal.type === "material") {
        endpoint = `${API_BASE_URL}/api/site-content/customize/materials/${deleteModal.item.id}`;
      } else if (deleteModal.type === "size") {
        endpoint = `${API_BASE_URL}/api/site-content/customize/sizes/${deleteModal.item.id}`;
      }

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete item");
      }

      addToast(
        deleteModal.type === "tshirt"
          ? "Plain t-shirt deleted successfully!"
          : deleteModal.type === "design"
          ? "Design artwork deleted successfully!"
          : deleteModal.type === "material"
          ? "Material deleted successfully!"
          : "Size deleted successfully!"
      );

      const deletedType = deleteModal.type;
      setDeleteModal({ open: false, type: "tshirt", item: null });

      if (deletedType === "tshirt") await loadPlainTshirts();
      else if (deletedType === "design") await loadDesigns();
      else if (deletedType === "material") await loadMaterials();
      else if (deletedType === "size") await loadSizes();
    } catch (err) {
      console.error("Delete error:", err);
      addToast(err.message || "Failed to delete item", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered designs
  const categoriesList = useMemo(() => {
    const set = new Set(["ALL"]);
    designs.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set);
  }, [designs]);

  const filteredDesigns = useMemo(() => {
    return designs.filter((d) => {
      const matchSearch =
        !designSearch.trim() ||
        d.name?.toLowerCase().includes(designSearch.toLowerCase()) ||
        d.category?.toLowerCase().includes(designSearch.toLowerCase());
      const matchCategory =
        selectedCategory === "ALL" || d.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [designs, designSearch, selectedCategory]);

  return (
    <div className="mc-page">
      {/* Toast Notifications */}
      <div className="mc-toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Plain T-Shirt Modal */}
      <PlainTshirtModal
        isOpen={tshirtModal.open}
        initialData={tshirtModal.data}
        isSaving={isSaving}
        onClose={() => setTshirtModal({ open: false, data: null })}
        onSubmit={handleSaveTshirt}
      />

      {/* Preset Design Modal */}
      <DesignModal
        isOpen={designModal.open}
        initialData={designModal.data}
        isSaving={isSaving}
        onClose={() => setDesignModal({ open: false, data: null })}
        onSubmit={handleSaveDesign}
      />

      {/* Fabric Material Modal */}
      <MaterialModal
        isOpen={materialModal.open}
        initialData={materialModal.data}
        isSaving={isSaving}
        onClose={() => setMaterialModal({ open: false, data: null })}
        onSubmit={handleSaveMaterial}
      />

      {/* Apparel Size Modal */}
      <SizeModal
        isOpen={sizeModal.open}
        initialData={sizeModal.data}
        isSaving={isSaving}
        onClose={() => setSizeModal({ open: false, data: null })}
        onSubmit={handleSaveSize}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        title={
          deleteModal.type === "tshirt"
            ? "Delete Plain T-Shirt Color?"
            : deleteModal.type === "design"
            ? "Delete Artwork / Design?"
            : deleteModal.type === "material"
            ? "Delete Fabric Material?"
            : "Delete Apparel Size?"
        }
        itemName={
          deleteModal.type === "tshirt"
            ? deleteModal.item?.color_name
            : deleteModal.item?.name
        }
        description={
          deleteModal.type === "tshirt"
            ? "This color will no longer appear in the customer studio."
            : deleteModal.type === "design"
            ? "This design will no longer be available in the customer motifs library."
            : deleteModal.type === "material"
            ? "This fabric material will no longer appear in the customizer fabric selector."
            : "This size option and its measurements will no longer appear in the studio."
        }
        isDeleting={isDeleting}
        onClose={() => setDeleteModal({ open: false, type: "tshirt", item: null })}
        onConfirm={handleConfirmDelete}
      />

      {/* Page Header */}
      <div className="mc-header">
        <div>
          <h1 className="mc-header-title">Customizer Management Studio</h1>
        </div>
        <div className="mc-header-actions">
          <button
            type="button"
            className="mc-btn mc-btn-secondary"
            onClick={() => {
              if (activeTab === "plain-tshirts") loadPlainTshirts();
              else if (activeTab === "designs") loadDesigns();
              else if (activeTab === "materials") loadMaterials();
              else loadSizes();
            }}
            title="Reload content"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
          {activeTab === "plain-tshirts" ? (
            <button
              type="button"
              className="mc-btn mc-btn-primary"
              onClick={() => setTshirtModal({ open: true, data: null })}
            >
              <Plus size={16} />
              Add T-Shirt Color
            </button>
          ) : activeTab === "designs" ? (
            <button
              type="button"
              className="mc-btn mc-btn-primary"
              onClick={() => setDesignModal({ open: true, data: null })}
            >
              <Plus size={16} />
              Add Preset Artwork
            </button>
          ) : activeTab === "materials" ? (
            <button
              type="button"
              className="mc-btn mc-btn-primary"
              onClick={() => setMaterialModal({ open: true, data: null })}
            >
              <Plus size={16} />
              Add Fabric Material
            </button>
          ) : (
            <button
              type="button"
              className="mc-btn mc-btn-primary"
              onClick={() => setSizeModal({ open: true, data: null })}
            >
              <Plus size={16} />
              Add Apparel Size
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="mc-tabs-nav">
        <button
          type="button"
          className={`mc-tab-item ${activeTab === "plain-tshirts" ? "active" : ""}`}
          onClick={() => setActiveTab("plain-tshirts")}
        >
          <Palette size={16} />
          <span>Plain T-Shirt Garments</span>
          <span className="mc-tab-badge">{plainTshirts.length}</span>
        </button>
        <button
          type="button"
          className={`mc-tab-item ${activeTab === "designs" ? "active" : ""}`}
          onClick={() => setActiveTab("designs")}
        >
          <Sparkles size={16} />
          <span>Artwork & Preset Designs</span>
          <span className="mc-tab-badge">{designs.length}</span>
        </button>
        <button
          type="button"
          className={`mc-tab-item ${activeTab === "materials" ? "active" : ""}`}
          onClick={() => setActiveTab("materials")}
        >
          <Layers size={16} />
          <span>Fabric & Materials</span>
          <span className="mc-tab-badge">{materials.length}</span>
        </button>
        <button
          type="button"
          className={`mc-tab-item ${activeTab === "sizes" ? "active" : ""}`}
          onClick={() => setActiveTab("sizes")}
        >
          <Ruler size={16} />
          <span>Sizes & Fit Guide</span>
          <span className="mc-tab-badge">{sizes.length}</span>
        </button>
      </div>

      {/* TAB 1: Plain T-Shirt Colors */}
      {activeTab === "plain-tshirts" && (
        <div className="mc-card">
          <div className="mc-card-header">
            <div className="mc-card-stat">
              <CheckCircle2 size={18} className="mc-stat-icon" />
              <span>
                <strong>{plainTshirts.length}</strong> Colors Live in Storefront Customizer
              </span>
            </div>
            <span className="mc-badge">Live in User Tab</span>
          </div>

          <div className="mc-card-body">
            {isLoadingTshirts ? (
              <div className="mc-loading-state">
                <div className="mc-spinner"></div>
                <p>Loading plain t-shirt collection...</p>
              </div>
            ) : plainTshirts.length > 0 ? (
              <div className="mc-garment-grid">
                {plainTshirts.map((tshirt) => (
                  <div key={tshirt.id} className="mc-garment-card">
                    {/* Top Images Row */}
                    <div className="mc-garment-preview-duo">
                      {/* Front */}
                      <div className="mc-preview-slot">
                        <span className="mc-slot-tag">FRONT VIEW</span>
                        <div className="mc-slot-img-wrap">
                          <img
                            src={tshirt.front_image}
                            alt={`${tshirt.color_name} Front`}
                            onError={(e) => {
                              e.target.style.opacity = "0.3";
                            }}
                          />
                        </div>
                      </div>

                      {/* Back */}
                      <div className="mc-preview-slot">
                        <span className="mc-slot-tag">BACK VIEW</span>
                        <div className="mc-slot-img-wrap">
                          <img
                            src={tshirt.back_image}
                            alt={`${tshirt.color_name} Back`}
                            onError={(e) => {
                              e.target.style.opacity = "0.3";
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Info & Actions */}
                    <div className="mc-garment-footer">
                      <div className="mc-garment-meta">
                        <span
                          className="mc-swatch-circle"
                          style={{ backgroundColor: tshirt.color_hex }}
                          title={`Color Hex: ${tshirt.color_hex}`}
                        />
                        <div>
                          <strong className="mc-color-title">{tshirt.color_name}</strong>
                          <span className="mc-price-subtitle">
                            Base Price: ₹{Number(tshirt.base_price || 699).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className="mc-garment-actions">
                        <button
                          type="button"
                          className="mc-action-btn edit"
                          onClick={() => setTshirtModal({ open: true, data: tshirt })}
                          title="Edit photos or pricing"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          type="button"
                          className="mc-action-btn delete"
                          onClick={() =>
                            setDeleteModal({
                              open: true,
                              type: "tshirt",
                              item: tshirt,
                            })
                          }
                          title="Delete color"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mc-empty-state">
                <div className="mc-empty-icon-box">
                  <Palette size={38} />
                </div>
                <h3>No Plain T-Shirt Colors Yet</h3>
                <p>Add your first plain t-shirt color with front and back photos so customers can customize it.</p>
                <button
                  type="button"
                  className="mc-btn mc-btn-primary"
                  onClick={() => setTshirtModal({ open: true, data: null })}
                >
                  <Plus size={16} />
                  Add Plain T-Shirt Color
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Artwork & Preset Designs */}
      {activeTab === "designs" && (
        <div className="mc-card">
          <div className="mc-card-header flex-column-mobile">
            <div className="mc-card-stat">
              <Sparkles size={18} className="mc-stat-icon" />
              <span>
                <strong>{designs.length}</strong> Artwork Designs Configured (
                {designs.filter((d) => d.is_active === 1 || d.is_active === true).length} Active)
              </span>
            </div>

            {/* Search & Category Filter Controls */}
            <div className="mc-filter-toolbar">
              <div className="mc-search-box">
                <Search size={15} className="mc-search-icon" />
                <input
                  type="text"
                  placeholder="Search design or category..."
                  value={designSearch}
                  onChange={(e) => setDesignSearch(e.target.value)}
                  className="mc-search-input"
                />
                {designSearch && (
                  <button
                    type="button"
                    className="mc-search-clear"
                    onClick={() => setDesignSearch("")}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="mc-category-select-wrap">
                <Filter size={14} className="mc-filter-icon" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mc-category-select"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "ALL" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mc-card-body">
            {isLoadingDesigns ? (
              <div className="mc-loading-state">
                <div className="mc-spinner"></div>
                <p>Loading preset designs library...</p>
              </div>
            ) : filteredDesigns.length > 0 ? (
              <div className="mc-designs-grid">
                {filteredDesigns.map((design) => {
                  const isActive = design.is_active === 1 || design.is_active === true;
                  const priceNum = Number(design.price || 0);

                  return (
                    <div
                      key={design.id}
                      className={`mc-design-card ${!isActive ? "inactive" : ""}`}
                    >
                      {/* Artwork Thumbnail with Checkerboard Transparent Background */}
                      <div className="mc-design-thumb-wrap">
                        <img
                          src={design.image_url}
                          alt={design.name}
                          onError={(e) => {
                            e.target.style.opacity = "0.2";
                          }}
                        />
                        <span className="mc-design-category-tag">{design.category}</span>
                        {priceNum > 0 ? (
                          <span className="mc-design-price-tag">+₹{priceNum}</span>
                        ) : (
                          <span className="mc-design-price-tag free">FREE</span>
                        )}
                      </div>

                      {/* Design Info */}
                      <div className="mc-design-card-content">
                        <div className="mc-design-header-row">
                          <h4 className="mc-design-name" title={design.name}>
                            {design.name}
                          </h4>
                          <button
                            type="button"
                            className={`mc-status-toggle ${isActive ? "active" : ""}`}
                            onClick={() => handleToggleDesignStatus(design)}
                            title={isActive ? "Deactivate design" : "Activate design"}
                          >
                            <span className="mc-status-indicator"></span>
                            {isActive ? "Live" : "Draft"}
                          </button>
                        </div>

                        <div className="mc-design-actions-row">
                          <span className="mc-sort-order-hint">
                            Sort: #{design.display_order ?? 0}
                          </span>

                          <div className="mc-design-btn-group">
                            <button
                              type="button"
                              className="mc-action-btn edit"
                              onClick={() => setDesignModal({ open: true, data: design })}
                              title="Edit design details"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              type="button"
                              className="mc-action-btn delete"
                              onClick={() =>
                                setDeleteModal({
                                  open: true,
                                  type: "design",
                                  item: design,
                                })
                              }
                              title="Delete design"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mc-empty-state">
                <div className="mc-empty-icon-box">
                  <Sparkles size={38} />
                </div>
                <h3>No Designs Found</h3>
                <p>
                  {designSearch || selectedCategory !== "ALL"
                    ? "No artwork matches your search criteria. Try clearing filters."
                    : "Add your first preset artwork or motif so customers can apply it in the customizer."}
                </p>
                <button
                  type="button"
                  className="mc-btn mc-btn-primary"
                  onClick={() => setDesignModal({ open: true, data: null })}
                >
                  <Plus size={16} />
                  Add Preset Artwork
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Fabric & Materials */}
      {activeTab === "materials" && (
        <div className="mc-card">
          <div className="mc-card-header">
            <div className="mc-card-stat">
              <Layers size={18} className="mc-stat-icon" />
              <span>
                <strong>{materials.filter((m) => m.is_active === 1 || m.is_active === true).length}</strong> of {materials.length} Materials Active in Storefront Customizer
              </span>
            </div>
            <span className="mc-badge">Live in User Studio</span>
          </div>

          <div className="mc-card-body">
            {isLoadingMaterials ? (
              <div className="mc-loading-state">
                <div className="mc-spinner"></div>
                <p>Loading fabric materials...</p>
              </div>
            ) : materials.length > 0 ? (
              <div className="mc-materials-grid">
                {materials.map((mat) => {
                  const isActive = mat.is_active === 1 || mat.is_active === true;
                  const surcharge = Number(mat.price_adjustment || 0);

                  return (
                    <div key={mat.id} className={`mc-material-card ${!isActive ? "inactive" : ""}`}>
                      <div className="mc-mat-header">
                        <div className="mc-mat-title-wrap">
                          <h4 className="mc-mat-name">{mat.name}</h4>
                          {mat.fabric_weight && (
                            <span className="mc-mat-weight-badge">{mat.fabric_weight}</span>
                          )}
                        </div>
                        <span className={`mc-status-pill ${isActive ? "active" : "inactive"}`}>
                          {isActive ? "Active" : "Disabled"}
                        </span>
                      </div>

                      <p className="mc-mat-desc">
                        {mat.description || "Standard apparel fabric specification for plain t-shirts."}
                      </p>

                      <div className="mc-mat-meta-bar">
                        <div className="mc-mat-price-info">
                          <span className="mc-mat-price-label">Price Surcharge</span>
                          <span className="mc-mat-price-val">
                            {surcharge > 0 ? `+₹${surcharge}` : "Standard (₹0)"}
                          </span>
                        </div>
                        <div className="mc-mat-order-info">
                          <span className="mc-mat-order-label">Order:</span>
                          <span className="mc-mat-order-val">#{mat.display_order ?? 0}</span>
                        </div>
                      </div>

                      <div className="mc-mat-card-footer">
                        <button
                          type="button"
                          className={`mc-status-toggle-btn ${isActive ? "btn-active" : "btn-inactive"}`}
                          onClick={() => handleToggleMaterialStatus(mat)}
                          title={isActive ? "Click to disable from studio" : "Click to activate in studio"}
                        >
                          {isActive ? "Deactivate" : "Activate"}
                        </button>
                        <div className="mc-garment-actions">
                          <button
                            type="button"
                            className="mc-action-btn edit"
                            onClick={() => setMaterialModal({ open: true, data: mat })}
                            title="Edit Material"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            className="mc-action-btn delete"
                            onClick={() =>
                              setDeleteModal({
                                open: true,
                                type: "material",
                                item: mat,
                              })
                            }
                            title="Delete Material"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mc-empty-state">
                <div className="mc-empty-icon-box">
                  <Layers size={38} />
                </div>
                <h3>No Materials Configured</h3>
                <p>
                  Add your first fabric material so customers can select their preferred garment weave in the customizer studio.
                </p>
                <button
                  type="button"
                  className="mc-btn mc-btn-primary"
                  onClick={() => setMaterialModal({ open: true, data: null })}
                >
                  <Plus size={16} />
                  Add First Material
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Sizes & Fit Guide */}
      {activeTab === "sizes" && (
        <div className="mc-card">
          <div className="mc-card-header">
            <div className="mc-card-stat">
              <Ruler size={18} className="mc-stat-icon" />
              <span>
                <strong>{sizes.filter((s) => s.is_active === 1 || s.is_active === true).length}</strong> of {sizes.length} Sizes Active in Customizer & Fit Guide
              </span>
            </div>
            <span className="mc-badge">Live in Size Chart Modal</span>
          </div>

          <div className="mc-card-body">
            {isLoadingSizes ? (
              <div className="mc-loading-state">
                <div className="mc-spinner"></div>
                <p>Loading size specifications...</p>
              </div>
            ) : sizes.length > 0 ? (
              <div className="mc-table-responsive">
                <table className="mc-data-table">
                  <thead>
                    <tr>
                      <th>Size Code</th>
                      <th>Chest (Inches)</th>
                      <th>Body Length</th>
                      <th>Shoulder Width</th>
                      <th>Surcharge</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map((sz) => {
                      const isActive = sz.is_active === 1 || sz.is_active === true;
                      const surcharge = Number(sz.price_adjustment || 0);

                      return (
                        <tr key={sz.id} className={!isActive ? "mc-row-inactive" : ""}>
                          <td>
                            <span className="mc-size-code-badge">{sz.name}</span>
                          </td>
                          <td>
                            <strong>{sz.chest || "—"}</strong>
                          </td>
                          <td>{sz.length || "—"}</td>
                          <td>{sz.shoulder || "—"}</td>
                          <td>
                            {surcharge > 0 ? (
                              <span className="mc-surcharge-tag">+₹{surcharge}</span>
                            ) : (
                              <span className="mc-free-tag">Standard (₹0)</span>
                            )}
                          </td>
                          <td>#{sz.display_order ?? 0}</td>
                          <td>
                            <button
                              type="button"
                              className={`mc-status-pill clickable ${isActive ? "active" : "inactive"}`}
                              onClick={() => handleToggleSizeStatus(sz)}
                              title="Click to toggle status"
                            >
                              {isActive ? "Active" : "Disabled"}
                            </button>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="mc-table-actions">
                              <button
                                type="button"
                                className="mc-action-btn edit"
                                onClick={() => setSizeModal({ open: true, data: sz })}
                                title="Edit Size Specs"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                type="button"
                                className="mc-action-btn delete"
                                onClick={() =>
                                  setDeleteModal({
                                    open: true,
                                    type: "size",
                                    item: sz,
                                  })
                                }
                                title="Delete Size"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mc-empty-state">
                <div className="mc-empty-icon-box">
                  <Ruler size={38} />
                </div>
                <h3>No Sizes Configured</h3>
                <p>
                  Configure garment sizes so customers can select their size and view measurements in the customizer studio.
                </p>
                <button
                  type="button"
                  className="mc-btn mc-btn-primary"
                  onClick={() => setSizeModal({ open: true, data: null })}
                >
                  <Plus size={16} />
                  Add First Size
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
