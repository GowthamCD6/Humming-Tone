import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import demoImage from '../../../../assets/demo.jpeg';
import './OrderDetails.css';

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [shippingDate, setShippingDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [dateSaving, setDateSaving] = useState(false);

  /* ================= FETCH ORDER DATA ================= */
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

        // Fetch all orders and find the specific one
        const ordersRes = await fetch('http://localhost:5000/api/orders/manage', {
          headers: authHeaders
        });
        if (!ordersRes.ok) throw new Error('Failed to fetch orders');
        
        const ordersData = await ordersRes.json();
        const foundOrder = ordersData.find(o => o.id == orderId);
        
        if (!foundOrder) {
          setLoading(false);
          return;
        }

        // Fetch order items
        const itemsRes = await fetch(
          `http://localhost:5000/admin/get_order_items/${orderId}`,
          { headers: authHeaders }
        );

        if (!itemsRes.ok) throw new Error('Failed to fetch order items');

        const itemsData = await itemsRes.json();
        setItems(itemsData);

        // Calculate total from items
        const calculatedTotal = itemsData.reduce(
          (sum, item) => sum + (Number(item.product_price) || 0) * (Number(item.quantity) || 0),
          0
        );

        // Set order with proper data
        setOrder({
          ...foundOrder,
          status: foundOrder.status || 'pending',
          total_amount: calculatedTotal
        });

        // Set date picker initial values
        if (foundOrder.shipping_date) {
          setShippingDate(foundOrder.shipping_date.split('T')[0]);
        }
        if (foundOrder.delivery_date) {
          setDeliveryDate(foundOrder.delivery_date.split('T')[0]);
        }

      } catch (error) {
        console.error('Error fetching order data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  /* ================= UPDATE STATUS ================= */
  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ 
            status: newStatus,
            shipping_date: shippingDate || undefined,
            delivery_date: deliveryDate || undefined
          })
        }
      );

      if (res.ok) {
        setOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  /* ================= SAVE DATES ================= */
  const handleSaveDates = async () => {
    setDateSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            status: order.status,
            shipping_date: shippingDate || null,
            delivery_date: deliveryDate || null
          })
        }
      );

      if (res.ok) {
        setOrder(prev => ({
          ...prev,
          shipping_date: shippingDate || null,
          delivery_date: deliveryDate || null
        }));
      }
    } catch (error) {
      console.error('Error saving dates:', error);
    } finally {
      setDateSaving(false);
    }
  };

  /* ================= HELPERS ================= */
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const getStatusClass = (status) => `status-${status}`;

  /* ================= STATES ================= */
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

  /* ================= UI ================= */
  return (
    <section className="order-details-container">

      {/* Header */}
      <div className="od-header">
        <div className="od-header-top">
          <button className="od-back-btn" onClick={() => navigate('/admin/manage-orders')}>
            <ArrowBackIcon /> Back to Orders
          </button>
          <div className="od-header-info">
            <h1 className="od-title">Order #{order.order_number}</h1>
            <span className="od-date">{formatDate(order.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="od-status-bar">
        <span className={`od-status-badge ${getStatusClass(order.status)}`}>
          {order.status.replace(/_/g, ' ').toUpperCase()}
        </span>

        <div className="od-status-buttons">
          {['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
            <button
              key={s}
              disabled={updating || order.status === s}
              onClick={() => handleStatusUpdate(s)}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Shipping & Delivery Dates */}
      <div className="od-dates-section">
        <h3 className="od-section-title">
          <CalendarMonthIcon style={{ fontSize: '20px', verticalAlign: 'middle', marginRight: '6px' }} />
          Shipping & Delivery Dates
        </h3>
        <div className="od-dates-grid">
          <div className="od-date-group">
            <label className="od-date-label">Shipping Date</label>
            <input
              type="date"
              className="od-date-input"
              value={shippingDate}
              onChange={(e) => setShippingDate(e.target.value)}
            />
          </div>
          <div className="od-date-group">
            <label className="od-date-label">Expected Delivery Date</label>
            <input
              type="date"
              className="od-date-input"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </div>
          <div className="od-date-group od-date-action">
            <button
              className="od-save-dates-btn"
              onClick={handleSaveDates}
              disabled={dateSaving}
            >
              {dateSaving ? 'Saving...' : 'Save Dates'}
            </button>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="od-items-section">
        <h3 className="od-section-title">Order Items ({items.length})</h3>

        <div className="od-items-grid">
          {items.map(item => (
            <div key={item.id} className="od-item-card">
              <div className="od-item-image">
                <img
                  src={demoImage}
                  alt={item.product_name}
                />
              </div>

              <div className="od-item-info">
                <h4>{item.product_name}</h4>
                <p>Size: {item.size}</p>
                <p>Color: {item.color}</p>
                <p>Qty: {item.quantity}</p>
                <p>Price: ₹{item.product_price}</p>
                <p className="od-item-total">
                  Total: ₹{(item.product_price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="od-summary">
        <h3 className="od-section-title">Order Summary</h3>
        
        <div className="od-summary-content">
          {/* Items Breakdown */}
          <div className="od-summary-items">
            {items.map((item, index) => {
              const itemTotal = Number(item.product_price) * Number(item.quantity);
              return (
                <div key={item.id} className="od-summary-item-row">
                  <span className="od-summary-item-name">
                    {item.product_name} ({item.size}, {item.color}) × {item.quantity}
                  </span>
                  <span className="od-summary-item-amount">₹{itemTotal.toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="od-summary-divider"></div>

          {/* Subtotal */}
          <div className="od-summary-row">
            <span>Subtotal</span>
            <span>₹{items.reduce((sum, item) => sum + (Number(item.product_price) * Number(item.quantity)), 0).toFixed(2)}</span>
          </div>

          {/* Shipping */}
          <div className="od-summary-row">
            <span>Shipping</span>
            <span>₹{(order.shipping || 0).toFixed(2)}</span>
          </div>

          {/* Discount */}
          {order.discount_amount > 0 && (
            <div className="od-summary-row od-discount">
              <span>Discount</span>
              <span>-₹{order.discount_amount.toFixed(2)}</span>
            </div>
          )}

          {/* Total */}
          <div className="od-summary-row od-total">
            <span>Total Amount</span>
            <span>₹{order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

    </section>
  );
}
