import { useState } from 'react'
import './Dashboard.css'
import { Package, CheckCircle, AlertCircle, TrendingUp, Users, ShoppingCart, DollarSign, Clock } from 'lucide-react'

// Static data for dashboard
const statsData = [
  { label: 'TOTAL PRODUCTS', value: 24, icon: Package, color: 'blue' },
  { label: 'ACTIVE PRODUCTS', value: 24, icon: CheckCircle, color: 'green' },
  { label: 'OUT OF STOCK', value: 0, icon: AlertCircle, color: 'red' },
]

const categoriesData = [
  { label: 'MEN', count: 8, percentage: 33 },
  { label: 'WOMEN', count: 10, percentage: 42 },
  { label: 'CHILDREN', count: 8, percentage: 33 },
  { label: 'KIDS', count: 8, percentage: 33 },
  { label: 'SPORTS', count: 0, percentage: 0 },
  { label: 'CUSTOMIZE', count: 5, percentage: 21 },
]

const recentActivityData = [
  { id: 1, action: 'Product Added', detail: 'Winter Collection - Men Shirt', time: '2 hours ago' },
  { id: 2, action: 'Product Updated', detail: 'Summer Dress - Children', time: '4 hours ago' },
  { id: 3, action: 'Order Received', detail: '5 items ordered', time: '1 day ago' },
]

const topProductsData = [
  { id: 1, name: 'Men Winter Shirt', sales: 45, revenue: 2250, percentage: 28 },
  { id: 2, name: 'Children Summer Dress', sales: 32, revenue: 1600, percentage: 20 },
  { id: 3, name: 'Sports Jersey', sales: 28, revenue: 1400, percentage: 17 },
  { id: 4, name: 'Baby Outfit', sales: 22, revenue: 990, percentage: 12 },
  { id: 5, name: 'Kids T-Shirt', sales: 18, revenue: 720, percentage: 9 },
]

const keyMetricsData = [
  { label: 'TOTAL ORDERS', value: 142, icon: ShoppingCart, color: 'purple' },
  { label: 'PENDING ORDERS', value: 5, icon: Clock, color: 'orange' },
  { label: 'COMPLETED ORDERS', value: 137, icon: CheckCircle, color: 'green' },
  { label: 'TOTAL CUSTOMERS', value: 87, icon: Users, color: 'blue' },
]

