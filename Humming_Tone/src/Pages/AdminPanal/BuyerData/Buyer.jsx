import React, { useState, useEffect, useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { API_BASE_URL } from '../../../utils/apiConfig';
import './Buyer.css';

export default function Buyer() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [sortBy, setSortBy] = useState('orders-desc');
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // Try dedicated customers endpoint first, then fallback to order manage
      let res = await fetch(`${API_BASE_URL}/admin/customers`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setBuyers(data);
          setLoading(false);
          return;
        }
      }

      // Fallback: load from /api/orders/manage and aggregate
      res = await fetch(`${API_BASE_URL}/api/orders/manage`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const ordersData = await res.json();
        const map = new Map();
        (ordersData || []).forEach((order) => {
          const email = (order.customer_email || '').toLowerCase().trim();
          if (!email) return;
          if (map.has(email)) {
            const existing = map.get(email);
            existing.total_orders = (existing.total_orders || 1) + 1;
            existing.total_spent = (existing.total_spent || 0) + Number(order.total_amount || 0);
            if (!existing.address && order.customer_address) existing.address = order.customer_address;
            if (!existing.phone && order.customer_phone) existing.phone = order.customer_phone;
            if (!existing.name && order.customer_name) existing.name = order.customer_name;
            if (!existing.city && order.city) existing.city = order.city;
            if (!existing.state && order.state) existing.state = order.state;
            if (!existing.pincode && order.pincode) existing.pincode = order.pincode;
          } else {
            map.set(email, {
              id: order.id,
              name: order.customer_name || 'Customer',
              email: order.customer_email,
              phone: order.customer_phone || '',
              address: order.customer_address || '',
              city: order.city || '',
              state: order.state || '',
              pincode: order.pincode || '',
              total_orders: 1,
              total_spent: Number(order.total_amount || 0),
              created_at: order.created_at,
              last_order_date: order.created_at,
            });
          }
        });
        setBuyers(Array.from(map.values()));
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setBuyers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search Logic
  const filteredBuyers = useMemo(() => {
    let result = [...buyers];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.name?.toLowerCase().includes(q) ||
          b.email?.toLowerCase().includes(q) ||
          b.phone?.toLowerCase().includes(q) ||
          b.address?.toLowerCase().includes(q) ||
          b.city?.toLowerCase().includes(q) ||
          b.state?.toLowerCase().includes(q) ||
          b.pincode?.toLowerCase().includes(q)
      );
    }

    // Order Count category filter
    if (orderFilter !== 'all') {
      if (orderFilter === '0') {
        result = result.filter((b) => Number(b.total_orders || 0) === 0);
      } else if (orderFilter === '1') {
        result = result.filter((b) => Number(b.total_orders || 0) === 1);
      } else if (orderFilter === '2-5') {
        result = result.filter((b) => Number(b.total_orders || 0) >= 2 && Number(b.total_orders || 0) <= 5);
      } else if (orderFilter === '5+') {
        result = result.filter((b) => Number(b.total_orders || 0) > 5);
      }
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'orders-desc') return (b.total_orders || 0) - (a.total_orders || 0);
      if (sortBy === 'orders-asc') return (a.total_orders || 0) - (b.total_orders || 0);
      if (sortBy === 'spent-desc') return (b.total_spent || 0) - (a.total_spent || 0);
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      return 0;
    });

    return result;
  }, [buyers, searchTerm, orderFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredBuyers.length / itemsPerPage) || 1;
  const paginatedBuyers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBuyers.slice(start, start + itemsPerPage);
  }, [filteredBuyers, currentPage]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportToCSV = () => {
    if (filteredBuyers.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Total Orders', 'Total Spent (INR)', 'Address', 'City', 'State', 'Pincode', 'Registered / Last Active'];
    const rows = filteredBuyers.map((b) => [
      `"${b.name || 'N/A'}"`,
      `"${b.email || ''}"`,
      `"${b.phone || ''}"`,
      b.total_orders || 0,
      b.total_spent || 0,
      `"${(b.address || '').replace(/"/g, '""')}"`,
      `"${b.city || ''}"`,
      `"${b.state || ''}"`,
      `"${b.pincode || ''}"`,
      `"${b.last_order_date || b.created_at || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HummingTone_Customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTierBadge = (orderCount) => {
    const count = Number(orderCount || 0);
    if (count >= 5) return { label: 'VIP Patron', className: 'tier-vip' };
    if (count >= 2) return { label: 'Loyal Buyer', className: 'tier-loyal' };
    if (count === 1) return { label: 'First-time', className: 'tier-first' };
    return { label: 'Registered', className: 'tier-registered' };
  };

  return (
    <section className="buyer-page-container">
      {/* 🔹 Search, Filter, Export & Sorter Toolbar */}
      <div className="buyer-toolbar">
        {/* Search */}
        <div className="buyer-search-wrap">
          <SearchIcon className="buyer-search-ico" />
          <input
            type="text"
            className="buyer-search-input"
            placeholder="Search by name, email, phone, city, or pincode..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              <CloseIcon fontSize="small" />
            </button>
          )}
        </div>

        {/* Order Frequency Filter */}
        <div className="buyer-select-wrap">
          <FilterListIcon className="buyer-select-ico" />
          <select
            className="buyer-select"
            value={orderFilter}
            onChange={(e) => {
              setOrderFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Customer Profiles</option>
            <option value="5+">VIP Customers (5+ orders)</option>
            <option value="2-5">Repeat Buyers (2-5 orders)</option>
            <option value="1">First-Time Buyers (1 order)</option>
            <option value="0">Registered (0 orders)</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="buyer-select-wrap">
          <select
            className="buyer-select"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="orders-desc">Sort: Most Orders</option>
            <option value="spent-desc">Sort: Highest Spend (₹)</option>
            <option value="newest">Sort: Newest Registered</option>
            <option value="name-asc">Sort: Name (A-Z)</option>
          </select>
        </div>

        {/* Export CSV Button */}
        <button
          className="buyer-export-btn"
          onClick={exportToCSV}
          disabled={filteredBuyers.length === 0}
          title="Download customer list as CSV"
        >
          <FileDownloadIcon fontSize="small" />
          <span>Export CSV</span>
        </button>

        {/* Total Badge */}
        <div className="buyer-count-badge">
          <PeopleIcon fontSize="small" />
          <span>{loading ? '...' : `${filteredBuyers.length} Users`}</span>
        </div>
      </div>

      {/* 🔹 Modern Customer Data Table */}
      <div className="buyer-table-card">
        {loading ? (
          <div className="buyer-loading-skeleton">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="skeleton-row">
                <div className="skeleton-cell avatar-col" />
                <div className="skeleton-cell name-col" />
                <div className="skeleton-cell contact-col" />
                <div className="skeleton-cell badge-col" />
                <div className="skeleton-cell amount-col" />
                <div className="skeleton-cell action-col" />
              </div>
            ))}
          </div>
        ) : filteredBuyers.length === 0 ? (
          <div className="no-buyers-box">
            <PeopleIcon style={{ fontSize: 48, color: '#94a3b8', marginBottom: 12 }} />
            <h3>No Customer Records Found</h3>
            <p>Try adjusting your search keywords or order filter settings.</p>
          </div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="buyer-data-table">
              <thead>
                <tr>
                  <th>Customer Profile</th>
                  <th>Contact Information</th>
                  <th>Primary Location</th>
                  <th>Order Frequency</th>
                  <th>Lifetime Value</th>
                  <th>Last Activity</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBuyers.map((buyer, index) => {
                  const tier = getTierBadge(buyer.total_orders);
                  const initials = buyer.name
                    ? buyer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()
                    : 'U';

                  return (
                    <tr key={buyer.email || buyer.id || index}>
                      {/* Customer Profile Column */}
                      <td>
                        <div className="buyer-profile-cell">
                          {buyer.avatar_url ? (
                            <img src={buyer.avatar_url} alt="" className="buyer-avatar-img" />
                          ) : (
                            <div className="buyer-avatar-fallback">{initials}</div>
                          )}
                          <div className="buyer-name-group">
                            <span className="buyer-fullname" title={buyer.name || 'Member'}>
                              {buyer.name || 'Humming Tone Member'}
                            </span>
                            <span className="buyer-id-tag">ID: #{buyer.id || index + 1}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info Column */}
                      <td>
                        <div className="buyer-contact-cell">
                          <div className="contact-item">
                            <EmailIcon className="contact-ico" />
                            <span className="contact-text" title={buyer.email}>{buyer.email || 'No email'}</span>
                            {buyer.email && (
                              <button
                                className="cell-copy-btn"
                                onClick={() => handleCopy(buyer.email, `em-${index}`)}
                                title="Copy Email"
                              >
                                {copiedId === `em-${index}` ? (
                                  <CheckCircleOutlineIcon style={{ fontSize: 13, color: '#16a34a' }} />
                                ) : (
                                  <ContentCopyIcon style={{ fontSize: 13 }} />
                                )}
                              </button>
                            )}
                          </div>
                          {buyer.phone ? (
                            <div className="contact-item">
                              <PhoneIcon className="contact-ico" />
                              <span className="contact-text">{buyer.phone}</span>
                            </div>
                          ) : (
                            <span className="contact-muted">Phone not linked</span>
                          )}
                        </div>
                      </td>

                      {/* Location Column */}
                      <td>
                        <div className="buyer-location-cell">
                          {buyer.city || buyer.state ? (
                            <>
                              <div className="location-main">
                                <LocationOnIcon className="loc-ico" />
                                <span>{[buyer.city, buyer.state].filter(Boolean).join(', ')}</span>
                              </div>
                              {buyer.pincode && <span className="pincode-badge">PIN: {buyer.pincode}</span>}
                            </>
                          ) : (
                            <span className="contact-muted">Not specified</span>
                          )}
                        </div>
                      </td>

                      {/* Order Count / Tier Badge */}
                      <td>
                        <div className="buyer-orders-cell">
                          <span className={`buyer-tier-badge ${tier.className}`}>{tier.label}</span>
                          <span className="buyer-order-count">
                            <ShoppingBagIcon style={{ fontSize: 14 }} />
                            {buyer.total_orders || 0} {Number(buyer.total_orders) === 1 ? 'Order' : 'Orders'}
                          </span>
                        </div>
                      </td>

                      {/* Total Spent */}
                      <td>
                        <span className="buyer-spent-val">
                          ₹{Number(buyer.total_spent || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Last Activity */}
                      <td>
                        <span className="buyer-date-val">
                          {buyer.last_order_date || buyer.created_at
                            ? new Date(buyer.last_order_date || buyer.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="buyer-view-details-btn"
                          onClick={() => setSelectedBuyer(buyer)}
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 🔹 Table Footer / Pagination */}
        {filteredBuyers.length > itemsPerPage && (
          <div className="buyer-pagination-bar">
            <span className="pagination-info">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredBuyers.length)} of {filteredBuyers.length} users
            </span>
            <div className="pagination-controls">
              <button
                className="pag-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="pag-page-num">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="pag-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🔹 Customer Details Modal */}
      {selectedBuyer && (
        <div className="buyer-modal-overlay" onClick={() => setSelectedBuyer(null)}>
          <div className="buyer-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="buyer-modal-header">
              <div className="modal-title-group">
                <div className="modal-avatar">
                  {selectedBuyer.name
                    ? selectedBuyer.name.substring(0, 2).toUpperCase()
                    : 'U'}
                </div>
                <div>
                  <h3 className="modal-buyer-name">{selectedBuyer.name || 'Member Details'}</h3>
                  <span className="modal-buyer-email">{selectedBuyer.email}</span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedBuyer(null)}>
                <CloseIcon />
              </button>
            </div>

            <div className="buyer-modal-body">
              {/* Key Stats Row */}
              <div className="modal-stats-grid">
                <div className="modal-stat-card">
                  <span className="stat-label">Total Orders</span>
                  <span className="stat-value">{selectedBuyer.total_orders || 0}</span>
                </div>
                <div className="modal-stat-card">
                  <span className="stat-label">Lifetime Value</span>
                  <span className="stat-value">₹{Number(selectedBuyer.total_spent || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="modal-stat-card">
                  <span className="stat-label">Member Status</span>
                  <span className="stat-value tier-text">{getTierBadge(selectedBuyer.total_orders).label}</span>
                </div>
              </div>

              {/* Contact & Shipping Section */}
              <div className="modal-section-box">
                <h4 className="modal-section-title">Delivery & Shipping Address</h4>
                {selectedBuyer.address ? (
                  <p className="modal-address-text">{selectedBuyer.address}</p>
                ) : (
                  <p className="modal-muted-text">No delivery address recorded yet.</p>
                )}
                <div className="modal-location-grid">
                  <div>
                    <span className="modal-field-label">City</span>
                    <span className="modal-field-val">{selectedBuyer.city || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="modal-field-label">State</span>
                    <span className="modal-field-val">{selectedBuyer.state || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="modal-field-label">Pincode</span>
                    <span className="modal-field-val">{selectedBuyer.pincode || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="modal-field-label">Phone</span>
                    <span className="modal-field-val">{selectedBuyer.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="modal-footer-actions">
                {selectedBuyer.email && (
                  <a
                    href={`mailto:${selectedBuyer.email}`}
                    className="modal-action-btn email-btn"
                  >
                    <EmailIcon fontSize="small" /> Send Email
                  </a>
                )}
                {selectedBuyer.phone && (
                  <a
                    href={`tel:${selectedBuyer.phone}`}
                    className="modal-action-btn phone-btn"
                  >
                    <PhoneIcon fontSize="small" /> Call Customer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
