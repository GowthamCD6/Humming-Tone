import React, { useState, useEffect, useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleIcon from '@mui/icons-material/People';
import './Buyer.css';

export default function Buyer() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

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

  // Group buyers by email and count orders
  const groupedBuyers = useMemo(() => {
    const buyerMap = new Map();
    
    buyers.forEach(buyer => {
      const email = buyer.customer_email?.toLowerCase() || 'unknown';
      if (buyerMap.has(email)) {
        const existing = buyerMap.get(email);
        existing.orderCount += 1;
      } else {
        buyerMap.set(email, {
          ...buyer,
          orderCount: 1
        });
      }
    });
    
    return Array.from(buyerMap.values());
  }, [buyers]);

  // Filter buyers based on search term and order count
  const filteredBuyers = useMemo(() => {
    let result = groupedBuyers;
    
    // Apply order count filter
    if (orderFilter !== 'all') {
      if (orderFilter === '1') {
        result = result.filter(buyer => buyer.orderCount === 1);
      } else if (orderFilter === '2-5') {
        result = result.filter(buyer => buyer.orderCount >= 2 && buyer.orderCount <= 5);
      } else if (orderFilter === '5+') {
        result = result.filter(buyer => buyer.orderCount > 5);
      }
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(buyer => 
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
  }, [groupedBuyers, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => ({
    totalBuyers: groupedBuyers.length,
    totalOrders: buyers.length
  }), [buyers, groupedBuyers]);

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

      {/* Search & Filter Bar */}
      <div className="buyer-filter-container">
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
        <div className="buyer-filter-wrapper">
          <FilterListIcon className="buyer-filter-icon" />
          <select
            className="buyer-order-filter"
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="1">1 Order</option>
            <option value="2-5">2-5 Orders</option>
            <option value="5+">5+ Orders</option>
          </select>
        </div>
        <div className="buyer-total-badge">
          <PeopleIcon className="buyer-total-icon" />
          <span>{filteredBuyers.length} Buyers</span>
        </div>
      </div>

        {/* Buyers Cards */}
      {filteredBuyers.length === 0 ? (
        <div className="no-buyers">
          {searchTerm ? 'No buyers found matching your search.' : 'No buyers found.'}
        </div>
      ) : (
        <div className="buyer-cards-grid">
          {filteredBuyers.map((buyer, index) => (
            <div key={buyer.customer_email || index} className="buyer-card">
              <div className="buyer-card-header">
                <h3 className="buyer-card-name">{buyer.customer_name || 'N/A'}</h3>
                <span className="buyer-order-badge">{buyer.orderCount} {buyer.orderCount === 1 ? 'Order' : 'Orders'}</span>
              </div>
              <div className="buyer-card-body">
                <div className="buyer-card-row">
                  <span className="buyer-card-label">Email</span>
                  <a href={`mailto:${buyer.customer_email}`} className="buyer-card-value buyer-card-link">
                    {buyer.customer_email || 'N/A'}
                  </a>
                </div>
                <div className="buyer-card-row">
                  <span className="buyer-card-label">Phone</span>
                  <a href={`tel:${buyer.customer_phone}`} className="buyer-card-value buyer-card-link">
                    {buyer.customer_phone || 'N/A'}
                  </a>
                </div>
                <div className="buyer-card-row">
                  <span className="buyer-card-label">Address</span>
                  <span className="buyer-card-value">{buyer.customer_address || 'N/A'}</span>
                </div>
                <div className="buyer-card-row-inline">
                  <div className="buyer-card-item">
                    <span className="buyer-card-label">City</span>
                    <span className="buyer-card-value">{buyer.city || 'N/A'}</span>
                  </div>
                  <div className="buyer-card-item">
                    <span className="buyer-card-label">State</span>
                    <span className="buyer-card-value">{buyer.state || 'N/A'}</span>
                  </div>
                  <div className="buyer-card-item">
                    <span className="buyer-card-label">PIN</span>
                    <span className="buyer-card-value buyer-card-pin">{buyer.pincode || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}