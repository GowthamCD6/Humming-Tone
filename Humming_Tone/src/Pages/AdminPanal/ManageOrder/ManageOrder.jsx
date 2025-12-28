import React, { useState, useMemo, useEffect } from 'react';
import './ManageOrder.css';

export default function ManageOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoOrdersModal, setShowNoOrdersModal] = useState(false);
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
        const response = await fetch('http://localhost:5000/api/orders/manage');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
      const orderDateTime = new Date(order.created_at).getTime();

      // Start Boundary
      if (filters.startDate) {
        // If time isn't provided, default to start of day (00:00)
        const startString = `${filters.startDate}T${filters.startTime || '00:00'}`;
        const startLimit = new Date(startString).getTime();
        if (orderDateTime < startLimit) return false;
      }

      // End Boundary
      if (filters.endDate) {
        // If time isn't provided, default to end of day (23:59)
        const endString = `${filters.endDate}T${filters.endTime || '23:59'}`;
        const endLimit = new Date(endString).getTime();
        if (orderDateTime > endLimit) return false;
      }

      return true;
    });
  }, [orders, filters]);

  const stats = useMemo(() => ({
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status?.toLowerCase() === 'pending').length,
    delivered: filteredOrders.filter(o => o.status?.toLowerCase() === 'delivered').length
  }), [filteredOrders]);

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
      <div className="filter-container">
        <h2 className="section-title">Filter Orders</h2>
        
        <div className="filter-inputs">
          {/* Status Select */}
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
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>

          {/* Start Date & Time */}
          <div className="input-group">
            <label htmlFor="start-date">START DATE</label>
            <input 
              id="start-date"
              type="date" 
              className="form-input"
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

          {/* End Date & Time */}
          <div className="input-group">
            <label htmlFor="end-date">END DATE</label>
            <input 
              id="end-date"
              type="date" 
              className="form-input"
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
            <button className="btn btn-apply">APPLY FILTERS</button>
            <button className="btn btn-clear" onClick={handleClearFilters}>CLEAR FILTERS</button>
          </div>
          <div className="filter-actions-right">
            <button className="btn btn-download" onClick={downloadStatement}>DOWNLOAD STATEMENT</button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>TOTAL ORDERS</h3>
          <span className="stat-number blue">{stats.total}</span>
        </div>
        <div className="stat-card">
          <h3>PENDING</h3>
          <span className="stat-number orange">{stats.pending}</span>
        </div>
        <div className="stat-card">
          <h3>DELIVERED</h3>
          <span className="stat-number green">{stats.delivered}</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">No orders found matching your filters.</div>
        ) : (
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
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
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
                </tr>
              ))}
            </tbody>
          </table>
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