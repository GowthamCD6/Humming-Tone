import React, { useEffect, useState, useRef } from "react";
import {
  Outlet,
  Link,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import GridViewIcon from "@mui/icons-material/GridView";
import ManIcon from "@mui/icons-material/Man";
import WomanIcon from "@mui/icons-material/Woman";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import BabyChangingStationIcon from "@mui/icons-material/BabyChangingStation";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import TuneIcon from "@mui/icons-material/Tune";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SearchIcon from "@mui/icons-material/Search";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { Sparkles, Truck, CheckCircle2, AlertCircle, PackageCheck, Tag, Bell } from "lucide-react";
import { SITE_ASSETS } from "../../utils/siteAssets";
import "./UserTab.css";
import { fetchSiteContent } from "../../utils/siteContentStore";
import { API_BASE_URL, getImageUrl } from "../../utils/apiConfig";
import AuthModal from "../AuthModal/AuthModal";

const logo = SITE_ASSETS.logo;

const DEFAULT_GENDERS = [
  "Men",
  "Women",
  "Children",
  "Baby",
  "Sports",
  "Customize",
];

const UserTab = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeGenders, setActiveGenders] = useState([]);
  const [navLoading, setNavLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const [customerUser, setCustomerUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("customerUser")) || null;
    } catch {
      return null;
    }
  });

  const [genderCategories, setGenderCategories] = useState({});
  const [hoveredGender, setHoveredGender] = useState(null);
  const [expandedMobileGender, setExpandedMobileGender] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthChange = () => {
      try {
        setCustomerUser(JSON.parse(localStorage.getItem("customerUser")) || null);
      } catch {
        setCustomerUser(null);
      }
    };
    window.addEventListener("user:auth_changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("user:auth_changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("customerUser");
    setCustomerUser(null);
    setUserDropdownOpen(false);
    window.dispatchEvent(new Event("user:auth_changed"));
  };

  const getCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      return Array.isArray(cart) ? cart.length : 0;
    } catch {
      return 0;
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setHoveredGender(null);
  }, [location.pathname]);

  useEffect(() => {
    const refreshCount = () => setCartCount(getCartCount());

    refreshCount();

    const handleStorage = (e) => {
      if (e?.key === "cart") refreshCount();
    };

    window.addEventListener("cart:updated", refreshCount);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("cart:updated", refreshCount);
      window.removeEventListener("storage", handleStorage);
    };
  }, [location.pathname]);

  // Fetch User-Scoped Notifications (Broadcasts + User's own orders)
  const fetchUserNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const params = new URLSearchParams();
      if (customerUser?.id) params.append("user_id", customerUser.id);
      if (customerUser?.email) params.append("user_email", customerUser.email);

      const token = localStorage.getItem("userToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const url = `${API_BASE_URL}/user/notifications${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { headers });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadNotificationCount(Number(data.unread_count || 0));
      }
    } catch (err) {
      console.warn("Failed to fetch notifications:", err.message);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchUserNotifications();
    const interval = setInterval(fetchUserNotifications, 25000); // 25s auto-refresh
    return () => clearInterval(interval);
  }, [customerUser]);

  // Handle Click Outside for notification popover & profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/user/notifications/mark_read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: customerUser?.id || null,
          user_email: customerUser?.email || null,
        }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadNotificationCount(0);
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await fetch(`${API_BASE_URL}/user/notifications/mark_read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: notif.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: 1 } : n))
        );
        setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
      } catch (e) {}
    }
    setNotificationOpen(false);
    if (notif.product_id) {
      navigate(`/usertab/product/${notif.product_id}`);
    } else if (notif.order_id || notif.type === "order" || notif.type === "order_update") {
      navigate("/usertab/my-orders");
    }
  };

  const cleanNotificationTitle = (title = "") => {
    return String(title || "")
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, "")
      .trim();
  };

  const renderNotificationIcon = (notif) => {
    const title = (notif.title || "").toLowerCase();
    const type = (notif.type || "").toLowerCase();

    if (title.includes("confirm") || title.includes("placed") || title.includes("verified")) {
      return (
        <div className="notif-type-icon order confirmed">
          <CheckCircle2 size={16} />
        </div>
      );
    }
    if (title.includes("craft") || title.includes("atelier") || title.includes("pack")) {
      return (
        <div className="notif-type-icon order crafting">
          <Sparkles size={16} />
        </div>
      );
    }
    if (title.includes("ship") || title.includes("transit") || title.includes("dispatch") || title.includes("courier")) {
      return (
        <div className="notif-type-icon order transit">
          <Truck size={16} />
        </div>
      );
    }
    if (title.includes("deliver")) {
      return (
        <div className="notif-type-icon order delivered">
          <PackageCheck size={16} />
        </div>
      );
    }
    if (title.includes("cancel") || title.includes("failed")) {
      return (
        <div className="notif-type-icon order cancelled">
          <AlertCircle size={16} />
        </div>
      );
    }
    if (type === "promo" || title.includes("promo") || title.includes("discount")) {
      return (
        <div className="notif-type-icon promo">
          <Tag size={16} />
        </div>
      );
    }
    if (type === "product" || type === "new_arrival" || type === "featured_drop" || title.includes("arrival") || title.includes("drop")) {
      return (
        <div className="notif-type-icon product">
          <Sparkles size={16} />
        </div>
      );
    }
    return (
      <div className="notif-type-icon announcement">
        <Bell size={16} />
      </div>
    );
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadGendersAndCategories = async () => {
      try {
        const data = await fetchSiteContent(false);
        if (!isMounted) return;
        const genderStatus = data.genderStatus || {};
        const genderCatMap = data.genderCategory || {};

        // Get only active genders from database
        const activeGenderList = Object.keys(genderStatus).filter(
          (gender) => genderStatus[gender] === true
        );

        setActiveGenders(activeGenderList);
        setGenderCategories(genderCatMap);
      } catch (error) {
        console.error("Error loading genders & categories:", error);
        if (isMounted) {
          setActiveGenders(DEFAULT_GENDERS);
        }
      } finally {
        if (isMounted) {
          setNavLoading(false);
        }
      }
    };

    loadGendersAndCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Icon mapping for genders
  const getGenderIcon = (gender) => {
    const iconMap = {
      Men: ManIcon,
      Women: WomanIcon,
      Children: ChildCareIcon,
      Baby: BabyChangingStationIcon,
      Sports: SportsBasketballIcon,
      Customize: TuneIcon,
    };
    return iconMap[gender] || GridViewIcon;
  };

  // Define the desired order for genders
  const genderOrder = [
    "Men",
    "Women",
    "Children",
    "Baby",
    "Sports",
    "Customize",
  ];

  // Sort active genders based on the defined order
  const sortedActiveGenders = activeGenders.sort((a, b) => {
    const indexA = genderOrder.indexOf(a);
    const indexB = genderOrder.indexOf(b);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  // Generate dynamic nav items with static items first
  const staticNavItems = [
    { path: "home", label: "Home", Icon: HomeIcon },
    { path: "all-products", label: "All Products", Icon: GridViewIcon },
  ];

  const dynamicNavItems = sortedActiveGenders.map((gender) => {
    const cats = genderCategories[gender] || genderCategories[gender.toLowerCase()] || [];
    return {
      path: gender.toLowerCase().replace(/ /g, "-"),
      label: gender,
      Icon: getGenderIcon(gender),
      categories: Array.isArray(cats) ? cats : [],
    };
  });

  const navItems = [...staticNavItems, ...dynamicNavItems];

  return (
    <div className="user-app-container">
      {/* Header */}
      <header className={`user-header ${isScrolled ? "scrolled" : ""}`}>
        <div className="user-header-container">
          {/* Logo */}
          <Link to="/usertab/home" className="user-logo-section">
            <img src={logo} alt="Humming Tone" className="user-logo-image" />
          </Link>

          {/* Desktop Navigation with Category Dropdowns */}
          <nav className="user-nav desktop-nav">
            {navLoading ? (
              <div className="user-nav-skeleton-wrap">
                <div className="user-nav-skeleton-pill" style={{ width: '80px' }}></div>
                <div className="user-nav-skeleton-pill" style={{ width: '115px' }}></div>
                <div className="user-nav-skeleton-pill" style={{ width: '85px' }}></div>
                <div className="user-nav-skeleton-pill" style={{ width: '95px' }}></div>
                <div className="user-nav-skeleton-pill" style={{ width: '100px' }}></div>
                <div className="user-nav-skeleton-pill" style={{ width: '90px' }}></div>
              </div>
            ) : (
              <ul className="user-nav-menu">
                {navItems.map(({ path, label, Icon: _Icon, categories = [] }) => {
                  const hasCategories = categories && categories.length > 0;
                  return (
                    <li
                      key={path}
                      className={`user-nav-item ${hasCategories ? "has-dropdown" : ""}`}
                      onMouseEnter={() => hasCategories && setHoveredGender(label)}
                      onMouseLeave={() => setHoveredGender(null)}
                    >
                      <NavLink
                        to={path}
                        className={({ isActive }) =>
                          `user-nav-link${isActive ? " active" : ""}`
                        }
                        end
                      >
                        <_Icon className="user-nav-icon" />
                        <span>{label}</span>
                      </NavLink>

                      {/* Category Dropdown Menu */}
                      {hasCategories && (
                        <div className={`user-nav-dropdown ${hoveredGender === label ? "visible" : ""}`}>
                          <div className="user-dropdown-card">
                            <div className="user-dropdown-topbar">
                              <span className="dropdown-category-title">EXPLORE {label.toUpperCase()}</span>
                            </div>
                            
                            <div className="dropdown-category-list">
                              <Link
                                to={`/usertab/${path}`}
                                className="dropdown-category-item view-all-cat"
                                onClick={() => setHoveredGender(null)}
                              >
                                <span className="cat-item-name">All {label}'s Collection</span>
                                <span className="cat-arrow-icon">›</span>
                              </Link>

                              <div className="dropdown-category-divider"></div>

                              {categories.map((catName) => (
                                <Link
                                  key={catName}
                                  to={`/usertab/${path}?category=${encodeURIComponent(catName)}`}
                                  className="dropdown-category-item"
                                  onClick={() => setHoveredGender(null)}
                                >
                                  <span className="cat-item-name">{catName}</span>
                                  <span className="cat-arrow-icon">›</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>

          {/* Right Section - Cart, Notification Bell, User Profile & Hamburger */}
          <div className="user-header-right">
            {/* Notification Bell Icon & Popover */}
            <div className="user-notif-menu-wrapper" ref={notifRef}>
              <div
                className={`user-notif-icon ${notificationOpen ? "active" : ""}`}
                onClick={() => setNotificationOpen(!notificationOpen)}
                title="Notifications"
                aria-label="View notifications"
              >
                <NotificationsNoneOutlinedIcon className="user-notif-bell" />
                {unreadNotificationCount > 0 && (
                  <span className="user-notif-badge">
                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                  </span>
                )}
              </div>

              {/* Notification Popover / Mobile Bottom Sheet */}
              {notificationOpen && (
                <>
                  <div
                    className="notif-mobile-backdrop"
                    onClick={() => setNotificationOpen(false)}
                    aria-label="Close notifications backdrop"
                  />
                  <div className="user-notif-popover">
                    <div className="notif-drag-handle-bar">
                      <div className="notif-drag-handle"></div>
                    </div>
                    <div className="user-notif-header">
                      <div className="notif-header-title-wrap">
                        <h3 className="notif-header-title">Notifications</h3>
                        {unreadNotificationCount > 0 && (
                          <span className="notif-unread-tag">{unreadNotificationCount} new</span>
                        )}
                      </div>
                      <div className="notif-header-actions">
                        {unreadNotificationCount > 0 && (
                          <button
                            className="notif-mark-read-btn"
                            onClick={handleMarkAllRead}
                            title="Mark all as read"
                          >
                            <DoneAllIcon fontSize="inherit" />
                            <span>Mark read</span>
                          </button>
                        )}
                        <button
                          className="notif-close-btn"
                          onClick={() => setNotificationOpen(false)}
                          aria-label="Close notifications"
                        >
                          <CloseIcon fontSize="small" />
                        </button>
                      </div>
                    </div>

                  <div className="user-notif-body">
                    {loadingNotifications && notifications.length === 0 ? (
                      <div className="notif-loading-state">
                        <div className="notif-spinner"></div>
                        <span>Checking for notifications...</span>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="notif-empty-state">
                        <div className="notif-empty-icon-box">
                          <NotificationsNoneOutlinedIcon className="notif-empty-icon" />
                        </div>
                        <h4>You're all caught up!</h4>
                        <p>No new drop alerts or order notifications right now.</p>
                      </div>
                    ) : (
                      <div className="user-notif-list">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`user-notif-card ${notif.is_read ? "read" : "unread"} ${notif.type || "general"}`}
                            onClick={() => handleNotificationClick(notif)}
                          >
                            <div className="notif-card-icon-col">
                              {renderNotificationIcon(notif)}
                            </div>

                            <div className="notif-card-content">
                              <div className="notif-card-top">
                                <h4 className="notif-card-title">{cleanNotificationTitle(notif.title)}</h4>
                                <span className="notif-card-time">{getRelativeTime(notif.created_at)}</span>
                              </div>
                              <p className="notif-card-msg">{notif.message}</p>
                              {notif.product_name && (
                                <div className="notif-card-product-pill">
                                  <span>{notif.product_name}</span>
                                  {notif.product_price && <strong>₹{notif.product_price}</strong>}
                                </div>
                              )}
                            </div>

                            {!notif.is_read && <span className="notif-unread-dot" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  </div>
                </>
              )}
            </div>

            {/* Cart Icon */}
            <div
              className="user-cart-icon"
              onClick={() => navigate("/usertab/cart")}
            >
              <ShoppingBagOutlinedIcon className="user-cart-bag" />
              <span className="user-cart-badge">{cartCount}</span>
            </div>

            {/* User Profile / Login Trigger */}
            <div className="user-profile-menu-wrapper" ref={profileRef}>
              {customerUser ? (
                <div
                  className="user-profile-trigger logged-in"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  title={customerUser.name || "My Account"}
                >
                  {customerUser.avatar_url ? (
                    <img
                      src={customerUser.avatar_url}
                      alt={customerUser.name}
                      className="user-nav-avatar"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="user-avatar-initials">
                      {(customerUser.name || "U")[0].toUpperCase()}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="user-login-nav-btn"
                  onClick={() => setAuthModalOpen(true)}
                  aria-label="Sign in"
                >
                  <AccountCircleOutlinedIcon className="user-login-icon" />
                  <span className="user-login-nav-text">Sign In</span>
                </button>
              )}

              {/* Profile Dropdown */}
              {customerUser && userDropdownOpen && (
                <div className="user-profile-dropdown">
                  <div className="dropdown-user-info">
                    <strong>{customerUser.name}</strong>
                    <span className="dropdown-email">{customerUser.email}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate("/usertab/track-order");
                    }}
                  >
                    Track Orders
                  </button>
                  <button
                    className="dropdown-item dropdown-logout"
                    onClick={handleLogout}
                  >
                    <LogoutIcon fontSize="small" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger Menu Toggle - Mobile only */}
            <button
              className="hamburger-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <MenuIcon className="hamburger-icon" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      <div className={`mobile-sidebar ${mobileMenuOpen ? "open" : ""}`}>
        {/* Close Button */}
        <button
          className="sidebar-close-btn"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <CloseIcon />
        </button>

        {/* Mobile User Profile Section */}
        <div className="mobile-user-auth-section">
          {customerUser ? (
            <div className="mobile-user-profile">
              {customerUser.avatar_url ? (
                <img
                  src={customerUser.avatar_url}
                  alt={customerUser.name}
                  className="mobile-avatar"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="mobile-avatar-initials">
                  {(customerUser.name || "U")[0].toUpperCase()}
                </div>
              )}
              <div className="mobile-user-info">
                <strong>{customerUser.name}</strong>
                <span>{customerUser.email}</span>
              </div>
              <button className="mobile-logout-btn" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          ) : (
            <button
              className="mobile-login-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthModalOpen(true);
              }}
            >
              <AccountCircleOutlinedIcon />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>

        {/* Mobile Notification Quick Row */}
        <div 
          className="mobile-notif-quick-row" 
          onClick={() => {
            setMobileMenuOpen(false);
            setNotificationOpen(true);
          }}
        >
          <div className="mobile-notif-left">
            <NotificationsNoneOutlinedIcon className="mobile-notif-icon" />
            <span>Notifications & Drops</span>
          </div>
          {unreadNotificationCount > 0 ? (
            <span className="mobile-notif-badge">{unreadNotificationCount} new</span>
          ) : (
            <span className="mobile-notif-all-read">All caught up</span>
          )}
        </div>

        {/* Mobile Navigation Links */}
        <nav className="mobile-nav">
          {navLoading ? (
            <div className="user-mobile-nav-skeleton">
              <div className="user-mobile-skeleton-row"></div>
              <div className="user-mobile-skeleton-row"></div>
              <div className="user-mobile-skeleton-row"></div>
              <div className="user-mobile-skeleton-row"></div>
              <div className="user-mobile-skeleton-row"></div>
              <div className="user-mobile-skeleton-row"></div>
            </div>
          ) : (
            <ul className="mobile-nav-menu">
              {navItems.map(({ path, label, Icon: _Icon, categories = [] }) => {
                const hasCategories = categories && categories.length > 0;
                const isExpanded = expandedMobileGender === label;

                return (
                  <li key={path} className="mobile-nav-item">
                    <div className="mobile-nav-item-header">
                      <NavLink
                        to={path}
                        className={({ isActive }) =>
                          `mobile-nav-link${isActive ? " active" : ""}`
                        }
                        onClick={() => setMobileMenuOpen(false)}
                        end
                      >
                        <_Icon className="mobile-nav-icon" />
                        <span>{label}</span>
                      </NavLink>
                      {hasCategories && (
                        <button
                          type="button"
                          className={`mobile-cat-expand-btn ${isExpanded ? "expanded" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMobileGender(isExpanded ? null : label);
                          }}
                          aria-label="Toggle categories"
                        >
                          ▾
                        </button>
                      )}
                    </div>

                    {/* Subcategories Accordion */}
                    {hasCategories && isExpanded && (
                      <div className="mobile-subcategory-list">
                        <Link
                          to={`/usertab/${path}`}
                          className="mobile-subcat-link view-all"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          All {label}'s
                        </Link>
                        {categories.map((catName) => (
                          <Link
                            key={catName}
                            to={`/usertab/${path}?category=${encodeURIComponent(catName)}`}
                            className="mobile-subcat-link"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {catName}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-label="Close menu"
      />

      {/* Main Content Area */}
      <main className="user-main-content">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <NavLink
          to="/usertab/home"
          className={({ isActive }) => `bottom-nav-item${isActive ? " active" : ""}`}
        >
          <HomeOutlinedIcon className="bottom-nav-icon" />
          <span className="bottom-nav-label">Home</span>
        </NavLink>

        <NavLink
          to="/usertab/all-products"
          className={({ isActive }) => `bottom-nav-item${isActive ? " active" : ""}`}
        >
          <SearchIcon className="bottom-nav-icon" />
          <span className="bottom-nav-label">Explore</span>
        </NavLink>

        <div
          className={`bottom-nav-item bottom-nav-cart${location.pathname.includes("/cart") ? " active" : ""}`}
          onClick={() => navigate("/usertab/cart")}
        >
          <div className="bottom-nav-cart-wrapper">
            <ShoppingBagOutlinedIcon className="bottom-nav-icon" />
            {cartCount > 0 && (
              <span className="bottom-nav-cart-badge">{cartCount}</span>
            )}
          </div>
          <span className="bottom-nav-label">Cart</span>
        </div>

        <div
          className={`bottom-nav-item bottom-nav-alerts${notificationOpen ? " active" : ""}`}
          onClick={() => setNotificationOpen(true)}
        >
          <div className="bottom-nav-notif-wrapper">
            <NotificationsNoneOutlinedIcon className="bottom-nav-icon" />
            {unreadNotificationCount > 0 && (
              <span className="bottom-nav-cart-badge">{unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}</span>
            )}
          </div>
          <span className="bottom-nav-label">Alerts</span>
        </div>

        <div
          className={`bottom-nav-item${customerUser ? " has-avatar" : ""}`}
          onClick={() => {
            if (customerUser) {
              navigate("/usertab/track-order");
            } else {
              setAuthModalOpen(true);
            }
          }}
        >
          {customerUser ? (
            customerUser.avatar_url ? (
              <img
                src={customerUser.avatar_url}
                alt={customerUser.name}
                className="bottom-nav-avatar"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="bottom-nav-avatar-initials">
                {(customerUser.name || "U")[0].toUpperCase()}
              </div>
            )
          ) : (
            <PersonOutlineIcon className="bottom-nav-icon" />
          )}
          <span className="bottom-nav-label">{customerUser ? "Account" : "Sign In"}</span>
        </div>
      </nav>

      {/* Dynamic Google Login Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCustomerUser(user);
          setAuthModalOpen(false);
        }}
      />
    </div>
  );
};

export default UserTab;
