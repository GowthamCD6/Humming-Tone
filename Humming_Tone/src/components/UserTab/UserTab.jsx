import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import GridViewIcon from '@mui/icons-material/GridView';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import BabyChangingStationIcon from '@mui/icons-material/BabyChangingStation';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo">
          <img src="/assets/logo.png" alt="Fashion & More" className="logo-image" />
        </div>

        {/* Navigation Links */}
        <ul className="nav-menu">
          <li className="nav-item active">
            <HomeIcon className="nav-icon" />
            <span>Home</span>
          </li>
          <li className="nav-item">
            <GridViewIcon className="nav-icon" />
            <span>All Products</span>
          </li>
          <li className="nav-item">
            <ManIcon className="nav-icon" />
            <span>Men</span>
          </li>
          <li className="nav-item">
            <WomanIcon className="nav-icon" />
            <span>Women</span>
          </li>
          <li className="nav-item">
            <ChildCareIcon className="nav-icon" />
            <span>Kids</span>
          </li>
          <li className="nav-item">
            <BabyChangingStationIcon className="nav-icon" />
            <span>Baby</span>
          </li>
        </ul>

        {/* Cart Icon */}
        <div className="cart-icon">
          <ShoppingBagIcon />
          <span className="cart-count">0</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;