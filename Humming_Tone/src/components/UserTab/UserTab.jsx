import React, { useEffect, useState } from "react";
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
import logo from "../../assets/logo.png";
import "./UserTab.css";
import { fetchSiteContent } from "../../utils/siteContentStore";
import AuthModal from "../AuthModal/AuthModal";

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
  const [activeGenders, setActiveGenders] = useState(DEFAULT_GENDERS);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [customerUser, setCustomerUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("customerUser")) || null;
    } catch {
      return null;
    }
  });

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadGenders = async () => {
      try {
        // Force refresh to always get latest visibility from the server
        const data = await fetchSiteContent(true);
        const genderStatus = data.genderStatus || {};

        // Get only active genders
        const activeGenderList = Object.keys(genderStatus).filter(
          (gender) => genderStatus[gender] === true
        );

        setActiveGenders(activeGenderList);
      } catch (error) {
        console.error("Error loading genders:", error);
        // Set default genders if API fails
        setActiveGenders([
          "Men",
          "Women",
          "Children",
          "Baby",
          "Sports",
          "Customize",
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadGenders();
  }, [location.pathname]);

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

    // If both are in the order array, sort by their position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only a is in the order array, it comes first
    if (indexA !== -1) return -1;
    // If only b is in the order array, it comes first
    if (indexB !== -1) return 1;
    // If neither is in the order array, maintain original order
    return 0;
  });

  // Generate dynamic nav items with static items first
  const staticNavItems = [
    { path: "home", label: "Home", Icon: HomeIcon },
    { path: "all-products", label: "All Products", Icon: GridViewIcon },
  ];

  const dynamicNavItems = sortedActiveGenders.map((gender) => ({
    path: gender.toLowerCase().replace(/ /g, "-"),
    label: gender,
    Icon: getGenderIcon(gender),
  }));

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

          {/* Desktop Navigation */}
          <nav className="user-nav desktop-nav">
            <ul className="user-nav-menu">
              {navItems.map(({ path, label, Icon: _Icon }) => (
                <li key={path} className="user-nav-item">
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
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Section - Cart, User Profile & Hamburger */}
          <div className="user-header-right">
            {/* Cart Icon */}
            <div
              className="user-cart-icon"
              onClick={() => navigate("/usertab/cart")}
            >
              <ShoppingBagOutlinedIcon className="user-cart-bag" />
              <span className="user-cart-badge">{cartCount}</span>
            </div>

            {/* User Profile / Login Trigger */}
            <div className="user-profile-menu-wrapper">
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

        {/* Mobile Navigation Links */}
        <nav className="mobile-nav">
          <ul className="mobile-nav-menu">
            {navItems.map(({ path, label, Icon: _Icon }) => (
              <li key={path} className="mobile-nav-item">
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
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      {/* Nested Routes Render Here */}
      <main className="user-main-content">
        <Outlet />
      </main>

      {/* Storefront Customer Google Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCustomerUser(user);
        }}
      />
    </div>
  );
};

export default UserTab;
