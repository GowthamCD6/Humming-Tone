import React from 'react';

const ShippingInfo = () => {
  return (
    <div className="shipping-info-container">
      {/* Internal CSS Styles */}
      <style>{`
        /* Policy Pages Styling - Premium Design */
        .shipping-info-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #333;
            line-height: 1.6;
        }

        /* Hero Section */
        .policy-hero {
            background: linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.75) 100%), 
                        url('https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            min-height: 560px;
            height: clamp(340px, 55vh, 560px);
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            color: white;
            padding: 8rem 0 6rem;
            text-align: center;
            margin-bottom: 0;
        }

        .hero-content {
          max-width: 700px;
          margin: 0 auto;
        }

        .policy-hero h1 {
            font-size: 3.5rem;
            margin-bottom: 1.5rem;
            font-weight: 300;
            letter-spacing: -0.02em;
            text-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .policy-hero p {
            font-size: 1.3rem;
            opacity: 0.95;
            max-width: 600px;
            margin: 0 auto;
            font-weight: 300;
            line-height: 1.6;
        }

        /* Main Content Area */
        .policy-main {
            padding: 6rem 0;
            background: #fafafa;
            display: flex;
            justify-content: center;
        }

        .policy-content {
            max-width: 900px;
            width: 90%;
            background: white;
            padding: 4rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .policy-section {
            margin-bottom: 3.5rem;
            animation: fadeInUp 0.6s ease-out forwards;
            opacity: 0;
        }

        .policy-section h2 {
            font-size: 2rem;
            margin-bottom: 1.5rem;
            color: #1a1a1a;
            font-weight: 400;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 0.75rem;
        }

        .policy-section p {
            line-height: 1.8;
            margin-bottom: 1.5rem;
            color: #555;
            font-size: 1.05rem;
        }

        .policy-section ul {
            margin: 1.5rem 0;
            padding-left: 1.5rem;
            list-style-type: disc;
        }

        .policy-section li {
            margin-bottom: 0.75rem;
            color: #555;
        }

        .policy-update {
            text-align: center;
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 1px solid #e9ecef;
            color: #666;
            font-style: italic;
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Animation delays for sections */
        .section-1 { animation-delay: 0.1s; }
        .section-2 { animation-delay: 0.2s; }
        .section-3 { animation-delay: 0.3s; }
        .section-4 { animation-delay: 0.4s; }

        @media (max-width: 768px) {
            .policy-hero h1 { font-size: 2.5rem; }
            .policy-content { padding: 2rem; }
            .policy-hero { background-attachment: scroll; }
        }
      `}</style>

      {/* Hero Section */}
      <header className="policy-hero">
        <div className="hero-content">
          <h1>Shipping Information</h1>
          <p>Everything you need to know about how we get your orders to you.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="policy-main">
        <div className="policy-content">
          
          <section className="policy-section section-1">
            <h2>Shipping Methods & Delivery Times</h2>
            <p>We strive to deliver your orders as quickly as possible. Our standard shipping times are as follows:</p>
            <ul>
              <li><strong>Standard Shipping:</strong> 5-7 business days across India.</li>
              <li><strong>Express Shipping:</strong> 2-3 business days (available in select cities).</li>
              <li><strong>Same-Day Delivery:</strong> Available for orders placed before 12 PM in select metropolitan areas.</li>
            </ul>
            <p>Please note that delivery times are estimates and may vary based on your location and external factors.</p>
          </section>

          <section className="policy-section section-2">
            <h2>Shipping During Festive Seasons</h2>
            <p>During major festivals and sale periods:</p>
            <ul>
              <li>Delivery times may be extended by 2-3 days</li>
              <li>Express shipping may not be available in some areas</li>
              <li>We recommend ordering well in advance</li>
              <li>Real-time updates will be provided for any delays</li>
            </ul>
          </section>

          <section className="policy-section section-3">
            <h2>Undeliverable Packages</h2>
            <p>Packages may be deemed undeliverable due to:</p>
            <ul>
              <li>Incorrect or incomplete address</li>
              <li>Recipient not available after multiple attempts</li>
              <li>Refusal to accept delivery</li>
              <li>Security concerns in the delivery area</li>
            </ul>
            <p>In such cases, the package will be returned to our warehouse, and our customer support team will contact you to arrange for re-delivery or a refund.</p>
          </section>

          <section className="policy-section section-4">
            <h2>Order Tracking</h2>
            <p>Once your order is shipped, you will receive a confirmation email and SMS with a tracking link. You can use this link to monitor the status of your delivery in real-time.</p>
          </section>

          <p className="policy-update">
            Last Updated: December 28, 2025
          </p>
        </div>
      </main>
    </div>
  );
};

export default ShippingInfo;
