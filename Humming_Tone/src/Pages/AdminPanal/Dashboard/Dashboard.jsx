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
  { label: 'CHILDREN', count: 8, percentage: 33 },
  { label: 'KIDS', count: 8, percentage: 33 },
  { label: 'SPORTS', count: 0, percentage: 0 },
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

const revenueAnalyticsData = [
  { label: 'DAILY REVENUE', value: '₹2,450', change: '+12%', icon: DollarSign, color: 'blue' },
  { label: 'WEEKLY REVENUE', value: '₹18,650', change: '+8%', icon: TrendingUp, color: 'green' },
  { label: 'MONTHLY REVENUE', value: '₹78,240', change: '+15%', icon: DollarSign, color: 'purple' },
  { label: 'TOTAL REVENUE', value: '₹2,45,800', change: '+22%', icon: TrendingUp, color: 'orange' },
]

export default function Dashboard() {
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

      {/* Revenue Analytics Section */}
      <div className="metrics-section">
        <h3 className="section-title">Revenue Analytics</h3>
        <div className="metrics-grid">
          {revenueAnalyticsData.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div key={index} className={`metric-card metric-${metric.color}`}>
                <div className="metric-icon">
                  <Icon size={22} />
                </div>
                <div className="metric-content">
                  <p className="metric-label">{metric.label}</p>
                  <p className="metric-value">{metric.value}</p>
                  <p className="metric-change" style={{ 
                    fontSize: '0.75rem', 
                    color: '#10b981', 
                    fontWeight: 600,
                    margin: '0.25rem 0 0 0'
                  }}>{metric.change} from last period</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Two Column Section */}
      <div className="dashboard-grid">
        {/* Products by Category */}
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