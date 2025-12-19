import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import GridViewIcon from '@mui/icons-material/GridView';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import BabyChangingStationIcon from '@mui/icons-material/BabyChangingStation';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import logo from '../../assets/logo.png';
import './UserTab.css';

const Navbar = () => {
  return (
    <nav className="user-navbar">
      <div className="user-navbar-container">
        {/* Logo */}
        <div className="user-logo">
          <img src={logo} alt="Fashion & More" className="user-logo-image" />
        </div>

        {/* Navigation Links */}
        <ul className="user-nav-menu">
          <li className="user-nav-item active">
            <HomeIcon className="user-nav-icon" />
            <span>Home</span>
          </li>
          <li className="user-nav-item">
            <GridViewIcon className="user-nav-icon" />
            <span>All Products</span>
          </li>
          <li className="user-nav-item">
            <ManIcon className="user-nav-icon" />
            <span>Men</span>
          </li>
          <li className="user-nav-item">
            <WomanIcon className="user-nav-icon" />
            <span>Women</span>
          </li>
          <li className="user-nav-item">
            <ChildCareIcon className="user-nav-icon" />
            <span>Kids</span>
          </li>
          <li className="user-nav-item">
            <BabyChangingStationIcon className="user-nav-icon" />
            <span>Baby</span>
          </li>
        </ul>

        {/* Cart Icon */}
        <div className="user-cart-icon">
          <ShoppingBagIcon />
          <span className="user-cart-count">0</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;