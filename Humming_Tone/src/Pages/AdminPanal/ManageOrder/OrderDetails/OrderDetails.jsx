import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import demoImage from '../../../../assets/demo.jpeg';
import './OrderDetails.css';

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  /* ================= FETCH ORDER ITEMS ================= */
  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/admin/get_order_items/${orderId}`
        );

        if (!res.ok) throw new Error('Failed to fetch order items');

        const itemsData = await res.json();
        setItems(itemsData);

        // Derive a minimal order object (TEMP until order API exists)
        if (itemsData.length > 0) {
          setOrder({
            id: orderId,
            order_number: orderId,
            status: 'pending',
            created_at: new Date(),
            customer_name: 'Customer',
            customer_email: 'customer@email.com',
            customer_phone: '',
            customer_address: '',
            city: '',
            state: '',
            pincode: '',
            payment_verified: false,
            subtotal: itemsData.reduce(
              (sum, i) => sum + Number(i.product_price) * i.quantity,
              0
            ),
            discount_amount: 0,
            shipping: 0,
            total_amount: itemsData.reduce(
              (sum, i) => sum + Number(i.product_price) * i.quantity,
              0
            )
          });
        }
      } catch (error) {
        console.error('Error fetching order items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderItems();
  }, [orderId]);

  /* ================= UPDATE STATUS ================= */
  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
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
        <button className="od-back-btn" onClick={() => navigate(-1)}>
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
        <button className="od-back-btn" onClick={() => navigate(-1)}>
          <ArrowBackIcon /> Back to Orders
        </button>
        <div className="od-header-info">
          <h1 className="od-title">Order #{order.order_number}</h1>
          <span className="od-date">{formatDate(order.created_at)}</span>
        </div>
      </div>

      {/* Status Bar */}
      <div className="od-status-bar">
        <span className={`od-status-badge ${getStatusClass(order.status)}`}>
          {order.status.toUpperCase()}
        </span>

        <div className="od-status-buttons">
          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button
              key={s}
              disabled={updating || order.status === s}
              onClick={() => handleStatusUpdate(s)}
            >
              {s}
            </button>
          ))}
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
        <div className="od-summary-row od-total">
          <span>Total Amount</span>
          <span>₹{order.total_amount.toFixed(2)}</span>
        </div>
      </div>

    </section>
  );
}