export default function Dashboard() {
  const [revenueView, setRevenueView] = useState('daily')
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // Generate dynamic revenue data based on selected date
  const generateRevenueData = (baseDate) => {
    // Daily data - 7 days from selected date
    const daily = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(baseDate)
      date.setDate(date.getDate() - i)
      daily.push({
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(Math.random() * 2000) + 1500,
        date: new Date(date)
      })
    }
    
    // Weekly data - 4 weeks from selected date
    const weekly = []
    for (let i = 3; i >= 0; i--) {
      const date = new Date(baseDate)
      date.setDate(date.getDate() - (i * 7))
      const weekStart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      weekly.push({
        label: weekStart,
        revenue: Math.floor(Math.random() * 8000) + 12000,
        date: new Date(date)
      })
    }
    
    // Monthly data - 6 months from selected date
    const monthly = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(baseDate)
      date.setMonth(date.getMonth() - i)
      monthly.push({
        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: Math.floor(Math.random() * 25000) + 60000,
        date: new Date(date)
      })
    }
    
    return { daily, weekly, monthly }
  }
  
  const revenueData = generateRevenueData(selectedDate)
  
  const getCurrentRevenueData = () => {
    return revenueData[revenueView]
  }
  
  const getMaxRevenue = () => {
    const data = getCurrentRevenueData()
    return Math.max(...data.map(d => d.revenue))
  }
  
  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value))
  }
  
  const formatDateForInput = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <section className="tab-content">
      <h3 className="content-subtitle">Store Statistics</h3>

      {/* Key Stats Cards */}
      <div className="stats-grid">
        {statsData.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className={`stat-card stat-${stat.color}`}>
              <div className="stat-icon-wrapper">
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Order Metrics Section */}
      <div className="metrics-section">
        <h3 className="section-title">Order Metrics</h3>
        <div className="metrics-grid">
          {keyMetricsData.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div key={index} className={`metric-card metric-${metric.color}`}>
                <div className="metric-icon">
                  <Icon size={22} />
                </div>
                <div className="metric-content">
                  <p className="metric-label">{metric.label}</p>
                  <p className="metric-value">{metric.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Revenue Analytics Section - Graph View */}
      <div className="dashboard-section">
        <div className="section-header">
          <div className="header-left">
            <div className="title-with-revenue">
              <div className="title-section">
                <h3 className="section-title">Revenue Analytics</h3>
                <p className="section-description">Revenue trends over time</p>
              </div>
              <div className="total-revenue-display">
                <TrendingUp size={20} />
                <div>
                  <span className="revenue-display-label">Total Revenue</span>
                  <span className="revenue-display-value">
                    ₹{getCurrentRevenueData().reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="revenue-controls">
            <input 
              type="date" 
              value={formatDateForInput(selectedDate)}
              onChange={handleDateChange}
              className="date-picker"
              max={formatDateForInput(new Date())}
            />
            <div className="revenue-toggle">
              <button 
                className={`toggle-btn ${revenueView === 'daily' ? 'active' : ''}`}
                onClick={() => setRevenueView('daily')}
              >
                Daily
              </button>
              <button 
                className={`toggle-btn ${revenueView === 'weekly' ? 'active' : ''}`}
                onClick={() => setRevenueView('weekly')}
              >
                Weekly
              </button>
              <button 
                className={`toggle-btn ${revenueView === 'monthly' ? 'active' : ''}`}
                onClick={() => setRevenueView('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        <div className="revenue-chart">
          <div className="chart-bars">
            {getCurrentRevenueData().map((item, index) => {
              const height = (item.revenue / getMaxRevenue()) * 100
              return (
                <div key={index} className="chart-bar-container">
                  <div className="chart-bar-wrapper">
                    <div 
                      className="chart-bar" 
                      style={{ height: `${height}%` }}
                      title={`₹${item.revenue.toLocaleString()}`}
                    >
                      <span className="bar-value">₹{(item.revenue / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                  <span className="chart-label">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Products by Category - Full Width */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Products by Category</h3>
          <p className="section-description">Distribution across categories</p>
        </div>

        <div className="category-grid">
          {categoriesData.map((category, index) => (
            <div key={index} className="category-card">
              <div className="category-header">
                <h4 className="category-label">{category.label}</h4>
                <span className="category-badge">{category.count}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
              <p className="category-percentage">{category.percentage}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section - Top Selling Products and Recently Added */}
      <div className="dashboard-grid">
        {/* Top Products */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Top Selling Products</h3>
            <p className="section-description">Best performing items</p>
          </div>

          <div className="products-list">
            {topProductsData.map((product) => (
              <div key={product.id} className="product-item">
                <div className="product-rank">{product.id}</div>
                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-sales">{product.sales} sales • {product.percentage}% of revenue</p>
                </div>
                <div className="product-revenue">
                  <p className="revenue-value">₹{product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Added Products */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Recently Added Products</h3>
            <p className="section-description">Latest additions to store</p>
          </div>

          <div className="products-list">
            {topProductsData.map((product) => (
              <div key={product.id} className="product-item">
                <div className="product-rank">{product.id}</div>
                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-sales">{product.sales} sales • {product.percentage}% of revenue</p>
                </div>
                <div className="product-revenue">
                  <p className="revenue-value">₹{product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="dashboard-section full-width">
        <div className="section-header">
          <h3 className="section-title">Recent Activity</h3>
          <p className="section-description">Latest updates in your store</p>
        </div>

        <div className="activity-list">
          {recentActivityData.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                <TrendingUp size={16} />
              </div>
              <div className="activity-content">
                <h4 className="activity-action">{activity.action}</h4>
                <p className="activity-detail">{activity.detail}</p>
              </div>
              <span className="activity-time">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="dashboard-footer">
        <div className="footer-stat">
          <span className="footer-label">Average Order Value</span>
          <span className="footer-value">₹1,730</span>
        </div>
        <div className="footer-stat">
          <span className="footer-label">Orders This Month</span>
          <span className="footer-value">45</span>
        </div>
        <div className="footer-stat">
          <span className="footer-label">Revenue Growth</span>
          <span className="footer-value">+22%</span>
        </div>
      </div>
    </section>
  )
}