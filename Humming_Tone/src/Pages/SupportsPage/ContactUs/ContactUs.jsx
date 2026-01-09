import React from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

// Contact page reuses the premium policy styling for a consistent look.
const ContactUs = () => {
	return (
		<div className="support-contactus-page">
			<style>{`
				/* Base Typography & Colors */
				.support-contactus-page {
					font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
					color: #333;
					line-height: 1.6;
					background: linear-gradient(180deg, #fafafa 0%, #f2f4f7 45%, #ffffff 100%);
				}

				/* Hero Section */
				.support-contactus-hero {
	            background: linear-gradient(135deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.82) 100%), 
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
	            padding: 8rem 0 6rem;
	            text-align: center;
	            margin-bottom: 0;
	            position: relative;
	            overflow: hidden;
	        }

				.support-contactus-hero::before {
					content: '';
					position: absolute;
					inset: 0;
					background:
						radial-gradient(circle at 10% 0%, rgba(255,255,255,0.14), transparent 55%),
						radial-gradient(circle at 90% 100%, rgba(255,255,255,0.12), transparent 55%);
					pointer-events: none;
				}

				.support-contactus-hero-content {
					max-width: 760px;
					margin: 0 auto;
					position: relative;
					padding: 0 1.5rem;
				}

				.support-contactus-hero h1 {
					font-size: 3.6rem;
					margin-bottom: 1.25rem;
					font-weight: 300;
					letter-spacing: -0.02em;
					text-shadow: 0 4px 20px rgba(0,0,0,0.3);
				}

				.support-contactus-hero p {
					font-size: 1.35rem;
					opacity: 0.96;
					max-width: 720px;
					margin: 0 auto;
					font-weight: 300;
					line-height: 1.7;
				}

				/* Main Wrapper */
				.support-contactus-main {
					padding: 6rem 0;
					background: #fafafa;
					display: flex;
					justify-content: center;
				}

				.support-contactus-content {
					width: 100%;
					max-width: 1100px;
					padding: 0 1.5rem;
					box-sizing: border-box;
				}

				/* Section Headings */
				.support-contactus-heading {
					font-size: 2.4rem;
					font-weight: 400;
					color: #1a1a1a;
					margin-bottom: 1.25rem;
				}

				.support-contactus-subtitle {
					font-size: 1.15rem;
					color: #555;
					margin-bottom: 2.5rem;
					line-height: 1.7;
				}

				/* Cards Grid */
				.support-contactus-grid {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
					gap: 1.8rem;
					margin-bottom: 3.4rem;
				}

				.support-contactus-card {
					background: #fff;
					border-radius: 12px;
					padding: 1.9rem;
					box-shadow: 0 14px 38px rgba(15,23,42,0.08);
					display: flex;
					gap: 1.1rem;
					align-items: flex-start;
					border: 1px solid rgba(15,15,15,0.06);
					transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
				}

				.support-contactus-card:hover {
					transform: translateY(-4px);
					box-shadow: 0 18px 45px rgba(15,23,42,0.15);
					border-color: rgba(15,15,15,0.16);
				}

				.support-contactus-icon {
					flex-shrink: 0;
					width: 48px;
					height: 48px;
					border-radius: 50%;
					background: linear-gradient(135deg, #111827, #020617);
					color: #fff;
					display: grid;
					place-items: center;
					font-size: 1.2rem;
					letter-spacing: -0.01em;
				}

				.support-contactus-card-title {
					font-size: 1.25rem;
					margin: 0 0 0.35rem;
					color: #1b1b1b;
				}

				.support-contactus-card-text {
					margin: 0 0 0.4rem;
					color: #4a4a4a;
					line-height: 1.65;
				}

				.support-contactus-muted {
					color: #777;
					font-size: 0.95rem;
				}

				/* Social Row */
				.support-contactus-social-row {
					display: flex;
					align-items: center;
					gap: 1rem;
					flex-wrap: wrap;
					margin-top: 0.9rem;
				}

				.support-contactus-social-circle {
					width: 44px;
					height: 44px;
					border-radius: 50%;
					background: #111827;
					color: #fff;
					display: grid;
					place-items: center;
					font-size: 1rem;
					text-decoration: none;
					transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
				}

				.support-contactus-social-circle:hover {
					transform: translateY(-2px);
					box-shadow: 0 8px 18px rgba(15,23,42,0.25);
				}

				.support-contactus-social-row .support-contactus-social-circle:nth-child(1) {
					background: #1877f2;
				}

				.support-contactus-social-row .support-contactus-social-circle:nth-child(2) {
					background: radial-gradient(circle at 30% 30%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 100%);
				}

				.support-contactus-social-row .support-contactus-social-circle:nth-child(3) {
					background: #000000;
				}

				.support-contactus-social-row .support-contactus-social-circle:nth-child(4) {
					background: #e60023;
				}

				/* FAQ */
				.support-contactus-faq-grid {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
					gap: 1.8rem;
					margin-top: 2rem;
				}

				.support-contactus-faq-card {
					background: #fff;
					border-radius: 12px;
					padding: 1.9rem;
					box-shadow: 0 12px 34px rgba(15,23,42,0.07);
					border-top: 3px solid #111827;
				}

				.support-contactus-faq-question {
					font-size: 1.15rem;
					color: #1c1c1c;
					margin-bottom: 0.75rem;
				}

				.support-contactus-faq-answer {
					color: #4a4a4a;
					line-height: 1.65;
				}

				@media (max-width: 768px) {
					.support-contactus-hero {
						background-attachment: scroll;
						min-height: 360px;
						height: clamp(320px, 55vh, 480px);
						padding: 6rem 1.5rem 4rem;
					}
					.support-contactus-hero h1 { font-size: 2.6rem; }
					.support-contactus-hero p { font-size: 1.05rem; }
					.support-contactus-heading { font-size: 2rem; }
				}
			`}</style>

			{/* Hero */}
			<header className="support-contactus-hero">
				<div className="support-contactus-hero-content">
					<h1>Contact Us</h1>
					<p>Get in touch with our team. We're here to help you with any questions or concerns.</p>
				</div>
			</header>

			{/* Main Content */}
			<main className="support-contactus-main">
				<div className="support-contactus-content">
					<h2 className="support-contactus-heading">Get In Touch</h2>
					<p className="support-contactus-subtitle">
						Have questions about our products, orders, or need style advice? Our customer service team is ready to assist you.
					</p>

					<div className="support-contactus-grid">
						<div className="support-contactus-card">
							<div className="support-contactus-icon"><EmailOutlinedIcon fontSize="small" /></div>
							<div>
								<h3 className="support-contactus-card-title">Email Us</h3>
								<p className="support-contactus-card-text">fashionandmore.md@gmail.com</p>
								<p className="support-contactus-muted">We typically reply within 24 hours on business days.</p>
							</div>
						</div>

						<div className="support-contactus-card">
							<div className="support-contactus-icon"><PhoneInTalkOutlinedIcon fontSize="small" /></div>
							<div>
								<h3 className="support-contactus-card-title">Call Us</h3>
								<p className="support-contactus-card-text">+91 80729 77025</p>
								<p className="support-contactus-muted">Available Monday – Saturday, 9:00 AM – 6:00 PM.</p>
							</div>
						</div>

						<div className="support-contactus-card">
							<div className="support-contactus-icon"><PlaceOutlinedIcon fontSize="small" /></div>
							<div>
								<h3 className="support-contactus-card-title">Visit Us</h3>
								<p className="support-contactus-card-text">49, Rayapuram West Street,<br/>Tirupur-641 604, Tamil Nadu, India</p>
								<p className="support-contactus-muted">Showroom hours: 10:00 AM – 7:00 PM</p>
							</div>
						</div>

						<div className="support-contactus-card">
							<div className="support-contactus-icon"><AccessTimeOutlinedIcon fontSize="small" /></div>
							<div>
								<h3 className="support-contactus-card-title">Business Hours</h3>
								<p className="support-contactus-card-text">Monday - Friday: 9:00 AM - 6:00 PM</p>
								<p className="support-contactus-card-text">Saturday: 9:00 AM - 6:00 PM</p>
								<p className="support-contactus-muted">Sunday: Closed</p>
							</div>
						</div>
					</div>

					<div style={{ marginTop: '3rem' }}>
						<h2 className="support-contactus-heading">Follow Us</h2>
						<div className="support-contactus-social-row">
							<a className="support-contactus-social-circle" href="#" aria-label="Facebook">f</a>
							<a className="support-contactus-social-circle" href="#" aria-label="Instagram">ig</a>
							<a className="support-contactus-social-circle" href="#" aria-label="Twitter">x</a>
							<a className="support-contactus-social-circle" href="#" aria-label="Pinterest">p</a>
						</div>
					</div>

					<div style={{ marginTop: '4rem' }}>
						<h2 className="support-contactus-heading">Frequently Asked Questions</h2>
						<div className="support-contactus-faq-grid">
							<div className="support-contactus-faq-card">
								<h3 className="support-contactus-faq-question">How long does shipping take?</h3>
								<p className="support-contactus-faq-answer">Standard shipping takes 5-7 business days across India. Express shipping (2-3 days) and same-day delivery are also available in select areas.</p>
							</div>
							<div className="support-contactus-faq-card">
								<h3 className="support-contactus-faq-question">What is your return policy?</h3>
								<p className="support-contactus-faq-answer">We accept returns within 7 days of delivery. Items must be unworn with original tags attached. Some items like underwear are non-returnable for hygiene reasons.</p>
							</div>
							<div className="support-contactus-faq-card">
								<h3 className="support-contactus-faq-question">Do you offer international shipping?</h3>
								<p className="support-contactus-faq-answer">Currently, we only ship within India. We're working on expanding our services to international destinations soon.</p>
							</div>
							<div className="support-contactus-faq-card">
								<h3 className="support-contactus-faq-question">How can I track my order?</h3>
								<p className="support-contactus-faq-answer">Use the tracking link shared via email or contact our support team for updates.</p>
							</div>
						</div>
					</div>
				</div>
			</main>

			<UserFooter />
		</div>
	);
};

export default ContactUs;