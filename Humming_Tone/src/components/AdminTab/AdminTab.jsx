import { useState, useEffect } from 'react'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import LogoutIcon from '@mui/icons-material/Logout'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import RateReviewIcon from '@mui/icons-material/RateReview'
import WebIcon from '@mui/icons-material/Web'
import AssessmentIcon from '@mui/icons-material/Assessment'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import './AdminTab.css'

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

const menuSections = [
  {
    title: 'MAIN',
    items: [
      { id: 'dashboard', path: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
    ]
  },
  {
    title: 'STORE & CATALOG',
    items: [
      { id: 'manage-products', path: 'manage-products', label: 'Manage Products', Icon: ShoppingBagIcon },
      { id: 'add-product', path: 'add-product', label: 'Add Product', Icon: AddCircleOutlineIcon },
      { id: 'inventory', path: 'inventory', label: 'Inventory Management', Icon: Inventory2Icon },
      { id: 'manage-orders', path: 'manage-orders', label: 'Manage Orders', Icon: ShoppingCartIcon },
      { id: 'manage-reviews', path: 'manage-reviews', label: 'Product Reviews', Icon: RateReviewIcon },
    ]
  },
  {
    title: 'ANALYTICS & DATA',
    items: [
      { id: 'data-export', path: 'data-export', label: 'Data Export', Icon: FileDownloadIcon },
      { id: 'all-products', path: 'all-products', label: 'Product Analytics', Icon: AssessmentIcon },
      { id: 'product-buyers', path: 'product-buyers', label: 'Customer Buyer Data', Icon: PeopleOutlineIcon },
    ]
  },
  {
    title: 'CONFIGURATION',
    items: [
      { id: 'site-content', path: 'site-content', label: 'Site Content', Icon: WebIcon },
      { id: 'manage-admin', path: 'manage-admin', label: 'Admin Users', Icon: AdminPanelSettingsIcon },
    ]
  },
]

const menuItems = menuSections.flatMap(section => section.items)

export default function AdminTab({ onLogout = () => {} }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminUser, setAdminUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      const decoded = decodeToken(token)
      setAdminUser(decoded)
    }
  }, [])

  // Auto close sidebar drawer when navigating on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const currentItem = menuItems.find(item =>
    item.path && location.pathname.startsWith(`/admin/${item.path}`)
  )

  const activeTab = currentItem
    ? currentItem.id
    : location.pathname.startsWith('/admin/order/')
      ? 'manage-orders'
      : 'dashboard'

  const activeTabLabel =
    menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'

  const getInitials = (name) => {
    if (!name) return 'AD'
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <div className="admin-tab-layout">
      {/* 1. SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Mobile Close Button */}
        <button
          className="admin-sidebar-close-btn"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <CloseIcon fontSize="small" />
        </button>

        {/* Sidebar Brand Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand-wrap" onClick={() => navigate('dashboard')}>
            <img src={logo} alt="Humming Tone" className="sidebar-brand-logo" />
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar-nav">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              {section.title && (
                <div className="nav-section-title">{section.title}</div>
              )}

              <div className="nav-items-list">
                {section.items.map((item) => {
                  const Icon = item.Icon
                  const isActive = activeTab === item.id

                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={`admin-nav-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon className="admin-nav-icon" />
                      <span className="admin-nav-label">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Quick External Store Link */}
          <div className="nav-section">
            <div className="nav-section-title">STOREFRONT</div>
            <a
              href="/usertab/home"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-nav-item store-link-item"
            >
              <StorefrontIcon className="admin-nav-icon" />
              <span className="admin-nav-label">Live Storefront</span>
              <OpenInNewIcon className="store-link-arrow" fontSize="inherit" />
            </a>
          </div>
        </nav>

        {/* Sidebar Footer User Profile & Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {adminUser?.avatar_url ? (
                <img
                  src={adminUser.avatar_url}
                  alt={adminUser?.username || 'Admin'}
                  className="sidebar-user-img"
                />
              ) : (
                <span className="sidebar-user-initials">
                  {getInitials(adminUser?.username || 'Admin')}
                </span>
              )}
              <span className="sidebar-user-online" />
            </div>

            <div className="sidebar-user-info">
              <span className="sidebar-user-name">
                {adminUser?.username || 'Administrator'}
              </span>
              <span className="sidebar-user-role">Master Admin</span>
            </div>

            <button
              onClick={onLogout}
              className="sidebar-logout-icon-btn"
              title="Logout session"
            >
              <LogoutIcon fontSize="small" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop Overlay */}
      <div
        className={`admin-mobile-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-label="Close sidebar backdrop"
      />

      {/* 2. MAIN CONTENT AREA */}
      <main className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              type="button"
              className="admin-header-menu-btn"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle sidebar"
            >
              <MenuIcon fontSize="small" />
            </button>
            <div className="admin-header-title-box">
              <h1 className="page-title">{activeTabLabel}</h1>
            </div>
          </div>

          <div className="admin-header-right">
            <div className="admin-top-user-chip">
              <div className="top-user-avatar">
                {getInitials(adminUser?.username || 'Admin')}
              </div>
              <div className="top-user-text">
                <span className="top-user-name">{adminUser?.username || 'Admin'}</span>
                <span className="top-user-status">Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Nested Route Pages */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
