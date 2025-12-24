

// import React, { useState, useMemo, useEffect } from 'react';
// import './ManageOrder.css';

// export default function ManageOrder() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     status: 'All Statuses',
//     startDate: '',
//     endDate: ''
//   });

//   // Fetch data from backend
//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/orders/manage');
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//         const data = await response.json();
        
//         if (Array.isArray(data)) {
//           setOrders(data);
//         } else {
//           setOrders([]);
//         }
//       } catch (error) {
//         console.error("Fetch error:", error);
//         setOrders([]); 
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOrders();
//   }, []);

//   // Handlers for the restored UI
//   const handleFilterChange = (field, value) => {
//     setFilters(prev => ({ ...prev, [field]: value }));
//   };

//   const handleClearFilters = () => {
//     setFilters({
//       status: 'All Statuses',
//       startDate: '',
//       endDate: ''
//     });
//   };

//   // Filter Logic
//   const filteredOrders = useMemo(() => {
//     if (!Array.isArray(orders)) return [];
//     return orders.filter(order => {
//       if (filters.status !== 'All Statuses') {
//         if (order.status?.toLowerCase() !== filters.status.toLowerCase()) return false;
//       }
//       const orderDateStr = order.created_at ? order.created_at.split('T')[0] : '';
//       if (filters.startDate && orderDateStr < filters.startDate) return false;
//       if (filters.endDate && orderDateStr > filters.endDate) return false;
//       return true;
//     });
//   }, [orders, filters]);

//   // Calculate Stats
//   const stats = useMemo(() => ({
//     total: filteredOrders.length,
//     pending: filteredOrders.filter(o => o.status?.toLowerCase() === 'pending').length,
//     delivered: filteredOrders.filter(o => o.status?.toLowerCase() === 'delivered').length
//   }), [filteredOrders]);

//   // Formatting Helpers to match original mockup look
//   const formatDate = (dateStr) => {
//     const date = new Date(dateStr);
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//   };

//   const formatTime = (dateStr) => {
//     const date = new Date(dateStr);
//     return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
//   };

//   if (loading) return <div className="loading-container">Loading Orders...</div>;

//   return (
//     <section className="manage-orders-container">
//       <h2 className="page-heading">Manage Order</h2>

//       {/* RESTORED Filter Section UI */}
//       <div className="filter-container">
//         <h2 className="section-title">Filter Orders</h2>
        
//         <div className="filter-inputs">
//           <div className="input-group">
//             <label htmlFor="status-filter">STATUS</label>
//             <select 
//               id="status-filter"
//               className="form-input"
//               value={filters.status}
//               onChange={(e) => handleFilterChange('status', e.target.value)}
//               aria-label="Filter by status"
//             >
//               <option>All Statuses</option>
//               <option>Pending</option>
//               <option>Delivered</option>
//               <option>Cancelled</option>
//             </select>
//           </div>

//           <div className="input-group">
//             <label htmlFor="start-date">START DATE</label>
//             <input 
//               id="start-date"
//               type="date" 
//               className="form-input"
//               value={filters.startDate}
//               onChange={(e) => handleFilterChange('startDate', e.target.value)}
//               aria-label="Filter by start date"
//             />
//           </div>

//           <div className="input-group">
//             <label htmlFor="end-date">END DATE</label>
//             <input 
//               id="end-date"
//               type="date" 
//               className="form-input"
//               value={filters.endDate}
//               onChange={(e) => handleFilterChange('endDate', e.target.value)}
//               aria-label="Filter by end date"
//             />
//           </div>
//         </div>

//         <div className="filter-actions">
//           <button 
//             className="btn btn-apply"
//             aria-label="Apply filters"
//           >
//             APPLY FILTERS
//           </button>
//           <button 
//             className="btn btn-clear"
//             onClick={handleClearFilters}
//             aria-label="Clear all filters"
//           >
//             CLEAR FILTERS
//           </button>
//         </div>
//       </div>

//       {/* Stats Cards Section */}
//       <div className="stats-container">
//         <div className="stat-card" role="status" aria-label={`Total orders: ${stats.total}`}>
//           <h3>TOTAL ORDERS</h3>
//           <span className="stat-number blue">{stats.total}</span>
//         </div>
//         <div className="stat-card" role="status" aria-label={`Pending orders: ${stats.pending}`}>
//           <h3>PENDING</h3>
//           <span className="stat-number orange">{stats.pending}</span>
//         </div>
//         <div className="stat-card" role="status" aria-label={`Delivered orders: ${stats.delivered}`}>
//           <h3>DELIVERED</h3>
//           <span className="stat-number green">{stats.delivered}</span>
//         </div>
//       </div>

