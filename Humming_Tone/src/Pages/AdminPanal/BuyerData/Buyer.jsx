import React, { useState, useEffect, useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close';
import './Buyer.css';

export default function Buyer() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState(null);

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:5000/api/orders/manage', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setBuyers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Fetch error:', error);
        setBuyers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBuyers();
  }, []);

  // 🔹 Group buyers by email and count orders
  const groupedBuyers = useMemo(() => {
    const map = new Map();

    buyers.forEach((buyer) => {
      const email = buyer.customer_email?.toLowerCase() || 'unknown';
      if (map.has(email)) {
        map.get(email).orderCount += 1;
      } else {
        map.set(email, {
          ...buyer,
          orderCount: 1,
        });
      }
    });

    return Array.from(map.values());
  }, [buyers]);

  // 🔹 Manual Order Filter + Search
  const filteredBuyers = useMemo(() => {
    let result = groupedBuyers;

    // ----- ORDER FILTER -----
    if (orderFilter.trim()) {
      const filter = orderFilter.toLowerCase();

      // all
      if (filter !== 'all') {
        // Exact number (e.g., 1, 3)
        if (/^\d+$/.test(filter)) {
          const num = Number(filter);
          result = result.filter((b) => b.orderCount === num);
        }

        // Range (e.g., 2-5)
        else if (/^\d+\s*-\s*\d+$/.test(filter)) {
          const [min, max] = filter.split('-').map(Number);
          result = result.filter(
            (b) => b.orderCount >= min && b.orderCount <= max
          );
        }

        // Greater than (5+, >5)
        else if (filter.includes('+') || filter.startsWith('>')) {
          const num = parseInt(filter.replace(/\D/g, ''), 10);
          if (!isNaN(num)) {
            result = result.filter((b) => b.orderCount > num);
          }
        }
      }
    }

    // ----- SEARCH FILTER -----
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (buyer) =>
          buyer.customer_name?.toLowerCase().includes(search) ||
          buyer.customer_email?.toLowerCase().includes(search) ||
          buyer.customer_phone?.toLowerCase().includes(search) ||
          buyer.customer_address?.toLowerCase().includes(search) ||
          buyer.city?.toLowerCase().includes(search) ||
          buyer.state?.toLowerCase().includes(search) ||
          buyer.pincode?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [groupedBuyers, searchTerm, orderFilter]);

  if (loading) {
    return (
      <section className="buyer-page-container">
        <div className="buyer-loading">Loading buyer information...</div>
      </section>
    );
  }

  return (
    <section className="buyer-page-container">

      {/* 🔹 Search & Filter Bar */}
      <div className="buyer-filter-container">

        {/* Search */}
        <div className="buyer-search-wrapper">
          <SearchIcon className="buyer-search-icon" />
          <input
            type="text"
            className="buyer-search-box"
            placeholder="Search by name, email, phone, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Manual Order Filter */}
        <div className="buyer-filter-wrapper">
          <FilterListIcon className="buyer-filter-icon" />
          <input
            type="text"
            className="buyer-order-filter"
            placeholder=" Search by Order count"
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
          />
        </div>

        {/* Total Buyers */}
        <div className="buyer-total-badge">
          <PeopleIcon className="buyer-total-icon" />
          <span>{filteredBuyers.length} Buyers</span>
        </div>
      </div>

      {/* 🔹 Buyers Cards */}
      {filteredBuyers.length === 0 ? (
        <div className="no-buyers">
          No buyers found.
        </div>
      ) : (
        <div className="buyer-cards-grid">
          {filteredBuyers.map((buyer, index) => (
            <div
              key={buyer.customer_email || index}
              className="buyer-card"
              onClick={() => setSelectedBuyer(buyer)}
              style={{ cursor: 'pointer' }}
            >
              <div className="buyer-card-header">
                <h3 className="buyer-card-name" title={buyer.customer_name || 'N/A'}>
                  {buyer.customer_name || 'N/A'}
                </h3>
                <span className="buyer-order-badge">
                  {buyer.orderCount} {buyer.orderCount === 1 ? 'Order' : 'Orders'}
                </span>
              </div>

              <div className="buyer-card-body">
                <div className="buyer-card-row">
                  <span className="buyer-card-label">Email</span>
                  <a
                    href={`mailto:${buyer.customer_email}`}
                    className="buyer-card-value buyer-card-link"
                    onClick={(e) => e.stopPropagation()}
                    title={buyer.customer_email || 'N/A'}
                  >
                    {buyer.customer_email || 'N/A'}
                  </a>
                </div>

                <div className="buyer-card-row">
                  <span className="buyer-card-label">Phone</span>
                  <a
                    href={`tel:${buyer.customer_phone}`}
                    className="buyer-card-value buyer-card-link"
                    onClick={(e) => e.stopPropagation()}
                    title={buyer.customer_phone || 'N/A'}
                  >
                    {buyer.customer_phone || 'N/A'}
                  </a>
                </div>

                <div className="buyer-card-row">
                  <span className="buyer-card-label">Address</span>
                  <span className="buyer-card-value" title={buyer.customer_address || 'N/A'}>
                    {buyer.customer_address || 'N/A'}
                  </span>
                </div>

                <div className="buyer-card-row-inline">
                  <div className="buyer-card-item">
                    <span className="buyer-card-label">City</span>
                    <span className="buyer-card-value" title={buyer.city || 'N/A'}>{buyer.city || 'N/A'}</span>
                  </div>

                  <div className="buyer-card-item">
                    <span className="buyer-card-label">State</span>
                    <span className="buyer-card-value" title={buyer.state || 'N/A'}>{buyer.state || 'N/A'}</span>
                  </div>

                  <div className="buyer-card-item">
                    <span className="buyer-card-label">PIN</span>
                    <span className="buyer-card-value buyer-card-pin" title={buyer.pincode || 'N/A'}>
                      {buyer.pincode || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* 🔹 Buyer Details Modal */}
      {selectedBuyer && (
        <div className="buyer-modal-overlay" onClick={() => setSelectedBuyer(null)}>
          <div className="buyer-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="buyer-modal-header">
              <div className="buyer-modal-title-group">
                <h2>Buyer Details</h2>
                <span className="buyer-modal-orders">
                  {selectedBuyer.orderCount} {selectedBuyer.orderCount === 1 ? 'Order' : 'Orders'}
                </span>
              </div>
              <button className="buyer-modal-close" onClick={() => setSelectedBuyer(null)}>
                <CloseIcon />
              </button>
            </div>
            
            <div className="buyer-modal-body">
              <div className="buyer-modal-section">
                <div className="buyer-modal-field">
                  <span className="buyer-modal-label">Name</span>
                  <span className="buyer-modal-val name-val">{selectedBuyer.customer_name || 'N/A'}</span>
                </div>
              </div>

              <div className="buyer-modal-grid">
                <div className="buyer-modal-field">
                  <span className="buyer-modal-label">Email</span>
                  <a href={`mailto:${selectedBuyer.customer_email}`} className="buyer-modal-val link-val">
                    {selectedBuyer.customer_email || 'N/A'}
                  </a>
                </div>
                
                <div className="buyer-modal-field">
                  <span className="buyer-modal-label">Phone</span>
                  <a href={`tel:${selectedBuyer.customer_phone}`} className="buyer-modal-val link-val">
                    {selectedBuyer.customer_phone || 'N/A'}
                  </a>
                </div>
              </div>

              <div className="buyer-modal-section">
                <div className="buyer-modal-field">
                  <span className="buyer-modal-label">Full Address</span>
                  <span className="buyer-modal-val address-val">{selectedBuyer.customer_address || 'N/A'}</span>
                </div>
              </div>

              <div className="buyer-modal-grid-three">
                <div className="buyer-modal-field">
                  <span className="buyer-modal-label">City</span>
                  <span className="buyer-modal-val">{selectedBuyer.city || 'N/A'}</span>
                </div>
                
                <div className="buyer-modal-field">
                  <span className="buyer-modal-label">State</span>
                  <span className="buyer-modal-val">{selectedBuyer.state || 'N/A'}</span>
                </div>
                
                <div className="buyer-modal-field">
                  <span className="buyer-modal-label">PIN Code</span>
                  <span className="buyer-modal-val pin-val">{selectedBuyer.pincode || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="buyer-modal-footer">
              <button className="buyer-modal-btn" onClick={() => setSelectedBuyer(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
