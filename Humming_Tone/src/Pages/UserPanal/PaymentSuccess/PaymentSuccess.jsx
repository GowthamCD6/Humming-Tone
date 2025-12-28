import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import EmailIcon from '@mui/icons-material/Email';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // Get order data from navigation state or localStorage
    const data = location.state?.orderData || JSON.parse(localStorage.getItem('lastOrder') || 'null');
    
    if (data) {
      setOrderData(data);
      // Clear from localStorage after retrieving
      localStorage.removeItem('lastOrder');
    } else {
      // If no order data, redirect to home
      setTimeout(() => navigate('/usertab/home'), 3000);
    }
  }, [location, navigate]);

  if (!orderData) {
    return (
      <div className="payment-result">
        <div className="result-header">
          <span className="result-icon">⏳</span>
          <h1>Loading Order Details...</h1>
        </div>
      </div>
    );
  }

  const {
    orderId = 'ORD-' + Date.now(),
    orderDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    paymentMethod = 'Credit Card',
    paymentStatus = 'Paid',
    orderStatus = 'Confirmed',
    estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    shippingAddress = {
      name: 'John Doe',
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@example.com'
    },
    items = [],
    subtotal = 0,
    shipping = 0,
    tax = 0,
    total = 0
  } = orderData;

  return (
    <div className="payment-result">
      {/* Success Header */}
      <div className="result-header">
        <CheckCircleIcon className="result-icon" style={{ color: '#27ae60' }} />
        <h1>Payment Successful!</h1>
        <p>Thank you for your order. We've received your payment and will begin processing your order shortly.</p>
      </div>

      {/* Order Details */}
      <div className="order-details">
        <h2>Order Details</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Order Number</span>
            <span className="detail-value">{orderId}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Order Date</span>
            <span className="detail-value">{orderDate}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Payment Method</span>
            <span className="detail-value">{paymentMethod}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Payment Status</span>
            <span className="status-badge status-paid">{paymentStatus}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Order Status</span>
            <span className="status-badge status-confirmed">{orderStatus}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Estimated Delivery</span>
            <span className="detail-value">{estimatedDelivery}</span>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="shipping-info">
        <h3>Shipping Information</h3>
        <div className="shipping-details">
          <div className="shipping-item">
            <span className="shipping-label">Recipient Name</span>
            <span className="shipping-value">{shippingAddress.name}</span>
          </div>
          <div className="shipping-item">
            <span className="shipping-label">Shipping Address</span>
            <span className="shipping-value">
              {shippingAddress.street}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
              {shippingAddress.country}
            </span>
          </div>
          <div className="shipping-item">
            <span className="shipping-label">Contact Number</span>
            <span className="shipping-value">{shippingAddress.phone}</span>
          </div>
          <div className="shipping-item">
            <span className="shipping-label">Email Address</span>
            <span className="shipping-value">{shippingAddress.email}</span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="order-items-section">
        <h3>Order Items</h3>
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="order-item">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="order-item-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="placeholder-image" style={{ display: item.image ? 'none' : 'flex' }}>
                No Image
              </div>
              <div className="order-item-details">
                <div className="order-item-name">{item.name || 'Product Name'}</div>
                <div className="order-item-meta">
                  {item.size && `Size: ${item.size}`}
                  {item.color && ` • Color: ${item.color}`}
                  {item.quantity && ` • Qty: ${item.quantity}`}
                </div>
              </div>
              <div className="order-item-price">
                ₹{(item.price * (item.quantity || 1)).toFixed(2)}
              </div>
            </div>
          ))
        ) : (
          <div className="order-item">
            <div className="placeholder-image">No Image</div>
            <div className="order-item-details">
              <div className="order-item-name">Sample Product</div>
              <div className="order-item-meta">Size: M • Color: Black • Qty: 1</div>
            </div>
            <div className="order-item-price">₹999.00</div>
          </div>
        )}

        {/* Order Totals */}
        <div className="order-totals">
          <div className="total-row">
            <span className="total-label">Subtotal</span>
            <span className="total-value">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span className="total-label">Shipping</span>
            <span className="total-value">₹{shipping.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span className="total-label">Tax</span>
            <span className="total-value">₹{tax.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span className="total-label">Total</span>
            <span className="total-value total-final">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="next-steps">
        <h3>What Happens Next?</h3>
        
        <div className="step-item">
          <EmailIcon className="step-icon" style={{ color: '#3498db' }} />
          <div className="step-content">
            <div className="step-title">Order Confirmation Email</div>
            <div className="step-description">
              You'll receive a confirmation email at {shippingAddress.email} with your order details and receipt.
            </div>
          </div>
        </div>

        <div className="step-item">
          <InventoryIcon className="step-icon" style={{ color: '#9b59b6' }} />
          <div className="step-content">
            <div className="step-title">Order Processing</div>
            <div className="step-description">
              Our team will carefully prepare your items for shipment. This usually takes 1-2 business days.
            </div>
          </div>
        </div>

        <div className="step-item">
          <LocalShippingIcon className="step-icon" style={{ color: '#f39c12' }} />
          <div className="step-content">
            <div className="step-title">Shipping & Delivery</div>
            <div className="step-description">
              Once shipped, you'll receive tracking information. Estimated delivery: {estimatedDelivery}
            </div>
          </div>
        </div>

        <div className="step-item">
          <SupportAgentIcon className="step-icon" style={{ color: '#27ae60' }} />
          <div className="step-content">
            <div className="step-title">We're Here to Help</div>
            <div className="step-description">
              Questions about your order? Our support team is available 24/7 to assist you.
            </div>
          </div>
        </div>
      </div>

      {/* Support Information */}
      <div className="support-info">
        <p>Need help with your order?</p>
        <p>Contact us at <span className="support-email">fashionandmore.md@gmail.com</span></p>
        <p>or call +91 80729 77025</p>
      </div>

      {/* Action Buttons */}
      <div className="result-actions">
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/usertab/home')}
        >
          <HomeIcon />
          Continue Shopping
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/usertab/orders')}
        >
          <ShoppingBagIcon />
          View Orders
        </button>
        <button 
          className="btn btn-outline"
          onClick={() => window.print()}
        >
          Print Receipt
        </button>
      </div>

      {/* Footer */}
      <div className="payment-footer">
        <p>Thank you for shopping with Humming & Tone!</p>
        <p>We appreciate your business and look forward to serving you again.</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;