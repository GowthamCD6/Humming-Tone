import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, X, RefreshCw, Layers, CheckCircle2, AlertTriangle, Eye, Palette } from "lucide-react";
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

// Modal Component for Add & Edit
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

// Delete Confirmation Modal
function DeleteConfirmModal({
  isOpen,
  tshirt,
  onClose,
  onConfirm,
  isDeleting,
}) {
  if (!isOpen || !tshirt) return null;

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal mc-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="mc-delete-icon-wrap">
          <AlertTriangle size={32} />
        </div>
        <h3 className="mc-delete-title">Delete Plain T-Shirt?</h3>
        <p className="mc-delete-desc">
          Are you sure you want to delete <strong>{tshirt.color_name}</strong>?
          This color will no longer appear in the storefront customer studio.
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
  const [plainTshirts, setPlainTshirts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const [tshirtModal, setTshirtModal] = useState({
    open: false,
    data: null,
  });

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    tshirt: null,
  });

  const loadPlainTshirts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/site-content/customize/plain-tshirts`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.tshirts)) {
        setPlainTshirts(data.tshirts);
      }
    } catch (err) {
      console.error("Failed to load plain tshirts:", err);
      addToast("Failed to load plain t-shirts: " + err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlainTshirts();
  }, []);

  const handleOpenAdd = () => {
    setTshirtModal({
      open: true,
      data: null,
    });
  };

  const handleOpenEdit = (tshirt) => {
    setTshirtModal({
      open: true,
      data: tshirt,
    });
  };

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

  const handleOpenDelete = (tshirt) => {
    setDeleteModal({
      open: true,
      tshirt,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.tshirt) return;
    try {
      setIsDeleting(true);
      const res = await fetch(
        `${API_BASE_URL}/api/site-content/customize/plain-tshirts/${deleteModal.tshirt.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete plain t-shirt");
      }
      addToast("Plain t-shirt deleted successfully!");
      setDeleteModal({ open: false, tshirt: null });
      await loadPlainTshirts();
    } catch (err) {
      console.error("Delete error:", err);
      addToast(err.message || "Failed to delete plain t-shirt", "error");
    } finally {
      setIsDeleting(false);
    }
  };

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

      {/* Add / Edit Modal */}
      <PlainTshirtModal
        isOpen={tshirtModal.open}
        initialData={tshirtModal.data}
        isSaving={isSaving}
        onClose={() => setTshirtModal({ open: false, data: null })}
        onSubmit={handleSaveTshirt}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        tshirt={deleteModal.tshirt}
        isDeleting={isDeleting}
        onClose={() => setDeleteModal({ open: false, tshirt: null })}
        onConfirm={handleConfirmDelete}
      />

      {/* Header */}
      <div className="mc-header">
        <div>
          <h1 className="mc-header-title">Customizer Plain T-Shirts</h1>
        </div>
        <div className="mc-header-actions">
          <button
            type="button"
            className="mc-btn mc-btn-secondary"
            onClick={loadPlainTshirts}
            title="Reload garments"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
          <button
            type="button"
            className="mc-btn mc-btn-primary"
            onClick={handleOpenAdd}
          >
            <Plus size={16} />
            Add T-Shirt Color
          </button>
        </div>
      </div>

      {/* Card Wrapper */}
      <div className="mc-card">
        <div className="mc-card-header">
          <div className="mc-card-stat">
            <CheckCircle2 size={18} className="mc-stat-icon" />
            <span>
              <strong>{plainTshirts.length}</strong> Colors Configured for Storefront Customizer
            </span>
          </div>
          <span className="mc-badge">Live in User Tab</span>
        </div>

        <div className="mc-card-body">
          {isLoading ? (
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
                        onClick={() => handleOpenEdit(tshirt)}
                        title="Edit photos or pricing"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        type="button"
                        className="mc-action-btn delete"
                        onClick={() => handleOpenDelete(tshirt)}
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
                onClick={handleOpenAdd}
              >
                <Plus size={16} />
                Add Plain T-Shirt Color
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
