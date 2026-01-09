import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import './OrderDetails.css';

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}`);
        if (!response.ok) throw new Error('Failed to fetch order');
        const data = await response.json();
        setOrder(data.order);
        setItems(data.items || []);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'status-pending';
  };

  if (loading) {
    return (
      <section className="order-details-container">
        <div className="od-loading">Loading order details...</div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="order-details-container">
        <div className="od-error">Order not found</div>
        <button className="od-back-btn" onClick={() => navigate('/admin/manage-orders')}>
          <ArrowBackIcon /> Back to Orders
        </button>
      </section>
    );
  }

  return (
    <section className="order-details-container">
      {/* Header */}
      <div className="od-header">
        <button className="od-back-btn" onClick={() => navigate('/admin/manage-orders')}>
          <ArrowBackIcon /> Back to Orders
        </button>
        <div className="od-header-info">
          <h1 className="od-title">Order #{order.order_number}</h1>
          <span className="od-date">{formatDate(order.created_at)}</span>
        </div>
      </div>

      {/* Status Bar */}
      <div className="od-status-bar">
        <div className="od-current-status">
          <span className="od-status-label">Current Status:</span>
          <span className={`od-status-badge ${getStatusClass(order.status)}`}>
            {order.status?.toUpperCase()}
          </span>
        </div>
        <div className="od-status-actions">
          <span className="od-action-label">Update Status:</span>
          <div className="od-status-buttons">
            {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
              <button
                key={status}
                className={`od-status-btn ${order.status === status ? 'active' : ''}`}
                onClick={() => handleStatusUpdate(status)}
                disabled={updating || order.status === status}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="od-content-grid">
        {/* Customer Info Card */}
        <div className="od-card">
          <h3 className="od-card-title">Customer Information</h3>
          <div className="od-card-body">
            <div className="od-info-row">
              <span className="od-label">Name</span>
              <span className="od-value">{order.customer_name}</span>
            </div>
            <div className="od-info-row">
              <span className="od-label">Email</span>
              <a href={`mailto:${order.customer_email}`} className="od-value od-link">
                {order.customer_email}
              </a>
            </div>
            <div className="od-info-row">
              <span className="od-label">Phone</span>
              <a href={`tel:${order.customer_phone}`} className="od-value od-link">
                {order.customer_phone}
              </a>
            </div>
          </div>
        </div>

        {/* Shipping Address Card */}
        <div className="od-card">
          <h3 className="od-card-title">
            <LocalShippingIcon className="od-card-icon" /> Shipping Address
          </h3>
          <div className="od-card-body">
            <p className="od-address">{order.customer_address}</p>
            <p className="od-address-line">
              {order.city}, {order.state} - {order.pincode}
            </p>
            {order.order_instructions && (
              <div className="od-instructions">
                <span className="od-label">Instructions:</span>
                <p className="od-instructions-text">{order.order_instructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Info Card */}
        <div className="od-card">
          <h3 className="od-card-title">Payment Details</h3>
          <div className="od-card-body">
            <div className="od-info-row">
              <span className="od-label">Payment Status</span>
              <span className={`od-payment-badge ${order.payment_verified ? 'paid' : 'unpaid'}`}>
                {order.payment_verified ? 'PAID' : 'UNPAID'}
              </span>
            </div>
            {order.payment_id && (
              <div className="od-info-row">
                <span className="od-label">Payment ID</span>
                <span className="od-value od-mono">{order.payment_id}</span>
              </div>
            )}
            {order.promo_code && (
              <div className="od-info-row">
                <span className="od-label">Promo Code</span>
                <span className="od-value od-promo">{order.promo_code}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="od-items-section">
        <h3 className="od-section-title">Order Items ({items.length})</h3>
        <div className="od-items-grid">
          {items.map((item) => (
            <div key={item.id} className="od-item-card">
              <div className="od-item-image">
                {item.image_path ? (
                  <img 
                    src={`http://localhost:5000${item.image_path}`} 
                    alt={item.product_name}
                    onError={(e) => { e.target.src = '/placeholder.png'; }}
                  />
                ) : (
                  <div className="od-item-placeholder">No Image</div>
                )}
              </div>
              <div className="od-item-info">
                <h4 className="od-item-name">{item.product_name}</h4>
                <div className="od-item-details">
                  {item.size && <span className="od-item-size">Size: {item.size}</span>}
                  {item.color && <span className="od-item-color">Color: {item.color}</span>}
                </div>
                <div className="od-item-qty">Qty: {item.quantity}</div>
                <div className="od-item-price">₹{parseFloat(item.product_price).toFixed(2)}</div>
                <div className="od-item-total">
                  Total: ₹{(parseFloat(item.product_price) * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="od-summary">
        <h3 className="od-section-title">Order Summary</h3>
        <div className="od-summary-card">
          <div className="od-summary-row">
            <span>Subtotal</span>
            <span>₹{parseFloat(order.subtotal).toFixed(2)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="od-summary-row od-discount">
              <span>Discount</span>
              <span>-₹{parseFloat(order.discount_amount).toFixed(2)}</span>
            </div>
          )}
          <div className="od-summary-row">
            <span>Shipping</span>
            <span>₹{parseFloat(order.shipping).toFixed(2)}</span>
          </div>
          <div className="od-summary-row od-total">
            <span>Total Amount</span>
            <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}