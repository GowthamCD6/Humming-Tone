import React, { useState, useMemo } from 'react';
import './ManageOrder.css';

export default function ManageOrder() {
  // Mock Data
  const [orders] = useState([
    {
      id: 'ORD202511181328167362',
      customer: {
        name: 'Nirolin Nancy',
        email: 'nirolinnancy2001@gmail.com',
        phone: '9791447262'
      },
      date: '2025-11-18',
      time: '7:58 AM',
      items: '1 items',
      qty: '1 total qty',
      total: 230.00,
      status: 'DELIVERED',
      payment: 'PAID',
      paymentId: 'pay_Rh82'
    },
    {
      id: 'ORD202511071152391707',
      customer: {
        name: 'Aafiyah',
        email: 'aafiyahish@gmail.com',
        phone: '9994058273'
      },
      date: '2025-11-07',
      time: '6:24 AM',
      items: '1 items',
      qty: '1 total qty',
      total: 350.00,
      status: 'DELIVERED',
      payment: 'PAID',
      paymentId: 'pay_RckZ'
    },
    {
      id: 'ORD202510151234567890',
      customer: {
        name: 'Rajesh Kumar',
        email: 'rajesh.k@example.com',
        phone: '9876543210'
      },
      date: '2025-10-15',
      time: '3:45 PM',
      items: '3 items',
      qty: '5 total qty',
      total: 890.00,
      status: 'PENDING',
      payment: 'PAID',
      paymentId: 'pay_Abc1'
    }
  ]);

  const [filters, setFilters] = useState({
    status: 'All Statuses',
    startDate: '',
    endDate: ''
  });

  // Filter orders based on criteria
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status filter
      if (filters.status !== 'All Statuses' && order.status !== filters.status.toUpperCase()) {
        return false;
      }

      // Start date filter
      if (filters.startDate && order.date < filters.startDate) {
        return false;
      }

      // End date filter
      if (filters.endDate && order.date > filters.endDate) {
        return false;
      }

      return true;
    });
  }, [orders, filters]);

  // Calculate stats dynamically
  const stats = useMemo(() => ({
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status === 'PENDING').length,
    delivered: filteredOrders.filter(o => o.status === 'DELIVERED').length
  }), [filteredOrders]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'All Statuses',
      startDate: '',
      endDate: ''
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className="manage-orders-container">
      <h2 className="page-heading">Manage Order</h2>

      {/* Filter Section */}
      <div className="filter-container">
        <h2 className="section-title">Filter Orders</h2>
        
        <div className="filter-inputs">
          <div className="input-group">
            <label htmlFor="status-filter">STATUS</label>
            <select 
              id="status-filter"
              className="form-input"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              aria-label="Filter by status"
            >
              <option>All Statuses</option>
              <option>Pending</option>
              <option>Delivered</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="start-date">START DATE</label>
            <input 
              id="start-date"
              type="date" 
              className="form-input"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              aria-label="Filter by start date"
            />
          </div>

          <div className="input-group">
            <label htmlFor="end-date">END DATE</label>
            <input 
              id="end-date"
              type="date" 
              className="form-input"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              aria-label="Filter by end date"
            />
          </div>
        </div>

        <div className="filter-actions">
          <button 
            className="btn btn-apply"
            aria-label="Apply filters"
          >
            APPLY FILTERS
          </button>
          <button 
            className="btn btn-clear"
            onClick={handleClearFilters}
            aria-label="Clear all filters"
          >
            CLEAR FILTERS
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="stats-container">
        <div className="stat-card" role="status" aria-label={`Total orders: ${stats.total}`}>
          <h3>TOTAL ORDERS</h3>
          <span className="stat-number blue">{stats.total}</span>
        </div>
        <div className="stat-card" role="status" aria-label={`Pending orders: ${stats.pending}`}>
          <h3>PENDING</h3>
          <span className="stat-number orange">{stats.pending}</span>
        </div>
        <div className="stat-card" role="status" aria-label={`Delivered orders: ${stats.delivered}`}>
          <h3>DELIVERED</h3>
          <span className="stat-number green">{stats.delivered}</span>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="table-container">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">No orders found matching your filters.</div>
        ) : (
          <table className="orders-table" role="table" aria-label="Orders table">
            <thead>
              <tr>
                <th scope="col">ORDER #</th>
                <th scope="col">CUSTOMER</th>
                <th scope="col">DATE</th>
                <th scope="col">ITEMS</th>
                <th scope="col">TOTAL</th>
                <th scope="col">STATUS</th>
                <th scope="col">PAYMENT</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={order.id}>
                  <td className="order-id">{order.id}</td>
                  <td className="customer-info">
                    <div className="cust-name">{order.customer.name}</div>
                    <div className="cust-email">{order.customer.email}</div>
                    <div className="cust-phone">{order.customer.phone}</div>
                  </td>
                  <td className="date-info">
                    <div className="date-main">{formatDate(order.date)}</div>
                    <div className="date-time">{order.time}</div>
                  </td>
                  <td className="items-info">
                    <div className="item-count">{order.items}</div>
                    <div className="item-qty">{order.qty}</div>
                  </td>
                  <td className="total-price">₹{order.total.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="payment-info">
                    <span className="payment-badge">{order.payment}</span>
                    <div className="payment-id">ID: {order.paymentId}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}