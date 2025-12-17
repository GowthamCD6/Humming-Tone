import React, { useState } from 'react';
import './ManageOrder.css';

export default function ManageOrder() {
  // Mock Data based on the screenshot
  const [orders] = useState([
    {
      id: 'ORD202511181328167362',
      customer: {
        name: 'Nirolin Nancy',
        email: 'nirolinnancy2001@gmail.com',
        phone: '9791447262'
      },
      date: 'Nov 18, 2025',
      time: '7:58 AM',
      items: '1 items',
      qty: '1 total qty',
      total: '₹230.00',
      status: 'DELIVERED',
      payment: 'PAID',
      paymentId: 'pay_Rh82'
    },
    {
      id: 'ORD202511071152391707',
      customer: {
        name: 'Aafiyah',
        email: 'aafiyahish@gmail.com',
        phone: '9994058273'
      },
      date: 'Nov 7, 2025',
      time: '6:24 AM',
      items: '1 items',
      qty: '1 total qty',
      total: '₹350.00',
      status: 'DELIVERED',
      payment: 'PAID',
      paymentId: 'pay_RckZ'
    }
  ]);

  return (
    <div className="main-content">
      
      {/* Filter Section */}
      <div className="filter-container">
        <h2 className="section-title">Filter Orders</h2>
        
        <div className="filter-inputs">
          <div className="input-group">
            <label>STATUS</label>
            <select className="form-input">
              <option>All Statuses</option>
              <option>Pending</option>
              <option>Delivered</option>
            </select>
          </div>

          <div className="input-group">
            <label>START DATE</label>
            <input type="date" className="form-input" placeholder="dd-----yyyy" />
          </div>

          <div className="input-group">
            <label>END DATE</label>
            <input type="date" className="form-input" placeholder="dd-----yyyy" />
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn btn-apply">APPLY FILTERS</button>
          <button className="btn btn-clear">CLEAR FILTERS</button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>TOTAL ORDERS</h3>
          <span className="stat-number blue">2</span>
        </div>
        <div className="stat-card">
          <h3>PENDING</h3>
          <span className="stat-number orange">0</span>
        </div>
        <div className="stat-card">
          <h3>DELIVERED</h3>
          <span className="stat-number green">2</span>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="table-container">
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
            {orders.map((order, index) => (
              <tr key={index}>
                <td className="order-id">{order.id}</td>
                <td className="customer-info">
                  <div className="cust-name">{order.customer.name}</div>
                  <div className="cust-email">{order.customer.email}</div>
                  <div className="cust-phone">{order.customer.phone}</div>
                </td>
                <td className="date-info">
                  <div className="date-main">{order.date}</div>
                  <div className="date-time">{order.time}</div>
                </td>
                <td className="items-info">
                  <div className="item-count">{order.items}</div>
                  <div className="item-qty">{order.qty}</div>
                </td>
                <td className="total-price">{order.total}</td>
                <td>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td className="payment-info">
                  <span className="payment-badge">{order.payment}</span>
                  <div className="payment-id">ID: {order.paymentId}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}