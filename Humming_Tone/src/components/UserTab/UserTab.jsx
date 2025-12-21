import React, { useState, useEffect } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import GridViewIcon from '@mui/icons-material/GridView';
import ManIcon from '@mui/icons-material/Man';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import BabyChangingStationIcon from '@mui/icons-material/BabyChangingStation';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import TuneIcon from '@mui/icons-material/Tune';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import logo from '../../assets/logo.png';
import Home from '../../Pages/UserPanal/HomePage/Home';
import MensPage from '../../Pages/UserPanal/Men\'s-Page/Men\'s';
import ChildrensPage from '../../Pages/UserPanal/Children\'s-Page/Children\'s';
import BabyPage from '../../Pages/UserPanal/Baby-Page/Baby';
import SportsPage from '../../Pages/UserPanal/Sports-Page/Sports';
import './UserTab.css';

const UserTab = () => {
  const [activeNav, setActiveNav] = useState('home');
  const [cartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle Header Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', Icon: HomeIcon },
    { id: 'all-products', label: 'All Products', Icon: GridViewIcon },
    { id: 'men', label: 'Men', Icon: ManIcon },
    { id: 'children', label: 'Children', Icon: ChildCareIcon },
    { id: 'baby', label: 'Baby', Icon: BabyChangingStationIcon },
    { id: 'sports', label: 'Sports', Icon: SportsBasketballIcon },
    { id: 'customize', label: 'Customize', Icon: TuneIcon },
  ];

  const handleNavClick = (id) => {
    setActiveNav(id);
  };

  const handleCartClick = () => {
    console.log('Cart clicked');
  };

  // Render content based on active nav
  const renderContent = () => {
    switch (activeNav) {
      case 'home':
        return <Home />;
      case 'all-products':
        return <div className="page-placeholder">All Products Page</div>;
      case 'men':
        return <MensPage />;
      case 'children':
        return <ChildrensPage />;
      case 'baby':
        return <BabyPage /> 
      case 'sports':
        return <SportsPage />
      case 'customize':
        return <div className="page-placeholder">Customize Page</div>;
      default:
        return <Home />;
    }
  };

  return (
    <div className="user-app-container">
      {/* Header */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          {/* Logo Section */}
          <a href="#" className="logo-section" onClick={() => handleNavClick('home')}>
            <img src={logo} alt="Humming Tone" className="logo-image" />
          </a>

          {/* Navigation Menu */}
          <nav className="nav">
            <ul className="nav-menu">
              {navItems.map((item) => {
                const IconComponent = item.Icon;
                return (
                  <li key={item.id} className="nav-item">
                    <a
                      href="#"
                      className={`nav-link ${activeNav === item.id ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item.id);
                      }}
                    >
                      <IconComponent className="nav-icon" />
                      <span>{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Cart Icon */}
          <div className="cart-icon" onClick={handleCartClick}>
            <ShoppingBagOutlinedIcon className="cart-bag" />
            <span className="cart-badge">{cartCount}</span>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default UserTab;