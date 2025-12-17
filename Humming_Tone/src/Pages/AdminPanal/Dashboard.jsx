import { useState } from 'react'

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard')

  const stats = {
    totalProducts: 24,
    activeProducts: 24,
    outOfStock: 0
  }

  const categories = [
    { name: 'MEN', count: 0 },
    { name: 'WOMEN', count: 0 },
    { name: 'KIDS', count: 0 }
  ]

  // SVG Icons
  const DashboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )

  const ShirtIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
    </svg>
  )

  const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )

  const CartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  )

  const ExternalIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )

  const LogoutIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="brand-title">fashion&more</h1>
          <p className="brand-subtitle">ADMIN PANEL</p>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveMenu('dashboard')}
          >
            <DashboardIcon />
            <span>Dashboard</span>
          </button>

          <button 
            className={`nav-item ${activeMenu === 'products' ? 'active' : ''}`}
            onClick={() => setActiveMenu('products')}
          >
            <ShirtIcon />
            <span>Manage Products</span>
          </button>

          <button 
            className={`nav-item ${activeMenu === 'add' ? 'active' : ''}`}
            onClick={() => setActiveMenu('add')}
          >
            <PlusIcon />
            <span>Add Product</span>
          </button>

          <button 
            className={`nav-item ${activeMenu === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveMenu('orders')}
          >
            <CartIcon />
            <span>Manage Orders</span>
          </button>

          <button 
            className={`nav-item ${activeMenu === 'store' ? 'active' : ''}`}
            onClick={() => setActiveMenu('store')}
          >
            <ExternalIcon />
            <span>View Store</span>
          </button>

          <button 
            className="nav-item logout"
            onClick={() => alert('Logging out...')}
          >
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <h2 className="page-title">Dashboard</h2>
          <div className="user-profile">
            <div className="avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="user-name">Administrator</span>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <h3 className="section-title">Dashboard</h3>
          
          {/* Store Statistics */}
          <section className="stats-section">
            <h4 className="stats-heading">Store Statistics</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-label">TOTAL PRODUCTS</p>
                <p className="stat-value">{stats.totalProducts}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">ACTIVE PRODUCTS</p>
                <p className="stat-value">{stats.activeProducts}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">OUT OF STOCK</p>
                <p className="stat-value">{stats.outOfStock}</p>
              </div>
            </div>
          </section>

          {/* Products by Category */}
          <section className="category-section">
            <h4 className="category-heading">Products by Category</h4>
            <div className="category-grid">
              {categories.map((category) => (
                <div key={category.name} className="category-card">
                  <p className="category-label">{category.name}</p>
                  <p className="category-value">{category.count}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}