import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './OrderList.css';

export default function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders/manage');
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    let result = orders;

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status?.toLowerCase() === statusFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(order =>
        order.order_number?.toLowerCase().includes(search) ||
        order.customer_name?.toLowerCase().includes(search) ||
        order.customer_email?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [orders, statusFilter, searchTerm]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      pending: 'ol-status-pending',
      confirmed: 'ol-status-confirmed',
      shipped: 'ol-status-shipped',
      delivered: 'ol-status-delivered',
      cancelled: 'ol-status-cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'ol-status-pending';
  };

  if (loading) {
    return (
      <section className="order-list-container">
        <div className="ol-loading">Loading orders...</div>
      </section>
    );
  }

  return (
    <section className="order-list-container">
      {/* Filter Bar */}
      <div className="ol-filter-bar">
        <div className="ol-search-wrapper">
          <SearchIcon className="ol-search-icon" />
          <input
            type="text"
            className="ol-search-box"
            placeholder="Search by order #, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="ol-filter-wrapper">
          <FilterListIcon className="ol-filter-icon" />
          <select
            className="ol-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="ol-count-badge">
          {filteredOrders.length} Orders
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="ol-no-orders">
          {searchTerm || statusFilter !== 'all' 
            ? 'No orders found matching your filters.' 
            : 'No orders found.'}
        </div>
      ) : (
        <div className="ol-orders-grid">
          {filteredOrders.map((order) => (
            <div key={order.id} className="ol-order-card">
              <div className="ol-card-header">
                <span className="ol-order-number">#{order.order_number}</span>
                <span className={`ol-status-badge ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="ol-card-body">
                <div className="ol-customer-info">
                  <h4 className="ol-customer-name">{order.customer_name}</h4>
                  <p className="ol-customer-email">{order.customer_email}</p>
                </div>
                <div className="ol-order-meta">
                  <div className="ol-meta-item">
                    <span className="ol-meta-label">Date</span>
                    <span className="ol-meta-value">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="ol-meta-item">
                    <span className="ol-meta-label">Time</span>
                    <span className="ol-meta-value">{formatTime(order.created_at)}</span>
                  </div>
                  <div className="ol-meta-item">
                    <span className="ol-meta-label">Items</span>
                    <span className="ol-meta-value">{order.unique_items_count}</span>
                  </div>
                </div>
                <div className="ol-order-total">
                  <span className="ol-total-label">Total</span>
                  <span className="ol-total-value">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="ol-payment-status">
                  <span className={`ol-payment-badge ${order.payment_id ? 'paid' : 'unpaid'}`}>
                    {order.payment_id ? 'PAID' : 'UNPAID'}
                  </span>
                </div>
              </div>
              <div className="ol-card-footer">
                <button 
                  className="ol-view-btn"
                  onClick={() => navigate(`/admin/order/${order.id}`)}
                >
                  <VisibilityIcon /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}