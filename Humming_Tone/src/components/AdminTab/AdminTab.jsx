import { useState, useEffect } from 'react'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import PeopleIcon from '@mui/icons-material/People'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import './AdminTab.css'
import ReactSnowfall from 'react-snowfall';

export default function AdminTab({ onLogout = () => {} }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { id: 'dashboard', path: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
    { id: 'manage-products', path: 'manage-products', label: 'Manage Products', Icon: ShoppingBagIcon },
    { id: 'add-product', path: 'add-product', label: 'Add Product', Icon: AddCircleIcon },
    { id: 'manage-orders', path: 'manage-orders', label: 'Manage Orders', Icon: ShoppingCartIcon },
    { id: 'all-products', path: 'all-products', label: 'Product Data', Icon: ShoppingBagIcon },
    { id: 'site-content', path: 'site-content', label: 'Site Content', Icon: AccountCircleIcon },
    { id: 'product-buyers', path: 'product-buyers', label: 'Product Buyers', Icon: PeopleIcon },
    { id: 'view-store', path: '/usertab/home', label: 'View Store', Icon: OpenInNewIcon },
  ]
  const activeTabLabel =
    menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'

  // Keep activeTab in sync with URL
  useEffect(() => {
    const current = menuItems.find(item =>
      item.path && location.pathname.startsWith(`/admin/${item.path}`)
    )
    if (current && current.id !== activeTab) {
      setActiveTab(current.id)
    }
  }, [location.pathname])

  return (
    <div className="admin-tab-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Sidebar Header */}
        <ReactSnowfall style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
        <div className="sidebar-header">
          <h1 className="sidebar-brand">Humming Tone</h1>
          <p className="sidebar-subtitle">ADMIN PANEL</p>
        </div>

        {/* Sidebar Divider */}
        <div className="sidebar-divider"></div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {menuItems.map(item => {
            const Icon = item.Icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'view-store') {
                    navigate(item.path)
                  } else {
                    setActiveTab(item.id)
                    navigate(item.path)
                  }
                }}
                className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <Icon className="admin-nav-icon" />
                <span className="admin-nav-label">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer - Logout */}
        <div className="sidebar-footer">
          <button onClick={onLogout} className="admin-logout-btn">
            <LogoutIcon className="nav-icon" />
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <h1 className="page-title">{activeTabLabel}</h1>
          <div className="admin-user">
            <AccountCircleIcon className="user-avatar" />
            <span className="user-label">Administrator</span>
          </div>
        </header>

        {/* Content Container */}
        <div className="admin-content">
          {/* Nested admin routes render here */}
          <Outlet />
        </div>
      </main>
    </div>
  )
}