import React, { useEffect, useMemo, useState } from 'react';
import { Package, AlertTriangle, XCircle, DollarSign, Search, Plus, ChevronLeft, ChevronRight, Edit, X, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Inventory.css';
import axios from 'axios';
const API_BASE_URL = 'http://localhost:5000/admin';
const PAGE_SIZE = 5;

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [allMaterials, setAllMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All Materials');
  const [activeGender, setActiveGender] = useState('All');
  const [activeStockFilter, setActiveStockFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [detailsPanelItem, setDetailsPanelItem] = useState(null); // Item currently open in right side panel

  const mapStatus = (stock, reorder) => {
    if (stock <= 0) return { status: 'Out of Stock', statusClass: 'badge-red', stockColor: 'text-red' };
    if (stock <= reorder) return { status: 'Low Stock', statusClass: 'badge-orange', stockColor: 'text-orange' };
    return { status: 'In Stock', statusClass: 'badge-green', stockColor: 'text-dark' };
  };

  const handleOpenDetails = (item) => {
    setDetailsPanelItem({
      ...item,
      updateName: item.name,
      updateCode: item.code,
      updateSupplier: item.supplierName !== '-' ? item.supplierName : '',
      updateGender: item.gender !== '-' ? item.gender : '',
      updateColor: item.color,
      updateMaterial: item.material,
      updateCare: item.careInstructions,
      updateAge: item.ageRange,
      updateWeight: item.weight,
      updateDimensions: item.dimensions,
      updateAbout: item.about,
      updateStock: item.rawStock,
      updatePrice: item.standardCost
    });
  };

  const handleCloseDetails = () => {
    setDetailsPanelItem(null);
  };

  const handleUpdateFullDetails = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.patch(`${API_BASE_URL}/update_inventory_full/${detailsPanelItem.materialId}`, {
        product_id: detailsPanelItem.productId,
        material_name: detailsPanelItem.updateName,
        material_code: detailsPanelItem.updateCode,
        preferred_supplier: detailsPanelItem.updateSupplier,
        gender: detailsPanelItem.updateGender,
        color: detailsPanelItem.updateColor,
        material: detailsPanelItem.updateMaterial,
        care_instructions: detailsPanelItem.updateCare,
        age_range: detailsPanelItem.updateAge,
        weight: detailsPanelItem.updateWeight,
        dimensions: detailsPanelItem.updateDimensions,
        about: detailsPanelItem.updateAbout,
        current_stock: detailsPanelItem.updateStock,
        standard_cost: detailsPanelItem.updatePrice
      });
      if (res.data.success) {
        setDetailsPanelItem(null);
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStock = async () => {
    try {
      setLoading(true);
      const res = await axios.patch(`${API_BASE_URL}/update_inventory/${editingItem.materialId}`, {
        current_stock: editingItem.updateStock,
        standard_cost: editingItem.updatePrice
      });
      if (res.data.success) {
        setShowEditModal(false);
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this size/variant from the inventory? This action cannot be undone.')) {
      return;
    }
    try {
      setLoading(true);
      const res = await axios.delete(`${API_BASE_URL}/delete_inventory_variant`, {
        data: { id: materialId }
      });
      if (res.data.success) {
        setDetailsPanelItem(null);
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}/fetch_inventory`);
        const data = response.data?.data || [];
        const mapped = data.map((item) => {
          const stock = Number(item.current_stock || 0);
          const reorder = Number(item.reorder_level || item.reorder_point || 0);
          const cost = Number(item.standard_cost || 0);
          const statusMeta = mapStatus(stock, reorder);
          return {
            code: item.material_code,
            name: item.material_name,
            supplierName: item.preferred_supplier || '-',
            supplier: item.preferred_supplier ? `Supplier: ${item.preferred_supplier}` : 'Supplier: -',
            category: item.category || '-',
            gender: item.gender || '-',
            productId: item.product_id,
            color: item.color || '',
            material: item.material || '',
            careInstructions: item.care_instructions || '',
            ageRange: item.age_range || '',
            weight: item.weight || '',
            dimensions: item.dimensions || '',
            about: item.about || '',
            rawStock: stock,
            standardCost: cost,
            stock: stock.toLocaleString(),
            stockColor: statusMeta.stockColor,
            unit: item.unit_of_measurement || '-',
            reorder: reorder.toLocaleString(),
            status: statusMeta.status,
            statusClass: statusMeta.statusClass,
            materialId: item.material_id,
          };
        });
        setAllMaterials(mapped);
      } catch (err) {
        console.error('Failed to fetch inventory:', err);
        setError('Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Re-fetch when returning from GoodsInventory after adding a material
  useEffect(() => {
    if (location.state?.refreshInventory) {
      fetchInventory();
      // Clear the state so it doesn't fire again
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const categoryTabs = useMemo(() => {
    let filtered = allMaterials;

    if (activeGender !== 'All') {
      const selectedGender = activeGender.toLowerCase().trim();
      filtered = filtered.filter((item) => (item.gender || '').toLowerCase().trim() === selectedGender);
    }

    if (activeStockFilter !== 'All') {
      filtered = filtered.filter((item) => item.status === activeStockFilter);
    }

    const categories = Array.from(
      new Set(
        filtered
          .map((item) => (item.category || '').trim())
          .filter((c) => Boolean(c) && c !== '-')
      )
    );
    return ['All Materials', ...categories];
  }, [allMaterials, activeGender, activeStockFilter]);

  const genderTabs = useMemo(() => {
    const genders = Array.from(
      new Set(
        allMaterials
          .map((item) => (item.gender || '').trim())
          .filter((g) => Boolean(g) && g !== '-')
      )
    );
    return ['All', ...genders];
  }, [allMaterials]);

  const tabCounts = useMemo(() => {
    let filtered = allMaterials;

    if (activeGender !== 'All') {
      const selectedGender = activeGender.toLowerCase().trim();
      filtered = filtered.filter((item) => (item.gender || '').toLowerCase().trim() === selectedGender);
    }

    if (activeStockFilter !== 'All') {
      filtered = filtered.filter((item) => item.status === activeStockFilter);
    }

    const counts = { 'All Materials': filtered.length };
    categoryTabs.slice(1).forEach((cat) => {
      counts[cat] = filtered.filter(
        (item) => (item.category || '').toLowerCase().trim() === cat.toLowerCase().trim()
      ).length;
    });
    return counts;
  }, [allMaterials, categoryTabs, activeGender, activeStockFilter]);

  useEffect(() => {
    if (!categoryTabs.includes(activeTab)) {
      setActiveTab('All Materials');
    }
  }, [categoryTabs, activeTab]);

  const filteredMaterials = useMemo(() => {
    let filtered = allMaterials;

    if (activeStockFilter !== 'All') {
      filtered = filtered.filter((item) => item.status === activeStockFilter);
    }

    if (activeTab !== 'All Materials') {
      const selectedCategory = activeTab.toLowerCase().trim();
      filtered = filtered.filter(
        (item) => (item.category || '').toLowerCase().trim() === selectedCategory
      );
    }

    if (activeGender !== 'All') {
      const selectedGender = activeGender.toLowerCase().trim();
      filtered = filtered.filter(
        (item) => (item.gender || '').toLowerCase().trim() === selectedGender
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        (item.code || '').toLowerCase().includes(query) ||
        (item.name || '').toLowerCase().includes(query) ||
        (item.category || '').toLowerCase().includes(query) ||
        (item.supplierName || '').toLowerCase().includes(query) ||
        (item.status || '').toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allMaterials, activeStockFilter, activeTab, searchQuery, activeGender]);

  const totalValue = useMemo(() =>
    allMaterials.reduce((sum, m) => sum + m.rawStock * m.standardCost, 0)
  , [allMaterials]);

  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const pagedMaterials = filteredMaterials.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, activeGender, activeStockFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleStockCardClick = (nextFilter) => {
    setActiveStockFilter((prev) => (prev === nextFilter ? 'All' : nextFilter));
  };

  const handleAddMaterial = () => {
    navigate('/admin/add-product');
  };

  const handleUpdateStock = (item) => {
    setEditingItem({ ...item, updateStock: item.rawStock, updatePrice: item.standardCost });
    setShowEditModal(true);
  };

  const submitUpdate = async () => {
    if (!editingItem) return;
    try {
      setLoading(true);
      const res = await axios.patch(`${API_BASE_URL}/update_inventory/${editingItem.materialId}`, {
        current_stock: editingItem.updateStock,
        standard_cost: editingItem.updatePrice
      });
      if (res.data.success) {
        setShowEditModal(false);
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inv-container">
      
      {error && (
        <div style={{ padding: '12px 16px', marginBottom: '16px', background: '#fee', border: '1px solid #fcc', borderRadius: '8px', color: '#c33' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* --- Stats Row --- */}
      <div className="inv-stats-grid">
        <div
          className={`inv-stat-card is-clickable ${activeStockFilter === 'All' ? 'is-active' : ''}`}
          onClick={() => setActiveStockFilter('All')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveStockFilter('All');
            }
          }}
        >
          <div className="inv-stat-header">
            <span className="inv-stat-label">Total Materials</span>
            <Package size={20} className="icon-blue" />
          </div>
          {loading ? <div className="inv-skeleton-val" /> : <div className="inv-stat-value">{allMaterials.length}</div>}
        </div>
        <div
          className={`inv-stat-card is-clickable ${activeStockFilter === 'Low Stock' ? 'is-active' : ''}`}
          onClick={() => handleStockCardClick('Low Stock')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleStockCardClick('Low Stock');
            }
          }}
        >
          <div className="inv-stat-header">
            <span className="inv-stat-label">Low Stock Items</span>
            <AlertTriangle size={20} className="icon-orange" />
          </div>
          {loading ? <div className="inv-skeleton-val" /> : <div className="inv-stat-value">{allMaterials.filter(m => m.status === 'Low Stock').length}</div>}
        </div>
        <div
          className={`inv-stat-card is-clickable ${activeStockFilter === 'Out of Stock' ? 'is-active' : ''}`}
          onClick={() => handleStockCardClick('Out of Stock')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleStockCardClick('Out of Stock');
            }
          }}
        >
          <div className="inv-stat-header">
            <span className="inv-stat-label">Out of Stock</span>
            <XCircle size={20} className="icon-red" />
          </div>
          {loading ? <div className="inv-skeleton-val" /> : <div className="inv-stat-value">{allMaterials.filter(m => m.status === 'Out of Stock').length}</div>}
        </div>
        <div className="inv-stat-card">
          <div className="inv-stat-header">
            <span className="inv-stat-label">Total Value</span>
            <DollarSign size={20} className="icon-green" />
          </div>
          {loading ? <div className="inv-skeleton-val" /> : <div className="inv-stat-value">₹{totalValue.toLocaleString('en-IN')}</div>}
        </div>
      </div>

      {/* --- Main Content Split --- */}
      <div className="inv-layout-container">
        
        {/* Gender Sidebar */}
        <div className="inv-gender-sidebar">
          <h3 className="inv-sidebar-title">Gender Filter</h3>
          <ul className="inv-sidebar-list">
            {genderTabs.map(g => (
              <li 
                key={g} 
                className={`inv-sidebar-item ${activeGender === g ? 'active' : ''}`}
                onClick={() => setActiveGender(g)}
              >
                {g}
              </li>
            ))}
          </ul>
        </div>

        {/* Main Card */}
        <div className="inv-main-card">
        
        {/* Toolbar (Tabs + Search + Add) */}
        <div className="inv-toolbar">
          <div className="inv-tabs-scroll-box">
            <div className="inv-tabs-fixed">
              <div className="inv-tabs-container" role="tablist" aria-label="Material categories">
                {categoryTabs.map((tab) => (
                  <button
                    key={tab}
                    className={`inv-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                    <span className="inv-tab-badge">{tabCounts[tab] ?? 0}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="inv-actions">
            <div className="inv-search-wrapper">
              <div className="inv-search-icon">
                <Search size={18} className="icon-gray" />
              </div>
              <input 
                type="text" 
                placeholder="Search inventory..." 
                className="inv-search-input" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="inv-btn-primary" onClick={handleAddMaterial}>
              <Plus size={18} />
              Add Material
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="inv-table-wrapper">
          <table className="inv-table">
            <thead>
              <tr>
                <th style={{ width: '27%' }}>MATERIAL</th>
                <th style={{ width: '20%' }}>CATEGORY</th>
                <th style={{ width: '14%' }}>STOCK LEVEL</th>
                <th style={{ width: '9%' }}>UNIT</th>
                <th style={{ width: '14%' }}>STATUS</th>
                <th style={{ width: '16%', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <tr key={`skel-${i}`} className="inv-skeleton-row">
                  <td>
                    <div className="inv-skeleton-cell" style={{ width: '120px', height: '16px', marginBottom: '6px' }} />
                    <div className="inv-skeleton-cell" style={{ width: '80px', height: '12px' }} />
                  </td>
                  <td><div className="inv-skeleton-cell" style={{ width: '90px' }} /></td>
                  <td><div className="inv-skeleton-cell" style={{ width: '40px' }} /></td>
                  <td><div className="inv-skeleton-cell" style={{ width: '50px' }} /></td>
                  <td><div className="inv-skeleton-cell" style={{ width: '80px', height: '24px', borderRadius: '12px' }} /></td>
                  <td>
                    <div className="action-cell">
                      <div className="inv-skeleton-cell" style={{ width: '85px', height: '30px', borderRadius: '6px' }} />
                      <div className="inv-skeleton-cell" style={{ width: '30px', height: '30px', borderRadius: '6px' }} />
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && pagedMaterials.map((item, index) => (
                <tr key={index}>
                  {/* Material (name + code) */}
                  <td>
                    <div className="text-bold">{item.name}</div>
                    <div className="text-sub">Code: {item.code}</div>
                  </td>
                  
                  {/* Category */}
                  <td className="text-normal">{item.category}</td>
                  
                  {/* Stock */}
                  <td className={`font-stock ${item.stockColor}`}>{item.stock}</td>
                  
                  {/* Unit */}
                  <td className="text-normal">{item.unit}</td>
                  
                  {/* Status */}
                  <td>
                    <span className={`status-badge ${item.statusClass}`}>{item.status}</span>
                  </td>
                  
                  {/* Actions */}
                  <td>
                    <div className="action-cell">
                      <button className="btn-update" onClick={() => handleUpdateStock(item)}>Update Stock</button>
                      <button className="btn-page" style={{ padding: '7px' }} onClick={() => handleOpenDetails(item)}>
                         <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && pagedMaterials.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                    No materials found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="inv-footer">
          <span className="footer-text">Showing {pagedMaterials.length > 0 ? (safePage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(safePage * PAGE_SIZE, filteredMaterials.length)} of {filteredMaterials.length} items</span>
          <div className="pagination-group">
            <button className="btn-page" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
              <ChevronLeft size={16} /> Previous
            </button>
            <button className="btn-page" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
      </div>
      
      {/* --- Details Side Panel --- */}
      <div className={`inv-details-panel ${detailsPanelItem ? 'open' : ''}`}>
        {detailsPanelItem && (
          <form className="inv-details-form" onSubmit={handleUpdateFullDetails}>
            <div className="inv-details-header">
              <h2 className="inv-panel-title">Edit Details</h2>
              <button type="button" className="inv-close-btn" onClick={handleCloseDetails}>
                <X size={20} />
              </button>
            </div>
            
            <div className="inv-form-body">
              <div className="inv-form-group">
                <label className="inv-label">Product Name</label>
                <input required type="text" className="inv-input" value={detailsPanelItem.updateName} onChange={e => setDetailsPanelItem({...detailsPanelItem, updateName: e.target.value})} />
              </div>
              
              <div className="inv-form-row">
                <div className="inv-form-group half">
                  <label className="inv-label">SKU</label>
                  <input required type="text" className="inv-input" value={detailsPanelItem.updateCode} onChange={e => setDetailsPanelItem({...detailsPanelItem, updateCode: e.target.value})} />
                </div>
                <div className="inv-form-group half">
                  <label className="inv-label">Brand</label>
                  <input required type="text" className="inv-input" value={detailsPanelItem.updateSupplier} onChange={e => setDetailsPanelItem({...detailsPanelItem, updateSupplier: e.target.value})} />
                </div>
              </div>
              
              <div className="inv-form-row">
                <div className="inv-form-group half">
                  <label className="inv-label">Gender</label>
                  <select required className="inv-input" value={detailsPanelItem.updateGender} onChange={e => setDetailsPanelItem({...detailsPanelItem, updateGender: e.target.value})}>
                     <option value="men">Men</option>
                     <option value="women">Women</option>
                     <option value="children">Children</option>
                     <option value="babies">Babies</option>
                     <option value="unisex">Unisex</option>
                     <option value="sports">Sports</option>
                  </select>
                </div>
                <div className="inv-form-group half">
                  <label className="inv-label">Color</label>
                  <input required type="text" className="inv-input" value={detailsPanelItem.updateColor} onChange={e => setDetailsPanelItem({...detailsPanelItem, updateColor: e.target.value})} />
                </div>
              </div>
              
              <div className="inv-form-row">
                <div className="inv-form-group half">
                  <label className="inv-label">Material</label>
                  <input type="text" className="inv-input" value={detailsPanelItem.updateMaterial} onChange={e => setDetailsPanelItem({...detailsPanelItem, updateMaterial: e.target.value})} />
                </div>
                <div className="inv-form-group half">
                  <label className="inv-label">Age Range</label>
                  <input type="text" className="inv-input" value={detailsPanelItem.updateAge} onChange={e => setDetailsPanelItem({...detailsPanelItem, updateAge: e.target.value})} />
                </div>
              </div>

              <div className="inv-form-row">
                <div className="inv-form-group half">
                  <label className="inv-label">Weight</label>
                  <input type="number" step="0.01" className="inv-input" value={detailsPanelItem.updateWeight} onChange={e => setDetailsPanelItem({...detailsPanelItem, updateWeight: e.target.value})} />
                </div>
                <div className="inv-form-group half">
                  <label className="inv-label">Dimensions</label>
                  <input type="text" className="inv-input" value={detailsPanelItem.updateDimensions} onChange={e => setDetailsPanelItem({...detailsPanelItem, updateDimensions: e.target.value})} />
                </div>
              </div>
              
              <div className="inv-form-group">
                <label className="inv-label">Care Instructions</label>
                <input type="text" className="inv-input" value={detailsPanelItem.updateCare} onChange={e => setDetailsPanelItem({...detailsPanelItem, updateCare: e.target.value})} />
              </div>

              <div className="inv-form-group">
                <label className="inv-label">About Product</label>
                <textarea required className="inv-textarea" value={detailsPanelItem.updateAbout} onChange={e => setDetailsPanelItem({...detailsPanelItem, updateAbout: e.target.value})} />
              </div>

              <div className="inv-form-row">
                <div className="inv-form-group half">
                  <label className="inv-label">Stock Quantity ({detailsPanelItem.unit})</label>
                  <input required type="number" className="inv-input" value={detailsPanelItem.updateStock} onChange={e => setDetailsPanelItem({...detailsPanelItem, updateStock: e.target.value})} />
                </div>
                <div className="inv-form-group half">
                  <label className="inv-label">Price (₹)</label>
                  <input required type="number" className="inv-input" value={detailsPanelItem.updatePrice} onChange={e => setDetailsPanelItem({...detailsPanelItem, updatePrice: e.target.value})} />
                </div>
              </div>
            </div>
            
            <div className="inv-details-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="btn-page" style={{ color: '#ef4444', borderColor: '#fecaca', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center' }} onClick={() => handleDeleteProduct(detailsPanelItem.materialId)}>
                <Trash2 size={16} style={{ marginRight: '6px' }}/> Delete Size
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn-page" onClick={handleCloseDetails}>Cancel</button>
                <button type="submit" className="inv-btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Modal for Quick Edit */}
      {showEditModal && editingItem && (
        <div className="inv-modal-overlay">
          <div className="inv-modal-content">
            <div className="inv-details-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', marginBottom: '20px' }}>
              <h3 className="inv-panel-title">Update Stock & Price</h3>
              <button type="button" className="inv-close-btn" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>
              Editing Variant: <strong>{editingItem.name}</strong> <span style={{ fontSize: '13px', opacity: 0.8 }}>({editingItem.code})</span>
            </p>

            <div className="inv-form-group">
              <label className="inv-label">New Stock Quantity ({editingItem.unit})</label>
              <input 
                type="number" 
                className="inv-input" 
                value={editingItem.updateStock} 
                onChange={e => setEditingItem({...editingItem, updateStock: e.target.value})} 
              />
            </div>
            
            <div className="inv-form-group" style={{ marginBottom: '30px' }}>
              <label className="inv-label">New Price (₹)</label>
              <input 
                type="number" 
                className="inv-input" 
                value={editingItem.updatePrice} 
                onChange={e => setEditingItem({...editingItem, updatePrice: e.target.value})} 
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn-page" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="inv-btn-primary" onClick={handleSaveStock} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;