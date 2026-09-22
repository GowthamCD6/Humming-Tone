import React, { useState, useEffect, useMemo } from 'react';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import { API_BASE_URL } from '../../../utils/apiConfig';
import './ManageReturns.css';

const STATUS_CONFIG = {
  requested: { label: 'Requested', color: '#d97706', bg: '#fef3c7', icon: <PendingActionsIcon sx={{ fontSize: 16 }} /> },
  approved: { label: 'Approved', color: '#2563eb', bg: '#dbeafe', icon: <CheckCircleOutlineIcon sx={{ fontSize: 16 }} /> },
  rejected: { label: 'Rejected', color: '#dc2626', bg: '#fee2e2', icon: <HighlightOffIcon sx={{ fontSize: 16 }} /> },
  completed: { label: 'Completed', color: '#16a34a', bg: '#dcfce7', icon: <DoneAllIcon sx={{ fontSize: 16 }} /> },
};

export default function ManageReturns() {
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/get_return_requests`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.returns)) {
        setReturnRequests(data.returns);
      } else if (Array.isArray(data)) {
        setReturnRequests(data);
      } else {
        setReturnRequests([]);
      }
    } catch (err) {
      console.error('Error fetching return requests:', err);
      setReturnRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/change_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await response.json();
      if (response.ok && (data.success || data.message)) {
        showToast(`Return Request #${id} marked as ${newStatus.toUpperCase()}`);
        setReturnRequests(prev =>
          prev.map(r => r.id === id ? { ...r, return_status: newStatus } : r)
        );
        if (selectedRequest && selectedRequest.id === id) {
          setSelectedRequest(prev => ({ ...prev, return_status: newStatus }));
        }
      } else {
        showToast(data.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      console.error('Status change error:', err);
      showToast('Network error while updating status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(() => {
    return {
      total: returnRequests.length,
      requested: returnRequests.filter(r => r.return_status === 'requested').length,
      approved: returnRequests.filter(r => r.return_status === 'approved').length,
      rejected: returnRequests.filter(r => r.return_status === 'rejected').length,
      completed: returnRequests.filter(r => r.return_status === 'completed').length,
    };
  }, [returnRequests]);

  const filteredRequests = useMemo(() => {
    return returnRequests.filter(r => {
      const matchTab = activeTab === 'all' || r.return_status === activeTab;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchTab;

      const matchSearch =
        String(r.id).includes(q) ||
        (r.order_number && r.order_number.toLowerCase().includes(q)) ||
        (r.customer_name && r.customer_name.toLowerCase().includes(q)) ||
        (r.customer_email && r.customer_email.toLowerCase().includes(q)) ||
        (r.product_name && r.product_name.toLowerCase().includes(q)) ||
        (r.return_reason && r.return_reason.toLowerCase().includes(q));

      return matchTab && matchSearch;
    });
  }, [returnRequests, activeTab, searchQuery]);

  const exportCSV = () => {
    if (filteredRequests.length === 0) {
      showToast('No records to export', 'error');
      return;
    }

    const headers = ['Return ID', 'Order Number', 'Customer Name', 'Email', 'Product', 'Size', 'Color', 'Return Qty', 'Reason', 'Description', 'Refund Amount', 'Status', 'Date'];
    const rows = filteredRequests.map(r => [
      r.id,
      r.order_number || `ORD-${r.order_id}`,
      `"${r.customer_name || 'Customer'}"`,
      `"${r.customer_email || ''}"`,
      `"${r.product_name || 'Apparel Item'}"`,
      r.product_size || 'N/A',
      r.product_color || 'N/A',
      r.return_quantity || 1,
      `"${r.return_reason || ''}"`,
      `"${(r.return_description || '').replace(/"/g, '""')}"`,
      r.refund_amount || 0,
      r.return_status || 'requested',
      r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hummingtone_returns_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported return requests to CSV');
  };

  return (
    <div className="manage-returns-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`mr-toast ${toastMessage.type}`}>
          {toastMessage.text}
        </div>
      )}

      {/* Header */}
      <div className="mr-header-section">
        <div>
          <h1 className="mr-page-title">Returns & Exchanges Management</h1>
          <p className="mr-page-subtitle">Review, approve, and track reverse pickup & replacement requests</p>
        </div>
        <div className="mr-header-actions">
          <button className="mr-btn mr-btn-secondary" onClick={fetchReturns} disabled={loading}>
            <RefreshIcon sx={{ fontSize: 18, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button className="mr-btn mr-btn-primary" onClick={exportCSV}>
            <DownloadIcon sx={{ fontSize: 18 }} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mr-stats-grid">
        <div className="mr-stat-card">
          <div className="mr-stat-icon total">
            <AssignmentReturnIcon />
          </div>
          <div>
            <span className="mr-stat-label">Total Requests</span>
            <h3 className="mr-stat-val">{stats.total}</h3>
          </div>
        </div>

        <div className="mr-stat-card" onClick={() => setActiveTab('requested')} style={{ cursor: 'pointer' }}>
          <div className="mr-stat-icon pending">
            <PendingActionsIcon />
          </div>
          <div>
            <span className="mr-stat-label">Pending Review</span>
            <h3 className="mr-stat-val" style={{ color: '#d97706' }}>{stats.requested}</h3>
          </div>
        </div>

        <div className="mr-stat-card" onClick={() => setActiveTab('approved')} style={{ cursor: 'pointer' }}>
          <div className="mr-stat-icon approved">
            <CheckCircleOutlineIcon />
          </div>
          <div>
            <span className="mr-stat-label">Approved</span>
            <h3 className="mr-stat-val" style={{ color: '#2563eb' }}>{stats.approved}</h3>
          </div>
        </div>

        <div className="mr-stat-card" onClick={() => setActiveTab('completed')} style={{ cursor: 'pointer' }}>
          <div className="mr-stat-icon completed">
            <DoneAllIcon />
          </div>
          <div>
            <span className="mr-stat-label">Completed / Refunded</span>
            <h3 className="mr-stat-val" style={{ color: '#16a34a' }}>{stats.completed}</h3>
          </div>
        </div>

        <div className="mr-stat-card" onClick={() => setActiveTab('rejected')} style={{ cursor: 'pointer' }}>
          <div className="mr-stat-icon rejected">
            <HighlightOffIcon />
          </div>
          <div>
            <span className="mr-stat-label">Rejected</span>
            <h3 className="mr-stat-val" style={{ color: '#dc2626' }}>{stats.rejected}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mr-filters-bar">
        <div className="mr-tabs-row">
          {[
            { id: 'all', label: `All (${stats.total})` },
            { id: 'requested', label: `Pending (${stats.requested})` },
            { id: 'approved', label: `Approved (${stats.approved})` },
            { id: 'completed', label: `Completed (${stats.completed})` },
            { id: 'rejected', label: `Rejected (${stats.rejected})` },
          ].map(tab => (
            <button
              key={tab.id}
              className={`mr-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mr-search-box">
          <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by Order #, Customer, Product, Reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="mr-search-clear" onClick={() => setSearchQuery('')}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="mr-table-card">
        {loading ? (
          <div className="mr-loading-state">
            <div className="mr-spinner"></div>
            <p>Loading return requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="mr-empty-state">
            <AssignmentReturnIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
            <h3>No Return Requests Found</h3>
            <p>{searchQuery ? 'Try adjusting your search criteria.' : 'There are currently no return requests matching this status.'}</p>
          </div>
        ) : (
          <div className="mr-table-responsive">
            <table className="mr-table">
              <thead>
                <tr>
                  <th>Req ID</th>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Product Details</th>
                  <th>Reason & Details</th>
                  <th>Est. Refund</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => {
                  const cfg = STATUS_CONFIG[req.return_status] || STATUS_CONFIG.requested;
                  const isUpdating = updatingId === req.id;

                  return (
                    <tr key={req.id}>
                      <td className="mr-id-cell">
                        <strong>#{req.id}</strong>
                        <span className="mr-date-sub">
                          {req.created_at ? new Date(req.created_at).toLocaleDateString() : ''}
                        </span>
                      </td>

                      <td>
                        <span className="mr-order-num">{req.order_number || `ORD-${req.order_id}`}</span>
                        {req.order_status && (
                          <span className="mr-order-badge">{req.order_status}</span>
                        )}
                      </td>

                      <td>
                        <div className="mr-customer-info">
                          <span className="mr-cust-name">{req.customer_name || 'Customer'}</span>
                          <span className="mr-cust-email">{req.customer_email || '—'}</span>
                          {req.customer_phone && <span className="mr-cust-phone">{req.customer_phone}</span>}
                        </div>
                      </td>

                      <td>
                        <div className="mr-product-cell">
                          <span className="mr-prod-name">{req.product_name || `Product #${req.product_id || req.order_item_id}`}</span>
                          <div className="mr-prod-meta">
                            {req.product_size && <span>Size: <strong>{req.product_size}</strong></span>}
                            {req.product_color && <span>Color: <strong>{req.product_color}</strong></span>}
                            <span>Qty: <strong>{req.return_quantity || 1}</strong></span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="mr-reason-cell">
                          <span className="mr-reason-title">{req.return_reason}</span>
                          {req.return_description ? (
                            <p className="mr-reason-desc" title={req.return_description}>
                              {req.return_description.length > 50 ? `${req.return_description.substring(0, 50)}...` : req.return_description}
                            </p>
                          ) : null}
                        </div>
                      </td>

                      <td>
                        <span className="mr-refund-amount">₹{Number(req.refund_amount || 0).toLocaleString('en-IN')}</span>
                      </td>

                      <td>
                        <span className="mr-status-pill" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </td>

                      <td>
                        <div className="mr-actions-row">
                          <button
                            className="mr-action-icon-btn view"
                            title="View Full Details"
                            onClick={() => setSelectedRequest(req)}
                          >
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                          </button>

                          {req.return_status === 'requested' && (
                            <>
                              <button
                                className="mr-action-icon-btn approve"
                                title="Approve Return"
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(req.id, 'approved')}
                              >
                                <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                              </button>
                              <button
                                className="mr-action-icon-btn reject"
                                title="Reject Return"
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(req.id, 'rejected')}
                              >
                                <HighlightOffIcon sx={{ fontSize: 18 }} />
                              </button>
                            </>
                          )}

                          {req.return_status === 'approved' && (
                            <button
                              className="mr-action-icon-btn complete"
                              title="Mark Completed & Refunded"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(req.id, 'completed')}
                            >
                              <DoneAllIcon sx={{ fontSize: 18 }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="mr-modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="mr-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="mr-modal-header">
              <div>
                <h2>Return Request #{selectedRequest.id}</h2>
                <span className="mr-modal-sub">
                  Order: {selectedRequest.order_number || `ORD-${selectedRequest.order_id}`} • {selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleString() : ''}
                </span>
              </div>
              <button className="mr-modal-close" onClick={() => setSelectedRequest(null)}>
                <CloseIcon />
              </button>
            </div>

            <div className="mr-modal-body">
              <div className="mr-modal-grid">
                <div className="mr-modal-section">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {selectedRequest.customer_name || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedRequest.customer_email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedRequest.customer_phone || 'N/A'}</p>
                </div>

                <div className="mr-modal-section">
                  <h4>Product & Order Specs</h4>
                  <p><strong>Product:</strong> {selectedRequest.product_name || `Item #${selectedRequest.product_id || selectedRequest.order_item_id}`}</p>
                  <p><strong>Size:</strong> {selectedRequest.product_size || 'Standard'}</p>
                  <p><strong>Color:</strong> {selectedRequest.product_color || 'Standard'}</p>
                  <p><strong>Return Quantity:</strong> {selectedRequest.return_quantity || 1} piece(s)</p>
                  <p><strong>Verified Refund:</strong> ₹{Number(selectedRequest.refund_amount || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="mr-modal-section full">
                <h4>Return Reason</h4>
                <div className="mr-reason-box">
                  <strong>{selectedRequest.return_reason}</strong>
                  <p>{selectedRequest.return_description || 'No additional comments provided.'}</p>
                </div>
              </div>

              <div className="mr-modal-section full">
                <h4>Change Return Status</h4>
                <div className="mr-status-actions-row">
                  {['requested', 'approved', 'completed', 'rejected'].map((st) => {
                    const isCurrent = selectedRequest.return_status === st;
                    const cfg = STATUS_CONFIG[st];
                    return (
                      <button
                        key={st}
                        className={`mr-status-pill-btn ${isCurrent ? 'active' : ''}`}
                        style={{
                          borderColor: cfg.color,
                          backgroundColor: isCurrent ? cfg.color : '#FFFFFF',
                          color: isCurrent ? '#FFFFFF' : cfg.color,
                        }}
                        onClick={() => handleStatusChange(selectedRequest.id, st)}
                        disabled={updatingId === selectedRequest.id}
                      >
                        {cfg.icon}
                        Mark {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mr-modal-footer">
              <button className="mr-btn mr-btn-secondary" onClick={() => setSelectedRequest(null)}>
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
