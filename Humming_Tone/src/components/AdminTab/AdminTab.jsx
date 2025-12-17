import { useState } from 'react'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import Dashboard from '../../Pages/AdminPanal/Dashboard/Dashboard'
import ManageProduct from '../../Pages/AdminPanal/ManageProduct/ManageProduct'
import './AdminTab.css'

export default function AdminTab({ onLogout = () => {} }) {
  const [activeTab, setActiveTab] = useState('dashboard')

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
    { id: 'manage-products', label: 'Manage Products', Icon: ShoppingBagIcon },
    { id: 'add-product', label: 'Add Product', Icon: AddCircleIcon },
    { id: 'manage-orders', label: 'Manage Orders', Icon: ShoppingCartIcon },
    { id: 'view-store', label: 'View Store', Icon: OpenInNewIcon },
  ]

  const activeTabLabel = menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'

  return (
    <div className="admin-tab-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Sidebar Header */}
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
                onClick={() => setActiveTab(item.id)}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
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
          {activeTab === 'dashboard' && <Dashboard />}

          {activeTab === 'manage-products' && <ManageProduct />}

          {activeTab === 'add-product' && (
            <section className="tab-content">
              <h2 className="content-title">Add Product</h2>
              <p style={{ color: '#666', marginTop: '1rem' }}>Add product form will be added here</p>
            </section>
          )}

          {activeTab === 'manage-orders' && (
            <section className="tab-content">
              <h2 className="content-title">Manage Orders</h2>
              <p style={{ color: '#666', marginTop: '1rem' }}>Orders management page will be added here</p>
            </section>
          )}

          {activeTab === 'view-store' && (
            <section className="tab-content">
              <h2 className="content-title">View Store</h2>
              <p style={{ color: '#666', marginTop: '1rem' }}>Store view page will be added here</p>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}