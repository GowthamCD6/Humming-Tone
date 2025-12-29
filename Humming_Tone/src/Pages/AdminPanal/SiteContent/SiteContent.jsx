import { useMemo, useState, useEffect } from "react";
import "./SiteContent.css";
import SuccessModal from "../../../components/SuccessModal/SuccessModal";
import AdminCystamize from "./AdminCystamize/AdminCystamize";
import {
  fetchSiteContent,
  updateFooter,
  updateGenderCategory,
  updateGenderStatus,
  updateCustomize,
  resetSiteContent,
} from "../../../utils/siteContentStore";
import SettingsIcon from "@mui/icons-material/Settings";
import BusinessIcon from "@mui/icons-material/Business";
import CategoryIcon from "@mui/icons-material/Category";
import LinkIcon from "@mui/icons-material/Link";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function SiteContent() {
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [error, setError] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);

  const [footerDraft, setFooterDraft] = useState(null);
  const [genderCategoryDraft, setGenderCategoryDraft] = useState(null);
  const [genderStatusDraft, setGenderStatusDraft] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchSiteContent();
        setFooterDraft(data.footer);
        setGenderCategoryDraft(data.genderCategory);
        setGenderStatusDraft(data.genderStatus);
      } catch (err) {
        setError('Failed to load site content: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const genders = useMemo(() => {
    // Filter out "Kids" from the gender list
    return genderCategoryDraft 
      ? Object.keys(genderCategoryDraft)
          .filter(gender => gender.toLowerCase() !== 'kids')
          .sort() 
      : [];
  }, [genderCategoryDraft]);

  // Statistics for dashboard-like overview
  const stats = useMemo(() => ({
    totalGenders: genders.length,
    totalCategories: genders.reduce(
      (acc, gender) => acc + (genderCategoryDraft?.[gender]?.length || 0),
      0
    ),
    socialLinksConfigured: Object.values(footerDraft?.social || {}).filter(
      (link) => link && link.trim()
    ).length,
    shopLinksCount: footerDraft?.shopLinks?.length || 0,
    supportLinksCount: footerDraft?.supportLinks?.length || 0,
  }), [genders, genderCategoryDraft, footerDraft]);

  const toggleCard = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
    setError("");
  };

  const updateFooterField = (path, value) => {
    setFooterDraft((prev) => {
      const next = { ...(prev || {}) };
      if (path.includes(".")) {
        const parts = path.split(".");
        let current = next;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) current[parts[i]] = {};
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
      } else {
        next[path] = value;
      }
      return next;
    });
  };

  const saveFooter = async () => {
    try {
      setError("");
      await updateFooter(footerDraft);
      setModalMessage("Footer saved successfully!");
      setModalOpen(true);
    } catch (e) {
      setError(e?.message || "Failed to save footer");
    }
  };

  const saveGenderCategory = async () => {
    try {
      setError("");
      await updateGenderCategory(genderCategoryDraft);
      setModalMessage("Gender/Category mapping saved successfully!");
      setModalOpen(true);
    } catch (e) {
      setError(e?.message || "Failed to save mapping");
    }
  };

  const addGender = () => {
    const name = prompt("Enter new gender name (example: Women)");
    if (!name) return;
    if (name.toLowerCase() === 'kids') {
      alert('The "Kids" gender option is not available.');
      return;
    }
    setGenderCategoryDraft((prev) => {
      if (prev?.[name]) return prev;
      return { ...(prev || {}), [name]: ["All Categories"] };
    });
  };

  const removeGender = (gender) => {
    if (!confirm(`Remove gender "${gender}"?`)) return;
    setGenderCategoryDraft((prev) => {
      const next = { ...(prev || {}) };
      delete next[gender];
      return next;
    });
  };

  const addCategory = (gender) => {
    const name = prompt(`Add category for ${gender}`);
    if (!name) return;
    setGenderCategoryDraft((prev) => {
      const list = Array.isArray(prev?.[gender]) ? prev[gender] : [];
      if (list.includes(name)) return prev;
      return { ...(prev || {}), [gender]: [...list, name] };
    });
  };

  const removeCategory = (gender, category) => {
    setGenderCategoryDraft((prev) => {
      const list = Array.isArray(prev?.[gender]) ? prev[gender] : [];
      return { ...(prev || {}), [gender]: list.filter((c) => c !== category) };
    });
  };

  const addShopLink = () => {
    const label = prompt('Enter link label (e.g., "New Collection")');
    if (!label) return;
    const href = prompt('Enter link URL (e.g., "/new-collection")');
    if (href === null) return;

    setFooterDraft((prev) => ({
      ...prev,
      shopLinks: [...(prev?.shopLinks || []), { label, href: href || "#", active: true }],
    }));
  };

  const removeShopLink = (index) => {
    setFooterDraft((prev) => ({
      ...prev,
      shopLinks: prev?.shopLinks?.filter((_, i) => i !== index) || [],
    }));
  };

  const addSupportLink = () => {
    const label = prompt('Enter support link label (e.g., "Contact Us")');
    if (!label) return;
    const href = prompt('Enter link URL (e.g., "/contact")');
    if (href === null) return;

    setFooterDraft((prev) => ({
      ...prev,
      supportLinks: [
        ...(prev?.supportLinks || []),
        { label, href: href || "#", active: true },
      ],
    }));
  };

  const toggleShopLinkActive = (index) => {
    setFooterDraft((prev) => {
      const updated = [...(prev?.shopLinks || [])];
      updated[index] = {
        ...updated[index],
        active: !updated[index].active,
      };
      return { ...prev, shopLinks: updated };
    });
  };

  const toggleSupportLinkActive = (index) => {
    setFooterDraft((prev) => {
      const updated = [...(prev?.supportLinks || [])];
      updated[index] = {
        ...updated[index],
        active: !updated[index].active,
      };
      return { ...prev, supportLinks: updated };
    });
  };

  const removeSupportLink = (index) => {
    setFooterDraft((prev) => ({
      ...prev,
      supportLinks: prev?.supportLinks?.filter((_, i) => i !== index) || [],
    }));
  };

  const toggleGenderStatus = (gender) => {
    setGenderStatusDraft((prev) => ({
      ...prev,
      [gender]: !prev[gender],
    }));
  };

  const saveGenderStatus = async () => {
    try {
      setError("");
      await updateGenderStatus(genderStatusDraft);
      setModalMessage("Gender visibility saved successfully!");
      setModalOpen(true);
    } catch (e) {
      setError(e?.message || "Failed to save gender visibility");
    }
  };

  const resetAll = async () => {
    if (!confirm("Reset all content to defaults? This action cannot be undone."))
      return;
    const defaults = resetSiteContent();
    setFooterDraft(defaults.footer);
    setGenderCategoryDraft(defaults.genderCategory);
    setGenderStatusDraft(defaults.genderStatus);
    setModalMessage("All content reset to defaults successfully!");
    setModalOpen(true);
    setError("");
    setExpandedCard(null);
  };

  // Open customize content modal
  const openCustomizeModal = () => {
    setCustomizeModalOpen(true);
  };

  if (loading) {
    return (
      <section className="tab-content">
        <div className="loading-state">Loading site content...</div>
      </section>
    );
  }

  return (
    <section className="tab-content">
      <div className="content-header">
        <h3 className="content-subtitle">Store Content Management</h3>
      </div>
      
      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">GENDERS</p>
          <p className="stat-value">{stats.totalGenders}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">CATEGORIES</p>
          <p className="stat-value">{stats.totalCategories}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">FOOTER LINKS</p>
          <p className="stat-value">{stats.shopLinksCount + stats.supportLinksCount}</p>
        </div>
      </div>

      {error && (
        <div className="sitecontent-alert sitecontent-alert-error">{error}</div>
      )}

      <SuccessModal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />

      <div className="sitecontent-cards">
        {/* Business Information Card */}
        <div
          className={`sitecontent-main-card ${
            expandedCard === "business" ? "expanded" : ""
          }`}
        >
          <div
            className="sitecontent-card-header"
            onClick={() => toggleCard("business")}
          >
            <div className="sitecontent-card-icon">
              <BusinessIcon />
            </div>
            <div className="sitecontent-card-info">
              <h3 className="sitecontent-card-title">Business Information</h3>
              <p className="sitecontent-card-desc">
                Brand identity, description and contact details
              </p>
              <div className="sitecontent-card-status">
                <CheckCircleIcon className="status-icon complete" />
                <span>Complete</span>
              </div>
            </div>
            <div className="sitecontent-card-toggle">
              <ExpandMoreIcon
                className={`sitecontent-arrow ${
                  expandedCard === "business" ? "rotated" : ""
                }`}
              />
            </div>
          </div>

          {expandedCard === "business" && (
            <div className="sitecontent-card-content">
              <div className="sitecontent-form-section">
                <h4 className="sitecontent-section-title">Brand Identity</h4>
                <div className="sitecontent-form-group">
                  <div className="sitecontent-row">
                    <label>Brand Name</label>
                    <input
                      value={footerDraft?.brandName || ""}
                      onChange={(e) =>
                        updateFooterField("brandName", e.target.value)
                      }
                      placeholder="Enter your brand name"
                    />
                  </div>
                  <div className="sitecontent-row">
                    <label>Description</label>
                    <textarea
                      value={footerDraft?.description || ""}
                      onChange={(e) =>
                        updateFooterField("description", e.target.value)
                      }
                      placeholder="Describe your brand and what makes it unique"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="sitecontent-form-section">
                <h4 className="sitecontent-section-title">Contact Information</h4>
                <div className="sitecontent-form-group">
                  <div className="sitecontent-row">
                    <label>Email</label>
                    <input
                      type="email"
                      value={footerDraft?.company?.email || ""}
                      onChange={(e) =>
                        updateFooterField("company.email", e.target.value)
                      }
                      placeholder="contact@yourstore.com"
                    />
                  </div>
                  <div className="sitecontent-row">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={footerDraft?.company?.phone || ""}
                      onChange={(e) =>
                        updateFooterField("company.phone", e.target.value)
                      }
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="sitecontent-row">
                    <label>Address</label>
                    <textarea
                      value={footerDraft?.company?.address || ""}
                      onChange={(e) =>
                        updateFooterField("company.address", e.target.value)
                      }
                      placeholder="Your business address"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="sitecontent-form-section">
                <h4 className="sitecontent-section-title">Social Media</h4>
                <div className="sitecontent-form-group">
                  <div className="sitecontent-row">
                    <label>Facebook</label>
                    <input
                      type="url"
                      value={footerDraft?.social?.facebook || ""}
                      onChange={(e) =>
                        updateFooterField("social.facebook", e.target.value)
                      }
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div className="sitecontent-row">
                    <label>Instagram</label>
                    <input
                      type="url"
                      value={footerDraft?.social?.instagram || ""}
                      onChange={(e) =>
                        updateFooterField("social.instagram", e.target.value)
                      }
                      placeholder="https://instagram.com/yourpage"
                    />
                  </div>
                  <div className="sitecontent-row">
                    <label>WhatsApp</label>
                    <input
                      type="url"
                      value={footerDraft?.social?.whatsapp || ""}
                      onChange={(e) =>
                        updateFooterField("social.whatsapp", e.target.value)
                      }
                      placeholder="https://wa.me/1234567890"
                    />
                  </div>
                  <div className="sitecontent-row">
                    <label>Meesho</label>
                    <input
                      type="url"
                      value={footerDraft?.social?.meesho || ""}
                      onChange={(e) =>
                        updateFooterField("social.meesho", e.target.value)
                      }
                      placeholder="https://meesho.com/yourstore"
                    />
                  </div>
                </div>
              </div>

              <div className="sitecontent-card-actions">
                <button className="sitecontent-btn primary" onClick={saveFooter}>
                  <SaveIcon />
                  Save Business Info
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Card */}
        <div
          className={`sitecontent-main-card ${
            expandedCard === "navigation" ? "expanded" : ""
          }`}
        >
          <div
            className="sitecontent-card-header"
            onClick={() => toggleCard("navigation")}
          >
            <div className="sitecontent-card-icon">
              <LinkIcon />
            </div>
            <div className="sitecontent-card-info">
              <h3 className="sitecontent-card-title">Footer Navigation</h3>
              <p className="sitecontent-card-desc">
                Manage shop and support links in footer
              </p>
              <div className="sitecontent-card-status">
                <CheckCircleIcon className="status-icon complete" />
                <span>
                  {stats.shopLinksCount + stats.supportLinksCount} Links
                </span>
              </div>
            </div>
            <div className="sitecontent-card-toggle">
              <ExpandMoreIcon
                className={`sitecontent-arrow ${
                  expandedCard === "navigation" ? "rotated" : ""
                }`}
              />
            </div>
          </div>

          {expandedCard === "navigation" && (
            <div className="sitecontent-card-content">
              <div className="sitecontent-form-section">
                <div className="sitecontent-section-header">
                  <h4 className="sitecontent-section-title">Shop Links</h4>
                  <button className="sitecontent-btn secondary small" onClick={addShopLink}>
                    <AddIcon />
                    Add Link
                  </button>
                </div>
                <div className="sitecontent-links-list">
                  {(footerDraft?.shopLinks || []).map((link, index) => (
                    <div key={index} className="sitecontent-link-item">
                      <div className="sitecontent-link-content">
                        <span className="sitecontent-link-label">
                          {link.label}
                        </span>
                        <span className="sitecontent-link-href">{link.href}</span>
                      </div>
                      <div className="sitecontent-link-actions">
                        <button
                          className={`sitecontent-btn ${
                            link.active === false ? "danger" : "primary"
                          } small`}
                          onClick={() => toggleShopLinkActive(index)}
                        >
                          {link.active === false ? "Inactive" : "Active"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!footerDraft?.shopLinks ||
                    footerDraft.shopLinks.length === 0) && (
                    <div className="sitecontent-empty-links">
                      <p>No shop links configured</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="sitecontent-form-section">
                <div className="sitecontent-section-header">
                  <h4 className="sitecontent-section-title">Support Links</h4>
                  <button className="sitecontent-btn secondary small" onClick={addSupportLink}>
                    <AddIcon />
                    Add Link
                  </button>
                </div>
                <div className="sitecontent-links-list">
                  {(footerDraft?.supportLinks || []).map((link, index) => (
                    <div key={index} className="sitecontent-link-item">
                      <div className="sitecontent-link-content">
                        <span className="sitecontent-link-label">
                          {link.label}
                        </span>
                        <span className="sitecontent-link-href">{link.href}</span>
                      </div>
                      <div className="sitecontent-link-actions">
                        <button
                          className={`sitecontent-btn ${
                            link.active === false ? "danger" : "primary"
                          } small`}
                          onClick={() => toggleSupportLinkActive(index)}
                        >
                          {link.active === false ? "Inactive" : "Active"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!footerDraft?.supportLinks ||
                    footerDraft.supportLinks.length === 0) && (
                    <div className="sitecontent-empty-links">
                      <p>No support links configured</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="sitecontent-card-actions">
                <button className="sitecontent-btn primary" onClick={saveFooter}>
                  <SaveIcon />
                  Save Navigation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Gender Visibility Card */}
        <div
          className={`sitecontent-main-card ${
            expandedCard === "visibility" ? "expanded" : ""
          }`}
        >
          <div
            className="sitecontent-card-header"
            onClick={() => toggleCard("visibility")}
          >
            <div className="sitecontent-card-icon">
              <SettingsIcon />
            </div>
            <div className="sitecontent-card-info">
              <h3 className="sitecontent-card-title">Gender Page Visibility</h3>
              <p className="sitecontent-card-desc">
                Control which gender pages are visible to users
              </p>
              <div className="sitecontent-card-status">
                <CheckCircleIcon className="status-icon complete" />
                <span>
                  {Object.values(genderStatusDraft || {}).filter((status) => status).length} of{" "}
                  {Object.keys(genderStatusDraft || {}).length} Active
                </span>
              </div>
            </div>
            <div className="sitecontent-card-toggle">
              <ExpandMoreIcon
                className={`sitecontent-arrow ${
                  expandedCard === "visibility" ? "rotated" : ""
                }`}
              />
            </div>
          </div>

          {expandedCard === "visibility" && (
            <div className="sitecontent-card-content">
              <div className="sitecontent-form-section">
                <h4 className="sitecontent-section-title">Manage Gender Visibility</h4>
                <div className="sitecontent-visibility-list">
                  {genders.map((gender) => (
                    <div key={gender} className="sitecontent-visibility-item">
                      <div className="visibility-info">
                        <h4 className="visibility-name">{gender}</h4>
                        <p className="visibility-desc">
                          {genderStatusDraft?.[gender] ? "Visible to users" : "Hidden from users"}
                        </p>
                      </div>
                      <button
                        className={`sitecontent-btn ${
                          genderStatusDraft?.[gender] ? "primary" : "danger"
                        } small`}
                        onClick={() => toggleGenderStatus(gender)}
                      >
                        {genderStatusDraft?.[gender] ? "Active" : "Inactive"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sitecontent-card-actions">
                <button className="sitecontent-btn primary" onClick={saveGenderStatus}>
                  <SaveIcon />
                  Save Gender Visibility
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Product Categories Card */}
        <div
          className={`sitecontent-main-card ${
            expandedCard === "categories" ? "expanded" : ""
          }`}
        >
          <div
            className="sitecontent-card-header"
            onClick={() => toggleCard("categories")}
          >
            <div className="sitecontent-card-icon">
              <CategoryIcon />
            </div>
            <div className="sitecontent-card-info">
              <h3 className="sitecontent-card-title">Product Categories</h3>
              <p className="sitecontent-card-desc">
                Configure gender types and their product categories
              </p>
              <div className="sitecontent-card-status">
                <CheckCircleIcon className="status-icon complete" />
                <span>
                  {stats.totalCategories} Categories
                </span>
              </div>
            </div>
            <div className="sitecontent-card-toggle">
              <ExpandMoreIcon
                className={`sitecontent-arrow ${
                  expandedCard === "categories" ? "rotated" : ""
                }`}
              />
            </div>
          </div>

          {expandedCard === "categories" && (
            <div className="sitecontent-card-content">
              <div className="sitecontent-categories-list">
                {genders.map((gender) => (
                  <div key={gender} className="sitecontent-category-item">
                    <div className="sitecontent-category-header">
                      <div className="sitecontent-category-title">
                        <span className="sitecontent-badge">{gender}</span>
                        <span className="sitecontent-category-count">
                          {genderCategoryDraft?.[gender]?.length || 0} categories
                        </span>
                      </div>
                    </div>

                    <div className="sitecontent-category-tags">
                      {(genderCategoryDraft?.[gender] || []).map((cat) => (
                        <div key={cat} className="sitecontent-tag">
                          <span className="sitecontent-tag-text">{cat}</span>
                          <button
                            className="sitecontent-tag-remove"
                            onClick={() => removeCategory(gender, cat)}
                            title="Remove category"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        className="sitecontent-btn secondary small add-category"
                        onClick={() => addCategory(gender)}
                      >
                        <AddIcon />
                        Add Category
                      </button>
                    </div>
                  </div>
                ))}

                {genders.length === 0 && (
                  <div className="sitecontent-empty-state">
                    <CategoryIcon className="empty-icon" />
                    <h3>No Gender Categories</h3>
                    <p>
                      Start by adding a gender type like "Men", "Women", or "Children"
                    </p>
                  </div>
                )}
              </div>

              <div className="sitecontent-card-actions">
                <button
                  className="sitecontent-btn secondary"
                  onClick={addGender}
                >
                  <AddIcon />
                  Add Gender
                </button>
                <button
                  className="sitecontent-btn primary"
                  onClick={saveGenderCategory}
                >
                  <SaveIcon />
                  Save Categories
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Customize Content Card */}
        <div className="sitecontent-main-card">
          <div className="sitecontent-card-header">
            <div className="sitecontent-card-icon">
              <SettingsIcon />
            </div>
            <div className="sitecontent-card-info">
              <h3 className="sitecontent-card-title">Customize Product Content</h3>
              <p className="sitecontent-card-desc">
                Manage product categories, colors, materials, sizes and gallery designs
              </p>
              <div className="sitecontent-card-status">
                <CheckCircleIcon className="status-icon complete" />
                <span>Available</span>
              </div>
            </div>
            <div className="sitecontent-card-toggle">
              <button
                className="sitecontent-btn primary small"
                onClick={openCustomizeModal}
              >
                Open Modal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customize Content Modal */}
      {customizeModalOpen && (
        <div className="sitecontent-modal-overlay" onClick={() => setCustomizeModalOpen(false)}>
          <div className="sitecontent-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="sitecontent-modal-header">
              <h3>Customize Product Content Management</h3>
              <button 
                className="sitecontent-modal-close"
                onClick={() => setCustomizeModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="sitecontent-modal-body">
              <AdminCystamize onBack={() => setCustomizeModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}