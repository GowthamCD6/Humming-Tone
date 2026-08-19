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
      localStorage.removeItem('paymentFailure');
    } else {
      setFailureData({
        errorCode: 'PAYMENT_DECLINED',
        errorMessage: 'Your payment could not be processed at this time.',
        timestamp: new Date().toISOString(),
        transactionId: location.state?.order_number || ('ORD-' + Date.now()),
        amount: 0,
        reason: 'Payment was cancelled or declined by your bank/payment gateway'
      });
    }
  }, [location]);

  if (!failureData) {
    return (
      <div className="ps-page-container">
        <div className="payment-result">
          <div className="result-header">
            <h1>Verifying Status...</h1>
          </div>
        </div>
      </div>
    );
  }

  const {
    errorCode = 'PAYMENT_DECLINED',
    errorMessage = 'Your payment could not be processed.',
    timestamp = new Date().toISOString(),
    transactionId = 'ORD-' + Date.now(),
    reason = 'Payment was declined or cancelled by the user/bank',
  } = failureData;

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Recently';
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRetryPayment = () => {
    navigate('/usertab/checkout');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:fashionandmore.md@gmail.com?subject=Payment Incomplete Support - ' + transactionId;
  };

  return (
    <div className="ps-page-container">
      <div className="payment-result payment-failure-card">
        {/* Failure Header */}
        <div className="result-header">
          <div className="pf-cancel-icon-bubble">
            <CancelIcon className="pf-cancel-icon" />
          </div>
          <h1 className="pf-title">Payment Unsuccessful</h1>
          <p className="result-subtitle">
            We were unable to process your payment. If any amount was deducted by your bank, it will be automatically refunded within 5-7 business days.
          </p>
        </div>

        {/* Error Details */}
        <div className="error-details">
          <div className="order-details-header">
            <h3>Transaction Details</h3>
            <span className="pf-error-badge">Payment Failed</span>
          </div>

          <div className="error-message">
            <ErrorOutlineIcon style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: '#dc2626' }} />
            <span>{errorMessage}</span>
          </div>
          <p className="pf-reason-text">
            <strong>Reason:</strong> {reason}
          </p>

          <div className="error-meta">
            <div className="meta-item">
              <span className="meta-label">Reference ID</span>
              <span className="meta-value ps-order-number">{transactionId}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Error Code</span>
              <span className="meta-value">{errorCode}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Date & Time</span>
              <span className="meta-value">{formatTimestamp(timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="next-steps">
          <h3>What can you do now?</h3>
          <div className="steps-list">
            <div className="step-item">
              <div className="step-icon">
                <CreditCardIcon />
              </div>
              <div className="step-text">
                <strong>Try a Different Payment Method</strong>
                <p>Use a different UPI app, debit/credit card, or net banking option to complete your order.</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-icon">
                <AccountBalanceIcon />
              </div>
              <div className="step-text">
                <strong>Check Account Balance & Limits</strong>
                <p>Verify that your bank account has sufficient balance and online transactions are enabled.</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-icon">
                <SupportAgentIcon />
              </div>
              <div className="step-text">
                <strong>Need Assistance?</strong>
                <p>Our team is available at <strong>fashionandmore.md@gmail.com</strong> or <strong>+91 80729 77025</strong>.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="result-actions">
          <button className="btn btn-primary" onClick={handleRetryPayment}>
            <RefreshIcon />
            Retry Checkout
          </button>
          <button className="btn btn-secondary" onClick={handleContactSupport}>
            <SupportAgentIcon />
            Contact Support
          </button>
          <button className="btn btn-home" onClick={() => navigate('/usertab/home')}>
            <HomeIcon />
            Back to Home
          </button>
        </div>

        <div className="payment-footer">
          <p>Your items are safely retained in your cart so you can easily try again.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;