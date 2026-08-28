import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PrintIcon from '@mui/icons-material/Print';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CancelIcon from '@mui/icons-material/Cancel';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { API_BASE_URL, getImageUrl } from '../../../../utils/apiConfig';
import ShippingLabel from '../ShippingLabel/ShippingLabel';
import './OrderDetails.css';

const STATUS_FLOW = [
  { key: 'pending', label: 'Pending', icon: <HourglassEmptyIcon fontSize="inherit" />, desc: 'Order received, pending verification' },
  { key: 'confirmed', label: 'Confirmed', icon: <CheckCircleOutlineIcon fontSize="inherit" />, desc: 'Payment verified & order accepted' },
  { key: 'packed', label: 'Packed', icon: <Inventory2OutlinedIcon fontSize="inherit" />, desc: 'Items packed with shipping label' },
  { key: 'shipped', label: 'Shipped', icon: <LocalShippingOutlinedIcon fontSize="inherit" />, desc: 'Handed over to courier partner' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: <TwoWheelerIcon fontSize="inherit" />, desc: 'Package out with delivery agent' },
  { key: 'delivered', label: 'Delivered', icon: <DoneAllIcon fontSize="inherit" />, desc: 'Package successfully delivered' },
];

const COURIER_OPTIONS = [
  'Xpress Bees', 'Delhivery', 'BlueDart', 'DTDC',
  'India Post', 'Ecom Express', 'Shadowfax', 'Shiprocket', 'Other',
];

