import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CancelIcon from '@mui/icons-material/Cancel';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import './PaymentFailure.css';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [failureData, setFailureData] = useState(null);

  useEffect(() => {
    // Get failure data from navigation state or localStorage
    const data = location.state?.failureData || JSON.parse(localStorage.getItem('paymentFailure') || 'null');
    
    if (data) {
      setFailureData(data);
      // Clear from localStorage after retrieving
      localStorage.removeItem('paymentFailure');
    } else {
      // If no failure data, create default data
      setFailureData({
        errorCode: 'PAYMENT_DECLINED',
        errorMessage: 'Your payment could not be processed at this time.',
        timestamp: new Date().toISOString(),
        transactionId: 'TXN-' + Date.now(),
        amount: 0,
        reason: 'Payment was declined by your bank or card issuer'
      });
    }
  }, [location]);

  if (!failureData) {
    return (
      <div className="payment-result">
        <div className="result-header">
          <span className="result-icon">⏳</span>
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  const {
    errorCode = 'PAYMENT_DECLINED',
    errorMessage = 'Your payment could not be processed.',
    timestamp = new Date().toISOString(),
    transactionId = 'TXN-' + Date.now(),
    amount = 0,
    reason = 'Payment was declined by your bank or card issuer',
    attemptedPaymentMethod = 'Credit Card'
  } = failureData;

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleRetryPayment = () => {
    // Navigate back to checkout or payment page
    navigate('/usertab/checkout');
  };

  const handleContactSupport = () => {
    // Navigate to contact page or open email
    window.location.href = 'mailto:fashionandmore.md@gmail.com?subject=Payment Failed - ' + transactionId;
  };

  return (
    <div className="payment-result">
      {/* Failure Header */}
      <div className="result-header">
        <CancelIcon className="result-icon" style={{ color: '#e74c3c' }} />
        <h1>Payment Failed</h1>
        <p>We're sorry, but we couldn't process your payment. Please review the details below and try again.</p>
      </div>

      {/* Error Details */}
      <div className="error-details">
        <h3>Payment Error Details</h3>
        <div className="error-message">
          <ErrorOutlineIcon style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: '#991b1b' }} />
          {errorMessage}
        </div>
        <p style={{ color: '#991b1b', marginBottom: '2rem', lineHeight: '1.8' }}>
          Reason: {reason}
        </p>

        <div className="error-meta">
          <div className="meta-item">
            <span className="meta-label">Error Code</span>
            <span className="meta-value">{errorCode}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Transaction ID</span>
            <span className="meta-value">{transactionId}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Timestamp</span>
            <span className="meta-value">{formatTimestamp(timestamp)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Amount</span>
            <span className="meta-value">₹{amount.toFixed(2)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Payment Method</span>
            <span className="meta-value">{attemptedPaymentMethod}</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="next-steps">
        <h3>What You Can Do Next</h3>
        
        <div className="step-item">
          <CreditCardIcon className="step-icon" style={{ color: '#f39c12' }} />
          <div className="step-content">
            <div className="step-title">Verify Your Payment Information</div>
            <div className="step-description">
              Double-check your card number, expiration date, CVV, and billing address. Ensure all details are entered correctly.
            </div>
          </div>
        </div>

        <div className="step-item">
          <AccountBalanceIcon className="step-icon" style={{ color: '#9b59b6' }} />
          <div className="step-content">
            <div className="step-title">Check Your Account Balance</div>
            <div className="step-description">
              Make sure you have sufficient funds in your account and that your card hasn't reached its spending limit.
            </div>
          </div>
        </div>

        <div className="step-item">
          <RefreshIcon className="step-icon" style={{ color: '#3498db' }} />
          <div className="step-content">
            <div className="step-title">Try a Different Payment Method</div>
            <div className="step-description">
              If the issue persists, consider using an alternative payment method such as a different card, UPI, or net banking.
            </div>
          </div>
        </div>

        <div className="step-item">
          <SupportAgentIcon className="step-icon" style={{ color: '#e74c3c' }} />
          <div className="step-content">
            <div className="step-title">Contact Your Bank</div>
            <div className="step-description">
              Your bank may have declined the transaction for security reasons. Contact them to authorize the payment or resolve any issues.
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="result-actions">
        <button 
          className="btn btn-primary"
          onClick={handleRetryPayment}
        >
          <RefreshIcon />
          Retry Payment
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/usertab/home')}
        >
          <HomeIcon />
          Back to Home
        </button>
      </div>

      {/* Support Information */}
      <div className="support-info">
        <h4>Need Help?</h4>
        <p style={{ marginBottom: '2rem', color: '#004085' }}>
          Our customer support team is here to assist you with any payment issues.
        </p>

        <div className="support-details">
          <div className="support-item">
            <span className="support-label">Email Support</span>
            <span className="support-value">fashionandmore.md@gmail.com</span>
          </div>
          <div className="support-item">
            <span className="support-label">Phone Support</span>
            <span className="support-value">+91 80729 77025</span>
          </div>
          <div className="support-item">
            <span className="support-label">Support Hours</span>
            <span className="support-value">24/7 Available</span>
          </div>
        </div>

        <div className="reference-note">
          Please reference Transaction ID <strong>{transactionId}</strong> when contacting support for faster assistance.
        </div>

        <button 
          className="btn btn-secondary"
          onClick={handleContactSupport}
          style={{ marginTop: '2rem' }}
        >
          <SupportAgentIcon />
          Contact Support
        </button>
      </div>

      {/* Important Notes */}
      <div className="important-notes">
        <p>
          <strong>Important:</strong> No amount has been charged to your account. If you see a pending transaction, 
          it will be automatically reversed by your bank within 5-7 business days. Your items remain in your cart 
          and can be purchased once the payment issue is resolved.
        </p>
      </div>

      {/* Footer */}
      <div className="payment-footer">
        <p>We apologize for the inconvenience.</p>
        <p>Your security and shopping experience are our top priorities.</p>
      </div>
    </div>
  );
};

export default PaymentFailure;