import React from 'react';
import UserFooter from '../../../components/User-Footer-Card/UserFooter';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

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

				/* Animations */
				@keyframes fadeIn {
					from { opacity: 0; }
					to { opacity: 1; }
				}

				@keyframes fadeInUp {
					from { opacity: 0; transform: translateY(30px); }
					to { opacity: 1; transform: translateY(0); }
				}

				@keyframes slideInFromLeft {
					from { opacity: 0; transform: translateX(-40px); }
					to { opacity: 1; transform: translateX(0); }
				}

				@keyframes scaleIn {
					from { opacity: 0; transform: scale(0.95); }
					to { opacity: 1; transform: scale(1); }
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
	            padding: 8rem 2rem 6rem;
	            text-align: center;
	            margin-bottom: 0;
	            position: relative;
	            overflow: hidden;
	            animation: fadeIn 0.8s ease-out;
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
					animation: slideInFromLeft 0.8s ease-out 0.3s both;
				}

				.support-contactus-hero p {
					font-size: 1.35rem;
					opacity: 0.96;
					max-width: 720px;
					margin: 0 auto;
					font-weight: 300;
					line-height: 1.7;
					animation: fadeInUp 0.8s ease-out 0.5s both;
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
					animation: scaleIn 0.6s ease-out 0.2s both;
				}

				/* Section Headings */
				.support-contactus-heading {
					font-size: 2.4rem;
					font-weight: 400;
					color: #1a1a1a;
					margin-bottom: 1.25rem;
					animation: fadeInUp 0.6s ease-out forwards;
					opacity: 0;
				}

				.support-contactus-subtitle {
					font-size: 1.15rem;
					color: #555;
					margin-bottom: 2.5rem;
					line-height: 1.7;
					animation: fadeInUp 0.6s ease-out 0.1s forwards;
					opacity: 0;
				}

				/* Cards Grid */
				.support-contactus-grid {
					display: grid;
					grid-template-columns: repeat(2, 1fr);
					gap: 2rem;
					margin-bottom: 3.4rem;
				}

				.support-contactus-card {
					background: #fff;
					border-radius: 12px;
					padding: 2.2rem;
					box-shadow: 0 14px 38px rgba(15,23,42,0.08);
					display: flex;
					gap: 1.5rem;
					align-items: flex-start;
					border: 1px solid rgba(15,15,15,0.06);
					transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
					animation: fadeInUp 0.6s ease-out forwards;
					opacity: 0;
				}

				.support-contactus-card:hover {
					transform: translateY(-6px);
					box-shadow: 0 20px 50px rgba(15,23,42,0.18);
					border-color: rgba(15,15,15,0.16);
				}

				.support-contactus-card:nth-child(1) { animation-delay: 0.2s; }
				.support-contactus-card:nth-child(2) { animation-delay: 0.3s; }
				.support-contactus-card:nth-child(3) { animation-delay: 0.4s; }
				.support-contactus-card:nth-child(4) { animation-delay: 0.5s; }

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
					transition: transform 0.3s ease, box-shadow 0.3s ease;
				}

				.support-contactus-card:hover .support-contactus-icon {
					transform: scale(1.1);
					box-shadow: 0 8px 20px rgba(17, 24, 39, 0.3);
				}

				.support-contactus-card-title {
					font-size: 1.25rem;
					margin: 0 0 0.35rem;
					color: #1b1b1b;
					transition: color 0.3s ease;
				}

				.support-contactus-card:hover .support-contactus-card-title {
					color: #000;
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
					font-size: 1.2rem;
					text-decoration: none;
					transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
					animation: scaleIn 0.5s ease-out forwards;
					opacity: 0;
				}

				.support-contactus-social-circle svg {
					font-size: 1.3rem;
				}

				.support-contactus-social-circle:nth-child(1) { animation-delay: 0.1s; }
				.support-contactus-social-circle:nth-child(2) { animation-delay: 0.2s; }
				.support-contactus-social-circle:nth-child(3) { animation-delay: 0.3s; }
				.support-contactus-social-circle:nth-child(4) { animation-delay: 0.4s; }

				.support-contactus-social-circle:hover {
					transform: translateY(-4px) scale(1.1);
					box-shadow: 0 10px 25px rgba(15,23,42,0.35);
				}

				.support-contactus-social-row .support-contactus-social-circle:nth-child(1) {
					background: #1877f2;
				}

				.support-contactus-social-row .support-contactus-social-circle:nth-child(1):hover {
					background: #0e5fcc;
				}

				.support-contactus-social-row .support-contactus-social-circle:nth-child(2) {
					background: radial-gradient(circle at 30% 30%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 100%);
				}

				.support-contactus-social-row .support-contactus-social-circle:nth-child(3) {
					background: #25D366;
				}

				.support-contactus-social-row .support-contactus-social-circle:nth-child(3):hover {
					background: #1da851;
				}

				.support-contactus-social-row .support-contactus-social-circle:nth-child(4) {
					background: linear-gradient(135deg, #9c1ab1 0%, #e91e63 50%, #f06292 100%);
				}

				.support-contactus-social-row .support-contactus-social-circle:nth-child(4):hover {
					background: linear-gradient(135deg, #7a1590 0%, #c2185b 50%, #ec407a 100%);
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
					transition: transform 0.3s ease, box-shadow 0.3s ease;
					animation: fadeInUp 0.6s ease-out forwards;
					opacity: 0;
				}

				.support-contactus-faq-card:nth-child(1) { animation-delay: 0.2s; }
				.support-contactus-faq-card:nth-child(2) { animation-delay: 0.3s; }
				.support-contactus-faq-card:nth-child(3) { animation-delay: 0.4s; }
				.support-contactus-faq-card:nth-child(4) { animation-delay: 0.5s; }

				.support-contactus-faq-card:hover {
					transform: translateY(-4px);
					box-shadow: 0 16px 42px rgba(15,23,42,0.12);
				}

				.support-contactus-faq-question {
					font-size: 1.15rem;
					color: #1c1c1c;
					margin-bottom: 0.75rem;
					font-weight: 500;
				}

				.support-contactus-faq-answer {
					color: #4a4a4a;
					line-height: 1.65;
				}

				/* Responsive Design - Tablet */
				@media (max-width: 1024px) {
					.support-contactus-hero {
						min-height: 550px;
						height: clamp(450px, 60vh, 650px);
						padding: 6rem 2rem 5rem;
					}

					.support-contactus-hero h1 {
						font-size: 3.2rem;
					}

					.support-contactus-hero p {
						font-size: 1.25rem;
					}

					.support-contactus-content {
						max-width: 95%;
					}

					.support-contactus-heading {
						font-size: 2.2rem;
					}

					.support-contactus-subtitle {
						font-size: 1.1rem;
					}

					.support-contactus-grid {
						grid-template-columns: repeat(2, 1fr);
						gap: 1.5rem;
					}

					.support-contactus-faq-grid {
						grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
						gap: 1.5rem;
					}
				}

				/* Responsive Design - Mobile Large */
				@media (max-width: 768px) {
					.support-contactus-hero {
						background-attachment: scroll;
						min-height: 450px;
						height: clamp(380px, 55vh, 550px);
						padding: 5rem 1.5rem 4rem;
					}

					.support-contactus-hero h1 {
						font-size: 2.6rem;
						margin-bottom: 1rem;
					}

					.support-contactus-hero p {
						font-size: 1.15rem;
					}

					.support-contactus-main {
						padding: 4rem 0;
					}

					.support-contactus-content {
						width: 85%;
					}

					.support-contactus-heading {
						font-size: 2rem;
					}

					.support-contactus-subtitle {
						font-size: 1.05rem;
						margin-bottom: 2rem;
					}

					.support-contactus-grid {
						grid-template-columns: 1fr;
						gap: 1.5rem;
						margin-bottom: 3rem;
					}

					.support-contactus-card {
						padding: 1.6rem;
					}

					.support-contactus-icon {
						width: 44px;
						height: 44px;
					}

					.support-contactus-card-title {
						font-size: 1.15rem;
					}

					.support-contactus-faq-grid {
						grid-template-columns: 1fr;
						gap: 1.5rem;
					}

					.support-contactus-faq-card {
						padding: 1.6rem;
					}

					.support-contactus-social-circle {
						width: 40px;
						height: 40px;
						font-size: 0.95rem;
					}
				}

				/* Responsive Design - Mobile Medium */
				@media (max-width: 480px) {
					.support-contactus-hero {
						min-height: 380px;
						height: clamp(320px, 50vh, 450px);
						padding: 4rem 1rem 3rem;
					}

					.support-contactus-hero h1 {
						font-size: 2.2rem;
						margin-bottom: 0.75rem;
					}

					.support-contactus-hero p {
						font-size: 1.05rem;
					}

					.support-contactus-main {
						padding: 3rem 0;
					}

					.support-contactus-content {
						width: 90%;
						padding: 0 1rem;
					}

					.support-contactus-heading {
						font-size: 1.75rem;
						margin-bottom: 1rem;
					}

					.support-contactus-subtitle {
						font-size: 1rem;
						margin-bottom: 1.75rem;
					}

					.support-contactus-grid {
						gap: 1.25rem;
						margin-bottom: 2.5rem;
					}

					.support-contactus-card {
						padding: 1.4rem;
						flex-direction: column;
						align-items: center;
						text-align: center;
						gap: 1rem;
					}

					.support-contactus-icon {
						width: 40px;
						height: 40px;
					}

					.support-contactus-card-title {
						font-size: 1.1rem;
					}

					.support-contactus-card-text {
						font-size: 0.95rem;
					}

					.support-contactus-muted {
						font-size: 0.9rem;
					}

					.support-contactus-faq-grid {
						gap: 1.25rem;
					}

					.support-contactus-faq-card {
						padding: 1.4rem;
					}

					.support-contactus-faq-question {
						font-size: 1.05rem;
					}

					.support-contactus-faq-answer {
						font-size: 0.95rem;
					}

					.support-contactus-social-circle {
						width: 38px;
						height: 38px;
						font-size: 0.9rem;
					}
				}

				/* Responsive Design - Mobile Small */
				@media (max-width: 360px) {
					.support-contactus-hero {
						min-height: 320px;
						height: clamp(280px, 45vh, 400px);
						padding: 3rem 0.75rem 2.5rem;
					}

					.support-contactus-hero h1 {
						font-size: 1.9rem;
						margin-bottom: 0.5rem;
					}

					.support-contactus-hero p {
						font-size: 1rem;
					}

					.support-contactus-main {
						padding: 2.5rem 0;
					}

					.support-contactus-content {
						width: 95%;
						padding: 0 0.75rem;
					}

					.support-contactus-heading {
						font-size: 1.5rem;
						margin-bottom: 0.85rem;
					}

					.support-contactus-subtitle {
						font-size: 0.95rem;
						margin-bottom: 1.5rem;
					}

					.support-contactus-grid {
						gap: 1rem;
						margin-bottom: 2rem;
					}

					.support-contactus-card {
						padding: 1.2rem;
						gap: 0.85rem;
					}

					.support-contactus-icon {
						width: 36px;
						height: 36px;
						font-size: 0.95rem;
					}

					.support-contactus-card-title {
						font-size: 1rem;
						margin-bottom: 0.3rem;
					}

					.support-contactus-card-text {
						font-size: 0.9rem;
						margin-bottom: 0.3rem;
					}

					.support-contactus-muted {
						font-size: 0.85rem;
					}

					.support-contactus-faq-grid {
						gap: 1rem;
					}

					.support-contactus-faq-card {
						padding: 1.2rem;
					}

					.support-contactus-faq-question {
						font-size: 1rem;
						margin-bottom: 0.6rem;
					}

					.support-contactus-faq-answer {
						font-size: 0.9rem;
						line-height: 1.6;
					}

					.support-contactus-social-circle {
						width: 36px;
						height: 36px;
						font-size: 0.85rem;
					}
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
						Need help with your order, have a question about our products, or want styling advice? We're here to help you every step of the way.
					</p>

					<div className="support-contactus-grid">
						<div className="support-contactus-card">
							<div className="support-contactus-icon"><EmailOutlinedIcon fontSize="small" /></div>
							<div>
								<h3 className="support-contactus-card-title">Email Support</h3>
								<p className="support-contactus-card-text">
									<a href="mailto:fashionandmore.md@gmail.com" style={{ color: '#111827', textDecoration: 'none', fontWeight: '500' }}>
										fashionandmore.md@gmail.com
									</a>
								</p>
								<p className="support-contactus-muted">Response time: Within 24 hours on business days</p>
							</div>
						</div>

						<div className="support-contactus-card">
							<div className="support-contactus-icon"><PhoneInTalkOutlinedIcon fontSize="small" /></div>
							<div>
								<h3 className="support-contactus-card-title">Phone Support</h3>
								<p className="support-contactus-card-text">
									<a href="tel:+918072977025" style={{ color: '#111827', textDecoration: 'none', fontWeight: '500' }}>
										+91 80729 77025
									</a>
								</p>
								<p className="support-contactus-muted">Mon - Sat: 9:00 AM – 6:00 PM (IST)</p>
							</div>
						</div>

						<div className="support-contactus-card">
							<div className="support-contactus-icon"><PlaceOutlinedIcon fontSize="small" /></div>
							<div>
								<h3 className="support-contactus-card-title">Visit Our Showroom</h3>
								<p className="support-contactus-card-text">
									49, Rayapuram West Street,<br/>
									Tirupur - 641 604,<br/>
									Tamil Nadu, India
								</p>
								<p className="support-contactus-muted">Open: Mon - Sat, 10:00 AM – 7:00 PM</p>
							</div>
						</div>

						<div className="support-contactus-card">
							<div className="support-contactus-icon"><AccessTimeOutlinedIcon fontSize="small" /></div>
							<div>
								<h3 className="support-contactus-card-title">Business Hours</h3>
								<p className="support-contactus-card-text">
									<strong>Monday - Saturday</strong><br/>
									9:00 AM - 6:00 PM (IST)
								</p>
								<p className="support-contactus-card-text" style={{ marginTop: '0.5rem' }}>
									<strong>Sunday</strong><br/>
									Closed
								</p>
								<p className="support-contactus-muted">We respond to all inquiries the next business day</p>
							</div>
						</div>
					</div>

					<div style={{ marginTop: '3rem' }}>
						<h2 className="support-contactus-heading">Follow Us</h2>
						<div className="support-contactus-social-row">
							<a className="support-contactus-social-circle" href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
								<FacebookIcon />
							</a>
							<a className="support-contactus-social-circle" href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
								<InstagramIcon />
							</a>
							<a className="support-contactus-social-circle" href="https://wa.me/" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
								<WhatsAppIcon />
							</a>
							<a className="support-contactus-social-circle" href="https://meesho.com" aria-label="Meesho" target="_blank" rel="noopener noreferrer">
								<svg viewBox="0 0 100 100" style={{ width: '1.7rem', height: '1.7rem', fill: 'white', display: 'block' }}>
									<path d="M15 75V45c0-8 6-15 15-15 5 0 9 2 12 6 3-4 7-6 12-6 9 0 15 7 15 15v30H60V45c0-4-3-7-7-7s-7 3-7 7v30H37V45c0-4-3-7-7-7s-7 3-7 7v30H15z"/>
								</svg>
							</a>
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