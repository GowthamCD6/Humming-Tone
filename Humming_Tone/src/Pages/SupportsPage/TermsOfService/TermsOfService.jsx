import React from 'react';

const TermsOfService = () => {
	return (
		<div className="privacy-policy-container">
			{/* Internal CSS Styles */}
			<style>{`
				/* Shared Policy Styling */
				.privacy-policy-container {
						font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
						color: #333;
						line-height: 1.6;
				}

				/* Hero Section */
				.policy-hero {
						background: linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.55) 100%), 
												url('https://images.unsplash.com/photo-1521336575825-5fd3f8b5370b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80');
						background-size: cover;
						background-position: center;
						background-repeat: no-repeat;
						background-attachment: fixed;
						width: 89%;
						margin: 0 auto;
						min-height: 630px;
						height: clamp(420px, 60vh, 640px);
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

				@media (max-width: 768px) {
						.policy-hero {
								min-height: 320px;
								height: clamp(320px, 55vh, 440px);
								background-attachment: scroll;
						}
						.policy-hero h1 { font-size: 2.5rem; }
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
						max-width: 650px;
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
				.section-5 { animation-delay: 0.5s; }
				.section-6 { animation-delay: 0.6s; }
			`}</style>

			{/* Hero Section */}
			<header className="policy-hero">
				<div className="hero-content">
					<h1>Terms of Service</h1>
					<p>Please read these terms carefully before using our website and services.</p>
				</div>
			</header>

			{/* Main Content */}
			<main className="policy-main">
				<div className="policy-content">

					<section className="policy-section section-1">
						<h2>Order Acceptance</h2>
						<p>Your receipt of an order confirmation does not constitute our acceptance of your order. We reserve the right to refuse or cancel any order for any reason, including:</p>
						<ul>
							<li>Product availability</li>
							<li>Errors in product or pricing information</li>
							<li>Suspected fraud or unauthorized activity</li>
							<li>Problems identified with your payment method</li>
						</ul>
					</section>

					<section className="policy-section section-2">
						<h2>Payment Methods</h2>
						<p>We accept credit/debit cards, net banking, UPI, and other supported digital payment options. All payments are processed through secure gateways.</p>
					</section>

					<section className="policy-section section-3">
						<h2>Shipping and Delivery</h2>
						<p>We ship throughout India. Delivery times are estimates and not guaranteed. We are not responsible for delays caused by carriers or events beyond our control.</p>
						<p>Once shipped, you will receive tracking details where available. Ownership of products passes to you upon delivery.</p>
					</section>

					<section className="policy-section section-4">
						<h2>Returns and Refunds</h2>
						<p>Eligible items can be returned within the stated return window if unused, with tags intact, and in original packaging. Some items (e.g., intimate apparel or customized products) may be non-returnable. Refunds are processed to the original payment method after inspection.</p>
					</section>

					<section className="policy-section section-5">
						<h2>User Responsibilities</h2>
						<ul>
							<li>Provide accurate account, shipping, and payment information.</li>
							<li>Maintain the confidentiality of your account credentials.</li>
							<li>Use the website in compliance with applicable laws.</li>
						</ul>
					</section>

					<section className="policy-section section-6">
						<h2>Limitation of Liability</h2>
						<p>To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the site or products. Our total liability for any claim is limited to the amount you paid for the product giving rise to the claim.</p>
					</section>

					<section className="policy-section">
						<h2>Contact Us</h2>
						<p>If you have any questions about these Terms of Service, please contact us:</p>
						<p>Email: fashionandmore.md@gmail.com</p>
						<p>Phone: +91 80729 77025</p>
						<p>Address: 49, Rayapuram West Street, Tirupur-641 604, Tamil Nadu</p>
					</section>

					<p className="policy-update">
						Last Updated: December 28, 2025
					</p>
				</div>
			</main>
		</div>
	);
};

export default TermsOfService;