//       {/* Orders Table Section */}
//       <div className="table-container">
//         {filteredOrders.length === 0 ? (
//           <div className="no-orders">No orders found matching your filters.</div>
//         ) : (
//           <table className="orders-table" role="table" aria-label="Orders table">
//             <thead>
//               <tr>
//                 <th scope="col">ORDER #</th>
//                 <th scope="col">CUSTOMER</th>
//                 <th scope="col">DATE</th>
//                 <th scope="col">ITEMS</th>
//                 <th scope="col">TOTAL</th>
//                 <th scope="col">STATUS</th>
//                 <th scope="col">PAYMENT</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredOrders.map((order) => (
//                 <tr key={order.id}>
//                   <td className="order-id">{order.order_number}</td>
//                   <td className="customer-info">
//                     <div className="cust-name">{order.customer_name}</div>
//                     <div className="cust-email">{order.customer_email}</div>
//                     <div className="cust-phone">{order.customer_phone}</div>
//                   </td>
//                   <td className="date-info">
//                     <div className="date-main">{formatDate(order.created_at)}</div>
//                     <div className="date-time">{formatTime(order.created_at)}</div>
//                   </td>
//                   <td className="items-info">
//                     <div className="item-count">{order.unique_items_count} items</div>
//                     <div className="item-qty">{order.total_qty} total qty</div>
//                   </td>
//                   <td className="total-price">₹{parseFloat(order.total_amount).toFixed(2)}</td>
//                   <td>
//                     <span className={`status-badge ${order.status?.toLowerCase()}`}>
//                       {order.status}
//                     </span>
//                   </td>
//                   <td className="payment-info">
//                     <span className="payment-badge">{order.payment_id ? 'PAID' : 'UNPAID'}</span>
//                     <div className="payment-id">ID: {order.payment_id || 'N/A'}</div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </section>
//   );
// }


import React, { useState, useMemo, useEffect } from 'react';
import './ManageOrder.css';

export default function ManageOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'All Statuses',
    startDate: '',
    endDate: '',
    startTime: '', // Added
    endTime: ''    // Added
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders/manage');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch error:", error);
        setOrders([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'All Statuses',
      startDate: '',
      endDate: '',
      startTime: '', // Reset
      endTime: ''    // Reset
    });
  };

  // Logic to filter by Date AND Time
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    return orders.filter(order => {
      // 1. Status Filter
      if (filters.status !== 'All Statuses') {
        if (order.status?.toLowerCase() !== filters.status.toLowerCase()) return false;
      }

      // 2. Date & Time Filter Logic
      const orderDateTime = new Date(order.created_at).getTime();

      // Start Boundary
      if (filters.startDate) {
        // If time isn't provided, default to start of day (00:00)
        const startString = `${filters.startDate}T${filters.startTime || '00:00'}`;
        const startLimit = new Date(startString).getTime();
        if (orderDateTime < startLimit) return false;
      }

      // End Boundary
      if (filters.endDate) {
        // If time isn't provided, default to end of day (23:59)
        const endString = `${filters.endDate}T${filters.endTime || '23:59'}`;
        const endLimit = new Date(endString).getTime();
        if (orderDateTime > endLimit) return false;
      }

      return true;
    });
  }, [orders, filters]);

  const stats = useMemo(() => ({
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status?.toLowerCase() === 'pending').length,
    delivered: filteredOrders.filter(o => o.status?.toLowerCase() === 'delivered').length
  }), [filteredOrders]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (loading) return <div className="loading-container">Loading Orders...</div>;

  return (
    <section className="manage-orders-container">
      <h2 className="page-heading">Manage Order</h2>

      <div className="filter-container">
        <h2 className="section-title">Filter Orders</h2>
        
        <div className="filter-inputs">
          {/* Status Select */}
          <div className="input-group">
            <label htmlFor="status-filter">STATUS</label>
            <select 
              id="status-filter"
              className="form-input"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option>All Statuses</option>
              <option>Pending</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>

          {/* Start Date & Time */}
          <div className="input-group">
            <label htmlFor="start-date">START DATE</label>
            <input 
              id="start-date"
              type="date" 
              className="form-input"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
            <input 
              type="time" 
              className="form-input time-input"
              value={filters.startTime}
              onChange={(e) => handleFilterChange('startTime', e.target.value)}
              aria-label="Start time"
            />
          </div>

          {/* End Date & Time */}
          <div className="input-group">
            <label htmlFor="end-date">END DATE</label>
            <input 
              id="end-date"
              type="date" 
              className="form-input"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
            <input 
              type="time" 
              className="form-input time-input"
              value={filters.endTime}
              onChange={(e) => handleFilterChange('endTime', e.target.value)}
              aria-label="End time"
            />
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn btn-apply">APPLY FILTERS</button>
          <button className="btn btn-clear" onClick={handleClearFilters}>CLEAR FILTERS</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>TOTAL ORDERS</h3>
          <span className="stat-number blue">{stats.total}</span>
        </div>
        <div className="stat-card">
          <h3>PENDING</h3>
          <span className="stat-number orange">{stats.pending}</span>
        </div>
        <div className="stat-card">
          <h3>DELIVERED</h3>
          <span className="stat-number green">{stats.delivered}</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">No orders found matching your filters.</div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>ORDER #</th>
                <th>CUSTOMER</th>
                <th>DATE</th>
                <th>ITEMS</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>PAYMENT</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">{order.order_number}</td>
                  <td className="customer-info">
                    <div className="cust-name">{order.customer_name}</div>
                    <div className="cust-email">{order.customer_email}</div>
                  </td>
                  <td className="date-info">
                    <div className="date-main">{formatDate(order.created_at)}</div>
                    <div className="date-time">{formatTime(order.created_at)}</div>
                  </td>
                  <td className="items-info">
                    {order.unique_items_count} items
                  </td>
                  <td className="total-price">₹{parseFloat(order.total_amount).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="payment-info">
                    <span className="payment-badge">{order.payment_id ? 'PAID' : 'UNPAID'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}