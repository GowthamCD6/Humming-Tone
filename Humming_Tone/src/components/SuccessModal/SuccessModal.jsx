import React, { useEffect } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import './SuccessModal.css';

const SuccessModal = ({ isOpen, message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay">
      <div className="success-modal-content">
        <div className="success-modal-icon">
          <CheckCircleIcon />
        </div>
        <h2 className="success-modal-title">Success!</h2>
        <p className="success-modal-message">{message}</p>
        <button className="success-modal-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;