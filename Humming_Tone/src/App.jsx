import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import Login from "./Pages/LoginPage/Login.jsx";
import AdminTab from "./components/AdminTab/AdminTab.jsx";
import UserTab from "./components/UserTab/UserTab.jsx";
import { fetchSiteContent, getSiteContent } from "./utils/siteContentStore";
import { API_BASE_URL } from "./utils/apiConfig";
import LottieLoader from "./components/LottieLoader/LottieLoader.jsx";

// User pages (Direct imports for instant static filter & layout render)
import Home from "./Pages/UserPanal/HomePage/Home.jsx";
import AllProductPage from "./Pages/UserPanal/All-Product/AllProduct.jsx";
import Men from "./Pages/UserPanal/Men's-Page/Men's.jsx";
import Women from "./Pages/UserPanal/Women-Page/Women's.jsx";
import Children from "./Pages/UserPanal/Children's-Page/Children's.jsx";
import Baby from "./Pages/UserPanal/Baby-Page/Baby.jsx";
import Sports from "./Pages/UserPanal/Sports-Page/Sports.jsx";
import CustomizePage from "./Pages/UserPanal/Customize-Product/Customize.jsx";
import CartPage from "./Pages/UserPanal/Cart-Page/CartPage.jsx";
import ProductDetail from "./Pages/UserPanal/Prodect-Details/Details.jsx";
import CheckOut from "./Pages/UserPanal/CheckOut/CheckOut.jsx";
import AboutUs from "./Pages/UserPanal/About-Us/AboutUs.jsx";
import PaymentSuccess from "./Pages/UserPanal/PaymentSuccess/PaymentSuccess.jsx";
import PaymentFailure from "./Pages/UserPanal/PayementFailure/PaymentFailure.jsx";
import OrderTracking from "./Pages/UserPanal/OrderTracking/OrderTracking.jsx";

// Support pages
const PrivacyPolicy = lazy(() =>
  import("./Pages/SupportsPage/Privacy&Policy/Privacy&Policy.jsx")
);
const TermsOfService = lazy(() =>
  import("./Pages/SupportsPage/TermsOfService/TermsOfService.jsx")
);
const ContactUs = lazy(() =>
  import("./Pages/SupportsPage/ContactUs/ContactUs.jsx")
);
const ShoppingInfo = lazy(() =>
  import("./Pages/SupportsPage/ShippingInfo/ShippingInfo.jsx")
);
const ReturnAndExchange = lazy(() =>
  import("./Pages/SupportsPage/Return&Exchange/Return&Exchange.jsx")
);

// Admin pages
import Dashboard from './Pages/AdminPanal/Dashboard/Dashboard.jsx';
import ManageProduct from './Pages/AdminPanal/ManageProduct/ManageProduct.jsx';
import AddProduct from './Pages/AdminPanal/AddProduct/AddProduct.jsx';
import ManageOrder from './Pages/AdminPanal/ManageOrder/ManageOrder.jsx';
import SiteContent from './Pages/AdminPanal/SiteContent/SiteContent.jsx';
import ProductData from './Pages/AdminPanal/ProductData/ProductData.jsx';
import ProductBuyer from './Pages/AdminPanal/BuyerData/Buyer.jsx';
import OrderDetails from "./Pages/AdminPanal/ManageOrder/OrderDetails/OrderDetails.jsx";
import Inventory from "./Pages/AdminPanal/Inventory/Inventory.jsx";
import ManageAdmin from './Pages/AdminPanal/ManageAdmin/ManageAdmin.jsx';
import ManageReviews from './Pages/AdminPanal/ManageReviews/ManageReviews.jsx';
import axios from 'axios';

import "./App.css";

