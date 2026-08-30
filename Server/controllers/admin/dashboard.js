const db = require("../../config/db");

/**
 * GET /admin/dashboard/analytics
 * Comprehensive aggregated revenue, orders, inventory, and customer analytics
 */
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const pool = db.promise();

    // 1. Overall Order & Revenue Metrics
    const [revenueRows] = await pool.query(`
      SELECT 
        COUNT(id) AS total_orders,
        SUM(CASE 
          WHEN LOWER(order_status) != 'cancelled' 
               AND (payment_status IS NULL OR LOWER(payment_status) != 'failed')
          THEN total_amount 
          ELSE 0 
        END) AS total_revenue,
        SUM(CASE 
          WHEN DATE(created_at) = CURDATE() 
               AND LOWER(order_status) != 'cancelled' 
               AND (payment_status IS NULL OR LOWER(payment_status) != 'failed')
          THEN total_amount 
          ELSE 0 
        END) AS today_revenue,
        COUNT(CASE WHEN LOWER(order_status) IN ('delivered', 'completed') THEN 1 END) AS completed_orders,
        COUNT(CASE WHEN LOWER(order_status) IN ('confirmed', 'packed', 'shipped', 'out_for_delivery') THEN 1 END) AS pending_orders,
        COUNT(CASE WHEN LOWER(order_status) = 'cancelled' THEN 1 END) AS cancelled_orders,
        COUNT(DISTINCT customer_email) AS unique_customers
      FROM orders
      WHERE NOT (order_status = 'pending' AND (payment_status = 'created' OR payment_status = 'pending' OR payment_status IS NULL));
    `);

    // 2. Repeat Customers Count
    let repeatCustomers = 0;
    try {
      const [repeatCustRows] = await pool.query(`
        SELECT COUNT(*) AS repeat_customers FROM (
          SELECT customer_email 
          FROM orders 
          WHERE customer_email IS NOT NULL AND customer_email != ''
            AND NOT (order_status = 'pending' AND (payment_status = 'created' OR payment_status = 'pending' OR payment_status IS NULL))
          GROUP BY customer_email 
          HAVING COUNT(id) >= 2
        ) AS repeat_table;
      `);
      repeatCustomers = Number(repeatCustRows[0]?.repeat_customers || 0);
    } catch (e) {
      console.warn("Repeat customers query warning:", e.message);
    }

    // 3. Product & Inventory Metrics
    const [productRows] = await pool.query(`
      SELECT 
        COUNT(p.id) AS total_products,
        COUNT(CASE WHEN p.is_active = 1 THEN 1 END) AS active_products,
        COUNT(CASE WHEN IFNULL(v.total_stock, 0) <= 0 THEN 1 END) AS out_of_stock_products
      FROM products p
      LEFT JOIN (
        SELECT product_id, SUM(stock_quantity) AS total_stock 
        FROM product_variants 
        GROUP BY product_id
      ) v ON v.product_id = p.id;
    `);

    // 4. Daily Revenue (Last 7 Days)
    const [dailyRows] = await pool.query(`
      SELECT 
        DATE(created_at) AS order_date,
        SUM(CASE 
          WHEN LOWER(order_status) != 'cancelled' 
               AND (payment_status IS NULL OR LOWER(payment_status) != 'failed')
          THEN total_amount 
          ELSE 0 
        END) AS revenue,
        COUNT(id) AS orders_count
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        AND NOT (order_status = 'pending' AND (payment_status = 'created' OR payment_status = 'pending' OR payment_status IS NULL))
      GROUP BY DATE(created_at)
      ORDER BY order_date ASC;
    `);

    // 5. Weekly Revenue (Last 4 Weeks)
    const [weeklyRawRows] = await pool.query(`
      SELECT 
        created_at,
        CASE 
          WHEN LOWER(order_status) != 'cancelled' 
               AND (payment_status IS NULL OR LOWER(payment_status) != 'failed')
          THEN total_amount 
          ELSE 0 
        END AS revenue
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 28 DAY)
        AND NOT (order_status = 'pending' AND (payment_status = 'created' OR payment_status = 'pending' OR payment_status IS NULL));
    `);

    // 6. Monthly Revenue (Last 6 Months)
    const [monthlyRows] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month_iso,
        DATE_FORMAT(created_at, '%b %Y') AS month_label,
        SUM(CASE 
          WHEN LOWER(order_status) != 'cancelled' 
               AND (payment_status IS NULL OR LOWER(payment_status) != 'failed')
          THEN total_amount 
          ELSE 0 
        END) AS revenue,
        COUNT(id) AS orders_count
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        AND NOT (order_status = 'pending' AND (payment_status = 'created' OR payment_status = 'pending' OR payment_status IS NULL))
      GROUP BY month_iso, month_label
      ORDER BY month_iso ASC;
    `);

    // 7. Top Selling Products
    let topProductRows = [];
    try {
      const [topProdResults] = await pool.query(`
        SELECT 
          oi.product_id,
          COALESCE(MAX(p.name), MAX(oi.product_name), CONCAT('Product #', oi.product_id)) AS name,
          COALESCE(
            MAX((SELECT pi.image_path FROM product_images pi WHERE pi.product_id = oi.product_id AND pi.is_primary = 1 LIMIT 1)),
            MAX(p.image_path)
          ) AS image_path,
          SUM(oi.quantity) AS sales,
          SUM(oi.product_price * oi.quantity) AS revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE LOWER(o.order_status) != 'cancelled' 
          AND (o.payment_status IS NULL OR LOWER(o.payment_status) != 'failed')
          AND NOT (o.order_status = 'pending' AND (o.payment_status = 'created' OR o.payment_status = 'pending' OR o.payment_status IS NULL))
        GROUP BY oi.product_id
        ORDER BY revenue DESC, sales DESC
        LIMIT 5;
      `);
      topProductRows = topProdResults;
    } catch (err) {
      console.warn("Top products query fallback:", err.message);
    }

    // 8. Recent 5 Orders
    const [recentOrderRows] = await pool.query(`
      SELECT 
        o.id,
        o.order_number,
        o.customer_name,
        o.customer_email,
        o.total_amount,
        o.order_status AS status,
        o.created_at,
        COUNT(oi.id) AS unique_items_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE NOT (o.order_status = 'pending' AND (o.payment_status = 'created' OR o.payment_status = 'pending' OR o.payment_status IS NULL))
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 5;
    `);

    // 9. Category Distribution
    const [categoryRows] = await pool.query(`
      SELECT 
        COALESCE(c.name, p.subcategory, 'General') AS category_name,
        COUNT(p.id) AS count
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      GROUP BY category_name
      ORDER BY count DESC
      LIMIT 6;
    `);

    // Extract Summary Values
    const totalOrders = Number(revenueRows[0]?.total_orders || 0);
    const totalRevenue = Number(revenueRows[0]?.total_revenue || 0);
    const todayRevenue = Number(revenueRows[0]?.today_revenue || 0);
    const completedOrders = Number(revenueRows[0]?.completed_orders || 0);
    const pendingOrders = Number(revenueRows[0]?.pending_orders || 0);
    const cancelledOrders = Number(revenueRows[0]?.cancelled_orders || 0);
    const uniqueCustomers = Number(revenueRows[0]?.unique_customers || 0);

    const totalProducts = Number(productRows[0]?.total_products || 0);
    const activeProducts = Number(productRows[0]?.active_products || 0);
    const outOfStockProducts = Number(productRows[0]?.out_of_stock_products || 0);
    const inStockProducts = Math.max(0, totalProducts - outOfStockProducts);

    const catalogHealthPct = totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0;
    const fulfillmentPct = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
    const targetRevenue = 25000;
    const dailyTargetPct = Math.round((todayRevenue / targetRevenue) * 100);
    const retentionPct = uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0;

    // Process Daily Chart (7 Days)
    const dailyMap = {};
    dailyRows.forEach(r => {
      const d = new Date(r.order_date);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dailyMap[dStr] = Number(r.revenue || 0);
    });

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      return {
        label,
        date: iso,
        revenue: dailyMap[iso] || 0
      };
    });

    // Process Weekly Chart (4 Weeks)
    const weeklyMap = { 'Week 4': 0, 'Week 3': 0, 'Week 2': 0, 'Week 1 (Latest)': 0 };
    const now = new Date();
    weeklyRawRows.forEach(r => {
      const orderDate = new Date(r.created_at);
      const diffDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        weeklyMap['Week 1 (Latest)'] += Number(r.revenue || 0);
      } else if (diffDays >= 7 && diffDays < 14) {
        weeklyMap['Week 2'] += Number(r.revenue || 0);
      } else if (diffDays >= 14 && diffDays < 21) {
        weeklyMap['Week 3'] += Number(r.revenue || 0);
      } else if (diffDays >= 21 && diffDays <= 28) {
        weeklyMap['Week 4'] += Number(r.revenue || 0);
      }
    });

    const last4Weeks = [
      { label: 'Week 4', revenue: weeklyMap['Week 4'] },
      { label: 'Week 3', revenue: weeklyMap['Week 3'] },
      { label: 'Week 2', revenue: weeklyMap['Week 2'] },
      { label: 'Week 1 (Latest)', revenue: weeklyMap['Week 1 (Latest)'] }
    ];

    // Process Monthly Chart (6 Months)
    const monthlyMap = {};
    monthlyRows.forEach(r => {
      monthlyMap[r.month_iso] = Number(r.revenue || 0);
    });

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      return {
        label,
        iso,
        revenue: monthlyMap[iso] || 0
      };
    });

    // Top Products Formatting
    const formattedTopProducts = (topProductRows || []).map((prod, idx) => ({
      id: idx + 1,
      name: prod.name,
      image_path: prod.image_path,
      sales: Number(prod.sales || 0),
      revenue: Number(prod.revenue || 0),
      percentage: totalRevenue > 0 ? Math.round((Number(prod.revenue || 0) / totalRevenue) * 100) : 0
    }));

    // Categories Distribution
    const totalCatCount = categoryRows.reduce((sum, c) => sum + Number(c.count || 0), 0) || 1;
    const formattedCategories = (categoryRows || []).map(c => ({
      label: String(c.category_name).toUpperCase(),
      count: Number(c.count),
      percentage: Math.round((Number(c.count) / totalCatCount) * 100)
    }));

    // Return Complete Analytics Payload
    res.status(200).json({
      success: true,
      summary: {
        totalRevenue,
        todayRevenue,
        targetRevenue,
        dailyTargetPct,
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        fulfillmentPct,
        totalProducts,
        activeProducts,
        outOfStockProducts,
        inStockProducts,
        catalogHealthPct,
        uniqueCustomers,
        repeatCustomers,
        retentionPct
      },
      charts: {
        daily: last7Days,
        weekly: last4Weeks,
        monthly: last6Months,
        inventoryHealth: [
          { name: 'In Stock', value: inStockProducts, fill: '#10b981' },
          { name: 'Out of Stock', value: outOfStockProducts, fill: '#ef4444' }
        ].filter(d => d.value > 0)
      },
      topProducts: formattedTopProducts,
      recentOrders: recentOrderRows,
      categories: formattedCategories
    });

  } catch (error) {
    console.error("Dashboard Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard analytics",
      error: error.message
    });
  }
};