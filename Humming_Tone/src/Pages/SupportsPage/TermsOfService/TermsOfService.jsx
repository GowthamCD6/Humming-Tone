import React from "react";
import UserFooter from "../../../components/User-Footer-Card/UserFooter";

const TermsOfService = () => {
  return (
    <div className="terms-of-service-page">
      {/* Internal CSS Styles */}
      <style>{`
				/* Shared Policy Styling */
        .terms-of-service-page {
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

				/* Hero Section - Preserving your Master Image Style */
        .terms-of-service-page .policy-hero {
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

        .terms-of-service-page .hero-content {
						max-width: 700px;
						margin: 0 auto;
						animation: fadeInUp 1s ease-out 0.3s both;
				}

        .terms-of-service-page .policy-hero h1 {
						font-size: 3.5rem;
						margin-bottom: 1.5rem;
						font-weight: 300;
						letter-spacing: -0.02em;
						text-shadow: 0 4px 20px rgba(0,0,0,0.3);
						animation: slideInFromLeft 0.8s ease-out 0.5s both;
				}

        .terms-of-service-page .policy-hero p {
						font-size: 1.3rem;
						opacity: 0.95;
						max-width: 650px;
						margin: 0 auto;
						font-weight: 300;
						line-height: 1.6;
						animation: fadeInUp 0.8s ease-out 0.7s both;
				}

				/* Main Content Area */
        .terms-of-service-page .policy-main {
						padding: 6rem 2rem;
						background: #fafafa;
						display: flex;
						justify-content: center;
				}

        .terms-of-service-page .policy-content {
						max-width: 900px;
						width: 100%;
						background: white;
						padding: 4rem;
						box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
						animation: scaleIn 0.6s ease-out;
				}

        .terms-of-service-page .policy-section {
						margin-bottom: 3.5rem;
						animation: fadeInUp 0.6s ease-out forwards;
						opacity: 0;
				}

        .terms-of-service-page .policy-section h2 {
						font-size: 2rem;
						margin-bottom: 1.5rem;
						color: #1a1a1a;
						font-weight: 400;
						border-bottom: 2px solid #f0f0f0;
						padding-bottom: 0.75rem;
						transition: color 0.3s ease;
				}

        .terms-of-service-page .policy-section p {
						line-height: 1.8;
						margin-bottom: 1.5rem;
						color: #555;
						font-size: 1.05rem;
				}

        .terms-of-service-page .policy-section ul {
						margin: 1.5rem 0;
						padding-left: 1.5rem;
						list-style-type: disc;
				}

        .terms-of-service-page .policy-section li {
						margin-bottom: 0.75rem;
						color: #555;
						transition: color 0.3s ease, transform 0.3s ease;
				}

				.terms-of-service-page .policy-section li:hover {
						color: #1a1a1a;
						transform: translateX(5px);
				}

        .terms-of-service-page .policy-update {
						text-align: center;
						margin-top: 4rem;
						padding-top: 2rem;
						border-top: 1px solid #e9ecef;
						color: #666;
						font-style: italic;
						animation: fadeIn 0.8s ease-out 1s both;
				}

				/* Animation delays for sections */
				.section-1 { animation-delay: 0.1s; }
				.section-2 { animation-delay: 0.2s; }
				.section-3 { animation-delay: 0.3s; }
				.section-4 { animation-delay: 0.4s; }
				.section-5 { animation-delay: 0.5s; }
				.section-6 { animation-delay: 0.6s; }

				/* Responsive Design - Tablet */
				@media (max-width: 1024px) {
						.terms-of-service-page .policy-hero {
								height: clamp(450px, 60vh, 650px);
								padding: 6rem 2rem 5rem;
						}

						.terms-of-service-page .policy-hero h1 {
								font-size: 3rem;
						}

						.terms-of-service-page .policy-hero p {
								font-size: 1.2rem;
						}

						.terms-of-service-page .policy-main {
								padding: 4rem 1.5rem;
						}

						.terms-of-service-page .policy-content {
								padding: 3rem;
						}

						.terms-of-service-page .policy-section h2 {
								font-size: 1.75rem;
						}
				}

				/* Responsive Design - Mobile Large */
				@media (max-width: 768px) {
            .terms-of-service-page .policy-hero {
								min-height: 400px;
								height: clamp(400px, 55vh, 550px);
								background-attachment: scroll;
								padding: 5rem 1.5rem 4rem;
						}

						.terms-of-service-page .policy-hero h1 { 
								font-size: 2.5rem;
								margin-bottom: 1rem;
						}

						.terms-of-service-page .policy-hero p {
								font-size: 1.1rem;
						}

						.terms-of-service-page .policy-main {
								padding: 3rem 1rem;
						}

						.terms-of-service-page .policy-content {
								padding: 2.5rem 2rem;
								width: 95%;
						}

						.terms-of-service-page .policy-section {
								margin-bottom: 2.5rem;
						}

						.terms-of-service-page .policy-section h2 {
								font-size: 1.5rem;
								margin-bottom: 1rem;
						}

						.terms-of-service-page .policy-section p {
								font-size: 1rem;
								line-height: 1.7;
						}

						.terms-of-service-page .policy-section ul {
								padding-left: 1.25rem;
						}

						.terms-of-service-page .policy-section li {
								font-size: 0.95rem;
								margin-bottom: 0.6rem;
						}

						.terms-of-service-page .policy-update {
								margin-top: 3rem;
								padding-top: 1.5rem;
								font-size: 0.95rem;
						}
				}

				/* Responsive Design - Mobile Small */
				@media (max-width: 480px) {
						.terms-of-service-page .policy-hero {
								height: auto;
								min-height: 350px;
								padding: 4rem 1rem 3rem;
						}

						.terms-of-service-page .policy-hero h1 {
								font-size: 2rem;
								line-height: 1.2;
						}

						.terms-of-service-page .policy-hero p {
								font-size: 1rem;
								line-height: 1.5;
						}

						.terms-of-service-page .policy-main {
								padding: 2rem 0.75rem;
						}

						.terms-of-service-page .policy-content {
								padding: 2rem 1.5rem;
								width: 100%;
						}

						.terms-of-service-page .policy-section {
								margin-bottom: 2rem;
						}

						.terms-of-service-page .policy-section h2 {
								font-size: 1.3rem;
								padding-bottom: 0.5rem;
						}

						.terms-of-service-page .policy-section p {
								font-size: 0.95rem;
								margin-bottom: 1rem;
						}

						.terms-of-service-page .policy-section ul {
								margin: 1rem 0;
								padding-left: 1rem;
						}

						.terms-of-service-page .policy-section li {
								font-size: 0.9rem;
								margin-bottom: 0.5rem;
						}

						.terms-of-service-page .policy-update {
								margin-top: 2rem;
								padding-top: 1rem;
								font-size: 0.85rem;
						}
				}

				/* Extra Small Devices */
				@media (max-width: 360px) {
						.terms-of-service-page .policy-hero h1 {
								font-size: 1.75rem;
						}

						.terms-of-service-page .policy-hero p {
								font-size: 0.95rem;
						}

						.terms-of-service-page .policy-content {
								padding: 1.5rem 1rem;
						}

						.terms-of-service-page .policy-section h2 {
								font-size: 1.2rem;
						}
				}
			`}</style>

      {/* Hero Section */}
      <header className="policy-hero">
        <div className="hero-content">
          <h1>Terms of Service</h1>
          <p>
            Please read these terms carefully before using our website and
            services.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="policy-main">
        <div className="policy-content">
          <section className="policy-section section-1">
            <h2>Order Acceptance</h2>
            <p>
              Your receipt of an order confirmation does not constitute our
              acceptance of your order. We reserve the right to refuse or cancel
              any order for any reason, including:
            </p>
            <ul>
              <li>Product availability</li>
              <li>Errors in product or pricing information</li>
              <li>Suspected fraud or unauthorized activity</li>
              <li>Problems identified with your payment method</li>
            </ul>
          </section>

          <section className="policy-section section-2">
            <h2>Payment Methods</h2>
            <p>
              We accept credit/debit cards, net banking, UPI, and other
              supported digital payment options. All payments are processed
              through secure gateways.
            </p>
          </section>

          <section className="policy-section section-3">
            <h2>Shipping and Delivery</h2>
            <p>
              We ship throughout India. Delivery times are estimates and not
              guaranteed. We are not responsible for delays caused by carriers
              or events beyond our control.
            </p>
            <p>
              Once shipped, you will receive tracking details where available.
              Ownership of products passes to you upon delivery.
            </p>
          </section>

          <section className="policy-section section-4">
            <h2>Returns and Refunds</h2>
            <p>
              Eligible items can be returned within the stated return window if
              unused, with tags intact, and in original packaging. Some items
              (e.g., intimate apparel or customized products) may be
              non-returnable. Refunds are processed to the original payment
              method after inspection.
            </p>
          </section>

          <section className="policy-section section-5">
            <h2>User Responsibilities</h2>
            <ul>
              <li>
                Provide accurate account, shipping, and payment information.
              </li>
              <li>Maintain the confidentiality of your account credentials.</li>
              <li>Use the website in compliance with applicable laws.</li>
            </ul>
          </section>

          <section className="policy-section section-6">
            <h2>Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, we are not liable for
              indirect, incidental, or consequential damages arising from your
              use of the site or products. Our total liability for any claim is
              limited to the amount you paid for the product giving rise to the
              claim.
            </p>
          </section>

          <section className="policy-section">
            <h2>Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please
              contact us:
            </p>
            <p>Email: fashionandmore.md@gmail.com</p>
            <p>Phone: +91 80729 77025</p>
            <p>
              Address: 49, Rayapuram West Street, Tirupur-641 604, Tamil Nadu
            </p>
          </section>

          <p className="policy-update">Last Updated: December 28, 2025</p>
        </div>
      </main>

      <UserFooter />
    </div>
  );
};

export default TermsOfService;