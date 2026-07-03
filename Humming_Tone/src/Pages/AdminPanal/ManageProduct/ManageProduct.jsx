import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, X } from 'lucide-react'
import './ManageProduct.css'

const BASE_URL = 'http://localhost:5000';

const getAuthHeaders = (contentType) => {
  const token = localStorage.getItem('adminToken');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
};

export default function ManageProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([])
  const [promoCodes, setPromoCodes] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [editImageFile, setEditImageFile] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  
  // Promo State
  const [showAddPromoModal, setShowAddPromoModal] = useState(false)
  const [newPromo, setNewPromo] = useState({ code: '', type: 'fixed', discount: 0, minOrder: 0, usageLimit: 100 })
  const [showEditPromoModal, setShowEditPromoModal] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [showDeletePromoModal, setShowDeletePromoModal] = useState(false)

  const [filterGender, setFilterGender] = useState('All')
  const [filterCategory, setFilterCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [productPage, setProductPage] = useState(1)
  const [productLimit, setProductLimit] = useState(10)

  // Fetch from backend
  const [genderOptions, setGenderOptions] = useState([]);
  const [genderCategoryMap, setGenderCategoryMap] = useState({});
  const [filterCategoryOptions, setFilterCategoryOptions] = useState([]);
  const [editCategoryOptions, setEditCategoryOptions] = useState([]);

  const formatCurrency = (value) => {
    const num = Number(value || 0);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Fetch genders and categories from backend
  useEffect(() => {
    const fetchGendersAndCategories = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/site-content/genders-categories`, {
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.genders) {
          setGenderOptions(data.genders);
          setGenderCategoryMap(data.genderCategoryMap);
        }
      } catch (error) {
        console.error('Error fetching genders and categories:', error);
      }
    };

    fetchGendersAndCategories();
  }, []);

  // Update filter category options when filter gender changes
  useEffect(() => {
    if (filterGender !== 'All' && genderCategoryMap[filterGender]) {
      setFilterCategoryOptions(genderCategoryMap[filterGender]);
    } else if (filterGender === 'All') {
      const allCategories = [];
      Object.values(genderCategoryMap).forEach(cats => {
        cats.forEach(cat => {
          if (!allCategories.some(c => c.name === cat.name)) {
            allCategories.push(cat);
          }
        });
      });
      setFilterCategoryOptions(allCategories);
    }
  }, [filterGender, genderCategoryMap]);

  // Update edit category options when editing product gender changes
  useEffect(() => {
    if (editingProduct?.gender && genderCategoryMap[editingProduct.gender]) {
      setEditCategoryOptions(genderCategoryMap[editingProduct.gender]);
    } else {
      const allCats = [];
      Object.values(genderCategoryMap).forEach(cats => {
        cats.forEach(c => {
          if (!allCats.some(existing => existing.name === c.name)) {
            allCats.push(c);
          }
        });
      });
      setEditCategoryOptions(allCats);
    }
  }, [editingProduct?.gender, genderCategoryMap]);

  const loadData = async () => {
    try {
      const prodRes = await fetch(`${BASE_URL}/admin/fetch_products`, {
        headers: getAuthHeaders()
      });
      const prodData = await prodRes.json();
      if (Array.isArray(prodData)) {
        setProducts(prodData.map(p => ({
          ...p,
          image: p.image_path ? `${BASE_URL}/${p.image_path.replace(/\\/g, '/')}` : '',
          category: p.subcategory || 'General',
          gender: p.gender,
          price: p.price || 0,
          stock: p.stock_quantity || 0
        })));
      }
      const promoRes = await fetch(`${BASE_URL}/admin/fetch_promos`, {
        headers: getAuthHeaders()
      });
      const promoData = await promoRes.json();
      if (Array.isArray(promoData)) setPromoCodes(promoData);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData(); }, []);

  const filteredProducts = products.filter((p) => {
    const pGender = String(p.gender || '').toLowerCase();
    const fGender = String(filterGender || '').toLowerCase();
    
    const genOk = filterGender === 'All' || 
                  pGender === fGender || 
                  (fGender === 'baby' && (pGender === 'babies' || pGender === 'baby'));
                  
    const catOk = filterCategory === 'All' || 
                  String(p.category || '').toLowerCase() === String(filterCategory || '').toLowerCase();
                  
    const nameOk = String(p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return genOk && catOk && nameOk;
  });

  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / productLimit));
  const safeProductPage = Math.min(Math.max(1, productPage), totalProductPages);
  const pagedProducts = useMemo(() => {
    const start = (safeProductPage - 1) * productLimit;
    return filteredProducts.slice(start, start + productLimit);
  }, [filteredProducts, safeProductPage, productLimit]);

  useEffect(() => {
    setProductPage(1);
  }, [searchQuery, filterGender, filterCategory, productLimit]);

  useEffect(() => {
    if (productPage > totalProductPages) {
      setProductPage(totalProductPages);
    }
  }, [productPage, totalProductPages]);

  // --- PRODUCT HANDLERS ---
  const handleEditProduct = (p) => { setEditingProduct({ ...p }); setEditImageFile(null); setShowEditModal(true); }
  
  const handleSaveProduct = async () => {
    const formData = new FormData();
    formData.append('name', editingProduct.name);
    formData.append('sku', editingProduct.sku);
    formData.append('price', editingProduct.price);
    formData.append('stock', editingProduct.stock);
    formData.append('category', editingProduct.category);
    formData.append('gender', editingProduct.gender);
    formData.append('about', editingProduct.about || '');
    if (editImageFile) {
      formData.append('image', editImageFile);
    }

    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${BASE_URL}/admin/update_product/${editingProduct.id}`, {
      method: 'PATCH',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData
    });
    const data = await res.json();
    if (data.success) { setShowEditModal(false); setEditImageFile(null); loadData(); }
  }

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    const res = await fetch(`${BASE_URL}/admin/delete_product`, {
      method: 'DELETE',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify({ id: productToDelete.id })
    });
    const data = await res.json();
    if (data.success) {
      setShowDeleteModal(false);
      setProductToDelete(null);
      loadData();
    }
  }

  // --- PROMO HANDLERS ---
  const handleEditPromo = (promo) => {
    setEditingPromo({ ...promo });
    setShowEditPromoModal(true);
  }

  const handleSavePromo = async () => {
    if (!editingPromo) return;
    try {
      const res = await fetch(`${BASE_URL}/admin/update_promo_code/${editingPromo.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders('application/json'),
        body: JSON.stringify({
          code: editingPromo.code,
          discount_type: editingPromo.discount_type,
          discount_value: editingPromo.discount_value,
          min_order_amount: editingPromo.min_order_amount,
          is_active: editingPromo.is_active
        })
      });
      if (res.ok) {
        setShowEditPromoModal(false);
        setEditingPromo(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  const openDeletePromoModal = () => {
    setShowDeletePromoModal(true);
  }

  const handleDeletePromo = async () => {
    if (!editingPromo) return;
    try {
      const res = await fetch(`${BASE_URL}/admin/remove_promo_code/${editingPromo.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setShowDeletePromoModal(false);
        setShowEditPromoModal(false);
        setEditingPromo(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleAddPromo = async () => {
    const res = await fetch(`${BASE_URL}/admin/add_promo_code`, {
      method: 'POST',
      headers: getAuthHeaders('application/json'),
      body: JSON.stringify({
        ...newPromo,
        discount_type: newPromo.type,
        discount_value: newPromo.discount,
        min_order_amount: newPromo.minOrder,
        usage_limit: newPromo.usageLimit,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 31536000000).toISOString(),
        is_active: true
      })
    });
    if (res.ok) { setShowAddPromoModal(false); loadData(); }
  }

  // Check if any panel is open (for overlay)
  const isPanelOpen = showEditModal || showAddPromoModal || showEditPromoModal;

  return (
    <div className="mp-page">

      {/* --- Promo Codes Table --- */}
      <div className="mp-card">
        <div className="mp-card-header">
          <h3 className="mp-card-title">Active Promo Codes</h3>
          <div className="mp-card-header-actions">
            <span className="mp-card-count">{promoCodes.length} codes</span>
            <button className="mp-btn mp-btn-outline" onClick={() => setShowAddPromoModal(true)}>
              <Plus size={16} />
              Add Promo Code
            </button>
            <button className="mp-btn mp-btn-primary" onClick={() => navigate('/admin/add-product')}>
              <Plus size={16} />
              Add Product
            </button>
          </div>
        </div>
        <table className="mp-table">
          <thead>
            <tr>
              <th style={{ width: '20%' }}>Code</th>
              <th style={{ width: '15%' }}>Type</th>
              <th style={{ width: '15%' }}>Discount</th>
              <th style={{ width: '15%' }}>Min Order</th>
              <th style={{ width: '10%' }}>Usage</th>
              <th style={{ width: '12%' }}>Status</th>
              <th className="mp-text-center" style={{ width: '13%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {promoCodes.length > 0 ? promoCodes.map((p) => (
              <tr key={p.id}>
                <td><span className="mp-text-bold">{p.code}</span></td>
                <td>{p.discount_type}</td>
                <td><span className="mp-amount">{formatCurrency(p.discount_value)}</span></td>
                <td><span className="mp-amount">{formatCurrency(p.min_order_amount)}</span></td>
                <td>{p.used_count || 0} / {p.usage_limit || '∞'}</td>
                <td>
                  <span className={`mp-badge ${p.is_active ? 'mp-badge-green' : 'mp-badge-red'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="mp-text-center">
                  <div className="mp-actions">
                    <button className="mp-icon-btn" onClick={() => handleEditPromo(p)} title="Edit">
                      <Edit size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="mp-empty">No promo codes found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Products Table --- */}
      <div className="mp-card">
        <div className="mp-filters">
          <h3 className="mp-products-title">Active Products</h3>
          <div className="mp-search-wrap">
            <Search className="mp-search-icon" size={16} />
            <input
              type="text"
              className="mp-search-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="mp-filter-select"
            value={filterGender}
            onChange={(e) => { setFilterGender(e.target.value); setFilterCategory('All'); }}
          >
            <option value="All">All Genders</option>
            {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            className="mp-filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {filterCategoryOptions.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <span className="mp-products-count">{filteredProducts.length} matched / {products.length} total</span>
        </div>

        <table className="mp-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Product</th>
              <th style={{ width: '15%' }}>SKU</th>
              <th style={{ width: '12%' }}>Price</th>
              <th style={{ width: '12%' }}>Stock</th>
              <th style={{ width: '13%' }}>Category</th>
              <th style={{ width: '10%' }}>Gender</th>
              <th className="mp-text-center" style={{ width: '13%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedProducts.length > 0 ? (
              pagedProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="mp-product-cell">
                      <img
                        src={p.image}
                        className="mp-product-img"
                        alt={p.name}
                        onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                      />
                      <span className="mp-product-name">{p.name}</span>
                    </div>
                  </td>
                  <td>{p.sku}</td>
                  <td><span className="mp-text-bold mp-amount">{formatCurrency(p.price)}</span></td>
                  <td>
                    <span className={`mp-badge ${p.stock > 0 ? 'mp-badge-green' : 'mp-badge-red'}`}>
                      {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td><span className="mp-badge mp-badge-gray">{p.category}</span></td>
                  <td>
                    <span className="mp-badge mp-badge-blue">
                      {p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1).toLowerCase() : ''}
                    </span>
                  </td>
                  <td className="mp-text-center">
                    <div className="mp-actions">
                      <button className="mp-icon-btn" onClick={() => handleEditProduct(p)} title="Edit">
                        <Edit size={15} />
                      </button>
                      <button className="mp-icon-btn mp-icon-btn-danger" onClick={() => openDeleteModal(p)} title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="mp-empty">No products found matching your filters.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mp-table-footer">
          <span className="mp-footer-text">
            Showing {filteredProducts.length === 0 ? 0 : (safeProductPage - 1) * productLimit + 1}–{Math.min(safeProductPage * productLimit, filteredProducts.length)} of {filteredProducts.length} products
          </span>

          <div className="mp-pagination-group">
            <label className="mp-limit-label" htmlFor="mp-limit-select">Rows</label>
            <select
              id="mp-limit-select"
              className="mp-limit-select"
              value={productLimit}
              onChange={(e) => setProductLimit(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            <button
              className="mp-page-btn"
              onClick={() => setProductPage((p) => Math.max(1, p - 1))}
              disabled={safeProductPage === 1}
            >
              Previous
            </button>
            <span className="mp-page-indicator">Page {safeProductPage} / {totalProductPages}</span>
            <button
              className="mp-page-btn"
              onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))}
              disabled={safeProductPage === totalProductPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ==============================================
          SIDE PANELS
          ============================================== */}

      {/* Overlay behind panels */}
      <div
        className={`mp-panel-overlay ${isPanelOpen ? 'open' : ''}`}
        onClick={() => {
          setShowEditModal(false);
          setShowAddPromoModal(false);
          setShowEditPromoModal(false);
        }}
      />

      {/* --- Edit Product Side Panel --- */}
      <div className={`mp-panel ${showEditModal ? 'open' : ''}`}>
        <div className="mp-panel-header">
          <h2 className="mp-panel-title">Edit Product</h2>
          <button className="mp-panel-close" onClick={() => setShowEditModal(false)}>
            <X size={18} />
          </button>
        </div>
        {editingProduct && (
          <>
            <div className="mp-panel-body">
              {/* Image Preview & Upload */}
              <div className="mp-form-group">
                <label className="mp-form-label">Product Image</label>
                <div className="mp-image-edit">
                  <img
                    src={editImageFile ? URL.createObjectURL(editImageFile) : editingProduct.image}
                    alt={editingProduct.name}
                    className="mp-image-preview"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/120'}
                  />
                  <label className="mp-btn mp-btn-outline mp-image-btn">
                    <Edit size={14} />
                    Change Image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => { if (e.target.files[0]) setEditImageFile(e.target.files[0]); }}
                    />
                  </label>
                </div>
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label">SKU</label>
                <input type="text" className="mp-form-input" value={editingProduct.sku} onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})} />
              </div>
              <div className="mp-form-row">
                <div className="mp-form-group">
                  <label className="mp-form-label">Price (₹)</label>
                  <input type="number" className="mp-form-input" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} />
                </div>
                <div className="mp-form-group">
                  <label className="mp-form-label">Stock</label>
                  <input type="number" className="mp-form-input" value={editingProduct.stock} onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})} />
                </div>
              </div>
              <div className="mp-form-row">
                <div className="mp-form-group">
                  <label className="mp-form-label">Category</label>
                  <input type="text" list="edit-category-options" className="mp-form-input" placeholder="Select category" value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} />
                  <datalist id="edit-category-options">
                    {editCategoryOptions.map(c => <option key={c.name} value={c.name} />)}
                  </datalist>
                </div>
                <div className="mp-form-group">
                  <label className="mp-form-label">Gender</label>
                  <select className="mp-form-input" value={editingProduct.gender} onChange={(e) => setEditingProduct({...editingProduct, gender: e.target.value, category: ''})}>
                    <option value="">Select Gender</option>
                    {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label">Description</label>
                <textarea className="mp-form-input" rows="3" value={editingProduct.about} onChange={(e) => setEditingProduct({...editingProduct, about: e.target.value})} />
              </div>
            </div>
            <div className="mp-panel-footer">
              <button className="mp-btn mp-btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="mp-btn mp-btn-primary" onClick={handleSaveProduct}>Save Changes</button>
            </div>
          </>
        )}
      </div>

      {/* --- Add Promo Side Panel --- */}
      <div className={`mp-panel ${showAddPromoModal ? 'open' : ''}`}>
        <div className="mp-panel-header">
          <h2 className="mp-panel-title">Add Promo Code</h2>
          <button className="mp-panel-close" onClick={() => setShowAddPromoModal(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="mp-panel-body">
          <div className="mp-form-group">
            <label className="mp-form-label">Promo Code</label>
            <input type="text" className="mp-form-input" value={newPromo.code} onChange={(e) => setNewPromo({...newPromo, code: e.target.value})} />
          </div>
          <div className="mp-form-row">
            <div className="mp-form-group">
              <label className="mp-form-label">Type</label>
              <select className="mp-form-input" value={newPromo.type} onChange={(e) => setNewPromo({...newPromo, type: e.target.value})}>
                <option value="fixed">Fixed</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
            <div className="mp-form-group">
              <label className="mp-form-label">Usage Limit</label>
              <input type="number" className="mp-form-input" value={newPromo.usageLimit} onChange={(e) => setNewPromo({...newPromo, usageLimit: e.target.value})} placeholder="e.g. 100" />
            </div>
          </div>
          <div className="mp-form-row">
            <div className="mp-form-group">
              <label className="mp-form-label">Discount</label>
              <input type="number" className="mp-form-input" value={newPromo.discount} onChange={(e) => setNewPromo({...newPromo, discount: e.target.value})} />
            </div>
            <div className="mp-form-group">
              <label className="mp-form-label">Min Order (₹)</label>
              <input type="number" className="mp-form-input" value={newPromo.minOrder} onChange={(e) => setNewPromo({...newPromo, minOrder: e.target.value})} />
            </div>
          </div>
        </div>
        <div className="mp-panel-footer">
          <button className="mp-btn mp-btn-outline" onClick={() => setShowAddPromoModal(false)}>Cancel</button>
          <button className="mp-btn mp-btn-primary" onClick={handleAddPromo}>
            <Plus size={16} />
            Add Promo
          </button>
        </div>
      </div>

      {/* --- Edit Promo Side Panel --- */}
      <div className={`mp-panel ${showEditPromoModal ? 'open' : ''}`}>
        <div className="mp-panel-header">
          <h2 className="mp-panel-title">Edit Promo Code</h2>
          <button className="mp-panel-close" onClick={() => setShowEditPromoModal(false)}>
            <X size={18} />
          </button>
        </div>
        {editingPromo && (
          <>
            <div className="mp-panel-body">
              <div className="mp-form-group">
                <label className="mp-form-label">Promo Code</label>
                <input type="text" className="mp-form-input" value={editingPromo.code} onChange={(e) => setEditingPromo({...editingPromo, code: e.target.value})} />
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label">Type</label>
                <select className="mp-form-input" value={editingPromo.discount_type} onChange={(e) => setEditingPromo({...editingPromo, discount_type: e.target.value})}>
                  <option value="fixed">Fixed</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
              <div className="mp-form-row">
                <div className="mp-form-group">
                  <label className="mp-form-label">Discount</label>
                  <input type="number" className="mp-form-input" value={editingPromo.discount_value} onChange={(e) => setEditingPromo({...editingPromo, discount_value: e.target.value})} />
                </div>
                <div className="mp-form-group">
                  <label className="mp-form-label">Min Order (₹)</label>
                  <input type="number" className="mp-form-input" value={editingPromo.min_order_amount} onChange={(e) => setEditingPromo({...editingPromo, min_order_amount: e.target.value})} />
                </div>
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label">Status</label>
                <select className="mp-form-input" value={editingPromo.is_active ? 'true' : 'false'} onChange={(e) => setEditingPromo({...editingPromo, is_active: e.target.value === 'true'})}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mp-panel-footer mp-panel-footer-split">
              <button className="mp-btn mp-btn-danger" onClick={openDeletePromoModal}>Delete</button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="mp-btn mp-btn-outline" onClick={() => setShowEditPromoModal(false)}>Cancel</button>
                <button className="mp-btn mp-btn-primary" onClick={handleSavePromo}>Save Changes</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ==============================================
          CONFIRMATION MODALS (centered)
          ============================================== */}

      {/* Delete Product Modal */}
      {showDeleteModal && productToDelete && (
        <div className="mp-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h2>Delete Product</h2>
              <button className="mp-panel-close" onClick={() => setShowDeleteModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="mp-modal-body">
              <p>
                Deleting this product will remove it from the user pages
                and store it in Product Data. Do you want to continue?
              </p>
            </div>
            <div className="mp-modal-footer">
              <button className="mp-btn mp-btn-outline" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="mp-btn mp-btn-danger" onClick={handleDeleteProduct}>Delete Product</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Promo Modal */}
      {showDeletePromoModal && (
        <div className="mp-modal-overlay" onClick={() => setShowDeletePromoModal(false)}>
          <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h2>Delete Promo Code</h2>
              <button className="mp-panel-close" onClick={() => setShowDeletePromoModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="mp-modal-body">
              <p>
                Are you sure you want to delete this promo code? This action cannot be undone.
              </p>
            </div>
            <div className="mp-modal-footer">
              <button className="mp-btn mp-btn-outline" onClick={() => setShowDeletePromoModal(false)}>Cancel</button>
              <button className="mp-btn mp-btn-danger" onClick={handleDeletePromo}>Delete Promo</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}