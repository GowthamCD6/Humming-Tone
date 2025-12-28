import React from 'react';

const ReturnExchange = () => {
  return (
    <div className="policy-page-container">
      <style>{`
        .policy-page-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #333;
          line-height: 1.6;
        }

        .policy-hero {
          background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%),
                      url('https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1950&q=80');
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

        .policy-section h3 {
          font-size: 1.4rem;
          margin: 1.5rem 0 1rem;
          color: #333;
          font-weight: 500;
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

      <header className="policy-hero">
        <div className="hero-content">
          <h1>Return & Exchange</h1>
          <p>We want you to be completely satisfied with your purchase. Learn about our easy return and exchange process.</p>
        </div>
      </header>

      <main className="policy-main">
        <div className="policy-content">
          <section className="policy-section section-1">
            <h2>Return Policy</h2>
            <p>Items can be returned within 7 days of delivery. To be eligible for a return, your item must be:</p>
            <ul>
              <li>Unused and in the same condition that you received it</li>
              <li>In the original packaging</li>
              <li>With all tags intact and attached</li>
            </ul>
            <p>Certain items such as intimate apparel or customized products are non-returnable for hygiene and personalization reasons.</p>
          </section>

          <section className="policy-section section-2">
            <h2>Return Shipping</h2>
            
            <h3>Free Return Shipping</h3>
            <p>We provide free return shipping for:</p>
            <ul>
              <li>Defective or damaged items</li>
              <li>Wrong items received</li>
              <li>Size exchanges</li>
            </ul>

            <h3>Customer-Paid Returns</h3>
            <p>Return shipping is at customer's expense for:</p>
            <ul>
              <li>Change of mind returns</li>
              <li>Color exchanges (when original color is available)</li>
              <li>Returns without valid reason</li>
            </ul>
          </section>

          <section className="policy-section section-3">
            <h2>Refund Policy</h2>
            <p>Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.</p>
            <p>If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-10 business days.</p>
          </section>

          <section className="policy-section section-4">
            <h2>Exchange Policy</h2>
            <p>We only replace items if they are defective, damaged, or if you need a different size. If you need to exchange it for the same item, please contact our support team.</p>
          </section>

          <p className="policy-update">
            Last Updated: December 28, 2025
          </p>
        </div>
      </main>
    </div>
  );
};

export default ReturnExchange;