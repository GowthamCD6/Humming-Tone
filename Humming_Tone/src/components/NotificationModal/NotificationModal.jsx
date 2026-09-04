import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCheck,
  Bell,
  Sparkles,
  Truck,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  Tag,
  Inbox,
  Clock,
  ChevronRight,
} from "lucide-react";
import "./NotificationModal.css";

const NotificationModal = ({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkAllRead,
  onNotificationClick,
  loading = false,
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanTitle = (title = "") => {
    return String(title || "")
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, "")
      .trim();
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const renderIcon = (notif) => {
    const title = (notif.title || "").toLowerCase();
    const type = (notif.type || "").toLowerCase();

    if (title.includes("confirm") || title.includes("placed") || title.includes("verified")) {
      return (
        <div className="notif-modal-icon-badge order-confirmed">
          <CheckCircle2 size={18} />
        </div>
      );
    }
    if (title.includes("craft") || title.includes("atelier") || title.includes("pack")) {
      return (
        <div className="notif-modal-icon-badge order-crafting">
          <Sparkles size={18} />
        </div>
      );
    }
    if (title.includes("ship") || title.includes("transit") || title.includes("dispatch") || title.includes("courier")) {
      return (
        <div className="notif-modal-icon-badge order-transit">
          <Truck size={18} />
        </div>
      );
    }
    if (title.includes("deliver")) {
      return (
        <div className="notif-modal-icon-badge order-delivered">
          <PackageCheck size={18} />
        </div>
      );
    }
    if (title.includes("cancel") || title.includes("failed")) {
      return (
        <div className="notif-modal-icon-badge order-cancelled">
          <AlertCircle size={18} />
        </div>
      );
    }
    if (type === "promo" || title.includes("promo") || title.includes("discount") || title.includes("offer")) {
      return (
        <div className="notif-modal-icon-badge promo-badge">
          <Tag size={18} />
        </div>
      );
    }
    if (type === "product" || type === "new_arrival" || type === "featured_drop" || title.includes("arrival") || title.includes("drop")) {
      return (
        <div className="notif-modal-icon-badge product-badge">
          <Sparkles size={18} />
        </div>
      );
    }
    return (
      <div className="notif-modal-icon-badge announcement-badge">
        <Bell size={18} />
      </div>
    );
  };

  const modalElement = (
    <div
      className="notif-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-modal-title"
    >
      <div className="notif-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Mobile Drag Indicator Handle */}
        <div className="notif-modal-handle-bar">
          <div className="notif-modal-handle"></div>
        </div>

        {/* Modal Header */}
        <div className="notif-modal-header">
          <div className="notif-modal-header-left">
            <div className="notif-modal-title-row">
              <div className="notif-modal-bell-icon-wrap">
                <Bell size={18} />
              </div>
              <h2 id="notif-modal-title" className="notif-modal-title">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="notif-modal-badge">{unreadCount} new</span>
              )}
            </div>
            <p className="notif-modal-subtitle">Updates, order tracking & exclusive drops</p>
          </div>

          <div className="notif-modal-header-actions">
            {unreadCount > 0 && onMarkAllRead && (
              <button
                type="button"
                className="notif-modal-mark-btn"
                onClick={onMarkAllRead}
                title="Mark all notifications as read"
              >
                <CheckCheck size={15} />
                <span>Mark all read</span>
              </button>
            )}
            <button
              type="button"
              className="notif-modal-close-btn"
              onClick={onClose}
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="notif-modal-body">
          {loading && notifications.length === 0 ? (
            <div className="notif-modal-loading">
              <div className="notif-modal-spinner"></div>
              <span>Checking for new notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notif-modal-empty">
              <div className="notif-modal-empty-icon-wrap">
                <Inbox size={32} />
              </div>
              <h3>You're all caught up!</h3>
              <p>No new drop alerts, shipping updates, or offers right now.</p>
            </div>
          ) : (
            <div className="notif-modal-list">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-modal-card ${notif.is_read ? "read" : "unread"}`}
                  onClick={() => onNotificationClick && onNotificationClick(notif)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="notif-modal-card-icon-col">
                    {renderIcon(notif)}
                  </div>

                  <div className="notif-modal-card-main">
                    <div className="notif-modal-card-top-row">
                      <h4 className="notif-modal-card-title">
                        {cleanTitle(notif.title)}
                      </h4>
                      <span className="notif-modal-card-time">
                        <Clock size={11} />
                        {getRelativeTime(notif.created_at)}
                      </span>
                    </div>

                    <p className="notif-modal-card-msg">{notif.message}</p>

                    {notif.product_name && (
                      <div className="notif-modal-product-tag">
                        <span className="notif-prod-tag-name">{notif.product_name}</span>
                        {notif.product_price && (
                          <strong className="notif-prod-tag-price">₹{notif.product_price}</strong>
                        )}
                        <ChevronRight size={13} className="notif-prod-arrow" />
                      </div>
                    )}
                  </div>

                  {!notif.is_read && <span className="notif-modal-unread-dot" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="notif-modal-footer">
          <span>Humming Tone Atelier Alerts</span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalElement, document.body);
};

export default NotificationModal;
