import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Package,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ShoppingCart,
  Clock,
  ArrowRight,
} from 'lucide-react'
import './Dashboard.css'
import { API_BASE_URL } from '../../../utils/apiConfig'

const getAxiosConfig = () => {
  const token = localStorage.getItem('adminToken')
  return token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => (n === null || n === undefined ? '—' : Number(n).toLocaleString('en-IN'))

const fmtCurrency = (n) => {
  if (n === null || n === undefined) return '₹0'
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const statusMeta = (s = '') => {
  const k = String(s).toLowerCase()
  if (k.includes('delivered') || k.includes('completed')) return { cls: 'db-badge-green', label: s }
  if (k.includes('cancel')) return { cls: 'db-badge-red', label: s }
  if (k.includes('pending')) return { cls: 'db-badge-yellow', label: s }
  return { cls: 'db-badge-gray', label: s || '—' }
}

// ─── SVG Semi-circle Gauge ──────────────────────────────────────────────────
const SemiGauge = ({ pct = 0, color = '#2563eb', trackColor = '#dbeafe', label, sub, minLabel, maxLabel }) => {
  const cx = 100, cy = 106, r = 76, sw = 13
  const pathLen = Math.PI * r
  const filled = (Math.min(Math.max(pct, 0), 100) / 100) * pathLen
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`

  return (
    <svg viewBox="0 0 200 120" className="db-gauge-svg" aria-label={`${label} gauge`}>
      <path d={arcPath} fill="none" stroke={trackColor} strokeWidth={sw} strokeLinecap="round" />
      <path
        d={arcPath}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${pathLen}`}
      />
      <text x={cx} y={cy - 20} textAnchor="middle" fontSize="21" fontWeight="800" fill="#0f172a">{label}</text>
      {sub && <text x={cx} y={cy - 4} textAnchor="middle" fontSize="9.5" fill="#64748b">{sub}</text>}
      {minLabel && <text x={cx - r + 6} y={cy + 16} textAnchor="middle" fontSize="8" fill="#94a3b8">{minLabel}</text>}
      {maxLabel && <text x={cx + r - 6} y={cy + 16} textAnchor="middle" fontSize="8" fill="#94a3b8">{maxLabel}</text>}
    </svg>
  )
}

