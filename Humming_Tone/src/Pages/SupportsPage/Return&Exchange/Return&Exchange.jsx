import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserFooter from "../../../components/User-Footer-Card/UserFooter";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import SyncAltOutlinedIcon from "@mui/icons-material/SyncAltOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

const ReturnExchange = () => {
  const navigate = useNavigate();
  const [quickOrderId, setQuickOrderId] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const handleTrackOrReturn = (e) => {
    e.preventDefault();
    if (quickOrderId.trim()) {
      localStorage.setItem("ot_order_number", quickOrderId.trim());
    }
    navigate("/usertab/order_tracking");
  };

  return (
    <div className="support-return-exchange-page">
      <style>{`
        /* Base Typography & Colors */
        .support-return-exchange-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #333;
          line-height: 1.6;
          background: linear-gradient(180deg, #fafafa 0%, #f4f6f9 45%, #ffffff 100%);
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
        .support-return-hero {
          background: linear-gradient(135deg, rgba(0,0,0,0.80) 0%, rgba(15,23,42,0.65) 50%, rgba(0,0,0,0.84) 100%), 
                      url('https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
          width: 100%;
          max-width: 1340px;
          margin: 0 auto;
          min-height: 620px;
          height: clamp(500px, 62vh, 700px);
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          color: white;
          padding: 7rem 2rem 5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          animation: fadeIn 0.8s ease-out;
        }

        .support-return-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 12% 10%, rgba(255,255,255,0.12), transparent 55%),
            radial-gradient(circle at 88% 90%, rgba(255,255,255,0.10), transparent 55%);
          pointer-events: none;
        }

        .support-return-hero-content {
          max-width: 780px;
          margin: 0 auto;
          position: relative;
          padding: 0 1.5rem;
        }

        .support-return-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(8px);
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
          color: #f3f4f6;
          animation: fadeInUp 0.7s ease-out 0.2s both;
        }

        .support-return-hero h1 {
          font-size: 3.5rem;
          margin-bottom: 1.2rem;
          font-weight: 300;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 20px rgba(0,0,0,0.35);
          animation: slideInFromLeft 0.8s ease-out 0.3s both;
        }

        .support-return-hero p {
          font-size: 1.25rem;
          opacity: 0.95;
          max-width: 680px;
          margin: 0 auto;
          font-weight: 300;
          line-height: 1.7;
          animation: fadeInUp 0.8s ease-out 0.5s both;
        }

        /* Main Content */
        .support-return-main {
          padding: 5rem 0;
          background: #fafafa;
          display: flex;
          justify-content: center;
        }

        .support-return-container {
          width: 100%;
          max-width: 1120px;
          padding: 0 1.5rem;
          box-sizing: border-box;
          animation: scaleIn 0.6s ease-out 0.2s both;
        }

        /* 3-Step Process Grid */
        .support-process-section {
          margin-bottom: 4rem;
        }

        .support-section-header {
          text-align: center;
          margin-bottom: 2.8rem;
        }

        .support-section-tag {
          display: inline-block;
          font-size: 0.82rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #6366f1;
          margin-bottom: 0.5rem;
        }

        .support-section-title {
          font-size: 2.3rem;
          font-weight: 400;
          color: #111827;
          margin: 0 0 0.75rem;
          letter-spacing: -0.01em;
        }

        .support-section-desc {
          font-size: 1.1rem;
          color: #64748b;
          max-width: 620px;
          margin: 0 auto;
        }

        .support-process-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.8rem;
        }

        .support-process-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 2.2rem 1.8rem;
          box-shadow: 0 10px 30px rgba(15,23,42,0.06);
          border: 1px solid rgba(15,23,42,0.06);
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .support-process-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 45px rgba(15,23,42,0.12);
          border-color: rgba(99,102,241,0.25);
        }

        .support-process-step-num {
          position: absolute;
          top: 1.5rem;
          right: 1.8rem;
          font-size: 2rem;
          font-weight: 700;
          color: #f1f5f9;
          user-select: none;
          line-height: 1;
        }

        .support-process-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: linear-gradient(135deg, #111827, #1f2937);
          color: #fff;
          display: grid;
          place-items: center;
          margin-bottom: 1.4rem;
          transition: transform 0.3s ease;
        }

        .support-process-card:hover .support-process-icon-box {
          transform: scale(1.08);
          background: linear-gradient(135deg, #1e1b4b, #312e81);
        }

        .support-process-card h3 {
          font-size: 1.25rem;
          color: #111827;
          margin: 0 0 0.6rem;
          font-weight: 500;
        }

        .support-process-card p {
          font-size: 0.96rem;
          color: #64748b;
          line-height: 1.65;
          margin: 0;
        }

        /* Quick Action Bar / Order Finder */
        .support-quick-action-card {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #111827 100%);
          border-radius: 20px;
          padding: 3rem;
          color: white;
          margin-bottom: 4.5rem;
          box-shadow: 0 20px 50px rgba(15,23,42,0.22);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2.5rem;
          position: relative;
          overflow: hidden;
        }

        .support-quick-action-card::before {
          content: '';
          position: absolute;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%);
          top: -100px;
          right: -50px;
          pointer-events: none;
        }

        .support-quick-action-info {
          max-width: 520px;
          position: relative;
          z-index: 1;
        }

        .support-quick-action-info h3 {
          font-size: 1.85rem;
          margin: 0 0 0.8rem;
          font-weight: 400;
          letter-spacing: -0.01em;
        }

        .support-quick-action-info p {
          font-size: 1.05rem;
          color: #cbd5e1;
          margin: 0 0 1.25rem;
          line-height: 1.6;
        }

        .support-quick-action-badges {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .support-quick-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #a5b4fc;
          background: rgba(255,255,255,0.06);
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .support-quick-form {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          min-width: 320px;
          position: relative;
          z-index: 1;
        }

        .support-quick-input-group {
          display: flex;
          background: #ffffff;
          border-radius: 12px;
          padding: 4px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .support-quick-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 0.8rem 1.2rem;
          font-size: 0.95rem;
          border-radius: 10px;
          color: #111827;
        }

        .support-quick-btn {
          background: #111827;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0 1.5rem;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .support-quick-btn:hover {
          background: #4f46e5;
          transform: scale(1.02);
        }

        .support-quick-whatsapp-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(37, 211, 102, 0.15);
          color: #4ade80;
          border: 1px solid rgba(37, 211, 102, 0.3);
          border-radius: 10px;
          padding: 0.75rem 1.2rem;
          font-size: 0.92rem;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .support-quick-whatsapp-btn:hover {
          background: rgba(37, 211, 102, 0.25);
          border-color: #25D366;
          color: #86efac;
        }

        /* Pillars 4-Card Grid */
        .support-pillars-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 4.5rem;
        }

        .support-pillar-card {
          background: #ffffff;
          border-radius: 14px;
          padding: 1.8rem 1.4rem;
          box-shadow: 0 8px 25px rgba(15,23,42,0.05);
          border: 1px solid rgba(15,23,42,0.06);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .support-pillar-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 36px rgba(15,23,42,0.1);
        }

        .support-pillar-icon {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #f8fafc;
          color: #111827;
          display: grid;
          place-items: center;
          margin-bottom: 1rem;
          border: 1px solid #e2e8f0;
          transition: transform 0.3s ease, background 0.3s ease, color 0.3s ease;
        }

        .support-pillar-card:hover .support-pillar-icon {
          background: #111827;
          color: #ffffff;
          transform: scale(1.1);
        }

        .support-pillar-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.4rem;
        }

        .support-pillar-desc {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.55;
          margin: 0;
        }

        /* Comparison Section (Eligible vs Ineligible) */
        .support-eligibility-section {
          margin-bottom: 4.5rem;
        }

        .support-eligibility-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .support-eligibility-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 2.2rem;
          box-shadow: 0 12px 34px rgba(15,23,42,0.06);
          border: 1px solid rgba(15,23,42,0.06);
          position: relative;
          overflow: hidden;
        }

        .support-eligibility-card.valid {
          border-top: 4px solid #10b981;
        }

        .support-eligibility-card.invalid {
          border-top: 4px solid #ef4444;
        }

        .support-eligibility-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .support-eligibility-header-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: grid;
          place-items: center;
        }

        .support-eligibility-card.valid .support-eligibility-header-icon {
          background: #ecfdf5;
          color: #059669;
        }

        .support-eligibility-card.invalid .support-eligibility-header-icon {
          background: #fef2f2;
          color: #dc2626;
        }

        .support-eligibility-header h3 {
          font-size: 1.25rem;
          font-weight: 500;
          color: #1e293b;
          margin: 0;
        }

        .support-eligibility-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .support-eligibility-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.95rem;
          color: #475569;
          line-height: 1.55;
        }

        .support-eligibility-item svg {
          font-size: 1.15rem;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .support-eligibility-card.valid .support-eligibility-item svg {
          color: #10b981;
        }

        .support-eligibility-card.invalid .support-eligibility-item svg {
          color: #ef4444;
        }

        /* Detailed Policy Sections (Accordion / Glass Cards) */
        .support-policy-breakdown {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin-bottom: 4.5rem;
        }

        .support-policy-card {
          background: #ffffff;
          border-radius: 14px;
          padding: 2.2rem;
          box-shadow: 0 10px 30px rgba(15,23,42,0.06);
          border: 1px solid rgba(15,23,42,0.06);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .support-policy-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(15,23,42,0.1);
        }

        .support-policy-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.25rem;
        }

        .support-policy-card-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #f1f5f9;
          color: #1e293b;
          display: grid;
          place-items: center;
          font-size: 1.2rem;
        }

        .support-policy-card h3 {
          font-size: 1.25rem;
          color: #0f172a;
          margin: 0;
          font-weight: 500;
        }

        .support-policy-card p {
          color: #555;
          font-size: 0.98rem;
          line-height: 1.7;
          margin: 0 0 1rem;
        }

        .support-policy-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .support-policy-table th,
        .support-policy-table td {
          padding: 0.65rem 0.85rem;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .support-policy-table th {
          background: #f8fafc;
          color: #475569;
          font-weight: 600;
        }

        .support-policy-table td {
          color: #64748b;
        }

        /* FAQ Section */
        .support-faq-section {
          margin-bottom: 4.5rem;
        }

        .support-faq-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.8rem;
        }

        .support-faq-card {
          background: #ffffff;
          border-radius: 14px;
          padding: 1.8rem;
          box-shadow: 0 10px 30px rgba(15,23,42,0.05);
          border-left: 4px solid #111827;
          border: 1px solid rgba(15,23,42,0.06);
          border-left-width: 4px;
          border-left-color: #111827;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .support-faq-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(15,23,42,0.1);
        }

        .support-faq-question {
          font-size: 1.12rem;
          font-weight: 500;
          color: #111827;
          margin: 0 0 0.65rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .support-faq-answer {
          font-size: 0.96rem;
          color: #64748b;
          line-height: 1.65;
          margin: 0;
        }

        /* Concierge Contact Box */
        .support-concierge-banner {
          background: #ffffff;
          border-radius: 18px;
          padding: 3rem 2.5rem;
          box-shadow: 0 15px 45px rgba(15,23,42,0.08);
          border: 1px solid rgba(15,23,42,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: 3.5rem;
        }

        .support-concierge-content h3 {
          font-size: 1.8rem;
          font-weight: 400;
          color: #111827;
          margin: 0 0 0.5rem;
        }

        .support-concierge-content p {
          font-size: 1.05rem;
          color: #64748b;
          margin: 0;
        }

        .support-concierge-actions {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          flex-wrap: wrap;
        }

        .support-concierge-btn-wa {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #25D366;
          color: #ffffff;
          font-weight: 500;
          font-size: 0.95rem;
          padding: 0.85rem 1.6rem;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(37,211,102,0.3);
          transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }

        .support-concierge-btn-wa:hover {
          background: #20bd5a;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(37,211,102,0.4);
        }

        .support-concierge-btn-mail {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #111827;
          color: #ffffff;
          font-weight: 500;
          font-size: 0.95rem;
          padding: 0.85rem 1.6rem;
          border-radius: 12px;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .support-concierge-btn-mail:hover {
          background: #374151;
          transform: translateY(-2px);
        }

        .support-return-update-tag {
          text-align: center;
          font-size: 0.92rem;
          color: #94a3b8;
          font-style: italic;
          margin-top: 1rem;
        }

        /* Responsive Design - Tablet */
        @media (max-width: 1024px) {
          .support-return-hero {
            min-height: 520px;
            height: clamp(450px, 58vh, 620px);
            padding: 6rem 2rem 4rem;
          }

          .support-return-hero h1 {
            font-size: 3rem;
          }

          .support-process-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.2rem;
          }

          .support-pillars-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.2rem;
          }

          .support-quick-action-card {
            flex-direction: column;
            align-items: stretch;
            padding: 2.5rem;
          }

          .support-quick-form {
            min-width: 100%;
          }

          .support-policy-breakdown {
            grid-template-columns: 1fr;
          }
        }

        /* Responsive Design - Mobile Large */
        @media (max-width: 768px) {
          .support-return-hero {
            background-attachment: scroll;
            min-height: 420px;
            height: clamp(380px, 52vh, 500px);
            padding: 5rem 1.5rem 3.5rem;
          }

          .support-return-hero h1 {
            font-size: 2.4rem;
          }

          .support-return-hero p {
            font-size: 1.1rem;
          }

          .support-return-main {
            padding: 3.5rem 0;
          }

          .support-process-grid {
            grid-template-columns: 1fr;
            gap: 1.2rem;
          }

          .support-pillars-grid {
            grid-template-columns: 1fr;
          }

          .support-eligibility-grid {
            grid-template-columns: 1fr;
          }

          .support-faq-grid {
            grid-template-columns: 1fr;
          }

          .support-concierge-banner {
            flex-direction: column;
            align-items: flex-start;
            padding: 2rem;
          }

          .support-concierge-actions {
            width: 100%;
          }

          .support-concierge-btn-wa,
          .support-concierge-btn-mail {
            width: 100%;
            justify-content: center;
            box-sizing: border-box;
          }
        }

        /* Responsive Design - Mobile Small */
        @media (max-width: 480px) {
          .support-return-hero {
            min-height: 360px;
            padding: 4rem 1rem 3rem;
          }

          .support-return-hero h1 {
            font-size: 2rem;
          }

          .support-section-title {
            font-size: 1.8rem;
          }

          .support-quick-action-card {
            padding: 1.8rem 1.2rem;
          }

          .support-quick-input-group {
            flex-direction: column;
            gap: 6px;
            padding: 8px;
          }

          .support-quick-btn {
            padding: 0.75rem;
            justify-content: center;
          }

          .support-policy-card {
            padding: 1.5rem;
          }

          .support-faq-card {
            padding: 1.4rem;
          }
        }

        /* Extra Small */
        @media (max-width: 360px) {
          .support-return-hero h1 {
            font-size: 1.75rem;
          }

          .support-return-container {
            padding: 0 0.75rem;
          }
        }
      `}</style>

      {/* Hero Section */}
      <header className="support-return-hero">
        <div className="support-return-hero-content">
          <div className="support-return-hero-badge">
            <VerifiedUserOutlinedIcon style={{ fontSize: "1.1rem" }} />
            <span>Guaranteed Satisfaction</span>
          </div>
          <h1>Return &amp; Exchange</h1>
          <p>
            Experience our effortless, doorstep-assisted returns and size exchanges.
            Every bespoke and curated garment is crafted for your utmost delight.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="support-return-main">
        <div className="support-return-container">

          {/* Quick Order Lookup / Action Card */}
          <section className="support-quick-action-card">
            <div className="support-quick-action-info">
              <div className="support-quick-badge">
                <AccessTimeOutlinedIcon style={{ fontSize: "0.95rem" }} />
                <span>7-Day Window Post Delivery</span>
              </div>
              <h3 style={{ marginTop: "0.75rem" }}>Need to Return or Swap an Item?</h3>
              <p>
                Initiate a seamless doorstep return or size exchange in under 60 seconds.
                Enter your Order ID to view eligible items and start your request.
              </p>
              <div className="support-quick-action-badges">
                <span className="support-quick-badge">✓ Free Pickup</span>
                <span className="support-quick-badge">✓ 100% Refund</span>
                <span className="support-quick-badge">✓ Fast Swaps</span>
              </div>
            </div>

            <form className="support-quick-form" onSubmit={handleTrackOrReturn}>
              <div className="support-quick-input-group">
                <input
                  type="text"
                  className="support-quick-input"
                  placeholder="Enter Order ID (e.g. HT-10024)"
                  value={quickOrderId}
                  onChange={(e) => setQuickOrderId(e.target.value)}
                />
                <button type="submit" className="support-quick-btn">
                  <span>Manage</span>
                  <ArrowForwardOutlinedIcon style={{ fontSize: "1.1rem" }} />
                </button>
              </div>

              <a
                href="https://wa.me/918072977025?text=Hello%20Humming%20Tone,%20I%20would%20like%20to%20request%20a%20Return%20or%20Exchange%20for%20my%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="support-quick-whatsapp-btn"
              >
                <WhatsAppIcon style={{ fontSize: "1.2rem" }} />
                <span>Request via WhatsApp Concierge</span>
              </a>
            </form>
          </section>

          {/* 3-Step Process Journey */}
          <section className="support-process-section">
            <div className="support-section-header">
              <span className="support-section-tag">How It Works</span>
              <h2 className="support-section-title">Seamless 3-Step Process</h2>
              <p className="support-section-desc">
                We make returns and exchanges as delightful as unboxing your favorite piece.
              </p>
            </div>

            <div className="support-process-grid">
              <div className="support-process-card">
                <span className="support-process-step-num">01</span>
                <div className="support-process-icon-box">
                  <AssignmentReturnOutlinedIcon style={{ fontSize: "1.6rem" }} />
                </div>
                <h3>1. Submit Request</h3>
                <p>
                  Access your order via the Track &amp; Manage Orders portal or text our WhatsApp Concierge.
                  Choose whether you desire a refund or a size/color exchange.
                </p>
              </div>

              <div className="support-process-card">
                <span className="support-process-step-num">02</span>
                <div className="support-process-icon-box">
                  <LocalShippingOutlinedIcon style={{ fontSize: "1.6rem" }} />
                </div>
                <h3>2. Doorstep Pickup</h3>
                <p>
                  Keep the garment intact in its original packaging with tags.
                  Our courier partner will collect the parcel straight from your shipping address at no extra cost.
                </p>
              </div>

              <div className="support-process-card">
                <span className="support-process-step-num">03</span>
                <div className="support-process-icon-box">
                  <SyncAltOutlinedIcon style={{ fontSize: "1.6rem" }} />
                </div>
                <h3>3. Refund or Dispatch</h3>
                <p>
                  Upon quality inspection at our atelier, your refund is credited within 3-5 business days,
                  or your replacement exchange garment is dispatched immediately.
                </p>
              </div>
            </div>
          </section>

          {/* 4 Policy Pillars Grid */}
          <section className="support-pillars-grid">
            <div className="support-pillar-card">
              <div className="support-pillar-icon">
                <AccessTimeOutlinedIcon />
              </div>
              <h4 className="support-pillar-title">7-Day Window</h4>
              <p className="support-pillar-desc">
                Request a return or exchange within 7 days of verified parcel delivery.
              </p>
            </div>

            <div className="support-pillar-card">
              <div className="support-pillar-icon">
                <LocalShippingOutlinedIcon />
              </div>
              <h4 className="support-pillar-title">Free Reverse Logistics</h4>
              <p className="support-pillar-desc">
                Complimentary doorstep pickup for damaged items, size misfits, &amp; wrong items.
              </p>
            </div>

            <div className="support-pillar-card">
              <div className="support-pillar-icon">
                <AccountBalanceWalletOutlinedIcon />
              </div>
              <h4 className="support-pillar-title">100% Refund</h4>
              <p className="support-pillar-desc">
                Direct reimbursement to original payment mode or bank account for COD orders.
              </p>
            </div>

            <div className="support-pillar-card">
              <div className="support-pillar-icon">
                <VerifiedUserOutlinedIcon />
              </div>
              <h4 className="support-pillar-title">Atelier Quality Check</h4>
              <p className="support-pillar-desc">
                Quick 24-hour turnaround inspection for lightning-fast refund approval.
              </p>
            </div>
          </section>

          {/* Eligibility Checklist */}
          <section className="support-eligibility-section">
            <div className="support-section-header">
              <span className="support-section-tag">Guidelines</span>
              <h2 className="support-section-title">Item Eligibility Breakdown</h2>
              <p className="support-section-desc">
                To ensure fairness and hygiene, please review which garments qualify for return or swap.
              </p>
            </div>

            <div className="support-eligibility-grid">
              {/* Eligible Card */}
              <div className="support-eligibility-card valid">
                <div className="support-eligibility-header">
                  <div className="support-eligibility-header-icon">
                    <CheckCircleOutlineOutlinedIcon />
                  </div>
                  <h3>Eligible for Return / Exchange</h3>
                </div>
                <ul className="support-eligibility-list">
                  <li className="support-eligibility-item">
                    <CheckCircleOutlineOutlinedIcon />
                    <span>Unworn, unwashed, and undamaged garments in pristine condition.</span>
                  </li>
                  <li className="support-eligibility-item">
                    <CheckCircleOutlineOutlinedIcon />
                    <span>All original brand tags, security labels, and trims intact and attached.</span>
                  </li>
                  <li className="support-eligibility-item">
                    <CheckCircleOutlineOutlinedIcon />
                    <span>Garments received in damaged, stained, or defective state.</span>
                  </li>
                  <li className="support-eligibility-item">
                    <CheckCircleOutlineOutlinedIcon />
                    <span>Incorrect size, style, or color delivered vs order invoice.</span>
                  </li>
                  <li className="support-eligibility-item">
                    <CheckCircleOutlineOutlinedIcon />
                    <span>Packaged securely in original polybag / protective box.</span>
                  </li>
                </ul>
              </div>

              {/* Ineligible Card */}
              <div className="support-eligibility-card invalid">
                <div className="support-eligibility-header">
                  <div className="support-eligibility-header-icon">
                    <HighlightOffOutlinedIcon />
                  </div>
                  <h3>Non-Returnable Items</h3>
                </div>
                <ul className="support-eligibility-list">
                  <li className="support-eligibility-item">
                    <HighlightOffOutlinedIcon />
                    <span>Customized, tailored, monogrammed, or bespoke embroidered apparel.</span>
                  </li>
                  <li className="support-eligibility-item">
                    <HighlightOffOutlinedIcon />
                    <span>Intimate wear, innerwear, and bodysuits due to strict hygiene policies.</span>
                  </li>
                  <li className="support-eligibility-item">
                    <HighlightOffOutlinedIcon />
                    <span>Garments showing signs of perfume scents, deodorant marks, or wear.</span>
                  </li>
                  <li className="support-eligibility-item">
                    <HighlightOffOutlinedIcon />
                    <span>Items with missing original brand tags or damaged barcodes.</span>
                  </li>
                  <li className="support-eligibility-item">
                    <HighlightOffOutlinedIcon />
                    <span>Requests initiated after the 7-day post-delivery eligibility window.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Detailed Policy Breakdown */}
          <section className="support-policy-breakdown">
            <div className="support-policy-card">
              <div className="support-policy-card-header">
                <div className="support-policy-card-icon">
                  <AccountBalanceWalletOutlinedIcon />
                </div>
                <h3>Refund Modes &amp; Timelines</h3>
              </div>
              <p>
                Once your returned parcel reaches our facility and clears our quality assurance inspection,
                your refund is triggered within 24 hours.
              </p>
              <table className="support-policy-table">
                <thead>
                  <tr>
                    <th>Payment Method</th>
                    <th>Settlement Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>UPI / Digital Wallets</td>
                    <td>24 – 48 Hours</td>
                  </tr>
                  <tr>
                    <td>Credit / Debit Cards</td>
                    <td>3 – 5 Business Days</td>
                  </tr>
                  <tr>
                    <td>Net Banking</td>
                    <td>3 – 5 Business Days</td>
                  </tr>
                  <tr>
                    <td>Cash on Delivery (COD)</td>
                    <td>Direct Bank Transfer (via NEFT/IMPS)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="support-policy-card">
              <div className="support-policy-card-header">
                <div className="support-policy-card-icon">
                  <SyncAltOutlinedIcon />
                </div>
                <h3>Size &amp; Fit Exchange Policy</h3>
              </div>
              <p>
                Found that your piece is slightly too snug or loose? We offer zero-hassle size exchanges
                for the same product across all available size options.
              </p>
              <p>
                <strong>Free Reverse Pickup:</strong> Our concierge will arrange pickup for the initial garment
                and dispatch your chosen replacement size immediately upon package pickup.
              </p>
              <p style={{ color: "#64748b", fontSize: "0.92rem", marginBottom: 0 }}>
                *If the requested replacement size is currently out of stock, you may choose an alternative color,
                store credits, or a full refund.
              </p>
            </div>

            <div className="support-policy-card">
              <div className="support-policy-card-header">
                <div className="support-policy-card-icon">
                  <LocalShippingOutlinedIcon />
                </div>
                <h3>Reverse Logistics &amp; Shipping Fees</h3>
              </div>
              <p>
                We believe in total transparency. Here is how shipping fees for returns and exchanges work:
              </p>
              <p>
                <strong>Complimentary (100% Free):</strong> Defective items, transit damages, incorrect items delivered,
                and your first size exchange are 100% free of reverse shipping charges.
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Customer Return Logistics:</strong> For elective change-of-mind returns on non-defective items,
                a nominal reverse logistics fee of ₹99 may be deducted from the final refund amount to offset carrier pickup costs.
              </p>
            </div>

            <div className="support-policy-card">
              <div className="support-policy-card-header">
                <div className="support-policy-card-icon">
                  <VerifiedUserOutlinedIcon />
                </div>
                <h3>Damaged or Defective Protocol</h3>
              </div>
              <p>
                In the rare instance your order arrives damaged or with manufacturing flaws,
                please notify us within 48 hours of delivery.
              </p>
              <p>
                Simply share your Order ID and 2-3 photos/video of the affected garment via WhatsApp
                or email to <strong style={{ color: "#111827" }}>fashionandmore.md@gmail.com</strong>.
              </p>
              <p style={{ color: "#10b981", fontWeight: 500, marginBottom: 0 }}>
                ★ Priority Fast-Track: Replacement or instant 100% refund is processed with zero inspection delays.
              </p>
            </div>
          </section>

          {/* Frequently Asked Questions */}
          <section className="support-faq-section">
            <div className="support-section-header">
              <span className="support-section-tag">Got Questions?</span>
              <h2 className="support-section-title">Frequently Asked Questions</h2>
              <p className="support-section-desc">
                Everything you need to know regarding returns, exchanges, and refund settlements.
              </p>
            </div>

            <div className="support-faq-grid">
              <div className="support-faq-card">
                <h4 className="support-faq-question">
                  <HelpOutlineOutlinedIcon style={{ fontSize: "1.15rem", color: "#6366f1" }} />
                  How do I book a return or exchange?
                </h4>
                <p className="support-faq-answer">
                  You can initiate a return directly from the "Track &amp; Manage Orders" section in your account,
                  or by entering your Order ID at the top of this page. Alternatively, message our WhatsApp concierge.
                </p>
              </div>

              <div className="support-faq-card">
                <h4 className="support-faq-question">
                  <HelpOutlineOutlinedIcon style={{ fontSize: "1.15rem", color: "#6366f1" }} />
                  Can I return customized or tailored items?
                </h4>
                <p className="support-faq-answer">
                  Because bespoke, monogrammed, and tailored items are custom crafted specifically to your unique specifications,
                  they are non-returnable unless received damaged or with a verified manufacturing flaw.
                </p>
              </div>

              <div className="support-faq-card">
                <h4 className="support-faq-question">
                  <HelpOutlineOutlinedIcon style={{ fontSize: "1.15rem", color: "#6366f1" }} />
                  How does refund work for Cash on Delivery (COD)?
                </h4>
                <p className="support-faq-answer">
                  For COD orders, our support concierge will securely request your UPI ID or Bank Account Details (Account No &amp; IFSC).
                  The refund amount will be credited directly via NEFT/IMPS within 24–48 hours of inspection.
                </p>
              </div>

              <div className="support-faq-card">
                <h4 className="support-faq-question">
                  <HelpOutlineOutlinedIcon style={{ fontSize: "1.15rem", color: "#6366f1" }} />
                  How long does the courier take to pick up my parcel?
                </h4>
                <p className="support-faq-answer">
                  Once your return/exchange request is approved, our courier partner typically schedules doorstep pickup within
                  24 to 48 business hours across all major Indian pin codes.
                </p>
              </div>
            </div>
          </section>

          {/* Concierge Support Contact Banner */}
          <section className="support-concierge-banner">
            <div className="support-concierge-content">
              <h3>Need Personal Return Assistance?</h3>
              <p>
                Our dedicated support concierge is available Mon – Sat (9:00 AM – 6:00 PM IST)
                to assist you with instantaneous return approvals and fit advice.
              </p>
            </div>

            <div className="support-concierge-actions">
              <a
                href="https://wa.me/918072977025?text=Hello%20Humming%20Tone,%20I%20need%20assistance%20with%20a%20Return%20or%20Exchange"
                target="_blank"
                rel="noopener noreferrer"
                className="support-concierge-btn-wa"
              >
                <WhatsAppIcon style={{ fontSize: "1.2rem" }} />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href="mailto:fashionandmore.md@gmail.com?subject=Return%20/%20Exchange%20Inquiry"
                className="support-concierge-btn-mail"
              >
                <EmailOutlinedIcon style={{ fontSize: "1.2rem" }} />
                <span>Email Support</span>
              </a>
            </div>
          </section>

          <p className="support-return-update-tag">
            Policy Effective: September 2026 • Humming Tone Atelier All Rights Reserved
          </p>
        </div>
      </main>

      <UserFooter />
    </div>
  );
};

export default ReturnExchange;