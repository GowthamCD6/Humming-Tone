
import React, { useState, useEffect, useMemo } from 'react';
import './ProductData.css';
import demoImage from '../../../assets/demo.jpeg';
import axios from 'axios';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

const API_BASE_URL = 'http://localhost:5000'; // Change to your API URL

const getAxiosConfig = () => {
  const token = localStorage.getItem('adminToken');
  return token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
};

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [productToRestore, setProductToRestore] = useState(null);
  const [productPage, setProductPage] = useState(1);
  const [productLimit, setProductLimit] = useState(10);
  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    status: ''
  });

  // Fetch deleted products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/fetch_deleted_products`, getAxiosConfig());
      
      if (Array.isArray(response.data)) {
        const formattedProducts = response.data.map(p => ({
          ...p,
          _id: p.id,
          image: p.image_path ? `${API_BASE_URL}/${p.image_path.replace(/\\/g, '/')}` : demoImage,
          category: p.subcategory || 'General',
          price: p.price || 0,
          stock: p.stock_quantity || 0,
          status: p.is_active ? 'Active' : 'Inactive'
        }));
        setProducts(formattedProducts);
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      gender: '',
      status: ''
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.category && product.category !== filters.category) return false;
      if (filters.gender && product.gender !== filters.gender) return false;
      if (filters.status && product.status !== filters.status) return false;
      return true;
    });
  }, [products, filters]);

  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / productLimit));
  const safeProductPage = Math.min(Math.max(1, productPage), totalProductPages);
  const pagedProducts = useMemo(() => {
    const start = (safeProductPage - 1) * productLimit;
    return filteredProducts.slice(start, start + productLimit);
  }, [filteredProducts, safeProductPage, productLimit]);

  const stats = useMemo(() => ({
    total: products.length,
    filtered: filteredProducts.length,
    selected: selectedProducts.length,
    active: products.filter((product) => product.status === 'Active').length,
    inactive: products.filter((product) => product.status === 'Inactive').length
  }), [products, filteredProducts, selectedProducts]);

  useEffect(() => {
    setProductPage(1);
    setSelectedProducts([]);
  }, [filters.category, filters.gender, filters.status, productLimit]);

  useEffect(() => {
    if (productPage > totalProductPages) {
      setProductPage(totalProductPages);
    }
  }, [productPage, totalProductPages]);

  // Toggle product selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  // Select all products
  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id));
    }
  };

  // Delete all products
  const deleteAllProducts = async () => {
    if (products.length === 0) {
      alert('No products to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ALL ${products.length} products? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/products`, getAxiosConfig());
      
      if (response.data.success) {
        alert(response.data.message);
        setProducts([]);
        setSelectedProducts([]);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting all products:', error);
      alert('Failed to delete products. Please try again.');
    }
  };

  // Delete selected products
  const deleteSelectedProducts = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select products to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) {
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/products/delete-multiple`, {
        productIds: selectedProducts
      });
      
      if (response.data.success) {
        alert(response.data.message);
        setSelectedProducts([]);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting selected products:', error);
      alert('Failed to delete products. Please try again.');
    }
  };

  // Delete single product
  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/products/${productId}`, getAxiosConfig());
      
      if (response.data.success) {
        alert(response.data.message);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  // Open restore confirmation modal
  const openRestoreModal = (product) => {
    setProductToRestore(product);
    setShowRestoreModal(true);
  };

  // Restore product status to Active
  const restoreProductStatus = async () => {
    if (!productToRestore) return;
    try {
      const response = await axios.patch(`${API_BASE_URL}/admin/restore_product/${productToRestore._id}`, {}, getAxiosConfig());
      
      if (response.data.success) {
        setShowRestoreModal(false);
        setProductToRestore(null);
        setSelectedProducts([]);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error restoring product:', error);
    }
  };

  // Get unique values for filters from all products
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
  const genders = [...new Set(products.map(p => p.gender))].filter(Boolean);
  const statuses = ['Active', 'Inactive'];

  const hasActiveFilters = filters.category || filters.gender || filters.status;

  const formatCurrency = (value) => {
    const num = Number(value || 0);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="all-products-container">
        <div className="loading-state">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="all-products-container">

      <div className="inv-stats-grid pd-stats-grid">
        <div className="inv-stat-card pd-stat-card">
          <div className="inv-stat-header">
            <div className="inv-stat-label-wrap">
              <span className="pd-stat-icon pd-stat-icon-blue"><Inventory2Icon fontSize="inherit" /></span>
              <div className="inv-stat-label">TOTAL RECORDS</div>
            </div>
          </div>
          <div className="inv-stat-value pd-stat-value-blue">{stats.total}</div>
          <div className="pd-stat-note">All deleted product entries</div>
        </div>

        <div className="inv-stat-card pd-stat-card">
          <div className="inv-stat-header">
            <div className="inv-stat-label-wrap">
              <span className="pd-stat-icon pd-stat-icon-green"><CheckCircleIcon fontSize="inherit" /></span>
              <div className="inv-stat-label">ACTIVE</div>
            </div>
          </div>
          <div className="inv-stat-value pd-stat-value-green">{stats.active}</div>
          <div className="pd-stat-note">Currently restorable records</div>
        </div>

        <div className="inv-stat-card pd-stat-card">
          <div className="inv-stat-header">
            <div className="inv-stat-label-wrap">
              <span className="pd-stat-icon pd-stat-icon-red"><BlockIcon fontSize="inherit" /></span>
              <div className="inv-stat-label">INACTIVE</div>
            </div>
          </div>
          <div className="inv-stat-value pd-stat-value-red">{stats.inactive}</div>
          <div className="pd-stat-note">Records currently disabled</div>
        </div>

        <div className="inv-stat-card pd-stat-card">
          <div className="inv-stat-header">
            <div className="inv-stat-label-wrap">
              <span className="pd-stat-icon pd-stat-icon-orange"><DeleteSweepIcon fontSize="inherit" /></span>
              <div className="inv-stat-label">SELECTED</div>
            </div>
          </div>
          <div className="inv-stat-value pd-stat-value-orange">{stats.selected}</div>
          <div className="pd-stat-note">Ready for bulk delete</div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="pd-card">
        {/* Inline Filters Row - matching ManageProduct style */}
        <div className="pd-filters-bar">
          <h3 className="pd-table-title">Archived Products</h3>

          <select
            className="pd-filter-select"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="pd-filter-select"
            value={filters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
          >
            <option value="">All Genders</option>
            {genders.map(gender => (
              <option key={gender} value={gender}>{gender}</option>
            ))}
          </select>

          <select
            className="pd-filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button className="pd-btn-clear" onClick={clearFilters}>
              Clear
            </button>
          )}

          <div className="pd-filters-right-group">
            <span className="pd-products-count">{filteredProducts.length} of {products.length}</span>
            {selectedProducts.length > 0 && (
              <button className="pd-btn-action pd-btn-delete-selected" onClick={deleteSelectedProducts}>
                Delete Selected ({selectedProducts.length})
              </button>
            )}
            {products.length > 0 && (
              <button className="pd-btn-action pd-btn-delete-all" onClick={deleteAllProducts}>
                Delete All
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <table className="pd-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th style={{ width: '25%' }}>Product</th>
              <th style={{ width: '14%' }}>SKU</th>
              <th style={{ width: '11%' }}>Price</th>
              <th style={{ width: '13%' }}>Category</th>
              <th style={{ width: '10%' }}>Gender</th>
              <th style={{ width: '10%' }}>Status</th>
              <th className="pd-text-center" style={{ width: '14%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="pd-empty">
                  No archived products found
                </td>
              </tr>
            ) : (
              pagedProducts.map(product => (
                <tr key={product._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => toggleProductSelection(product._id)}
                    />
                  </td>
                  <td>
                    <div className="pd-product-cell">
                      <img
                        src={product.image || demoImage}
                        alt={product.name}
                        className="pd-product-img"
                        onError={(e) => { e.target.src = demoImage; }}
                      />
                      <span className="pd-product-name">{product.name}</span>
                    </div>
                  </td>
                  <td>{product.sku}</td>
                  <td><span className="pd-amount">{formatCurrency(product.price)}</span></td>
                  <td><span className="pd-badge pd-badge-gray">{product.category}</span></td>
                  <td>
                    <span className="pd-badge pd-badge-blue">
                      {product.gender ? product.gender.charAt(0).toUpperCase() + product.gender.slice(1).toLowerCase() : ''}
                    </span>
                  </td>
                  <td>
                    <span className={`pd-badge ${product.status === 'Active' ? 'pd-badge-green' : 'pd-badge-red'}`}>
                      {product.status || 'Active'}
                    </span>
                  </td>
                  <td className="pd-text-center">
                    <div className="pd-actions">
                      <button
                        className="pd-btn-restore"
                        onClick={() => openRestoreModal(product)}
                      >
                        Restore
                      </button>
                      <button
                        className="pd-btn-delete"
                        onClick={() => deleteProduct(product._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pd-table-footer">
          <span className="pd-footer-text">
            Showing {filteredProducts.length === 0 ? 0 : (safeProductPage - 1) * productLimit + 1}–{Math.min(safeProductPage * productLimit, filteredProducts.length)} of {filteredProducts.length} products
          </span>

          <div className="pd-pagination-group">
            <label className="pd-limit-label" htmlFor="product-limit-select">Rows</label>
            <select
              id="product-limit-select"
              className="pd-limit-select"
              value={productLimit}
              onChange={(e) => setProductLimit(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            <button
              className="pd-page-btn"
              onClick={() => setProductPage((page) => Math.max(1, page - 1))}
              disabled={safeProductPage === 1}
            >
              Previous
            </button>
            <span className="pd-page-indicator">Page {safeProductPage} / {totalProductPages}</span>
            <button
              className="pd-page-btn"
              onClick={() => setProductPage((page) => Math.min(totalProductPages, page + 1))}
              disabled={safeProductPage === totalProductPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* RESTORE CONFIRMATION MODAL */}
      {showRestoreModal && productToRestore && (
        <div className="modal-overlay" onClick={() => setShowRestoreModal(false)}>
          <div className="modal-content modal-content--compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Restore Product</h2>
              <button className="modal-close" onClick={() => setShowRestoreModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="delete-modal-text">
                Are you sure you want to restore "{productToRestore.name}"? This will make the product active and visible in the Manage Products page.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowRestoreModal(false)}>CANCEL</button>
              <button className="btn-save" onClick={restoreProductStatus}>RESTORE PRODUCT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;