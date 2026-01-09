import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { SvgIcon } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import "./UserFooter.css";
import { fetchSiteContent } from "../../utils/siteContentStore";

const Footer = () => {
  const [footer, setFooter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await fetchSiteContent();
        setFooter(data.footer);
      } catch (error) {
        console.error("Error loading footer:", error);
        // Set default footer data
        setFooter({
          brandName: "Humming & Tone",
          description:
            "Your premier destination for stylish and affordable fashion. Discover the latest trends in clothing for men, women, and kids.",
          company: {
            email: "fashionandmore.md@gmail.com",
            phone: "+91 80729 77025",
            address: "49, Rayapuram West Street, Tirupur-641 604, Tamil Nadu.",
          },
          social: {
            facebook: "https://facebook.com",
            instagram: "https://instagram.com",
            whatsapp: "https://wa.me/",
            meesho: "https://meesho.com",
          },
          legal: {
            copyright: "© 2025 humming tone | All rights reserved.",
            privacyPolicyLabel: "Privacy Policy",
            privacyPolicyHref: "/privacy-policy",
            termsLabel: "Terms of Service",
            termsHref: "/terms",
          },
          shopLinks: [],
          supportLinks: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // Show loading or default state
  if (loading || !footer) {
    return (
      <footer className="footer-main-wrapper">
        <div className="footer-loading">Loading...</div>
      </footer>
    );
  }

  return (
    <footer className="footer-main-wrapper">
      <div className="footer-top-grid">
        {/* Brand Column */}
        <div className="footer-col brand-info">
          <div className="brand-logo-container">
            <div className="footer-logo-wrapper">
              <span className="logo-icon-hanger"></span>
              <h2 className="footer-logo-text">{footer.brandName}</h2>
            </div>
          </div>
          <p className="footer-description">{footer.description}</p>
          <div className="footer-social-tray">
            <a
              href={footer.social?.facebook || "#"}
              className="social-circle"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              href={footer.social?.instagram || "#"}
              className="social-circle"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href={footer.social?.whatsapp || "#"}
              className="social-circle"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon />
            </a>
            {/* <a href={footer.social?.meesho || '#'} className="social-circle" aria-label="Meesho">
              <MeeshoIcon fontSize="small" />
            </a> */}
          </div>
        </div>

        {/* Shop Column */}
        <div className="footer-col">
          <h3 className="footer-header-title">SHOP</h3>
          <ul className="footer-link-list">
            {(footer.shopLinks || [])
              .filter((link) => link.active === true)
              .map((link, index) => (
                <li key={index}>
                  <a href={link.href || "#"}>{link.label}</a>
                </li>
              ))}
          </ul>
        </div>

        {/* Support Column */}
        <div className="footer-col">
          <h3 className="footer-header-title">SUPPORT</h3>
          <ul className="footer-link-list">
            {(footer.supportLinks || [])
              .filter((link) => link.active === true)
              .map((link, index) => (
                <li key={index}>
                  <a href={link.href || "#"}>{link.label}</a>
                </li>
              ))}
          </ul>
        </div>

        {/* Company Column */}
        <div className="footer-col contact-details">
          <h3 className="footer-header-title">COMPANY</h3>
          <div className="contact-row">
            <EmailIcon className="contact-icon" />
            <span>
              {footer.company?.email || "fashionandmore.md@gmail.com"}
            </span>
          </div>
          <div className="contact-row">
            <LocalPhoneIcon className="contact-icon" />
            <span>{footer.company?.phone || "+91 80729 77025"}</span>
          </div>
          <div className="contact-row align-start">
            <LocationOnIcon className="contact-icon" />
            <span>
              {(() => {
                const rawAddress =
                  footer.company?.address ||
                  "49, Rayapuram West Street, Tirupur-641 604, Tamil Nadu.";
                const parts = rawAddress
                  .split(",")
                  .map((part) => part.trim())
                  .filter(Boolean);
                if (parts.length >= 2 && /^\d+[A-Za-z-]*$/.test(parts[0])) {
                  parts[1] = `${parts[0]}, ${parts[1]}`;
                  parts.shift();
                }

                return parts.map((line, idx) => (
                  <span key={idx}>
                    {line}
                    <br />
                  </span>
                ));
              })()}
            </span>
          </div>
        </div>
      </div>

      <div className="footer-divider"></div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="copyright-container">
          <p>
            {footer.legal?.copyright ||
              "© 2025 humming tone | All rights reserved."}
          </p>
        </div>
        <div className="policy-container">
          <Link to={footer.legal?.privacyPolicyHref || "/privacy-policy"}>
            {footer.legal?.privacyPolicyLabel || "Privacy Policy"}
          </Link>
          <a href={footer.legal?.termsHref || "/terms"}>
            {footer.legal?.termsLabel || "Terms of Service"}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;