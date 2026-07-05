import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Login from "./Pages/LoginPage/Login.jsx";
import AdminTab from "./components/AdminTab/AdminTab.jsx";
import UserTab from "./components/UserTab/UserTab.jsx";

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
  
  return originalFetch(resource, config);
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
              <Suspense fallback={<UserPageLoader />}>
                <Men />
              </Suspense>
            }
          />
          <Route
            path="women"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <Women />
              </Suspense>
            }
          />
          <Route
            path="children"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <Children />
              </Suspense>
            }
          />
          <Route
            path="baby"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <Baby />
              </Suspense>
            }
          />
          <Route
            path="sports"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <Sports />
              </Suspense>
            }
          />
          <Route
            path="customize"
            element={
              <Suspense fallback={<UserPageLoader />}>
                <CustomizePage />
              </Suspense>
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

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // or "smooth"
    });
  }, [pathname]);

  return null;
};