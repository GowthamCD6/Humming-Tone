import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-container">
      {/* Internal CSS Styles */}
      <style>{`
        /* Policy Pages Styling - Premium Design with Dark Footer */
        .privacy-policy-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #333;
            line-height: 1.6;
        }

        /* Hero Section - Preserving your Master Image Style */
        .policy-hero {
            background: linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.75) 100%), 
                        url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            color: white;
            padding: 8rem 0 6rem;
            text-align: center;
            margin-bottom: 0;
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

        /* Contact Info - The Black Box Style */
        .contact-info {
            background: #0a0a0a;
            padding: 2.5rem;
            border-radius: 4px;
            margin: 1.5rem 0;
            color: white;
            text-align: left;
        }

        .contact-info p {
            margin-bottom: 0.75rem;
            color: #e0e0e0;
            font-size: 1.05rem;
        }

        .contact-info strong {
            color: white;
            display: inline-block;
            width: 80px;
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
        .section-5 { animation-delay: 0.5s; }

        @media (max-width: 768px) {
            .policy-hero h1 { font-size: 2.5rem; }
            .policy-content { padding: 2rem; }
            .policy-hero { background-attachment: scroll; }
        }
      `}</style>

      {/* Hero Section */}
      <header className="policy-hero">
        <div className="hero-content">
          <h1>Privacy Policy</h1>
          <p>Your privacy is important to us. Learn how we protect and handle your information.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="policy-main">
        <div className="policy-content">
          
          <section className="policy-section section-1">
            <h2>Information We Collect</h2>
            <p>We collect information to provide better services to all our users. The types of information we collect include:</p>
            <h3>Personal Information</h3>
            <ul>
              <li>Name and contact details (email address, phone number)</li>
              <li>Shipping and billing address</li>
              <li>Payment information (processed securely through our payment partners)</li>
              <li>Order history and preferences</li>
            </ul>
          </section>

          <section className="policy-section section-2">
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect for various purposes, including:</p>
            <ul>
              <li>Processing and fulfilling your orders</li>
              <li>Providing customer support and responding to inquiries</li>
              <li>Sending order confirmations and shipping updates</li>
              <li>Personalizing your shopping experience</li>
              <li>Improving our website and services</li>
              <li>Sending marketing communications (with your consent)</li>
              <li>Preventing fraud and ensuring security</li>
            </ul>
          </section>

          <section className="policy-section section-3">
            <h2>Information Sharing</h2>
            <p>We do not sell your personal information to third parties. We may share your information with:</p>
            <ul>
              <li>Shipping carriers to deliver your orders</li>
              <li>Payment processors to handle transactions</li>
              <li>Service providers who assist our operations</li>
            </ul>
          </section>

          <section className="policy-section section-4">
            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access and review your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Object to certain processing activities</li>
            </ul>
          </section>

          <section className="policy-section section-5">
            <h2>Changes to This Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
          </section>

          <section className="policy-section">
            <h2>Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> fashionandmore.md@gmail.com</p>
              <p><strong>Phone:</strong> +91 80729 77025</p>
              <p><strong>Address:</strong> 49, Rayapuram West Street, Tirupur-641 604, Tamil Nadu</p>
            </div>
          </section>

          <p className="policy-update">
            Last Updated: December 28, 2025
          </p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;