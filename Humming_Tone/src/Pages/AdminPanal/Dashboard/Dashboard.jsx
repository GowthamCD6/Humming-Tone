import './Dashboard.css'

// Static data for dashboard
const statsData = [
  { label: 'TOTAL PRODUCTS', value: 24 },
  { label: 'ACTIVE PRODUCTS', value: 24 },
  { label: 'OUT OF STOCK', value: 0 },
]

const categoriesData = [
  { label: 'MEN', count: 8 },
  { label: 'CHILDREN', count: 8 },
  { label: 'KID', count: 8 },
  { label: 'SPORTS', count: 8 },
]

export default function Dashboard() {
  return (
    <section className="tab-content">
      <h2 className="content-title">Dashboard</h2>
      <h3 className="content-subtitle">Store Statistics</h3>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div key={index} className="stat-card">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Products by Category */}
      <div className="section-container">
        <h3 className="content-subtitle">Products by Category</h3>
        <div className="category-grid">
          {categoriesData.map((category, index) => (
            <div key={index} className="category-card">
              <p className="category-label">{category.label}</p>
              <p className="category-count">{category.count}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}