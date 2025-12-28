import React from 'react';

// Contact page reuses the premium policy styling for a consistent look.
const ContactUs = () => {
	return (
		<div className="contact-page-container">
			<style>{`
				/* Base Typography & Colors */
				.contact-page-container {
					font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
					color: #333;
					line-height: 1.6;
				}

				/* Hero Section */
				.contact-hero {
					background: linear-gradient(135deg, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.68) 100%),
											url('https://images.unsplash.com/photo-1521336575825-5fd3f8b5370b?auto=format&fit=crop&w=1950&q=80');
					background-size: cover;
					background-position: center;
					background-repeat: no-repeat;
					background-attachment: fixed;
					width: 100%;
					max-width: 1200px;
					margin: 0 auto;
					min-height: 560px;
					height: clamp(360px, 55vh, 620px);
					display: flex;
					align-items: center;
					justify-content: center;
					box-sizing: border-box;
					color: #fff;
					padding: 8rem 0 6rem;
					text-align: center;
				}

				.contact-hero .hero-content {
					max-width: 760px;
					margin: 0 auto;
				}

				.contact-hero h1 {
					font-size: 3.6rem;
					margin-bottom: 1.25rem;
					font-weight: 300;
					letter-spacing: -0.02em;
					text-shadow: 0 4px 20px rgba(0,0,0,0.3);
				}

				.contact-hero p {
					font-size: 1.35rem;
					opacity: 0.95;
					max-width: 720px;
					margin: 0 auto;
					font-weight: 300;
					line-height: 1.6;
				}

				/* Main Wrapper */
				.contact-main {
					padding: 6rem 0;
					background: #fafafa;
					display: flex;
					justify-content: center;
				}

				.contact-content {
					width: 100%;
					max-width: 1100px;
					padding: 0 1.5rem;
					box-sizing: border-box;
				}

				/* Section Headings */
				.section-heading {
					font-size: 2.4rem;
					font-weight: 400;
					color: #1a1a1a;
					margin-bottom: 1.25rem;
				}

				.section-subtitle {
					font-size: 1.15rem;
					color: #555;
					margin-bottom: 2.5rem;
					line-height: 1.7;
				}

				/* Cards Grid */
				.contact-grid {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
					gap: 1.5rem;
					margin-bottom: 3rem;
				}

				.contact-card {
					background: #fff;
					border-radius: 12px;
					padding: 1.8rem;
					box-shadow: 0 10px 30px rgba(0,0,0,0.06);
					display: flex;
					gap: 1.1rem;
					align-items: flex-start;
				}

				.contact-icon {
					flex-shrink: 0;
					width: 46px;
					height: 46px;
					border-radius: 50%;
					background: #0f0f0f;
					color: #fff;
					display: grid;
					place-items: center;
					font-size: 1.2rem;
					letter-spacing: -0.01em;
				}

				.card-title {
					font-size: 1.25rem;
					margin: 0 0 0.35rem;
					color: #1b1b1b;
				}

				.card-text {
					margin: 0 0 0.4rem;
					color: #4a4a4a;
					line-height: 1.65;
				}

				.muted {
					color: #777;
					font-size: 0.95rem;
				}

				/* Social Row */
				.social-row {
					display: flex;
					align-items: center;
					gap: 1rem;
					flex-wrap: wrap;
					margin-top: 0.5rem;
				}

				.social-circle {
					width: 46px;
					height: 46px;
					border-radius: 50%;
					background: #111;
					color: #fff;
					display: grid;
					place-items: center;
					font-size: 1rem;
					text-decoration: none;
					transition: transform 0.2s ease, box-shadow 0.2s ease;
				}

				.social-circle:hover {
					transform: translateY(-2px);
					box-shadow: 0 8px 18px rgba(0,0,0,0.12);
				}

				/* FAQ */
				.faq-grid {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
					gap: 1.5rem;
					margin-top: 2rem;
				}

				.faq-card {
					background: #fff;
					border-radius: 12px;
					padding: 1.8rem;
					box-shadow: 0 10px 30px rgba(0,0,0,0.06);
				}

				.faq-question {
					font-size: 1.15rem;
					color: #1c1c1c;
					margin-bottom: 0.75rem;
				}

				.faq-answer {
					color: #4a4a4a;
					line-height: 1.65;
				}

				@media (max-width: 768px) {
					.contact-hero {
						background-attachment: scroll;
						min-height: 360px;
						height: clamp(320px, 55vh, 480px);
						padding: 6rem 1.5rem 4rem;
					}
					.contact-hero h1 { font-size: 2.6rem; }
					.contact-hero p { font-size: 1.05rem; }
					.section-heading { font-size: 2rem; }
				}
			`}</style>

			{/* Hero */}
			<header className="contact-hero">
				<div className="hero-content">
					<h1>Contact Us</h1>
					<p>Get in touch with our team. We're here to help you with any questions or concerns.</p>
				</div>
			</header>

			{/* Main Content */}
			<main className="contact-main">
				<div className="contact-content">
					<h2 className="section-heading">Get In Touch</h2>
					<p className="section-subtitle">
						Have questions about our products, orders, or need style advice? Our customer service team is ready to assist you.
					</p>

					<div className="contact-grid">
						<div className="contact-card">
							<div className="contact-icon">✉</div>
							<div>
								<h3 className="card-title">Email Us</h3>
								<p className="card-text">fashionandmore.md@gmail.com</p>
								<p className="muted">We'll respond within 24 hours</p>
							</div>
						</div>

						<div className="contact-card">
							<div className="contact-icon">☎</div>
							<div>
								<h3 className="card-title">Call Us</h3>
								<p className="card-text">+91 80729 77025</p>
								<p className="muted">Monday - Saturday, 9 AM - 6 PM</p>
							</div>
						</div>

						<div className="contact-card">
							<div className="contact-icon">📍</div>
							<div>
								<h3 className="card-title">Visit Us</h3>
								<p className="card-text">49, Rayapuram West Street,<br/>Tirupur-641 604, Tamil Nadu, India</p>
								<p className="muted">Showroom hours: 10 AM - 7 PM</p>
							</div>
						</div>

						<div className="contact-card">
							<div className="contact-icon">⏰</div>
							<div>
								<h3 className="card-title">Business Hours</h3>
								<p className="card-text">Monday - Friday: 9:00 AM - 6:00 PM</p>
								<p className="card-text">Saturday: 9:00 AM - 6:00 PM</p>
								<p className="muted">Sunday: Closed</p>
							</div>
						</div>
					</div>

					<div style={{ marginTop: '3rem' }}>
						<h2 className="section-heading">Follow Us</h2>
						<div className="social-row">
							<a className="social-circle" href="#" aria-label="Facebook">f</a>
							<a className="social-circle" href="#" aria-label="Instagram">ig</a>
							<a className="social-circle" href="#" aria-label="Twitter">x</a>
							<a className="social-circle" href="#" aria-label="Pinterest">p</a>
						</div>
					</div>

					<div style={{ marginTop: '4rem' }}>
						<h2 className="section-heading">Frequently Asked Questions</h2>
						<div className="faq-grid">
							<div className="faq-card">
								<h3 className="faq-question">How long does shipping take?</h3>
								<p className="faq-answer">Standard shipping takes 5-7 business days across India. Express shipping (2-3 days) and same-day delivery are also available in select areas.</p>
							</div>
							<div className="faq-card">
								<h3 className="faq-question">What is your return policy?</h3>
								<p className="faq-answer">We accept returns within 7 days of delivery. Items must be unworn with original tags attached. Some items like underwear are non-returnable for hygiene reasons.</p>
							</div>
							<div className="faq-card">
								<h3 className="faq-question">Do you offer international shipping?</h3>
								<p className="faq-answer">Currently, we only ship within India. We're working on expanding our services to international destinations soon.</p>
							</div>
							<div className="faq-card">
								<h3 className="faq-question">How can I track my order?</h3>
								<p className="faq-answer">Use the tracking link shared via email or contact our support team for updates.</p>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default ContactUs;