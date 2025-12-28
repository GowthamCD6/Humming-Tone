import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import GridViewIcon from '@mui/icons-material/GridView';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import BabyChangingStationIcon from '@mui/icons-material/BabyChangingStation';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import TuneIcon from '@mui/icons-material/Tune';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import logo from '../../assets/logo.png';
import './UserTab.css';
import { fetchSiteContent } from '../../utils/siteContentStore';

const UserTab = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeGenders, setActiveGenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadGenders = async () => {
      try {
        const data = await fetchSiteContent();
        const genderStatus = data.genderStatus || {};
        
        // Get only active genders
        const activeGenderList = Object.keys(genderStatus)
          .filter(gender => genderStatus[gender] === true);
        
        setActiveGenders(activeGenderList);
      } catch (error) {
        console.error('Error loading genders:', error);
        // Set default genders if API fails
        setActiveGenders(['Men', 'Women', 'Children', 'Baby', 'Sports', 'Customize']);
      } finally {
        setLoading(false);
      }
    };

    loadGenders();
  }, []);

  // Icon mapping for genders
  const getGenderIcon = (gender) => {
    const iconMap = {
      'Men': ManIcon,
      'Women': WomanIcon,
      'Children': ChildCareIcon,
      'Baby': BabyChangingStationIcon,
      'Sports': SportsBasketballIcon,
      'Customize': TuneIcon,
    };
    return iconMap[gender] || GridViewIcon;
  };

  // Define the desired order for genders
  const genderOrder = ['Men', 'Women', 'Children', 'Baby', 'Sports', 'Customize'];

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
    { path: 'home', label: 'Home', Icon: HomeIcon },
    { path: 'all-products', label: 'All Products', Icon: GridViewIcon },
  ];

  const dynamicNavItems = sortedActiveGenders.map(gender => ({
    path: gender.toLowerCase().replace(/ /g, '-'),
    label: gender,
    Icon: getGenderIcon(gender)
  }));

  const navItems = [...staticNavItems, ...dynamicNavItems];

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
            {loading ? (
              <div className="nav-loading">Loading...</div>
            ) : (
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
            )}
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