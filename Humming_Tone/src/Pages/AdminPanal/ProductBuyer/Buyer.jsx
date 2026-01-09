import React, { useState, useEffect, useMemo } from 'react';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import './Buyer.css';

export default function Buyer() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        // Fetch orders which contain buyer information
        const response = await fetch('http://localhost:5000/api/orders/manage');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setBuyers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch error:", error);
        setBuyers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBuyers();
  }, []);

  // Filter buyers based on search term
  const filteredBuyers = useMemo(() => {
    if (!searchTerm.trim()) return buyers;
    
    const search = searchTerm.toLowerCase();
    return buyers.filter(buyer => 
      buyer.customer_name?.toLowerCase().includes(search) ||
      buyer.customer_email?.toLowerCase().includes(search) ||
      buyer.customer_phone?.toLowerCase().includes(search) ||
      buyer.customer_address?.toLowerCase().includes(search) ||
      buyer.city?.toLowerCase().includes(search) ||
      buyer.state?.toLowerCase().includes(search) ||
      buyer.pincode?.toLowerCase().includes(search)
    );
  }, [buyers, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => ({
    totalBuyers: buyers.length,
    totalRevenue: buyers.reduce((sum, buyer) => sum + parseFloat(buyer.total_amount || 0), 0)
  }), [buyers]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <section className="buyer-page-container">
        <div className="buyer-loading">Loading buyer information...</div>
      </section>
    );
  }

  return (
    <section className="buyer-page-container">
      <h2 className="buyer-page-heading">Product Buyers</h2>

      {/* Stats Overview */}
      <div className="buyer-stats-container">
        <div className="buyer-stat-card">
          <h3>Total Buyers</h3>
          <span className="buyer-stat-number">{stats.totalBuyers}</span>
        </div>
        <div className="buyer-stat-card">
          <h3>Total Revenue</h3>
          <span className="buyer-stat-number">₹{stats.totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="buyer-filter-container">
        <input
          type="text"
          className="buyer-search-box"
          placeholder="Search by name, email, phone, address, city, state, or PIN code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Buyers Grid */}
      {filteredBuyers.length === 0 ? (
        <div className="no-buyers">
          {searchTerm ? 'No buyers found matching your search.' : 'No buyers found.'}
        </div>
      ) : (
        <div className="buyers-grid">
          {filteredBuyers.map((buyer) => (
            <div key={buyer.id} className="buyer-card">
              {/* Card Header */}
              <div className="buyer-card-header">
                <div className="buyer-name-section">
                  <h3 className="buyer-name">{buyer.customer_name || 'N/A'}</h3>
                  <div className="buyer-order-date">
                    <CalendarTodayIcon style={{ fontSize: '14px', marginRight: '4px' }} />
                    <span>{formatDate(buyer.created_at)}</span>
                    <span>• {formatTime(buyer.created_at)}</span>
                  </div>
                </div>
                <span className={`buyer-status-badge ${buyer.status?.toLowerCase()}`}>
                  {buyer.status || 'pending'}
                </span>
              </div>

              {/* Contact Information */}
              <div className="buyer-info-section">
                <div className="buyer-info-row">
                  <span className="buyer-info-label">Email</span>
                  <span className="buyer-info-value">
                    <a href={`mailto:${buyer.customer_email}`}>
                      {buyer.customer_email || 'N/A'}
                    </a>
                  </span>
                </div>

                <div className="buyer-info-row">
                  <span className="buyer-info-label">Phone</span>
                  <span className="buyer-info-value">
                    <a href={`tel:${buyer.customer_phone}`}>
                      {buyer.customer_phone || 'N/A'}
                    </a>
                  </span>
                </div>
              </div>

              {/* Address Section */}
              {buyer.customer_address && (
                <div className="buyer-address-section">
                  <div className="buyer-address-title">Delivery Address</div>
                  <div className="buyer-address-text">
                    {buyer.customer_address}
                  </div>
                  <div className="buyer-location-info">
                    {buyer.city && (
                      <div className="buyer-location-item">
                        <strong>City:</strong> {buyer.city}
                      </div>
                    )}
                    {buyer.state && (
                      <div className="buyer-location-item">
                        <strong>State:</strong> {buyer.state}
                      </div>
                    )}
                    {buyer.pincode && (
                      <div className="buyer-location-item">
                        <strong>PIN:</strong> {buyer.pincode}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Instructions */}
              {buyer.order_instructions && (
                <div className="buyer-instructions-section">
                  <div className="buyer-instructions-title">Order Instructions</div>
                  <div className="buyer-instructions-text">
                    {buyer.order_instructions}
                  </div>
                </div>
              )}

              {/* Card Footer - Order Total */}
              <div className="buyer-card-footer">
                <div className="buyer-order-total">
                  <span className="buyer-total-label">Order Total:</span>
                  <span className="buyer-total-amount">
                    ₹{parseFloat(buyer.total_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}