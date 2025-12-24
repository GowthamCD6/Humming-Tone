import React from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import PinterestIcon from '@mui/icons-material/Pinterest';
import EmailIcon from '@mui/icons-material/Email';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import './UserFooter.css';
import { getSiteContent } from '../../utils/siteContentStore';

const Footer = () => {
  const { footer } = getSiteContent();

  return (
    <footer className="footer-main-wrapper">
      <div className="footer-top-grid">
        {/* Brand Column */}
        <div className="footer-col brand-info">
          <div className="brand-logo-container">
            {/* The Hanger Icon and Text */}
            <div className="footer-logo-wrapper">
               <span className="logo-icon-hanger"></span>
               <h2 className="footer-logo-text">{footer?.brandName || 'Humming & Tone'}</h2>
            </div>
          </div>
          <p className="footer-description">
            {footer?.description ||
              'Your premier destination for stylish and affordable fashion. Discover the latest trends in clothing for men, women, and kids.'}
          </p>
          <div className="footer-social-tray">
            <a href={footer?.social?.facebook || '#'} className="social-circle"><FacebookIcon fontSize="small" /></a>
            <a href={footer?.social?.instagram || '#'} className="social-circle"><InstagramIcon fontSize="small" /></a>
            <a href={footer?.social?.twitter || '#'} className="social-circle"><TwitterIcon fontSize="small" /></a>
            <a href={footer?.social?.pinterest || '#'} className="social-circle"><PinterestIcon fontSize="small" /></a>
          </div>
        </div>

        {/* Shop Column */}
        <div className="footer-col">
          <h3 className="footer-header-title">SHOP</h3>
          <ul className="footer-link-list">
            {(footer?.shopLinks || []).map(link => (
              <li key={link.label}><a href={link.href || '#'}>{link.label}</a></li>
            ))}
          </ul>
        </div>

        {/* Support Column */}
        <div className="footer-col">
          <h3 className="footer-header-title">SUPPORT</h3>
          <ul className="footer-link-list">
            {(footer?.supportLinks || []).map(link => (
              <li key={link.label}><a href={link.href || '#'}>{link.label}</a></li>
            ))}
          </ul>
        </div>

        {/* Company Column */}
        <div className="footer-col contact-details">
          <h3 className="footer-header-title">COMPANY</h3>
          <div className="contact-row">
            <EmailIcon className="contact-icon" />
            <span>{footer?.company?.email || 'fashionandmore.md@gmail.com'}</span>
          </div>
          <div className="contact-row">
            <LocalPhoneIcon className="contact-icon" />
            <span>{footer?.company?.phone || '+91 80729 77025'}</span>
          </div>
          <div className="contact-row align-start">
            <LocationOnIcon className="contact-icon" />
            <span>
              {(footer?.company?.address || '49, Rayapuram West Street, Tirupur-641 604, Tamil Nadu.').split(',').join(',\n').split('\n').map((line, idx) => (
                <span key={idx}>
                  {line.trim()}
                  <br />
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>

      <div className="footer-divider"></div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="copyright-container">
          <p>{footer?.legal?.copyright || '© 2025 humming tone | All rights reserved.'}</p>
        </div>
        <div className="policy-container">
          <a href={footer?.legal?.privacyPolicyHref || '#'}>{footer?.legal?.privacyPolicyLabel || 'Privacy Policy'}</a>
          <a href={footer?.legal?.termsHref || '#'}>{footer?.legal?.termsLabel || 'Terms of Service'}</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;