// Toast notification component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`od-toast od-toast-${type}`}>
      <span className="od-toast-icon">
        {type === 'success' ? <CheckIcon fontSize="inherit" /> : type === 'error' ? <CloseIcon fontSize="inherit" /> : <InfoOutlinedIcon fontSize="inherit" />}
      </span>
      <span className="od-toast-text">{message}</span>
      <button className="od-toast-close" onClick={onClose}>
        <CloseIcon fontSize="small" />
      </button>
    </div>
  );
}

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
  const [waSending, setWaSending] = useState(false);
  const [directWaLink, setDirectWaLink] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierPartner, setCourierPartner] = useState('');
  const [trackingSaving, setTrackingSaving] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [labelData, setLabelData] = useState([]);
  const [copied, setCopied] = useState(false);

  // Toast system
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // Status confirmation modal
  const [statusConfirm, setStatusConfirm] = useState(null);

  /* ================= FETCH ORDER DATA ================= */
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

        const ordersRes = await fetch(`${API_BASE_URL}/api/orders/manage`, { headers: authHeaders });
        if (!ordersRes.ok) throw new Error('Failed to fetch orders');

        const ordersData = await ordersRes.json();
        const foundOrder = ordersData.find(o => o.id == orderId);

        if (!foundOrder) { setLoading(false); return; }

        const itemsRes = await fetch(`${API_BASE_URL}/admin/get_order_items/${orderId}`, { headers: authHeaders });
        const itemsData = await itemsRes.json();
        setItems(Array.isArray(itemsData) ? itemsData : []);

        setOrder({
          ...foundOrder,
          status: foundOrder.status || 'pending',
          total_amount: Number(foundOrder.total_amount != null ? foundOrder.total_amount : 0)
        });

        if (foundOrder.shipping_date) setShippingDate(foundOrder.shipping_date.split('T')[0]);
        if (foundOrder.delivery_date) setDeliveryDate(foundOrder.delivery_date.split('T')[0]);
        if (foundOrder.tracking_number) setTrackingNumber(foundOrder.tracking_number);
        if (foundOrder.courier_partner) setCourierPartner(foundOrder.courier_partner);

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
    setStatusConfirm(null);
    setUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          status: newStatus,
          shipping_date: shippingDate || undefined,
          delivery_date: deliveryDate || undefined,
          tracking_number: trackingNumber || undefined,
          courier_partner: courierPartner || undefined
        })
      });
      if (res.ok) {
        setOrder(prev => ({ ...prev, status: newStatus }));
        addToast(`Order status updated to "${newStatus.replace(/_/g, ' ')}"`, 'success');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      addToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  /* ================= SAVE DATES ================= */
  const handleSaveDates = async () => {
    setDateSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: order.status, shipping_date: shippingDate || null, delivery_date: deliveryDate || null })
      });
      if (res.ok) {
        setOrder(prev => ({ ...prev, shipping_date: shippingDate || null, delivery_date: deliveryDate || null }));
        addToast('Delivery dates saved successfully!', 'success');
      }
    } catch (error) {
      addToast('Failed to update dates', 'error');
    } finally {
      setDateSaving(false);
    }
  };

  /* ================= SAVE TRACKING INFO ================= */
  const handleSaveTracking = async () => {
    setTrackingSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: order.status, tracking_number: trackingNumber || null, courier_partner: courierPartner || null })
      });
      if (res.ok) {
        setOrder(prev => ({ ...prev, tracking_number: trackingNumber || null, courier_partner: courierPartner || null }));
        addToast('Courier & tracking details saved!', 'success');
      }
    } catch (error) {
      addToast('Failed to save tracking info', 'error');
    } finally {
      setTrackingSaving(false);
    }
  };

  /* ================= GENERATE LABEL ================= */
  const handleGenerateLabel = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/orders/label-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ orderIds: [orderId] })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLabelData(data.labels);
        setShowLabel(true);
      }
    } catch (error) {
      addToast('Error generating shipping label', 'error');
    }
  };

  /* ================= SEND WHATSAPP ================= */
  const handleSendWhatsApp = async (type = 'update') => {
    setWaSending(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/send-order-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ orderId: order.id, type })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.result?.directWhatsAppLink) setDirectWaLink(data.result.directWhatsAppLink);
        addToast(
          data.result?.mock
            ? 'Preview link ready (configure META_ACCESS_TOKEN for live delivery)'
            : `WhatsApp ${type === 'confirmation' ? 'confirmation' : 'update'} sent!`,
          data.result?.mock ? 'info' : 'success'
        );
      } else {
        addToast(data.message || 'WhatsApp send failed', 'error');
      }
    } catch (error) {
      addToast('Error connecting to WhatsApp', 'error');
    } finally {
      setWaSending(false);
    }
  };

  const copyOrderNumber = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast('Order number copied to clipboard', 'info');
    }
  };

  /* ================= HELPERS ================= */
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusClass = (status) => `status-${status}`;

  const currentStepIndex = useMemo(() => {
    if (!order) return -1;
    if (order.status === 'cancelled') return -2;
    return STATUS_FLOW.findIndex(s => s.key === order.status?.toLowerCase());
  }, [order]);

  const nextAction = useMemo(() => {
    if (!order) return null;
    const idx = STATUS_FLOW.findIndex(s => s.key === order.status?.toLowerCase());
    if (idx >= 0 && idx < STATUS_FLOW.length - 1) return STATUS_FLOW[idx + 1];
    return null;
  }, [order]);

  // Subtotal calculated from items
  const itemsSubtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.product_price || 0) * Number(item.quantity || 1)), 0);
  }, [items]);

  /* ================= LOADING / ERROR ================= */
  if (loading) {
    return (
      <section className="od-container">
        <div className="od-loading-state">
          <div className="od-loading-spinner" />
          <p>Loading order details...</p>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="od-container">
        <div className="od-empty-state">
          <Inventory2OutlinedIcon style={{ fontSize: '48px', color: '#94a3b8' }} />
          <h2>Order Not Found</h2>
          <p>This order may have been removed or the link is invalid.</p>
          <button className="od-btn od-btn-secondary" onClick={() => navigate('/admin/manage-orders')}>
            <ArrowBackIcon fontSize="small" /> Back to Orders
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="od-container">

      {/* Toast Notifications */}
      <div className="od-toast-container">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* ===== TOP BAR NAVIGATION & QUICK ACTIONS ===== */}
      <div className="od-top-bar">
        <div className="od-top-bar-left">
          <button className="od-back-btn" onClick={() => navigate('/admin/manage-orders')}>
            <ArrowBackIcon fontSize="small" /> Back to Orders
          </button>
          <div className="od-title-block">
            <div className="od-order-num-row">
              <h1 className="od-order-title">Order #{order.order_number}</h1>
              <button className="od-copy-btn" onClick={copyOrderNumber} title="Copy Order Number">
                <ContentCopyIcon fontSize="inherit" />
                {copied ? 'Copied' : ''}
              </button>
            </div>
            <div className="od-order-meta">
              <span className="od-meta-item">
                <CalendarTodayIcon fontSize="inherit" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Placed on {formatDate(order.created_at)}
              </span>
              <span className="od-meta-dot">•</span>
              <span className={`od-status-pill ${getStatusClass(order.status)}`}>
                {order.status.replace(/_/g, ' ').toUpperCase()}
              </span>
              <span className="od-meta-dot">•</span>
              <span className={`od-payment-pill ${order.payment_id ? 'paid' : 'unpaid'}`}>
                {order.payment_id ? 'PAID' : 'UNPAID / COD'}
              </span>
            </div>
          </div>
        </div>

        <div className="od-top-bar-actions">
          <button className="od-btn od-btn-primary" onClick={handleGenerateLabel}>
            <PrintIcon fontSize="small" />
            Print Shipping Sticker
          </button>
        </div>
      </div>

      {/* ===== VISUAL PROGRESS TIMELINE ===== */}
      <div className="od-card od-progress-card">
        <div className="od-card-title-bar">
          <div className="od-card-title-left">
            <LocalShippingIcon className="od-title-icon" />
            <div>
              <h2 className="od-card-title">Order Fulfillment Timeline</h2>
              <p className="od-card-subtitle">Real-time status tracking for this order</p>
            </div>
          </div>
          {order.status === 'cancelled' && (
            <span className="od-badge-cancelled">
              <CancelIcon fontSize="inherit" style={{ verticalAlign: 'middle', marginRight: '4px' }} /> CANCELLED
            </span>
          )}
        </div>

        <div className={`od-stepper ${order.status === 'cancelled' ? 'is-cancelled' : ''}`}>
          {STATUS_FLOW.map((step, idx) => {
            const isCompleted = currentStepIndex >= 0 && idx < currentStepIndex;
            const isCurrent = currentStepIndex >= 0 && idx === currentStepIndex;
            const isCancelled = order.status === 'cancelled';

            return (
              <div
                key={step.key}
                className={`od-step ${isCompleted ? 'is-completed' : ''} ${isCurrent ? 'is-current' : ''} ${isCancelled ? 'is-cancelled-step' : ''}`}
              >
                {idx > 0 && (
                  <div className={`od-step-line ${idx <= currentStepIndex ? 'line-active' : ''}`} />
                )}
                <div className="od-step-content">
                  <div className="od-step-circle">
                    {isCompleted ? (
                      <CheckCircleIcon className="od-step-icon-check" />
                    ) : (
                      <span className="od-step-icon">{step.icon}</span>
                    )}
                  </div>
                  <div className="od-step-info">
                    <span className="od-step-title">{step.label}</span>
                    <span className="od-step-desc">{step.desc}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Next Stage Recommender */}
        {nextAction && order.status !== 'cancelled' && (
          <div className="od-next-action-bar">
            <div className="od-next-action-text">
              <span className="od-next-badge">NEXT STEP</span>
              <span>Ready to move this order to <strong>{nextAction.label}</strong>?</span>
            </div>
            <button
              className="od-btn od-btn-action"
              disabled={updating}
              onClick={() => setStatusConfirm(nextAction.key)}
            >
              {updating ? 'Updating...' : `Advance to ${nextAction.label} →`}
            </button>
          </div>
        )}
      </div>

      {/* ===== MAIN 2-COLUMN LAYOUT ===== */}
      <div className="od-layout-grid">

        {/* ===== LEFT COLUMN: Products & Logistics ===== */}
        <div className="od-col-main">

          {/* Product Items Table */}
          <div className="od-card">
            <div className="od-card-title-bar">
              <div className="od-card-title-left">
                <span className="od-title-badge">{items.length}</span>
                <div>
                  <h2 className="od-card-title">Order Items</h2>
                  <p className="od-card-subtitle">Exact products and variant specifications ordered by customer</p>
                </div>
              </div>
            </div>

            <div className="od-items-table-wrap">
              <table className="od-items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Details</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th className="th-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const unitPrice = Number(item.product_price || 0);
                    const qty = Number(item.quantity || 1);
                    const itemTotal = unitPrice * qty;

                    return (
                      <tr key={item.id || index}>
                        <td className="od-product-cell">
                          <div className="od-prod-thumb">
                            <img
                              src={getImageUrl(item.image_path) || getImageUrl(item.product_image)}
                              alt={item.product_name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                              }}
                            />
                          </div>
                          <div className="od-prod-info">
                            <h3 className="od-prod-name">{item.product_name}</h3>
                            {item.product_sku && (
                              <span className="od-prod-sku">SKU: {item.product_sku}</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="od-variant-tags">
                            {item.size && <span className="od-v-tag">Size: <strong>{item.size}</strong></span>}
                            {item.color && <span className="od-v-tag">Color: <strong>{item.color}</strong></span>}
                          </div>
                        </td>

                        <td className="od-price-cell">
                          ₹{unitPrice.toFixed(2)}
                        </td>

                        <td className="od-qty-cell">
                          <span className="od-qty-badge">{qty}</span>
                        </td>

                        <td className="od-total-cell th-right">
                          ₹{itemTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="5" className="od-no-items">
                        No product items recorded for this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="od-tax-inclusive-bar">
              <span className="od-tax-icon">
                <CheckIcon fontSize="inherit" />
              </span>
              <span>All product prices are <strong>inclusive of all applicable taxes</strong>.</span>
            </div>
          </div>

          {/* Courier & Shipping Logistics */}
          <div className="od-card">
            <div className="od-card-title-bar">
              <div className="od-card-title-left">
                <LocalShippingIcon className="od-title-icon" />
                <div>
                  <h2 className="od-card-title">Shipping & Courier Logistics</h2>
                  <p className="od-card-subtitle">Manage tracking number, partner, and dispatch schedule</p>
                </div>
              </div>
            </div>

            <div className="od-logistics-grid">
              <div className="od-field-group">
                <label className="od-field-label">Tracking Number / AWB</label>
                <input
                  type="text"
                  className="od-input"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. 1340066588327"
                />
              </div>

              <div className="od-field-group">
                <label className="od-field-label">Courier Partner</label>
                <select
                  className="od-input od-select"
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                >
                  <option value="">Select courier partner...</option>
                  {COURIER_OPTIONS.map(c => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              <div className="od-field-group">
                <label className="od-field-label">Dispatch / Shipping Date</label>
                <input
                  type="date"
                  className="od-input"
                  value={shippingDate}
                  onChange={(e) => setShippingDate(e.target.value)}
                />
              </div>

              <div className="od-field-group">
                <label className="od-field-label">Expected Delivery Date</label>
                <input
                  type="date"
                  className="od-input"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>
            </div>

            <div className="od-logistics-actions">
              <button
                className="od-btn od-btn-secondary"
                onClick={handleSaveTracking}
                disabled={trackingSaving}
              >
                {trackingSaving ? 'Saving...' : 'Save Logistics Info'}
              </button>
              <button
                className="od-btn od-btn-secondary"
                onClick={handleSaveDates}
                disabled={dateSaving}
              >
                {dateSaving ? 'Saving...' : 'Save Dates'}
              </button>
              <button
                className="od-btn od-btn-primary"
                onClick={handleGenerateLabel}
              >
                <PrintIcon fontSize="small" /> Preview Sticker
              </button>
            </div>
          </div>

          {/* WhatsApp Notifications */}
          <div className="od-card">
            <div className="od-card-title-bar">
              <div className="od-card-title-left">
                <WhatsAppIcon className="od-wa-icon-brand" />
                <div>
                  <h2 className="od-card-title">Customer WhatsApp Updates</h2>
                  <p className="od-card-subtitle">
                    Send automated tracking links & order updates to <strong>{order.customer_phone || 'No phone attached'}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="od-wa-body">
              <div className="od-wa-btn-group">
                <button
                  className="od-btn od-btn-wa"
                  onClick={() => handleSendWhatsApp('confirmation')}
                  disabled={waSending || !order.customer_phone}
                >
                  <WhatsAppIcon fontSize="small" />
                  {waSending ? 'Sending...' : 'Send Order Confirmation'}
                </button>
                <button
                  className="od-btn od-btn-wa-dark"
                  onClick={() => handleSendWhatsApp('update')}
                  disabled={waSending || !order.customer_phone}
                >
                  <WhatsAppIcon fontSize="small" />
                  {waSending ? 'Sending...' : 'Send Delivery Status Update'}
                </button>
                {directWaLink && (
                  <a href={directWaLink} target="_blank" rel="noopener noreferrer" className="od-wa-direct-btn">
                    Open Direct Chat Preview ↗
                  </a>
                )}
              </div>
              {!order.customer_phone && (
                <div className="od-alert od-alert-warning">
                  <WarningAmberIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  No phone number provided for this order. Customer notifications cannot be dispatched.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ===== RIGHT SIDEBAR: Customer, Payment & Status Manager ===== */}
        <div className="od-col-side">

          {/* Price & Billing Summary (NO GST - TAXES INCLUDED) */}
          <div className="od-card od-summary-card">
            <div className="od-card-title-bar">
              <h2 className="od-card-title">Payment Summary</h2>
              <span className={`od-payment-tag ${order.payment_id ? 'tag-paid' : 'tag-unpaid'}`}>
                {order.payment_id ? 'PREPAID' : 'COD'}
              </span>
            </div>

            <div className="od-summary-breakdown">
              <div className="od-sum-row">
                <span>Items Subtotal</span>
                <span className="od-sum-num">
                  ₹{(order.subtotal !== undefined && order.subtotal !== null ? Number(order.subtotal) : itemsSubtotal).toFixed(2)}
                </span>
              </div>

              {Number(order.discount_amount || 0) > 0 && (
                <div className="od-sum-row od-discount-row">
                  <span>Promo / Discount</span>
                  <span className="od-sum-num">-₹{Number(order.discount_amount).toFixed(2)}</span>
                </div>
              )}

              <div className="od-sum-row">
                <span>Shipping & Handling</span>
                <span className="od-sum-num">
                  {Number(order.shipping || 0) === 0 ? <span className="od-free-ship">FREE</span> : `₹${Number(order.shipping).toFixed(2)}`}
                </span>
              </div>

              <div className="od-sum-divider" />

              <div className="od-sum-row od-grand-total">
                <div>
                  <div className="od-total-label">Grand Total</div>
                  <div className="od-tax-subtext">Included of all taxes</div>
                </div>
                <div className="od-total-amount">
                  ₹{Number(order.total_amount || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {order.payment_id && (
              <div className="od-payment-ref">
                <span className="od-ref-label">Payment Ref ID:</span>
                <span className="od-ref-val">{order.payment_id}</span>
              </div>
            )}
          </div>

          {/* Customer & Destination Address */}
          <div className="od-card">
            <div className="od-card-title-bar">
              <h2 className="od-card-title">Customer Information</h2>
            </div>

            <div className="od-customer-box">
              <div className="od-cust-avatar">
                {order.customer_name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div className="od-cust-details">
                <div className="od-cust-name">{order.customer_name}</div>
                {order.customer_phone && (
                  <a href={`tel:${order.customer_phone}`} className="od-cust-link">
                    <PhoneIcon fontSize="inherit" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    {order.customer_phone}
                  </a>
                )}
                <a href={`mailto:${order.customer_email}`} className="od-cust-link">
                  <EmailIcon fontSize="inherit" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  {order.customer_email}
                </a>
              </div>
            </div>

            <div className="od-address-block">
              <div className="od-addr-title">Delivery Address</div>
              <div className="od-addr-text">
                <p>{order.customer_address}</p>
                <p><strong>{order.city}</strong>, {order.state} — <strong>{order.pincode}</strong></p>
              </div>
            </div>
          </div>

          {/* Quick Status Changer */}
          <div className="od-card">
            <div className="od-card-title-bar">
              <h2 className="od-card-title">Update Status</h2>
            </div>

            <div className="od-status-selector-grid">
              {['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map(s => {
                const isActive = order.status?.toLowerCase() === s;
                return (
                  <button
                    key={s}
                    disabled={updating || isActive}
                    onClick={() => setStatusConfirm(s)}
                    className={`od-status-btn-pill ${isActive ? 'active' : ''} ${s === 'cancelled' ? 'is-danger' : ''}`}
                  >
                    {isActive && <CheckIcon fontSize="inherit" style={{ verticalAlign: 'middle', marginRight: '4px' }} />}
                    {s.replace(/_/g, ' ')}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ===== STATUS CONFIRM MODAL ===== */}
      {statusConfirm && (
        <div className="od-modal-overlay" onClick={() => setStatusConfirm(null)}>
          <div className="od-modal-card" onClick={e => e.stopPropagation()}>
            <div className="od-modal-icon">
              {statusConfirm === 'cancelled' ? (
                <WarningAmberIcon style={{ fontSize: '40px', color: '#ef4444' }} />
              ) : (
                <AutorenewIcon style={{ fontSize: '40px', color: '#3b82f6' }} />
              )}
            </div>
            <h3 className="od-modal-heading">Confirm Status Change</h3>
            <p className="od-modal-desc">
              Change status from <strong className="od-highlight">{order.status.replace(/_/g, ' ')}</strong> to{' '}
              <strong className="od-highlight">{statusConfirm.replace(/_/g, ' ')}</strong>?
            </p>
            {statusConfirm === 'cancelled' && (
              <p className="od-modal-warn">This will cancel the order flow.</p>
            )}
            <div className="od-modal-btn-row">
              <button className="od-btn od-btn-secondary" onClick={() => setStatusConfirm(null)}>
                Cancel
              </button>
              <button
                className={`od-btn ${statusConfirm === 'cancelled' ? 'od-btn-danger' : 'od-btn-primary'}`}
                onClick={() => handleStatusUpdate(statusConfirm)}
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Yes, Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Label Modal */}
      {showLabel && <ShippingLabel orders={labelData} onClose={() => setShowLabel(false)} />}
    </section>
  );
}
