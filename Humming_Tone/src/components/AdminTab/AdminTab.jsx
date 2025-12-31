import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import './AdminTab.css'
import ReactSnowfall from 'react-snowfall';

export default function AdminTab({ onLogout = () => {} }) {

  const location = useLocation()
  const navigate = useNavigate()

  const currentPath = location.pathname.split('/').pop()


  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon, 'path':"dashboard" },
    { id: 'manage-products', label: 'Manage Products', Icon: ShoppingBagIcon, 'path':"manage_products" },
    { id: 'add-product', label: 'Add Product', Icon: AddCircleIcon, "path":"add_product" },
    { id: 'manage-orders', label: 'Manage Orders', Icon: ShoppingCartIcon, "path":"manage_orders" },
    { id: 'site-content', label: 'Site Content', Icon: AccountCircleIcon, "path":"site_content" },
    { id: 'all-products', label: 'Product Data', Icon: ShoppingBagIcon, "path":"product_data" },
    { id: 'view-store', label: 'View Store', Icon: OpenInNewIcon, "path":"view_store" },
  ]

  const activeTabLabel =
  menuItems.find(item => item.path === currentPath)?.label || 'Dashboard'

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
                onClick={() => navigate(item.path)}
                className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer - Logout */}
        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-btn">
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
          {/* Render based on activeTab */}
          <Outlet />
        </div>
      </main>
    </div>
  )
}