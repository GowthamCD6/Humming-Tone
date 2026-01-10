import React from "react";
import UserFooter from "../../../components/User-Footer-Card/UserFooter";

const ReturnExchange = () => {
  return (
    <div className="support-return-exchange-page">
      <style>{`
        .support-return-exchange-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #333;
          line-height: 1.6;
        }

        /* Animations */
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInFromLeft {
          from { 
            opacity: 0; 
            transform: translateX(-30px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }

        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }

        .support-return-exchange-hero {
          background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%),
                      url('https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1950&q=80');
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

        .support-return-exchange-hero-content {
          max-width: 700px;
          margin: 0 auto;
          animation: fadeInUp 1s ease-out 0.3s both;
        }

        .support-return-exchange-hero h1 {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          font-weight: 300;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 20px rgba(0,0,0,0.3);
          animation: slideInFromLeft 0.8s ease-out 0.5s both;
        }

        .support-return-exchange-hero p {
          font-size: 1.3rem;
          opacity: 0.95;
          max-width: 600px;
          margin: 0 auto;
          font-weight: 300;
          line-height: 1.6;
          animation: fadeInUp 0.8s ease-out 0.7s both;
        }

        .support-return-exchange-main {
          padding: 6rem 2rem;
          background: #fafafa;
          display: flex;
          justify-content: center;
        }

        .support-return-exchange-content {
          max-width: 900px;
          width: 100%;
          background: white;
          padding: 4rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          animation: scaleIn 0.6s ease-out;
        }

        .support-return-exchange-section {
          margin-bottom: 3.5rem;
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .support-return-exchange-section h2 {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          color: #1a1a1a;
          font-weight: 400;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 0.75rem;
          transition: color 0.3s ease;
        }

        .support-return-exchange-section h3 {
          font-size: 1.4rem;
          margin: 1.5rem 0 1rem;
          color: #333;
          font-weight: 500;
        }

        .support-return-exchange-section p {
          line-height: 1.8;
          margin-bottom: 1.5rem;
          color: #555;
          font-size: 1.05rem;
        }

        .support-return-exchange-section ul {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
          list-style-type: disc;
        }

        .support-return-exchange-section li {
          margin-bottom: 0.75rem;
          color: #555;
          transition: color 0.3s ease, transform 0.3s ease;
        }

        .support-return-exchange-section li:hover {
          color: #1a1a1a;
          transform: translateX(5px);
        }

        .support-return-exchange-update {
          text-align: center;
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 1px solid #e9ecef;
          color: #666;
          font-style: italic;
          animation: fadeIn 0.8s ease-out 1s both;
        }

        .support-return-exchange-page .section-1 { animation-delay: 0.1s; }
        .support-return-exchange-page .section-2 { animation-delay: 0.2s; }
        .support-return-exchange-page .section-3 { animation-delay: 0.3s; }
        .support-return-exchange-page .section-4 { animation-delay: 0.4s; }

        /* Responsive Design - Tablet */
        @media (max-width: 1024px) {
          .support-return-exchange-hero {
            height: clamp(450px, 60vh, 650px);
            padding: 6rem 2rem 5rem;
          }

          .support-return-exchange-hero h1 {
            font-size: 3rem;
          }

          .support-return-exchange-hero p {
            font-size: 1.2rem;
          }

          .support-return-exchange-main {
            padding: 4rem 1.5rem;
          }

          .support-return-exchange-content {
            padding: 3rem;
          }

          .support-return-exchange-section h2 {
            font-size: 1.75rem;
          }

          .support-return-exchange-section h3 {
            font-size: 1.3rem;
          }
        }

        /* Responsive Design - Mobile Large */
        @media (max-width: 768px) {
          .support-return-exchange-hero {
            background-attachment: scroll;
            height: clamp(400px, 55vh, 550px);
            padding: 5rem 1.5rem 4rem;
            min-height: 400px;
          }

          .support-return-exchange-hero h1 { 
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }

          .support-return-exchange-hero p {
            font-size: 1.1rem;
          }

          .support-return-exchange-main {
            padding: 3rem 1rem;
          }

          .support-return-exchange-content { 
            padding: 2.5rem 2rem;
            width: 95%;
          }

          .support-return-exchange-section {
            margin-bottom: 2.5rem;
          }

          .support-return-exchange-section h2 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }

          .support-return-exchange-section h3 {
            font-size: 1.2rem;
            margin: 1rem 0 0.75rem;
          }

          .support-return-exchange-section p {
            font-size: 1rem;
            line-height: 1.7;
          }

          .support-return-exchange-section ul {
            padding-left: 1.25rem;
          }

          .support-return-exchange-section li {
            font-size: 0.95rem;
            margin-bottom: 0.6rem;
          }

          .support-return-exchange-update {
            margin-top: 3rem;
            padding-top: 1.5rem;
            font-size: 0.95rem;
          }
        }

        /* Responsive Design - Mobile Small */
        @media (max-width: 480px) {
          .support-return-exchange-hero {
            height: auto;
            min-height: 350px;
            padding: 4rem 1rem 3rem;
          }

          .support-return-exchange-hero h1 {
            font-size: 2rem;
            line-height: 1.2;
          }

          .support-return-exchange-hero p {
            font-size: 1rem;
            line-height: 1.5;
          }

          .support-return-exchange-main {
            padding: 2rem 0.75rem;
          }

          .support-return-exchange-content {
            padding: 2rem 1.5rem;
            width: 100%;
          }

          .support-return-exchange-section {
            margin-bottom: 2rem;
          }

          .support-return-exchange-section h2 {
            font-size: 1.3rem;
            padding-bottom: 0.5rem;
          }

          .support-return-exchange-section h3 {
            font-size: 1.1rem;
          }

          .support-return-exchange-section p {
            font-size: 0.95rem;
            margin-bottom: 1rem;
          }

          .support-return-exchange-section ul {
            margin: 1rem 0;
            padding-left: 1rem;
          }

          .support-return-exchange-section li {
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
          }

          .support-return-exchange-update {
            margin-top: 2rem;
            padding-top: 1rem;
            font-size: 0.85rem;
          }
        }

        /* Extra Small Devices */
        @media (max-width: 360px) {
          .support-return-exchange-hero h1 {
            font-size: 1.75rem;
          }

          .support-return-exchange-hero p {
            font-size: 0.95rem;
          }

          .support-return-exchange-content {
            padding: 1.5rem 1rem;
          }

          .support-return-exchange-section h2 {
            font-size: 1.2rem;
          }
        }
      `}</style>

      <header className="support-return-exchange-hero">
        <div className="support-return-exchange-hero-content">
          <h1>Return & Exchange</h1>
          <p>
            We want you to be completely satisfied with your purchase. Learn
            about our easy return and exchange process.
          </p>
        </div>
      </header>

      <main className="support-return-exchange-main">
        <div className="support-return-exchange-content">
          <section className="support-return-exchange-section section-1">
            <h2>Return Policy</h2>
            <p>
              Items can be returned within 7 days of delivery. To be eligible
              for a return, your item must be:
            </p>
            <ul>
              <li>Unused and in the same condition that you received it</li>
              <li>In the original packaging</li>
              <li>With all tags intact and attached</li>
            </ul>
            <p>
              Certain items such as intimate apparel or customized products are
              non-returnable for hygiene and personalization reasons.
            </p>
          </section>

          <section className="support-return-exchange-section section-2">
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

          <section className="support-return-exchange-section section-3">
            <h2>Refund Policy</h2>
            <p>
              Once your return is received and inspected, we will send you an
              email to notify you that we have received your returned item. We
              will also notify you of the approval or rejection of your refund.
            </p>
            <p>
              If approved, your refund will be processed, and a credit will
              automatically be applied to your original method of payment within
              5-10 business days.
            </p>
          </section>

          <section className="support-return-exchange-section section-4">
            <h2>Exchange Policy</h2>
            <p>
              We only replace items if they are defective, damaged, or if you
              need a different size. If you need to exchange it for the same
              item, please contact our support team.
            </p>
          </section>

          <p className="support-return-exchange-update">Last Updated: December 28, 2025</p>
        </div>
      </main>
      <UserFooter />
    </div>
  );
};

export default ReturnExchange;