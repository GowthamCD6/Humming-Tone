import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelIcon from '@mui/icons-material/Cancel';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import './ManageOrder.css';

const getTodayInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ManageOrder() {
  const navigate = useNavigate();
  const todayInputValue = getTodayInputValue();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoOrdersModal, setShowNoOrdersModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const [orderLimit, setOrderLimit] = useState(10);
  const [filters, setFilters] = useState({
    status: 'All Statuses',
    startDate: '',
    endDate: '',
    startTime: '', // Added
    endTime: ''    // Added
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:5000/api/orders/manage', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch error:", error);
        setOrders([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleFilterChange = (field, value) => {
    if ((field === 'startDate' || field === 'endDate') && value && value > todayInputValue) {
      value = todayInputValue;
    }

    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'All Statuses',
      startDate: '',
      endDate: '',
      startTime: '', // Reset
      endTime: ''    // Reset
    });
  };

  const formatStatementDate = (dateStr) => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    // YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const downloadStatement = () => {
    const rows = Array.isArray(filteredOrders) ? filteredOrders : [];
    if (rows.length === 0) {
      setShowNoOrdersModal(true);
      return;
    }

    const headers = [
      'Order Number',
      'Customer Name',
      'Customer Email',
      'Date',
      'Time',
      'Items',
      'Total Amount',
      'Status',
      'Payment'
    ];

    const escapeCsv = (value) => {
      const s = String(value ?? '');
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const lines = [];
    lines.push(headers.map(escapeCsv).join(','));

    rows.forEach((o) => {
      const line = [
        o.order_number,
        o.customer_name,
        o.customer_email,
        formatStatementDate(o.created_at),
        formatTime(o.created_at),
        o.unique_items_count,
        parseFloat(o.total_amount).toFixed(2),
        o.status,
        o.payment_id ? 'PAID' : 'UNPAID'
      ].map(escapeCsv).join(',');
      lines.push(line);
    });

    const csv = `\uFEFF${lines.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const nameParts = [
      'orders',
      (filters.status && filters.status !== 'All Statuses') ? filters.status.toLowerCase() : 'all',
      filters.startDate ? filters.startDate : 'start',
      filters.endDate ? filters.endDate : 'end'
    ];
    const filename = `${nameParts.join('_')}.csv`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Logic to filter by Date AND Time
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    return orders.filter(order => {
      // 1. Status Filter
      if (filters.status !== 'All Statuses') {
        if (order.status?.toLowerCase() !== filters.status.toLowerCase()) return false;
      }

      // 2. Date & Time Filter Logic
      // Parse the order's created_at safely as local time to avoid UTC drift
      const orderDate = new Date(order.created_at);
      
      // Start Boundary
      if (filters.startDate) {
        const [year, month, day] = filters.startDate.split('-');
        let startLimit;
        if (filters.startTime) {
          const [hours, minutes] = filters.startTime.split(':');
          startLimit = new Date(year, month - 1, day, hours, minutes).getTime();
        } else {
          startLimit = new Date(year, month - 1, day, 0, 0, 0).getTime();
        }
        if (orderDate.getTime() < startLimit) return false;
      }

      // End Boundary
      if (filters.endDate) {
        const [year, month, day] = filters.endDate.split('-');
        let endLimit;
        if (filters.endTime) {
          const [hours, minutes] = filters.endTime.split(':');
          endLimit = new Date(year, month - 1, day, hours, minutes).getTime();
        } else {
          endLimit = new Date(year, month - 1, day, 23, 59, 59).getTime();
        }
        if (orderDate.getTime() > endLimit) return false;
      }

      return true;
    });
  }, [orders, filters]);

  const stats = useMemo(() => ({
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status?.toLowerCase() === 'pending').length,
    delivered: filteredOrders.filter(o => o.status?.toLowerCase() === 'delivered').length,
    cancelled: filteredOrders.filter(o => o.status?.toLowerCase() === 'cancelled').length
  }), [filteredOrders]);

  const activeFilterCount = useMemo(() => {
    return [
      filters.status !== 'All Statuses',
      Boolean(filters.startDate),
      Boolean(filters.endDate),
      Boolean(filters.startTime),
      Boolean(filters.endTime)
    ].filter(Boolean).length;
  }, [filters]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / orderLimit));
  const safeOrderPage = Math.min(Math.max(1, orderPage), totalOrderPages);
  const pagedOrders = useMemo(() => {
    const start = (safeOrderPage - 1) * orderLimit;
    return filteredOrders.slice(start, start + orderLimit);
  }, [filteredOrders, safeOrderPage, orderLimit]);

  useEffect(() => {
    setOrderPage(1);
  }, [filters.status, filters.startDate, filters.endDate, filters.startTime, filters.endTime, orderLimit]);

  useEffect(() => {
    if (orderPage > totalOrderPages) {
      setOrderPage(totalOrderPages);
    }
  }, [orderPage, totalOrderPages]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (loading) return <div className="loading-container">Loading Orders...</div>;

  return (
    <section className="manage-orders-container">
      <div className="inv-stats-grid mo-stats-grid">
        <div className="inv-stat-card mo-stat-card">
          <div className="inv-stat-header">
            <div className="inv-stat-label-wrap">
              <span className="mo-stat-icon mo-stat-icon-blue"><ShoppingCartIcon fontSize="inherit" /></span>
              <div className="inv-stat-label">TOTAL ORDERS</div>
            </div>
          </div>
          <div className="inv-stat-value mo-stat-value-blue">{stats.total}</div>
          <div className="mo-stat-note">{stats.total === 0 ? 'No orders in view' : 'Orders currently listed'}</div>
        </div>
        <div className="inv-stat-card mo-stat-card">
          <div className="inv-stat-header">
            <div className="inv-stat-label-wrap">
              <span className="mo-stat-icon mo-stat-icon-orange"><HourglassBottomIcon fontSize="inherit" /></span>
              <div className="inv-stat-label">PENDING</div>
            </div>
          </div>
          <div className="inv-stat-value mo-stat-value-orange">{stats.pending}</div>
          <div className="mo-stat-note">Orders waiting for action</div>
        </div>
        <div className="inv-stat-card mo-stat-card">
          <div className="inv-stat-header">
            <div className="inv-stat-label-wrap">
              <span className="mo-stat-icon mo-stat-icon-green"><LocalShippingIcon fontSize="inherit" /></span>
              <div className="inv-stat-label">DELIVERED</div>
            </div>
          </div>
          <div className="inv-stat-value mo-stat-value-green">{stats.delivered}</div>
          <div className="mo-stat-note">Completed and fulfilled orders</div>
        </div>
        <div className="inv-stat-card mo-stat-card">
          <div className="inv-stat-header">
            <div className="inv-stat-label-wrap">
              <span className="mo-stat-icon mo-stat-icon-red"><CancelIcon fontSize="inherit" /></span>
              <div className="inv-stat-label">CANCELLED</div>
            </div>
          </div>
          <div className="inv-stat-value mo-stat-value-red">{stats.cancelled}</div>
          <div className="mo-stat-note">Orders removed from the active flow</div>
        </div>
      </div>

      <div className="filter-prototype-card">
        <button
          type="button"
          className="filter-prototype-bar"
          onClick={() => setShowFilterPanel((open) => !open)}
        >
          <div className="filter-prototype-left">
            <span className="filter-title-icon"><FilterAltIcon fontSize="inherit" /></span>
            <div>
              <div className="section-title">Filter Orders</div>
              <div className="filter-prototype-subtitle">
                {activeFilterCount > 0 ? `${activeFilterCount} active filters` : 'Click to open the filter panel'}
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
                <label htmlFor="status-filter">STATUS</label>
                <select
                  id="status-filter"
                  className="form-input"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option>All Statuses</option>
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
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
                <input
                  type="time"
                  className="form-input time-input"
                  value={filters.startTime}
                  onChange={(e) => handleFilterChange('startTime', e.target.value)}
                  aria-label="Start time"
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
                <input
                  type="time"
                  className="form-input time-input"
                  value={filters.endTime}
                  onChange={(e) => handleFilterChange('endTime', e.target.value)}
                  aria-label="End time"
                />
              </div>
            </div>

            <div className="filter-actions">
              <div className="filter-actions-left">
                <button
                  type="button"
                  className="btn btn-apply"
                  onClick={() => setShowFilterPanel(false)}
                >
                  <SearchIcon fontSize="inherit" />
                  APPLY FILTERS
                </button>
                <button className="btn btn-clear" onClick={handleClearFilters}>
                  <RotateLeftIcon fontSize="inherit" />
                  CLEAR FILTERS
                </button>
              </div>
              <div className="filter-actions-right">
                <button className="btn btn-download" onClick={downloadStatement}>
                  <DownloadIcon fontSize="inherit" />
                  DOWNLOAD STATEMENT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">No orders found matching your filters.</div>
        ) : (
          <>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ORDER #</th>
                  <th>CUSTOMER</th>
                  <th>DATE</th>
                  <th>ITEMS</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                  <th>PAYMENT</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {pagedOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">{order.order_number}</td>
                    <td className="customer-info">
                      <div className="cust-name">{order.customer_name}</div>
                      <div className="cust-email">{order.customer_email}</div>
                    </td>
                    <td className="date-info">
                      <div className="date-main">{formatDate(order.created_at)}</div>
                      <div className="date-time">{formatTime(order.created_at)}</div>
                    </td>
                    <td className="items-info">
                      {order.unique_items_count} items
                    </td>
                    <td className="total-price">₹{parseFloat(order.total_amount).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${order.status?.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="payment-info">
                      <span className="payment-badge">{order.payment_id ? 'PAID' : 'UNPAID'}</span>
                    </td>
                    <td className="action-info">
                      <button 
                        className="view-order-btn"
                        onClick={() => navigate(`/admin/order/${order.id}`)}
                        title="View Order Details"
                      >
                        <VisibilityIcon /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
                  onChange={(e) => setOrderLimit(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>

                <button
                  className="page-btn"
                  onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                  disabled={safeOrderPage === 1}
                >
                  Previous
                </button>
                <span className="page-indicator">Page {safeOrderPage} / {totalOrderPages}</span>
                <button
                  className="page-btn"
                  onClick={() => setOrderPage((p) => Math.min(totalOrderPages, p + 1))}
                  disabled={safeOrderPage === totalOrderPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* No Orders Modal */}
      {showNoOrdersModal && (
        <div className="mo-modal-overlay" onClick={() => setShowNoOrdersModal(false)}>
          <div className="mo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mo-modal-header">
              <h3 className="mo-modal-title">No Orders Found</h3>
              <button
                className="mo-modal-close"
                onClick={() => setShowNoOrdersModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="mo-modal-body">
              <p>
                There are no orders available for the selected filters, so a statement can’t be downloaded.
              </p>
            </div>
            <div className="mo-modal-footer">
              <button className="btn btn-clear" onClick={() => setShowNoOrdersModal(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}