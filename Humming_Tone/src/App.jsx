import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import Login from "./Pages/LoginPage/Login.jsx";
import AdminTab from "./components/AdminTab/AdminTab.jsx";
import UserTab from "./components/UserTab/UserTab.jsx";
import { fetchSiteContent } from "./utils/siteContentStore";

// User pages (lazy-loaded to avoid loading all tab pages on first paint)
const Home = lazy(() => import("./Pages/UserPanal/HomePage/Home.jsx"));
const AllProductPage = lazy(() =>
  import("./Pages/UserPanal/All-Product/AllProduct.jsx")
);
const Men = lazy(() => import("./Pages/UserPanal/Men's-Page/Men's.jsx"));
const Women = lazy(() => import("./Pages/UserPanal/Women-Page/Women's.jsx"));
const Children = lazy(() =>
  import("./Pages/UserPanal/Children's-Page/Children's.jsx")
);
const Baby = lazy(() => import("./Pages/UserPanal/Baby-Page/Baby.jsx"));
const Sports = lazy(() => import("./Pages/UserPanal/Sports-Page/Sports.jsx"));
const CustomizePage = lazy(() =>
  import("./Pages/UserPanal/Customize-Product/Customize.jsx")
);
const CartPage = lazy(() => import("./Pages/UserPanal/Cart-Page/CartPage.jsx"));
const ProductDetail = lazy(() =>
  import("./Pages/UserPanal/Prodect-Details/Details.jsx")
);
const CheckOut = lazy(() => import("./Pages/UserPanal/CheckOut/CheckOut.jsx"));
const AboutUs = lazy(() => import("./Pages/UserPanal/About-Us/AboutUs.jsx"));
const PaymentSuccess = lazy(() =>
  import("./Pages/UserPanal/PaymentSuccess/PaymentSuccess.jsx")
);
const PaymentFailure = lazy(() =>
  import("./Pages/UserPanal/PayementFailure/PaymentFailure.jsx")
);
const OrderTracking = lazy(() =>
  import("./Pages/UserPanal/OrderTracking/OrderTracking.jsx")
);

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
  import("./pages/SupportsPage/ShippingInfo/ShippingInfo.jsx")
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
import axios from 'axios';

import "./App.css";

// --- GLOBAL API INTERCEPTORS ---
// Automatically inject the JWT token into all outgoing axios requests
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on expired / invalid token (401 response)
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Automatically inject the JWT token into all outgoing fetch requests
const originalFetch = window.fetch;
window.fetch = async function () {
  let [resource, config] = arguments;
  
  const token = localStorage.getItem('adminToken');
  if (token) {
    if (!config) config = {};
    if (!config.headers) config.headers = {};
    
    if (config.headers instanceof Headers) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const response = await originalFetch(resource, config);
  
  // Auto-logout on 401 for fetch requests too
  if (response.status === 401 && window.location.pathname !== '/login') {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  }
  
  return response;
};
// -------------------------------

const UserPageLoader = () => (
  <div style={{ minHeight: "40vh", display: "grid", placeItems: "center" }}>
    Loading page...
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
        const response = await fetch('http://localhost:5000/admin/auth/verify', {
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
          <Route path="manage-admin" element={<ManageAdmin />} />
        </Route>

        {/* USER NESTED ROUTES (PUBLIC) */}
        <Route path="/usertab" element={<UserTab />}>
          <Route index element={<Navigate to="home" />} />
          <Route
            path="home"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="all-products"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <AllProductPage />
              </Suspense>
            }
          />
          <Route
            path="men"
            element={
              <GenderGuard genderName="Men">
                <Suspense fallback={<UserPageLoader />}>
                  <Men />
                </Suspense>
              </GenderGuard>
            }
          />
          <Route
            path="women"
            element={
              <GenderGuard genderName="Women">
                <Suspense fallback={<UserPageLoader />}>
                  <Women />
                </Suspense>
              </GenderGuard>
            }
          />
          <Route
            path="children"
            element={
              <GenderGuard genderName="Children">
                <Suspense fallback={<UserPageLoader />}>
                  <Children />
                </Suspense>
              </GenderGuard>
            }
          />
          <Route
            path="baby"
            element={
              <GenderGuard genderName="Baby">
                <Suspense fallback={<UserPageLoader />}>
                  <Baby />
                </Suspense>
              </GenderGuard>
            }
          />
          <Route
            path="sports"
            element={
              <GenderGuard genderName="Sports">
                <Suspense fallback={<UserPageLoader />}>
                  <Sports />
                </Suspense>
              </GenderGuard>
            }
          />
          <Route
            path="customize"
            element={
              <GenderGuard genderName="Customize">
                <Suspense fallback={<UserPageLoader />}>
                  <CustomizePage />
                </Suspense>
              </GenderGuard>
            }
          />
          <Route
            path="cart"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <CartPage />
              </Suspense>
            }
          />
          <Route
            path="product/:id"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <ProductDetail />
              </Suspense>
            }
          />
          <Route
            path="checkout"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <CheckOut />
              </Suspense>
            }
          />
          <Route
            path="payment-success"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <PaymentSuccess />
              </Suspense>
            }
          />
          <Route
            path="payment-failure"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <PaymentFailure />
              </Suspense>
            }
          />
          <Route
            path="track-order"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <OrderTracking />
              </Suspense>
            }
          />
          <Route
            path="details/:id"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <ProductDetail />
              </Suspense>
            }
          ></Route>

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
  const [status, setStatus] = useState('loading'); // 'loading' | 'active' | 'inactive'
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    fetchSiteContent(true).then(data => {
      if (cancelled) return;
      const genderStatus = data?.genderStatus || {};
      // If the gender key doesn't exist, default to active
      const isActive = genderStatus[genderName] !== false;
      setStatus(isActive ? 'active' : 'inactive');
    }).catch(() => {
      if (!cancelled) setStatus('active'); // On error, allow access
    });
    return () => { cancelled = true; };
  }, [genderName]);

  if (status === 'loading') return <UserPageLoader />;

  if (status === 'inactive') {
    return (
      <div className="page-disabled-overlay">
        <div className="page-disabled-modal">
          <div className="page-disabled-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <h2 className="page-disabled-title">Page Currently Unavailable</h2>
          <p className="page-disabled-message">
            The <strong>{genderName}</strong> section has been temporarily disabled by the administrator. 
            This page may be undergoing maintenance or updates.
          </p>
          <p className="page-disabled-sub">
            Please check back later or explore our other collections.
          </p>
          <button
            className="page-disabled-btn"
            onClick={() => navigate('/usertab/home')}
          >
            Go Back Home
          </button>
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