// --- GLOBAL API INTERCEPTORS ---
// Automatically inject the JWT token into outgoing admin axios requests
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  const url = String(config.url || '');
  const isAdminApi = url.includes('/admin') || url.includes('/api/orders') || url.includes('/api/whatsapp') || url.includes('/api/products');
  if (token && isAdminApi) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on expired / invalid token (401 response) ONLY when on admin paths (/admin/...)
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      if (isAdminRoute) {
        localStorage.removeItem('adminToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Automatically inject the JWT token into outgoing admin fetch requests
const originalFetch = window.fetch;
window.fetch = async function () {
  let [resource, config] = arguments;
  const urlStr = typeof resource === 'string' ? resource : (resource?.url || '');
  const isAdminApi = urlStr.includes('/admin') || urlStr.includes('/api/orders') || urlStr.includes('/api/whatsapp') || urlStr.includes('/api/products');
  
  const token = localStorage.getItem('adminToken');
  if (token && isAdminApi) {
    if (!config) config = {};
    if (!config.headers) config.headers = {};
    
    if (config.headers instanceof Headers) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const response = await originalFetch(resource, config);
  
  // Auto-logout on 401 ONLY when user is actively inside an admin route (/admin/...)
  if (response.status === 401) {
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    if (isAdminRoute) {
      localStorage.removeItem('adminToken');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }
  
  return response;
};
const UserPageLoader = () => (
  <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
    <LottieLoader size={180} message="Loading..." />
  </div>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));
  const [userType, setUserType] = useState(localStorage.getItem('adminToken') ? 'admin' : null);

  // Background verification of token to ensure it hasn't expired or been revoked
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          // Token is invalid or expired
          localStorage.removeItem('adminToken');
          setIsAuthenticated(false);
          setUserType(null);
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
      }
    };

    verifyToken();
  }, []);

  const handleLogin = (type) => {
    setIsAuthenticated(true);
    setUserType(type);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setUserType(null);
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/usertab/home" replace />}
        />

        <Route
          path="/login"
          element={
            isAuthenticated && userType === "admin" ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Login onSuccess={handleLogin} />
            )
          }
        />

        {/* Redirect old /dashboard path to new admin route */}
        <Route
          path="/dashboard"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        {/* ADMIN NESTED ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userType={userType}
              requiredType="admin"
            >
              <AdminTab onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="manage-products" element={<ManageProduct />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="manage-orders" element={<ManageOrder />} />
          <Route path="order/:orderId" element={<OrderDetails />} />
          <Route path="site-content" element={<SiteContent />} />
          <Route path="all-products" element={<ProductData />} />
          <Route path="product-buyers" element={<ProductBuyer />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="manage-reviews" element={<ManageReviews />} />
          <Route path="manage-admin" element={<ManageAdmin />} />
        </Route>

        {/* USER NESTED ROUTES (PUBLIC) */}
        <Route path="/usertab" element={<UserTab />}>
          <Route index element={<Navigate to="home" />} />
          <Route path="home" element={<Home />} />
          <Route path="all-products" element={<AllProductPage />} />
          <Route
            path="men"
            element={
              <GenderGuard genderName="Men">
                <Men />
              </GenderGuard>
            }
          />
          <Route
            path="women"
            element={
              <GenderGuard genderName="Women">
                <Women />
              </GenderGuard>
            }
          />
          <Route
            path="children"
            element={
              <GenderGuard genderName="Children">
                <Children />
              </GenderGuard>
            }
          />
          <Route
            path="baby"
            element={
              <GenderGuard genderName="Baby">
                <Baby />
              </GenderGuard>
            }
          />
          <Route
            path="sports"
            element={
              <GenderGuard genderName="Sports">
                <Sports />
              </GenderGuard>
            }
          />
          <Route
            path="customize"
            element={
              <GenderGuard genderName="Customize">
                <CustomizePage />
              </GenderGuard>
            }
          />
          <Route path="cart" element={<CartPage />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="checkout" element={<CheckOut />} />
          <Route path="payment-success" element={<PaymentSuccess />} />
          <Route path="payment-failure" element={<PaymentFailure />} />
          <Route path="track-order" element={<OrderTracking />} />
          <Route path="details/:id" element={<ProductDetail />} />

          {/* Supports page */}
          <Route
            path="privacy_policy"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <PrivacyPolicy />
              </Suspense>
            }
          />
          <Route
            path="terms_of_service"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <TermsOfService />
              </Suspense>
            }
          />
          <Route
            path="contact_us"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <ContactUs />
              </Suspense>
            }
          />
          <Route
            path="shipping_info"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <ShoppingInfo />
              </Suspense>
            }
          />
          <Route
            path="return_&_exchange"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <ReturnAndExchange />
              </Suspense>
            }
          />
          <Route
            path="about-us"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <AboutUs />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function ProtectedRoute({ isAuthenticated, userType, requiredType, children }) {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (userType !== requiredType) return <Navigate to="/" replace />;
  return children;
}

// Guard component: blocks access to gender pages that the admin has set to inactive
function GenderGuard({ genderName, children }) {
  const initialContent = getSiteContent();
  const initialActive = initialContent?.genderStatus?.[genderName] !== false;
  const [isActive, setIsActive] = useState(initialActive);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    fetchSiteContent().then(data => {
      if (cancelled) return;
      const genderStatus = data?.genderStatus || {};
      const active = genderStatus[genderName] !== false;
      setIsActive(active);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [genderName]);

  if (!isActive) {
    return (
      <div className="page-disabled-overlay">
        <div className="page-disabled-modal">
          <div className="page-disabled-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <h2 className="page-disabled-title">{genderName} Section is Currently Unavailable</h2>
          <p className="page-disabled-msg">
            This collection is temporarily hidden by the store administrator. Please check back later or explore our other collections.
          </p>
          <div className="page-disabled-actions">
            <button className="page-disabled-btn page-disabled-btn-primary" onClick={() => navigate('/usertab/all-products')}>
              Browse All Products
            </button>
            <button className="page-disabled-btn page-disabled-btn-secondary" onClick={() => navigate('/usertab/home')}>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant", // or "smooth"
      });
    }
  }, [pathname, hash]);

  return null;
};