// ─── Custom Tooltips ─────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="db-chart-tooltip">
      {label && <p className="db-tt-date">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="db-tt-row">
          <span className="db-tt-dot" style={{ background: p.color || p.payload?.fill }} />
          <span>{p.name}: <strong>{fmtCurrency(p.value)}</strong></span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [revenueView, setRevenueView] = useState('daily')
  const [dashboardData, setDashboardData] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Fetch from dedicated backend dashboard analytics endpoint
      const res = await axios.get(`${API_BASE_URL}/admin/dashboard/analytics`, getAxiosConfig())
      if (res.data?.success) {
        setDashboardData(res.data)
      }
    } catch (err) {
      console.error('Dashboard analytics endpoint error, falling back to multi-source:', err)
      // Fallback: Fetch products and orders
      try {
        const [prodRes, ordersRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/admin/fetch_products`, getAxiosConfig()),
          axios.get(`${API_BASE_URL}/api/orders/manage`, getAxiosConfig())
        ])
        const products = prodRes.status === 'fulfilled' && Array.isArray(prodRes.value?.data) ? prodRes.value.data : []
        const orders = ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value?.data) ? ordersRes.value.data : []

        const totalRevenue = orders
          .filter(o => String(o.status || '').toLowerCase() !== 'cancelled')
          .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

        setDashboardData({
          summary: {
            totalRevenue,
            todayRevenue: 0,
            targetRevenue: 25000,
            dailyTargetPct: 0,
            totalOrders: orders.length,
            completedOrders: orders.filter(o => ['delivered', 'completed'].includes(String(o.status || '').toLowerCase())).length,
            pendingOrders: orders.filter(o => ['pending', 'confirmed', 'packed'].includes(String(o.status || '').toLowerCase())).length,
            totalProducts: products.length,
            activeProducts: products.filter(p => p.is_active || p.status === 'Active').length,
            outOfStockProducts: products.filter(p => Number(p.stock_quantity || 0) <= 0).length,
            catalogHealthPct: products.length > 0 ? Math.round((products.filter(p => p.is_active).length / products.length) * 100) : 0,
            fulfillmentPct: orders.length > 0 ? Math.round((orders.filter(o => ['delivered', 'completed'].includes(String(o.status || '').toLowerCase())).length / orders.length) * 100) : 0,
            uniqueCustomers: new Set(orders.map(o => o.customer_email).filter(Boolean)).size,
            retentionPct: 0
          },
          charts: {
            daily: [],
            monthly: [],
            inventoryHealth: []
          },
          topProducts: [],
          recentOrders: orders.slice(0, 5),
          categories: []
        })
      } catch (fallbackErr) {
        console.error('Fallback fetch error:', fallbackErr)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const summary = dashboardData?.summary || {}
  const charts = dashboardData?.charts || {}
  const topProducts = dashboardData?.topProducts || []
  const recentOrders = dashboardData?.recentOrders || []
  const categoriesData = dashboardData?.categories || []

  // Dynamic Chart Data based on selected toggle (daily / weekly / monthly)
  const chartData = useMemo(() => {
    if (!charts) return []
    if (revenueView === 'daily') {
      return charts.daily || []
    } else if (revenueView === 'weekly') {
      return charts.weekly || []
    } else {
      return charts.monthly || []
    }
  }, [charts, revenueView])

  const selectedPeriodRevenue = useMemo(
    () => chartData.reduce((sum, point) => sum + Number(point.revenue || 0), 0),
    [chartData]
  )

  const donutData = charts.inventoryHealth || []

  return (
    <section className="db-page-container">

      {/* ═══════════════ ROW 1 – GAUGE KPI CARDS ═══════════════ */}
      <div className="db-gauge-row">
        {/* Gauge 1 – Catalog Utilization */}
        <div className="db-gauge-card">
          <p className="db-gauge-title">Catalog Health</p>
          {loading ? (
            <div className="db-skeleton-gauge" />
          ) : (
            <SemiGauge
              pct={summary.catalogHealthPct || 0}
              color="#10b981"
              trackColor="#d1fae5"
              label={`${summary.catalogHealthPct || 0}%`}
              sub="Active Catalog"
              minLabel="Total"
              maxLabel={`${summary.activeProducts || 0}/${summary.totalProducts || 0}`}
            />
          )}
          <p className="db-gauge-note">
            <span style={{ color: '#10b981' }}>{fmt(summary.activeProducts)}</span> active products listed
          </p>
        </div>

        {/* Gauge 2 – Order Fulfillment SLA */}
        <div className="db-gauge-card">
          <p className="db-gauge-title">Fulfillment Rate</p>
          {loading ? (
            <div className="db-skeleton-gauge" />
          ) : (
            <SemiGauge
              pct={summary.fulfillmentPct || 0}
              color="#3b82f6"
              trackColor="#dbeafe"
              label={`${summary.fulfillmentPct || 0}%`}
              sub="Delivered Orders"
              minLabel="Pending"
              maxLabel={`${summary.pendingOrders || 0}`}
            />
          )}
          <p className="db-gauge-note">
            <span style={{ color: '#3b82f6' }}>{fmt(summary.completedOrders)}</span> delivered orders
          </p>
        </div>

        {/* Gauge 3 – Daily Sales Target */}
        <div className="db-gauge-card">
          <p className="db-gauge-title">Daily Sales Target</p>
          {loading ? (
            <div className="db-skeleton-gauge" />
          ) : (
            <SemiGauge
              pct={summary.dailyTargetPct || 0}
              color="#f59e0b"
              trackColor="#fef3c7"
              label={fmtCurrency(summary.todayRevenue)}
              sub="Today's Revenue"
              minLabel="Target"
              maxLabel="₹25k"
            />
          )}
          <p className="db-gauge-note">Target for daily completed sales</p>
        </div>

        {/* Gauge 4 – Customer Retention Rate */}
        <div className="db-gauge-card">
          <p className="db-gauge-title">Customer Retention</p>
          {loading ? (
            <div className="db-skeleton-gauge" />
          ) : (
            <SemiGauge
              pct={summary.retentionPct || 0}
              color="#8b5cf6"
              trackColor="#ede9fe"
              label={`${summary.retentionPct || 0}%`}
              sub="Repeat Buyers"
              minLabel="Total Users"
              maxLabel={`${summary.uniqueCustomers || 0}`}
            />
          )}
          <p className="db-gauge-note">Customers with 2+ orders</p>
        </div>
      </div>

      {/* ═══════════════ ROW 2 – STATS COUNTERS ═══════════════ */}
      <div className="db-stats-grid">
        <div className="db-stat-card db-blue">
          <div className="db-stat-icon-wrapper">
            <Package size={24} />
          </div>
          <div className="db-stat-content">
            <p className="db-stat-label">TOTAL PRODUCTS</p>
            <p className="db-stat-value">{loading ? '—' : fmt(summary.totalProducts)}</p>
          </div>
        </div>
        <div className="db-stat-card db-green">
          <div className="db-stat-icon-wrapper">
            <CheckCircle size={24} />
          </div>
          <div className="db-stat-content">
            <p className="db-stat-label">ACTIVE PRODUCTS</p>
            <p className="db-stat-value">{loading ? '—' : fmt(summary.activeProducts)}</p>
          </div>
        </div>
        <div className="db-stat-card db-red">
          <div className="db-stat-icon-wrapper">
            <AlertCircle size={24} />
          </div>
          <div className="db-stat-content">
            <p className="db-stat-label">OUT OF STOCK</p>
            <p className="db-stat-value">{loading ? '—' : fmt(summary.outOfStockProducts)}</p>
          </div>
        </div>
        <div className="db-stat-card db-purple">
          <div className="db-stat-icon-wrapper">
            <ShoppingCart size={24} />
          </div>
          <div className="db-stat-content">
            <p className="db-stat-label">TOTAL ORDERS</p>
            <p className="db-stat-value">{loading ? '—' : fmt(summary.totalOrders)}</p>
          </div>
        </div>
        <div className="db-stat-card db-orange">
          <div className="db-stat-icon-wrapper">
            <Clock size={24} />
          </div>
          <div className="db-stat-content">
            <p className="db-stat-label">PENDING ORDERS</p>
            <p className="db-stat-value">{loading ? '—' : fmt(summary.pendingOrders)}</p>
          </div>
        </div>
      </div>

      {/* ═══════════════ ROW 3 – REVENUE ANALYTICS ═══════════════ */}
      <div className="db-section">
        <div className="db-section-header">
          <div className="db-header-left">
            <div className="db-title-with-revenue">
              <div className="db-title-section">
                <h3 className="db-section-title">Revenue Analytics</h3>
                <p className="db-section-description">Revenue trends over time (excluding cancelled orders)</p>
              </div>
              <div className="db-total-revenue-display">
                <TrendingUp size={20} />
                <div>
                  <span className="db-revenue-display-label">Total Revenue</span>
                  <span className="db-revenue-display-value">
                    {loading ? '₹—' : fmtCurrency(summary.totalRevenue)}
                  </span>
                </div>
              </div>
              <div className="db-period-revenue-display">
                <span className="db-revenue-display-label">{revenueView} revenue</span>
                <span className="db-period-revenue-value">{loading ? '₹—' : fmtCurrency(selectedPeriodRevenue)}</span>
              </div>
            </div>
          </div>
          <div className="db-revenue-controls">
            <div className="db-revenue-toggle">
              <button
                className={`db-toggle-btn ${revenueView === 'daily' ? 'active' : ''}`}
                onClick={() => setRevenueView('daily')}
              >
                Daily
              </button>
              <button
                className={`db-toggle-btn ${revenueView === 'weekly' ? 'active' : ''}`}
                onClick={() => setRevenueView('weekly')}
              >
                Weekly
              </button>
              <button
                className={`db-toggle-btn ${revenueView === 'monthly' ? 'active' : ''}`}
                onClick={() => setRevenueView('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        <div className="db-revenue-chart">
          {loading ? (
            <div className="db-skeleton-chart" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#gradRevenue)" activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ═══════════════ ROW 4 – DONUT CHART + CATEGORIES ═══════════════ */}
      <div className="db-mid-grid">
        {/* Inventory Overview (Donut) */}
        <div className="db-panel">
          <div className="db-panel-head">
            <h4 className="db-panel-title">Inventory Health Overview</h4>
          </div>
          {loading ? (
            <div className="db-skeleton-donut" />
          ) : (
            <div className="db-donut-wrapper">
              <div className="db-donut-chart-container">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={donutData.length > 0 ? donutData : [{ name: 'In Stock', value: summary.inStockProducts || summary.totalProducts || 1, fill: '#10b981' }]}
                      cx="50%" cy="50%"
                      innerRadius={45} outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90} endAngle={-270}
                    >
                      {donutData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="db-donut-overlay">
                  <span className="db-donut-val">{loading ? '—' : `${summary.totalProducts || 0}`}</span>
                  <span className="db-donut-sub">Products</span>
                </div>
              </div>
              <div className="db-donut-legend">
                <div className="db-legend-row">
                  <span className="db-legend-dot" style={{ background: '#10b981' }} />
                  <span className="db-legend-label">In Stock</span>
                  <span className="db-legend-count">{fmt(summary.inStockProducts !== undefined ? summary.inStockProducts : (summary.totalProducts - (summary.outOfStockProducts || 0)))}</span>
                </div>
                <div className="db-legend-row">
                  <span className="db-legend-dot" style={{ background: '#ef4444' }} />
                  <span className="db-legend-label">Out of Stock</span>
                  <span className="db-legend-count">{fmt(summary.outOfStockProducts || 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Categories Distribution */}
        <div className="db-panel">
          <div className="db-panel-head">
            <h4 className="db-panel-title">Products by Category</h4>
          </div>
          <div className="db-category-list">
            {loading ? (
              <div className="db-skeleton-rows">
                {[1, 2, 3].map(i => <div key={i} className="db-skeleton-row" style={{ height: '30px', margin: '8px 0' }} />)}
              </div>
            ) : categoriesData.length === 0 ? (
              <div className="db-empty-state">No category data found.</div>
            ) : (
              categoriesData.slice(0, 5).map((category, idx) => (
                <div key={idx} className="db-category-item">
                  <div className="db-category-header">
                    <span className="db-category-label">{category.label}</span>
                    <span className="db-category-badge">{category.count}</span>
                  </div>
                  <div className="db-progress-bar">
                    <div
                      className="db-progress-fill"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════ ROW 5 – TOP PRODUCTS + RECENT ORDERS ═══════════════ */}
      <div className="db-bottom-grid">
        {/* Top Selling Products */}
        <div className="db-panel">
          <div className="db-panel-head">
            <h4 className="db-panel-title">Top Performing Items</h4>
          </div>
          <div className="db-products-list">
            {loading ? (
              <div className="db-skeleton-rows">
                {[1, 2, 3, 4].map(i => <div key={i} className="db-skeleton-row" style={{ height: '48px', margin: '8px 0' }} />)}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="db-empty-state">No sales recorded yet.</div>
            ) : (
              topProducts.map((product) => (
                <div key={product.id} className="db-product-item">
                  <div className="db-product-rank">{product.id}</div>
                  <div className="db-product-info">
                    <h4 className="db-product-name">{product.name}</h4>
                    <p className="db-product-sales">{product.sales} sales • {product.percentage}% revenue share</p>
                  </div>
                  <div className="db-product-revenue">
                    <p className="db-revenue-value">{fmtCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="db-panel">
          <div className="db-panel-head">
            <h4 className="db-panel-title">Recent Orders</h4>
            <button className="db-link-btn" onClick={() => navigate('/admin/manage-orders')}>
              Manage Orders <ArrowRight size={13} />
            </button>
          </div>
          <div className="db-orders-list">
            {loading ? (
              <div className="db-skeleton-rows">
                {[1, 2, 3, 4].map(i => <div key={i} className="db-skeleton-row" style={{ height: '48px', margin: '8px 0' }} />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="db-empty-state">No orders received yet.</div>
            ) : (
              recentOrders.map((order, idx) => {
                const sta = statusMeta(order.status)
                return (
                  <div key={order.id || idx} className="db-order-item" onClick={() => navigate(`/admin/order/${order.id}`)} style={{ cursor: 'pointer' }}>
                    <div className="db-order-avatar">
                      <ShoppingCart size={15} />
                    </div>
                    <div className="db-order-info">
                      <h4 className="db-order-number">{order.order_number}</h4>
                      <p className="db-order-meta">{order.customer_name} · {fmtDate(order.created_at)}</p>
                    </div>
                    <div className="db-order-right">
                      <span className="db-order-amount">{fmtCurrency(order.total_amount)}</span>
                      <span className={`db-badge ${sta.cls}`}>{sta.label}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </section>
  )
}