import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import GridViewIcon from '@mui/icons-material/GridView';
import ManIcon from '@mui/icons-material/Man';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import BabyChangingStationIcon from '@mui/icons-material/BabyChangingStation';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import TuneIcon from '@mui/icons-material/Tune';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import logo from '../../assets/logo.png';
import './UserTab.css';

const UserTab = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: 'home', label: 'Home', Icon: HomeIcon },
    { path: 'all-products', label: 'All Products', Icon: GridViewIcon },
    { path: 'men', label: 'Men', Icon: ManIcon },
    { path: 'children', label: 'Children', Icon: ChildCareIcon },
    { path: 'baby', label: 'Baby', Icon: BabyChangingStationIcon },
    { path: 'sports', label: 'Sports', Icon: SportsBasketballIcon },
    { path: 'customize', label: 'Customize', Icon: TuneIcon },
  ];

  return (
    <div className="user-app-container">
      {/* Header */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          {/* Logo */}
          <Link to="/usertab/home" className="logo-section">
            <img src={logo} alt="Humming Tone" className="logo-image" />
          </Link>

          {/* Navigation */}
          <nav className="nav">
            <ul className="nav-menu">
              {navItems.map(({ path, label, Icon }) => (
                <li key={path} className="nav-item">
                  <Link to={path} className="nav-link">
                    <Icon className="nav-icon" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Cart */}
          <div className="cart-icon" onClick={() => navigate('/usertab/cart')}>
            <ShoppingBagOutlinedIcon className="cart-bag" />
            <span className="cart-badge">0</span>
          </div>
        </div>
      </header>

      {/* Nested Routes Render Here */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default UserTab;
