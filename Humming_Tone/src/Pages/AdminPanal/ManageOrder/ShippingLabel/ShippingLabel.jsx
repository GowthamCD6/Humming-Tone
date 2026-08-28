import React, { useRef, useEffect, useState, useCallback } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import './ShippingLabel.css';

// Store return address (Humming Tone)
const STORE_ADDRESS = {
  name: 'HUMMING TONE',
  line1: 'No. 45, Municipal Lay Out 5th Street,',
  line2: 'Perichipalayam Dharapuram Road, Tirupur,',
  line3: 'Tamil Nadu, Pincode 641604',
  pincode: '641604'
};

export default function ShippingLabel({ orders = [], onClose }) {
  const printRef = useRef(null);
  const [qrDataUrls, setQrDataUrls] = useState({});

  // Generate QR codes for each order
  useEffect(() => {
    const generateQRCodes = async () => {
      const urls = {};
      for (const order of orders) {
        try {
          const trackingUrl = `https://hummingtone.com/usertab/track-order?order=${order.order_number}`;
          urls[order.id] = await QRCode.toDataURL(trackingUrl, {
            width: 140,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' }
          });
        } catch (err) {
          console.error('QR generation error:', err);
        }
      }
      setQrDataUrls(urls);
    };
    if (orders.length > 0) generateQRCodes();
  }, [orders]);

  // Generate barcode after render
  const barcodeCallback = useCallback((el) => {
    if (el) {
      const code = el.getAttribute('data-value');
      if (code) {
        try {
          JsBarcode(el, code, {
            format: 'CODE128',
            width: 1.5,
            height: 50,
            displayValue: true,
            fontSize: 12,
            margin: 2,
            font: 'monospace',
            textMargin: 2
          });
        } catch (err) {
          console.error('Barcode generation error:', err);
        }
      }
    }
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) {
      const now = new Date();
      return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    }
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadAll = async () => {
    // Use print-to-PDF approach through the browser
    window.print();
  };

  if (!orders || orders.length === 0) {
    return null;
  }

  return (
    <div className="sl-overlay">
      <div className="sl-modal-container">
        {/* Modal Header */}
        <div className="sl-modal-header">
          <div className="sl-modal-header-left">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <polyline points="16 21 12 17 8 21" />
              <line x1="12" y1="3" x2="12" y2="7" />
            </svg>
            <div>
              <h2 className="sl-modal-title">Shipping Labels</h2>
              <p className="sl-modal-subtitle">{orders.length} label{orders.length > 1 ? 's' : ''} ready</p>
            </div>
          </div>
          <div className="sl-modal-actions">
            <button className="sl-btn sl-btn-print" onClick={handlePrint}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print {orders.length > 1 ? `All (${orders.length})` : 'Label'}
            </button>
            <button className="sl-btn sl-btn-download" onClick={handleDownloadAll}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </button>
            <button className="sl-btn sl-btn-close" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Label Preview Scroll Area */}
        <div className="sl-labels-scroll">
          <div ref={printRef} className="sl-print-area" id="shipping-labels-print-area">
            {orders.map((order, idx) => (
              <div key={order.id} className="sl-label" data-label-index={idx}>
                {/* Top Bar: Date + Payment Type */}
                <div className="sl-label-topbar">
                  <span className="sl-label-date">{formatDate(order.created_at)}</span>
                  <span className={`sl-payment-type ${order.payment_id ? 'prepaid' : 'cod'}`}>
                    {order.payment_id ? 'PREPAID' : 'COD'}
                    {!order.payment_id && ' — Check the payable amount on the app'}
                  </span>
                </div>

                {/* Main Content Grid */}
                <div className="sl-label-body">
                  {/* Left Column: Addresses */}
                  <div className="sl-label-addresses">
                    {/* Customer (Destination) Address */}
                    <div className="sl-address-block sl-destination">
                      <div className="sl-address-header">Customer Address</div>
                      <div className="sl-address-name">{order.customer_name}</div>
                      <div className="sl-address-line">{order.customer_address}</div>
                      {order.city && <div className="sl-address-line">{order.city}</div>}
                      <div className="sl-address-line">{order.state}{order.pincode ? `, ${order.pincode}` : ''}</div>
                      {order.customer_phone && (
                        <div className="sl-address-phone">Ph: {order.customer_phone}</div>
                      )}
                    </div>

                    {/* Return Address */}
                    <div className="sl-address-block sl-return">
                      <div className="sl-address-header">If undelivered, return to:</div>
                      <div className="sl-address-name">{STORE_ADDRESS.name}</div>
                      <div className="sl-address-line">{STORE_ADDRESS.line1}</div>
                      <div className="sl-address-line">{STORE_ADDRESS.line2}</div>
                      <div className="sl-address-line">{STORE_ADDRESS.line3}</div>
                    </div>
                  </div>

                  {/* Right Column: QR + Courier Info */}
                  <div className="sl-label-right">
                    {/* Courier Badge */}
                    <div className="sl-courier-section">
                      <div className="sl-courier-name">
                        {order.courier_partner || 'Courier Partner'}
                      </div>
                      <div className="sl-courier-type-badge">
                        {order.status?.toLowerCase() === 'shipped' || order.status?.toLowerCase() === 'out_for_delivery'
                          ? 'In Transit'
                          : 'Pickup'
                        }
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="sl-qr-container">
                      {qrDataUrls[order.id] ? (
                        <img src={qrDataUrls[order.id]} alt="QR Code" className="sl-qr-image" />
                      ) : (
                        <div className="sl-qr-placeholder">QR</div>
                      )}
                    </div>

                    {/* Pin Codes */}
                    <div className="sl-codes-grid">
                      <div className="sl-code-item">
                        <span className="sl-code-label">Destination Code</span>
                        <span className="sl-code-value">{order.pincode || '—'}</span>
                      </div>
                      <div className="sl-code-item">
                        <span className="sl-code-label">Return Code</span>
                        <span className="sl-code-value">{STORE_ADDRESS.pincode}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barcode Section */}
                <div className="sl-barcode-section">
                  <svg
                    ref={barcodeCallback}
                    data-value={order.tracking_number || order.order_number}
                    className="sl-barcode-svg"
                  />
                </div>

                {/* Product Details Footer */}
                <div className="sl-product-footer">
                  <table className="sl-product-table">
                    <thead>
                      <tr>
                        <th>Product Details</th>
                        <th>SKU</th>
                        <th>Size</th>
                        <th>Qty</th>
                        <th>Color</th>
                        <th>Order No.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items || []).map((item, i) => (
                        <tr key={i}>
                          <td className="sl-product-name">{item.product_name}</td>
                          <td>{item.product_sku || '—'}</td>
                          <td>{item.size || '—'}</td>
                          <td>{item.quantity}</td>
                          <td>{item.color || '—'}</td>
                          {i === 0 && (
                            <td rowSpan={(order.items || []).length} className="sl-order-number-cell">
                              {order.order_number}
                            </td>
                          )}
                        </tr>
                      ))}
                      {(!order.items || order.items.length === 0) && (
                        <tr>
                          <td colSpan="6" className="sl-no-items">No items data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Label Page Number */}
                {orders.length > 1 && (
                  <div className="sl-label-page-num">{idx + 1}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
