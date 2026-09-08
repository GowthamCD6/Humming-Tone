import React, { useState, useMemo, useEffect, useCallback } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelIcon from '@mui/icons-material/Cancel';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import PaletteIcon from '@mui/icons-material/Palette';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CustomGarmentThumb from '../../../components/CustomGarmentThumb/CustomGarmentThumb';
import { API_BASE_URL } from '../../../utils/apiConfig';
import './ManageCustomizeOrders.css';

const STATUS_CHIPS = [
  { key: 'All Statuses', label: 'All', color: '#64748b' },
  { key: 'pending', label: 'Pending', color: '#f59e0b' },
  { key: 'in_production', label: 'In Production', color: '#3b82f6' },
  { key: 'confirmed', label: 'Confirmed', color: '#6366f1' },
  { key: 'packed', label: 'Packed', color: '#10b981' },
  { key: 'shipped', label: 'Shipped', color: '#8b5cf6' },
  { key: 'delivered', label: 'Delivered', color: '#16a34a' },
  { key: 'cancelled', label: 'Cancelled', color: '#ef4444' },
];

const getTodayInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ManageCustomizeOrders() {
  const todayInputValue = getTodayInputValue();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const [orderLimit, setOrderLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'All Statuses',
    startDate: '',
    endDate: '',
  });

  // Selected Order for Modal inspection
  const [inspectOrder, setInspectOrder] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState(null);

  // Bulk selection
  const [selectedOrders, setSelectedOrders] = useState(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/customize-orders`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setOrders(Array.isArray(data.orders) ? data.orders : (Array.isArray(data) ? data : []));
    } catch (error) {
      console.error("Fetch customized orders error:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (field, value) => {
    if ((field === 'startDate' || field === 'endDate') && value && value > todayInputValue) {
      value = todayInputValue;
    }
    setFilters(prev => ({ ...prev, [field]: value }));
    setOrderPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'All Statuses',
      startDate: '',
      endDate: '',
    });
    setSearchQuery('');
    setOrderPage(1);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setStatusUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/admin/customize-orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus, production_status: newStatus })
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (inspectOrder && inspectOrder.id === orderId) {
          setInspectOrder(prev => ({ ...prev, status: newStatus }));
        }
        setUpdateFeedback("Status updated successfully!");
        setTimeout(() => setUpdateFeedback(null), 3000);
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      console.error("Status update error:", e);
      alert("Error updating order status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status filter
      if (filters.status !== 'All Statuses') {
        const ordStatus = (order.status || '').toLowerCase();
        if (ordStatus !== filters.status.toLowerCase()) {
          return false;
        }
      }

      // Date range filter
      if (filters.startDate) {
        const orderDate = new Date(order.created_at);
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) return false;
      }

      if (filters.endDate) {
        const orderDate = new Date(order.created_at);
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const num = (order.order_number || '').toLowerCase();
        const name = (order.customer_name || '').toLowerCase();
        const email = (order.customer_email || '').toLowerCase();
        const phone = (order.customer_phone || '').toLowerCase();
        const frontText = (order.front_text || '').toLowerCase();
        const backText = (order.back_text || '').toLowerCase();
        return (
          num.includes(q) ||
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          frontText.includes(q) ||
          backText.includes(q)
        );
      }

      return true;
    });
  }, [orders, filters, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => (o.status || '').toLowerCase() === 'pending').length;
    const inProd = orders.filter(o => (o.status || '').toLowerCase() === 'in_production').length;
    const delivered = orders.filter(o => (o.status || '').toLowerCase() === 'delivered').length;
    const cancelled = orders.filter(o => (o.status || '').toLowerCase() === 'cancelled').length;
    return { total, pending, inProd, delivered, cancelled };
  }, [orders]);

  // Pagination
  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / orderLimit));
  const safeOrderPage = Math.min(orderPage, totalOrderPages);
  const pagedOrders = useMemo(() => {
    const start = (safeOrderPage - 1) * orderLimit;
    return filteredOrders.slice(start, start + orderLimit);
  }, [filteredOrders, safeOrderPage, orderLimit]);

  const handleSelectAll = () => {
    if (selectedOrders.size === pagedOrders.length && pagedOrders.length > 0) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(pagedOrders.map(o => o.id)));
    }
  };

  const handleSelectOrder = (id) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'All Statuses') count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [filters, searchQuery]);

  const downloadStatement = () => {
    const rows = filteredOrders;
    if (rows.length === 0) {
      alert("No orders available to export.");
      return;
    }

    const headers = [
      'Order Number',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Date',
      'Garment Color',
      'Fabric',
      'Size',
      'Qty',
      'Front Text',
      'Back Text',
      'Total Amount',
      'Status'
    ];

    const escapeCsv = (val) => {
      const s = String(val ?? '');
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const lines = [headers.map(escapeCsv).join(',')];
    rows.forEach(o => {
      lines.push([
        o.order_number,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        formatDate(o.created_at),
        o.garment_color_name,
        o.fabric_name,
        o.size,
        o.quantity || 1,
        o.front_text || '',
        o.back_text || '',
        parseFloat(o.total_price || 0).toFixed(2),
        o.status
      ].map(escapeCsv).join(','));
    });

    const csv = `\uFEFF${lines.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Customized_Orders_${todayInputValue}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="manage-orders-container mco-container">
      {/* ===== STATS CARDS (EXACT MANAGE ORDER STYLE) ===== */}
      <div className="inv-stats-grid mo-stats-grid">
        <div className="inv-stat-card mo-stat-card">
          <div className="inv-stat-header">
            <div className="inv-stat-label-wrap">
              <span className="mo-stat-icon mo-stat-icon-blue">
                <PaletteIcon fontSize="inherit" />
              </span>
              <div className="inv-stat-label">TOTAL CUSTOM ORDERS</div>
            </div>
          </div>
          {loading ? (
            <div className="mo-skeleton-val" />
          ) : (
            <div className="inv-stat-value mo-stat-value-blue">{stats.total}</div>
          )}
          <div className="mo-stat-note">Bespoke apparel orders</div>
        </div>

        <div className="inv-stat-card mo-stat-card">
          <div className="inv-stat-header">
            <div className="inv-stat-label-wrap">
              <span className="mo-stat-icon mo-stat-icon-orange">
                <HourglassBottomIcon fontSize="inherit" />
              </span>
              <div className="inv-stat-label">PENDING PREP</div>
            </div>
          </div>
          {loading ? (
            <div className="mo-skeleton-val" />
          ) : (
            <div className="inv-stat-value mo-stat-value-orange">{stats.pending}</div>
          )}
          <div className="mo-stat-note">Waiting for artwork review</div>
        </div>

        <div className="inv-stat-card mo-stat-card">
          <div className="inv-stat-header">
            <div className="inv-stat-label-wrap">
              <span className="mo-stat-icon mo-stat-icon-blue" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                <LocalShippingIcon fontSize="inherit" />
              </span>
              <div className="inv-stat-label">IN PRODUCTION</div>
            </div>
          </div>
          {loading ? (
            <div className="mo-skeleton-val" />
          ) : (
            <div className="inv-stat-value" style={{ color: '#4f46e5', fontSize: '32px', fontWeight: 800 }}>
              {stats.inProd}
            </div>
          )}
          <div className="mo-stat-note">Currently being printed</div>
        </div>

        <div className="inv-stat-card mo-stat-card">
          <div className="inv-stat-header">
            <div className="inv-stat-label-wrap">
              <span className="mo-stat-icon mo-stat-icon-green">
                <CheckCircleIcon fontSize="inherit" />
              </span>
              <div className="inv-stat-label">DELIVERED</div>
            </div>
          </div>
          {loading ? (
            <div className="mo-skeleton-val" />
          ) : (
            <div className="inv-stat-value mo-stat-value-green">{stats.delivered}</div>
          )}
          <div className="mo-stat-note">Completed & fulfilled</div>
        </div>
      </div>

      {/* ===== STATUS CHIPS ===== */}
      <div className="mo-status-chips">
        {STATUS_CHIPS.map(chip => (
          <button
            key={chip.key}
            className={`mo-chip ${filters.status === chip.key ? 'mo-chip-active' : ''}`}
            style={{
              '--chip-color': chip.color,
              '--chip-bg': filters.status === chip.key ? chip.color : 'transparent'
            }}
            onClick={() => handleFilterChange('status', chip.key)}
          >
            <span
              className="mo-chip-dot"
              style={{ background: chip.color }}
            />
            {chip.label}
            {chip.key !== 'All Statuses' && (
              <span className="mo-chip-count">
                {orders.filter(o =>
                  (o.status || '').toLowerCase() === chip.key.toLowerCase()
                ).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ===== FILTER PANEL ===== */}
      <div className="filter-prototype-card">
        <button
          type="button"
          className="filter-prototype-bar"
          onClick={() => setShowFilterPanel(open => !open)}
        >
          <div className="filter-prototype-left">
            <span className="filter-title-icon">
              <FilterAltIcon fontSize="inherit" />
            </span>
            <div>
              <div className="section-title">Filter Customized Orders</div>
              <div className="filter-prototype-subtitle">
                {activeFilterCount > 0
                  ? `${activeFilterCount} active filters applied`
                  : 'Click to open date range and search filters'}
              </div>
            </div>
          </div>
          <div className="filter-meta">
            <SearchIcon fontSize="inherit" />
            <span>{filteredOrders.length} matched / {orders.length} total</span>
          </div>
        </button>

        {showFilterPanel && (
          <div className="filter-panel">
            <div className="filter-panel-row">
              <div className="input-group">
                <label htmlFor="mco-search">SEARCH</label>
                <input
                  id="mco-search"
                  type="text"
                  placeholder="Order #, customer, email, text..."
                  className="form-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="status-filter">STATUS</label>
                <select
                  id="status-filter"
                  className="form-input"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {STATUS_CHIPS.map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="start-date">START DATE</label>
                <input
                  id="start-date"
                  type="date"
                  className="form-input"
                  max={todayInputValue}
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="end-date">END DATE</label>
                <input
                  id="end-date"
                  type="date"
                  className="form-input"
                  max={todayInputValue}
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-actions-row">
              <button
                type="button"
                className="clear-btn"
                onClick={handleClearFilters}
              >
                <RotateLeftIcon fontSize="small" /> Clear Filters
              </button>

              <button
                type="button"
                className="download-statement-btn"
                onClick={downloadStatement}
              >
                <DownloadIcon fontSize="small" /> Export CSV Statement
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== TABLE CONTAINER (MATCHING MANAGE ORDERS) ===== */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th className="mo-checkbox-th">
                  <input
                    type="checkbox"
                    className="mo-checkbox"
                    checked={selectedOrders.size === pagedOrders.length && pagedOrders.length > 0}
                    onChange={handleSelectAll}
                    aria-label="Select all orders"
                  />
                </th>
                <th>ORDER</th>
                <th>PREVIEW</th>
                <th>CUSTOMER</th>
                <th>DATE & TIME</th>
                <th>GARMENT SPECS</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>PAYMENT</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: orderLimit }).map((_, index) => (
                  <tr key={`skel-${index}`} className="mo-skeleton-row">
                    <td><div className="mo-skeleton-cell" style={{ width: '18px', height: '18px' }} /></td>
                    <td><div className="mo-skeleton-cell" style={{ width: '90px' }} /></td>
                    <td><div className="mo-skeleton-cell" style={{ width: '48px', height: '56px', borderRadius: '6px' }} /></td>
                    <td><div className="mo-skeleton-cell" style={{ width: '130px', height: '14px' }} /></td>
                    <td><div className="mo-skeleton-cell" style={{ width: '80px' }} /></td>
                    <td><div className="mo-skeleton-cell" style={{ width: '120px' }} /></td>
                    <td><div className="mo-skeleton-cell" style={{ width: '70px' }} /></td>
                    <td><div className="mo-skeleton-cell" style={{ width: '80px', height: '24px', borderRadius: '12px' }} /></td>
                    <td><div className="mo-skeleton-cell" style={{ width: '60px' }} /></td>
                    <td><div className="mo-skeleton-cell" style={{ width: '75px', height: '32px', borderRadius: '4px' }} /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="10">
                    <div className="no-orders">
                      No customized orders found matching your filters.
                    </div>
                  </td>
                </tr>
              ) : (
                pagedOrders.map((order) => {
                  const hasFrontArtwork = Boolean(order.front_image_url || order.front_text);
                  const hasBackArtwork = Boolean(order.back_image_url || order.back_text);

                  return (
                    <tr
                      key={order.id}
                      className={selectedOrders.has(order.id) ? 'mo-row-selected' : ''}
                    >
                      <td className="mo-checkbox-td" data-label="Select">
                        <input
                          type="checkbox"
                          className="mo-checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                          aria-label={`Select order ${order.order_number}`}
                        />
                      </td>

                      <td className="order-id" data-label="Order">
                        <span className="order-id-num">{order.order_number}</span>
                      </td>

                      <td data-label="Preview" style={{ textAlign: 'center' }}>
                        <div className="mco-thumb-wrap">
                          {order.front_preview_url ? (
                            <img
                              src={order.front_preview_url}
                              alt="Custom preview"
                              className="mco-table-thumb"
                            />
                          ) : (
                            <CustomGarmentThumb item={order} size={48} showBadge={false} />
                          )}
                        </div>
                      </td>

                      <td className="customer-info" data-label="Customer">
                        <div className="cust-name">{order.customer_name}</div>
                        <div className="cust-email">{order.customer_email}</div>
                        {order.customer_phone && (
                          <div className="cust-phone-small">{order.customer_phone}</div>
                        )}
                      </td>

                      <td className="date-info" data-label="Date">
                        <div className="date-main">{formatDate(order.created_at)}</div>
                        <div className="date-time">{formatTime(order.created_at)}</div>
                      </td>

                      <td data-label="Garment Specs">
                        <div className="mco-garment-cell">
                          <div className="mco-garment-title">
                            <span
                              className="mco-color-pip"
                              style={{ backgroundColor: order.garment_color_hex || '#e2e8f0' }}
                            />
                            <strong>{order.garment_color_name || 'Custom'}</strong> • {order.size || 'M'}
                          </div>
                          <div className="mco-garment-sub">
                            {order.fabric_name || 'Bio-Washed Cotton'} (x{order.quantity || 1})
                          </div>
                          <div className="mco-prints-badges">
                            {hasFrontArtwork && <span className="mco-print-tag front">Front Print</span>}
                            {hasBackArtwork && <span className="mco-print-tag back">Back Print</span>}
                          </div>
                        </div>
                      </td>

                      <td className="total-price" data-label="Total">
                        ₹{parseFloat(order.total_price || order.unit_price || 0).toFixed(2)}
                      </td>

                      <td data-label="Status">
                        <span className={`status-badge ${(order.status || 'pending').toLowerCase().replace(/ /g, '_')}`}>
                          {(order.status || 'pending').replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="payment-info" data-label="Payment">
                        <span className="payment-badge">
                          {order.payment_id ? 'PAID' : 'PAID'}
                        </span>
                      </td>

                      <td className="action-info" data-label="Action">
                        <button
                          className="view-order-btn"
                          onClick={() => setInspectOrder(order)}
                          title="View Full Customization Specification"
                        >
                          <VisibilityIcon /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ===== TABLE FOOTER PAGINATION ===== */}
        <div className="table-footer">
          <div className="footer-text">
            Showing {filteredOrders.length === 0 ? 0 : (safeOrderPage - 1) * orderLimit + 1}–{Math.min(safeOrderPage * orderLimit, filteredOrders.length)} of {filteredOrders.length} orders
          </div>

          <div className="pagination-group">
            <label className="limit-label" htmlFor="order-limit-select">Rows</label>
            <select
              id="order-limit-select"
              className="limit-select"
              value={orderLimit}
              onChange={(e) => {
                setOrderLimit(Number(e.target.value));
                setOrderPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            <button
              className="page-btn"
              onClick={() => setOrderPage(p => Math.max(1, p - 1))}
              disabled={safeOrderPage === 1}
            >
              Previous
            </button>
            <span className="page-indicator">Page {safeOrderPage} / {totalOrderPages}</span>
            <button
              className="page-btn"
              onClick={() => setOrderPage(p => Math.min(totalOrderPages, p + 1))}
              disabled={safeOrderPage === totalOrderPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ===== INSPECT CUSTOM ORDER MODAL ===== */}
      {inspectOrder && (
        <div className="mco-modal-backdrop" onClick={() => setInspectOrder(null)}>
          <div className="mco-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="mco-modal-header">
              <div className="mco-modal-header-left">
                <PaletteIcon style={{ color: '#4f46e5' }} />
                <div>
                  <h3 className="mco-modal-order-id">
                    Custom Order {inspectOrder.order_number}
                  </h3>
                  <span className="mco-modal-date">
                    Placed on {formatDate(inspectOrder.created_at)} at {formatTime(inspectOrder.created_at)}
                  </span>
                </div>
              </div>
              <button
                className="mco-modal-close"
                onClick={() => setInspectOrder(null)}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mco-modal-body">
              {/* Customer & Garment Top Grid */}
              <div className="mco-modal-info-grid">
                <div className="mco-info-card">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {inspectOrder.customer_name}</p>
                  <p><strong>Email:</strong> {inspectOrder.customer_email}</p>
                  <p><strong>Phone:</strong> {inspectOrder.customer_phone || '—'}</p>
                  <p><strong>Shipping Address:</strong> {inspectOrder.customer_address || '—'}, {inspectOrder.city} {inspectOrder.pincode}</p>
                </div>

                <div className="mco-info-card">
                  <h4>Garment Details</h4>
                  <p>
                    <strong>Color:</strong> {inspectOrder.garment_color_name} &nbsp;
                    <span
                      className="mco-color-pip"
                      style={{ backgroundColor: inspectOrder.garment_color_hex || '#e2e8f0' }}
                    />
                  </p>
                  <p><strong>Fabric:</strong> {inspectOrder.fabric_name} ({inspectOrder.fabric_weight || '180 GSM'})</p>
                  <p><strong>Size:</strong> {inspectOrder.size} &nbsp; | &nbsp; <strong>Quantity:</strong> {inspectOrder.quantity || 1}</p>
                  <p><strong>Total Price:</strong> ₹{parseFloat(inspectOrder.total_price || inspectOrder.unit_price || 0).toFixed(2)}</p>
                </div>
              </div>

              {/* Visual Showcase: Front & Back Sides */}
              <div className="mco-modal-sides-row">
                {/* Front Side */}
                <div className="mco-modal-side-card">
                  <div className="side-title-badge">FRONT PRINT DESIGN</div>
                  <div className="side-image-container">
                    {inspectOrder.front_preview_url ? (
                      <img
                        src={inspectOrder.front_preview_url}
                        alt="Front Design"
                        className="side-preview-img"
                      />
                    ) : (
                      <div className="no-side-preview">No Front Preview</div>
                    )}
                  </div>

                  <div className="side-specs-list">
                    <div className="side-spec-item">
                      <span className="spec-name">Placement Zone:</span>
                      <span className="spec-val">{(inspectOrder.front_placement || 'Left Chest').toUpperCase()}</span>
                    </div>

                    {inspectOrder.front_image_url ? (
                      <div className="side-spec-item artwork">
                        <span className="spec-name">
                          {inspectOrder.front_design_type === 'upload' ? 'User Upload Artwork:' : 'Gallery Motif:'}
                        </span>
                        <a
                          href={inspectOrder.front_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-download-highres"
                        >
                          <DownloadIcon fontSize="small" /> Download Original Artwork
                        </a>
                      </div>
                    ) : (
                      <div className="side-spec-item muted">No Artwork Image</div>
                    )}

                    {inspectOrder.front_text ? (
                      <div className="side-spec-item text-spec">
                        <span className="spec-name">Custom Typography:</span>
                        <div className="custom-text-quote">
                          "{inspectOrder.front_text}"
                          {inspectOrder.front_font && <span className="font-tag">({inspectOrder.front_font})</span>}
                          {inspectOrder.front_text_color && (
                            <span
                              className="color-dot"
                              style={{ backgroundColor: inspectOrder.front_text_color }}
                              title={`Color: ${inspectOrder.front_text_color}`}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="side-spec-item muted">No Custom Text</div>
                    )}

                    <div className="side-coords-tag">
                      Scale: {inspectOrder.front_scale || 1}x | Rot: {inspectOrder.front_rotation || 0}° | Pos: ({inspectOrder.front_pos_x || 0}, {inspectOrder.front_pos_y || 0})
                    </div>
                  </div>
                </div>

                {/* Back Side */}
                <div className="mco-modal-side-card">
                  <div className="side-title-badge">BACK PRINT DESIGN</div>
                  <div className="side-image-container">
                    {inspectOrder.back_preview_url ? (
                      <img
                        src={inspectOrder.back_preview_url}
                        alt="Back Design"
                        className="side-preview-img"
                      />
                    ) : (
                      <div className="no-side-preview">Plain Back (No print)</div>
                    )}
                  </div>

                  <div className="side-specs-list">
                    <div className="side-spec-item">
                      <span className="spec-name">Placement Zone:</span>
                      <span className="spec-val">{(inspectOrder.back_placement || 'Full Back').toUpperCase()}</span>
                    </div>

                    {inspectOrder.back_image_url ? (
                      <div className="side-spec-item artwork">
                        <span className="spec-name">
                          {inspectOrder.back_design_type === 'upload' ? 'User Upload Artwork:' : 'Gallery Motif:'}
                        </span>
                        <a
                          href={inspectOrder.back_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-download-highres"
                        >
                          <DownloadIcon fontSize="small" /> Download Original Artwork
                        </a>
                      </div>
                    ) : (
                      <div className="side-spec-item muted">No Back Artwork</div>
                    )}

                    {inspectOrder.back_text ? (
                      <div className="side-spec-item text-spec">
                        <span className="spec-name">Custom Typography:</span>
                        <div className="custom-text-quote">
                          "{inspectOrder.back_text}"
                          {inspectOrder.back_font && <span className="font-tag">({inspectOrder.back_font})</span>}
                          {inspectOrder.back_text_color && (
                            <span
                              className="color-dot"
                              style={{ backgroundColor: inspectOrder.back_text_color }}
                              title={`Color: ${inspectOrder.back_text_color}`}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="side-spec-item muted">No Back Custom Text</div>
                    )}

                    <div className="side-coords-tag">
                      Scale: {inspectOrder.back_scale || 1}x | Rot: {inspectOrder.back_rotation || 0}° | Pos: ({inspectOrder.back_pos_x || 0}, {inspectOrder.back_pos_y || 0})
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Strip */}
              <div className="mco-modal-status-strip">
                <div className="status-update-left">
                  <label htmlFor="modal-status-select"><strong>Update Production Status:</strong></label>
                  <select
                    id="modal-status-select"
                    className="form-input status-select"
                    value={inspectOrder.status || 'pending'}
                    disabled={statusUpdating}
                    onChange={(e) => handleStatusUpdate(inspectOrder.id, e.target.value)}
                  >
                    {STATUS_CHIPS.filter(s => s.key !== 'All Statuses').map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                  {updateFeedback && (
                    <span className="mco-feedback-text">
                      <CheckCircleIcon fontSize="small" /> {updateFeedback}
                    </span>
                  )}
                </div>

                <div className="status-update-right">
                  <button
                    type="button"
                    className="btn-print-specs"
                    onClick={() => window.print()}
                  >
                    <PrintIcon fontSize="small" /> Print Specification Sheet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
