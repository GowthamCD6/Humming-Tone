import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Login from "./Pages/LoginPage/Login.jsx";
import AdminTab from "./components/AdminTab/AdminTab.jsx";
import UserTab from "./components/UserTab/UserTab.jsx";

// User pages
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

// Supports page
import PrivacyPolicy from "./Pages/SupportsPage/Privacy&Policy/Privacy&Policy.jsx";
import TermsOfService from "./Pages/SupportsPage/TermsOfService/TermsOfService.jsx";
import ContactUs from "./Pages/SupportsPage/ContactUs/ContactUs.jsx";
import ShoppingInfo from "./pages/SupportsPage/ShippingInfo/ShippingInfo.jsx";
import ReturnAndExchange from "./Pages/SupportsPage/Return&Exchange/Return&Exchange.jsx";
import PaymentSuccess from "./Pages/UserPanal/PaymentSuccess/PaymentSuccess.jsx";
import PaymentFailure from "./Pages/UserPanal/PayementFailure/PaymentFailure.jsx";

// Admin pages
import Dashboard from './Pages/AdminPanal/Dashboard/Dashboard.jsx';
import ManageProduct from './Pages/AdminPanal/ManageProduct/ManageProduct.jsx';
import AddProduct from './Pages/AdminPanal/AddProduct/AddProduct.jsx';
import ManageOrder from './Pages/AdminPanal/ManageOrder/ManageOrder.jsx';
import SiteContent from './Pages/AdminPanal/SiteContent/SiteContent.jsx';
import ProductData from './Pages/AdminPanal/ProductData/ProductData.jsx';
import ProductBuyer from './Pages/AdminPanal/BuyerData/Buyer.jsx';
import OrderDetails from "./Pages/AdminPanal/ManageOrder/OrderDetails/OrderDetails.jsx";
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
        </Route>

        {/* USER NESTED ROUTES (PUBLIC) */}
        <Route path="/usertab" element={<UserTab />}>
          <Route index element={<Navigate to="home" />} />
          <Route path="home" element={<Home />} />
          <Route path="all-products" element={<AllProductPage />} />
          <Route path="men" element={<Men />} />
          <Route path="women" element={<Women />} />
          <Route path="children" element={<Children />} />
          <Route path="baby" element={<Baby />} />
          <Route path="sports" element={<Sports />} />
          <Route path="customize" element={<CustomizePage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="checkout" element={<CheckOut />} />
          <Route path="payment-success" element={<PaymentSuccess />} />
          <Route path="payment-failure" element={<PaymentFailure />} />
          <Route path="details/:id" element={<ProductDetail />}></Route>

          {/* Supports page */}
          <Route path="privacy_policy" element={<PrivacyPolicy />} />
          <Route path="terms_of_service" element={<TermsOfService/>} />
          <Route path="contact_us" element={<ContactUs/>} />
          <Route path="shipping_info" element={<ShoppingInfo/>} />
          <Route path="return_&_exchange" element={<ReturnAndExchange/>} />
          <Route path="about-us" element={<AboutUs/>} />
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