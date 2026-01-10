import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import "./UserFooter.css";
import { fetchSiteContent } from "../../utils/siteContentStore";

const Footer = () => {
  const [footer, setFooter] = useState(null);
  const [loading, setLoading] = useState(true);
  const isExternalHref = (href = "") => {
    const value = String(href).trim();
    return (
      /^https?:\/\//i.test(value) ||
      value.startsWith("mailto:") ||
      value.startsWith("tel:") ||
      value.startsWith("#")
    );
  };

  const normalizeUsertabTo = (href = "") => {
    const value = String(href).trim();
    if (!value) return "#";

    let path = value;
    if (!path.startsWith("/")) path = `/${path}`;

    // Strip /usertab prefix if already present
    const raw = path.replace(/^\/+/, "").replace(/^usertab\//i, "");
    const normalizedKey = raw
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/&/g, "and")
      .replace(/[^a-z0-9/_-]/g, "")
      .replace(/^\/+/, "")
      .replace(/\/+$/, "");

    const routeMap = {
      // Support pages
      "privacy-policy": "privacy_policy",
      "privacy_policy": "privacy_policy",
      "privacyandpolicy": "privacy_policy",
      "privacy-policy/": "privacy_policy",

      "terms": "terms_of_service",
      "terms-of-service": "terms_of_service",
      "terms_of_service": "terms_of_service",
      "termsofservice": "terms_of_service",

      "contact": "contact_us",
      "contact-us": "contact_us",
      "contact_us": "contact_us",
      "contactus": "contact_us",

      "shipping": "shipping_info",
      "shipping-info": "shipping_info",
      "shipping_info": "shipping_info",
      "shippinginfo": "shipping_info",

      "returns": "return_&_exchange",
      "return": "return_&_exchange",
      "return-exchange": "return_&_exchange",
      "return-and-exchange": "return_&_exchange",
      "return_&_exchange": "return_&_exchange",
      "returnandexchange": "return_&_exchange",

      // Shop pages
      "mens": "men",
      "mens-collection": "men",
      "mens_collection": "men",
      "women": "women",
      "womens": "women",
      "womens-collection": "women",
      "childrens": "children",
      "childrens-collection": "children",
      "children": "children",
      "baby": "baby",
      "sports": "sports",
      "customize": "customize",
      "all-products": "all-products",
      "all_products": "all-products",
    };

    const mapped = routeMap[normalizedKey] || routeMap[normalizedKey.replace(/^\//, "")];

    // If it already looks like a nested path (e.g. support/privacy_policy), keep it.
    const finalPath = mapped || raw.replace(/^\/+/, "");
    if (!finalPath) return "#";

    return `/usertab/${finalPath.replace(/^\/+/, "")}`;
  };

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
            privacyPolicyHref: "/usertab/privacy_policy",
            termsLabel: "Terms of Service",
            termsHref: "/usertab/terms_of_service",
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
            <a
              href={footer.social?.meesho || "https://meesho.com"}
              className="social-circle"
              aria-label="Meesho"
            >
              <svg viewBox="0 0 100 100" style={{ width: '1.5rem', height: '1.5rem', fill: 'white', display: 'block' }}>
                <path d="M15 75V45c0-8 6-15 15-15 5 0 9 2 12 6 3-4 7-6 12-6 9 0 15 7 15 15v30H60V45c0-4-3-7-7-7s-7 3-7 7v30H37V45c0-4-3-7-7-7s-7 3-7 7v30H15z"/>
              </svg>
            </a>
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
                  {isExternalHref(link.href) ? (
                    <a href={link.href || "#"}>{link.label}</a>
                  ) : (
                    <Link to={normalizeUsertabTo(link.href)}>{link.label}</Link>
                  )}
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
                  {isExternalHref(link.href) ? (
                    <a href={link.href || "#"}>{link.label}</a>
                  ) : (
                    <Link to={normalizeUsertabTo(link.href)}>{link.label}</Link>
                  )}
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
          <Link to={normalizeUsertabTo(footer.legal?.privacyPolicyHref || "privacy_policy")}>
            {footer.legal?.privacyPolicyLabel || "Privacy Policy"}
          </Link>
          <Link to={normalizeUsertabTo(footer.legal?.termsHref || "terms_of_service")}>
            {footer.legal?.termsLabel || "Terms of Service"}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;