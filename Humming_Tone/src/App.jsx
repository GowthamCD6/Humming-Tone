import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import Login from './Pages/LoginPage/Login.jsx';
import AdminTab from './components/AdminTab/AdminTab.jsx';
import UserTab from './components/UserTab/UserTab.jsx';

import Home from './Pages/UserPanal/HomePage/Home.jsx';
import AllProductPage from './Pages/UserPanal/All-Product/AllProduct.jsx';
import Men from './Pages/UserPanal/Men\'s-Page/Men\'s.jsx';
import Women from './Pages/UserPanal/Women-Page/Women\'s.jsx';
import Children from './Pages/UserPanal/Children\'s-Page/Children\'s.jsx';
import Baby from './Pages/UserPanal/Baby-Page/Baby.jsx';
import Sports from './Pages/UserPanal/Sports-Page/Sports.jsx';
import CustomizePage from './Pages/UserPanal/Customize-Product/Customize.jsx';
import CartPage from './Pages/UserPanal/Cart-Page/CartPage.jsx';
import ProductDetail from './Pages/UserPanal/Prodect-Details/Details.jsx';
import CheckOut from './Pages/UserPanal/CheckOut/CheckOut.jsx';
import PrivacyPolicy from './Pages/SupportsPage/Privacy&Policy/Privacy&Policy.jsx';

import './App.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);

  const handleLogin = (type) => {
    setIsAuthenticated(true);
    setUserType(type);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserType(null);
  };

  return (
    <BrowserRouter>
	<ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? userType === 'admin'
                    ? '/dashboard'
                    : '/usertab/home'
                  : '/login'
              }
              replace
            />
          }
        />

        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={userType === 'admin' ? '/dashboard' : '/usertab/home'} />
            ) : (
              <Login onSuccess={handleLogin} />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} userType={userType} requiredType="admin">
              <AdminTab onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* USER NESTED ROUTES */}
        <Route
          path="/usertab"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} userType={userType} requiredType="user">
              <UserTab />
            </ProtectedRoute>
          }
        >
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
          <Route path="privacy_policy" element={<PrivacyPolicy />} />
		  <Route path="details/:id" element={<ProductDetail/>}></Route>
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
      behavior: "instant" // or "smooth"
    });
  }, [pathname]);

  return null;
};


