import React from 'react';
import UserFooter from "../../../components/User-Footer-Card/UserFooter";

const ShippingInfo = () => {
  return (
    <div className="support-shipping-info-page">
      {/* Internal CSS Styles */}
      <style>{`
        /* Shipping Info Page Styling - Scoped */
        .support-shipping-info-page {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #333;
            line-height: 1.6;
        }

        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInFromLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
        }

        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }

        /* Hero Section */
        .support-shipping-info-hero {
            background: linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.75) 100%), 
                        url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
            width: 100%;
            max-width: 1340px;
            margin: 0 auto;
            min-height: 650px;
            height: clamp(520px, 65vh, 720px);
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            color: white;
            padding: 8rem 2rem 6rem;
            text-align: center;
            margin-bottom: 0;
            animation: fadeIn 0.8s ease-out;
        }

        .support-shipping-info-hero-content {
            max-width: 700px;
            margin: 0 auto;
        }

        .support-shipping-info-hero h1 {
            font-size: 3.5rem;
            margin-bottom: 1.5rem;
            font-weight: 300;
            letter-spacing: -0.02em;
            text-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: slideInFromLeft 0.8s ease-out 0.3s both;
        }

        .support-shipping-info-hero p {
            font-size: 1.3rem;
            opacity: 0.95;
            max-width: 600px;
            margin: 0 auto;
            font-weight: 300;
            line-height: 1.6;
            animation: fadeInUp 0.8s ease-out 0.5s both;
        }

        /* Main Content Area */
        .support-shipping-info-main {
            padding: 6rem 0;
            background: #fafafa;
            display: flex;
            justify-content: center;
        }

        .support-shipping-info-content {
            max-width: 900px;
            width: 90%;
            background: white;
            padding: 4rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            animation: scaleIn 0.6s ease-out 0.2s both;
        }

        .support-shipping-info-section {
            margin-bottom: 3.5rem;
            animation: fadeInUp 0.6s ease-out forwards;
            opacity: 0;
        }

        .support-shipping-info-section h2 {
            font-size: 2rem;
            margin-bottom: 1.5rem;
            color: #1a1a1a;
            font-weight: 400;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 0.75rem;
        }

        .support-shipping-info-section p {
            line-height: 1.8;
            margin-bottom: 1.5rem;
            color: #555;
            font-size: 1.05rem;
        }

        .support-shipping-info-section ul {
            margin: 1.5rem 0;
            padding-left: 1.5rem;
            list-style-type: disc;
        }

        .support-shipping-info-section li {
            margin-bottom: 0.75rem;
            color: #555;
            transition: all 0.3s ease;
        }

        .support-shipping-info-section li:hover {
            color: #000;
            transform: translateX(5px);
        }

        .support-shipping-info-update {
            text-align: center;
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 1px solid #e9ecef;
            color: #666;
            font-style: italic;
        }

        /* Animation delays for sections */
        .support-shipping-info-page .section-1 { animation-delay: 0.1s; }
        .support-shipping-info-page .section-2 { animation-delay: 0.2s; }
        .support-shipping-info-page .section-3 { animation-delay: 0.3s; }
        .support-shipping-info-page .section-4 { animation-delay: 0.4s; }

        /* Responsive Design - Tablet */
        @media (max-width: 1024px) {
            .support-shipping-info-hero {
                min-height: 550px;
                height: clamp(450px, 60vh, 650px);
                padding: 6rem 2rem 5rem;
            }

            .support-shipping-info-hero h1 {
                font-size: 3rem;
            }

            .support-shipping-info-hero p {
                font-size: 1.2rem;
            }

            .support-shipping-info-content {
                padding: 3.5rem;
            }

            .support-shipping-info-section h2 {
                font-size: 1.85rem;
            }
        }

        /* Responsive Design - Mobile Large */
        @media (max-width: 768px) {
            .support-shipping-info-hero {
                min-height: 450px;
                height: clamp(380px, 55vh, 550px);
                padding: 5rem 1.5rem 4rem;
                background-attachment: scroll;
            }

            .support-shipping-info-hero h1 {
                font-size: 2.5rem;
                margin-bottom: 1rem;
            }

            .support-shipping-info-hero p {
                font-size: 1.1rem;
            }

            .support-shipping-info-main {
                padding: 4rem 0;
            }

            .support-shipping-info-content {
                padding: 2.5rem;
                width: 85%;
            }

            .support-shipping-info-section {
                margin-bottom: 2.5rem;
            }

            .support-shipping-info-section h2 {
                font-size: 1.65rem;
                margin-bottom: 1.25rem;
            }

            .support-shipping-info-section p {
                font-size: 1rem;
                margin-bottom: 1.25rem;
            }

            .support-shipping-info-section ul {
                padding-left: 1.25rem;
            }

            .support-shipping-info-section li {
                font-size: 0.95rem;
            }

            .support-shipping-info-update {
                margin-top: 3rem;
                font-size: 0.95rem;
            }
        }

        /* Responsive Design - Mobile Medium */
        @media (max-width: 480px) {
            .support-shipping-info-hero {
                min-height: 380px;
                height: clamp(320px, 50vh, 450px);
                padding: 4rem 1rem 3rem;
            }

            .support-shipping-info-hero h1 {
                font-size: 2rem;
                margin-bottom: 0.75rem;
            }

            .support-shipping-info-hero p {
                font-size: 1rem;
            }

            .support-shipping-info-main {
                padding: 3rem 0;
            }

            .support-shipping-info-content {
                padding: 2rem;
                width: 90%;
            }

            .support-shipping-info-section {
                margin-bottom: 2rem;
            }

            .support-shipping-info-section h2 {
                font-size: 1.5rem;
                margin-bottom: 1rem;
            }

            .support-shipping-info-section p {
                font-size: 0.95rem;
                line-height: 1.7;
                margin-bottom: 1rem;
            }

            .support-shipping-info-section ul {
                margin: 1rem 0;
                padding-left: 1rem;
            }

            .support-shipping-info-section li {
                font-size: 0.9rem;
                margin-bottom: 0.6rem;
            }

            .support-shipping-info-update {
                margin-top: 2.5rem;
                font-size: 0.9rem;
            }
        }

        /* Responsive Design - Mobile Small */
        @media (max-width: 360px) {
            .support-shipping-info-hero {
                min-height: 320px;
                height: clamp(280px, 45vh, 400px);
                padding: 3rem 0.75rem 2.5rem;
            }

            .support-shipping-info-hero h1 {
                font-size: 1.75rem;
                margin-bottom: 0.5rem;
            }

            .support-shipping-info-hero p {
                font-size: 0.95rem;
            }

            .support-shipping-info-main {
                padding: 2.5rem 0;
            }

            .support-shipping-info-content {
                padding: 1.5rem;
                width: 95%;
            }

            .support-shipping-info-section {
                margin-bottom: 1.75rem;
            }

            .support-shipping-info-section h2 {
                font-size: 1.35rem;
                margin-bottom: 0.85rem;
                padding-bottom: 0.5rem;
            }

            .support-shipping-info-section p {
                font-size: 0.9rem;
                line-height: 1.65;
                margin-bottom: 0.85rem;
            }

            .support-shipping-info-section ul {
                margin: 0.85rem 0;
                padding-left: 0.85rem;
            }

            .support-shipping-info-section li {
                font-size: 0.85rem;
                margin-bottom: 0.5rem;
            }

            .support-shipping-info-update {
                margin-top: 2rem;
                padding-top: 1.5rem;
                font-size: 0.85rem;
            }
        }
      `}</style>

      {/* Hero Section */}
      <header className="support-shipping-info-hero">
        <div className="support-shipping-info-hero-content">
          <h1>Shipping Information</h1>
          <p>Everything you need to know about how we get your orders to you.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="support-shipping-info-main">
        <div className="support-shipping-info-content">
          
          <section className="support-shipping-info-section section-1">
            <h2>Shipping Methods & Delivery Times</h2>
            <p>We strive to deliver your orders as quickly as possible. Our standard shipping times are as follows:</p>
            <ul>
              <li><strong>Standard Shipping:</strong> 5-7 business days across India.</li>
              <li><strong>Express Shipping:</strong> 2-3 business days (available in select cities).</li>
              <li><strong>Same-Day Delivery:</strong> Available for orders placed before 12 PM in select metropolitan areas.</li>
            </ul>
            <p>Please note that delivery times are estimates and may vary based on your location and external factors.</p>
          </section>

          <section className="support-shipping-info-section section-2">
            <h2>Shipping During Festive Seasons</h2>
            <p>During major festivals and sale periods:</p>
            <ul>
              <li>Delivery times may be extended by 2-3 days</li>
              <li>Express shipping may not be available in some areas</li>
              <li>We recommend ordering well in advance</li>
              <li>Real-time updates will be provided for any delays</li>
            </ul>
          </section>

          <section className="support-shipping-info-section section-3">
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

          <section className="support-shipping-info-section section-4">
            <h2>Order Tracking</h2>
            <p>Once your order is shipped, you will receive a confirmation email and SMS with a tracking link. You can use this link to monitor the status of your delivery in real-time.</p>
          </section>

          <p className="support-shipping-info-update">
            Last Updated: December 28, 2025
          </p>
        </div>
      </main>
      <UserFooter/>
    </div>
  );
};

export default ShippingInfo;