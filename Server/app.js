require("dotenv").config();
// Cloudinary & Database Services Active
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const createError = require("http-errors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const adminProductRoute = require("./routes/admin/product");
const adminAuthRoute = require("./routes/admin/auth");
const adminDashboardRoute = require("./routes/admin/dashboard");
const adminOrderRoute = require("./routes/admin/order");
const userProductRoute = require("./routes/user/product");
const adminPromoRoute = require("./routes/admin/promo");
const userPromoRoutes = require("./routes/user/promo");
const siteRoutes = require('./routes/admin/siteContent');
const productRoutes=require('./routes/admin/productData');
const userReturnRoutes = require("./routes/user/return");
const customizeRoutes = require("./routes/user/customize");
const userCheckoutRoutes = require('./routes/user/checkout')
const adminCustomizeRoutes = require('./routes/admin/customize')
const adminInventoryRoutes = require('./routes/admin/inventory')
const adminAuth = require('./middlewares/adminAuth');
const adminUsersRoute = require("./routes/admin/adminUsers");
const adminWhatsAppRoute = require("./routes/admin/whatsapp");
const adminReturnRoute = require("./routes/admin/return");
const adminReviewRoute = require("./routes/admin/review");
const userReviewRoute = require("./routes/user/review");
const googleAuthRoute = require("./routes/auth/googleAuth");
const notificationRoute = require("./routes/user/notification");
const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');

const allowedStaticOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(",").map(s => s.trim()) 
  : [
      "https://hummingtone.com",
      "https://www.hummingtone.com",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175"
    ];

if (process.env.CLIENT_URL && !allowedStaticOrigins.includes(process.env.CLIENT_URL)) {
  allowedStaticOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      
      // Check static list
      if (allowedStaticOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Allow all Vercel preview/production deployments for hummingtone
      if (origin.endsWith('.vercel.app') || origin.includes('hummingtone.com')) {
        return callback(null, true);
      }
      
      return callback(null, true); // Permissive CORS for cross-origin storefront
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(morgan('dev'));
app.use(cookieParser());
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cache-Control', 'public, max-age=86400');
  }
}));

// Admin Auth Middleware Protection for /admin routes
app.use('/admin', (req, res, next) => {
  if (req.path === '/auth/login') {
    return next(); // Skip auth for login
  }
  // Allow OPTIONS preflight through
  if (req.method === 'OPTIONS') {
    return next();
  }
  adminAuth(req, res, next);
});

// Admin routes
app.use("/", adminProductRoute);
app.use("/", adminOrderRoute);
app.use("/admin", adminOrderRoute);
app.use("/", adminDashboardRoute);
app.use("/", adminAuthRoute);
app.use("/", adminReturnRoute);
app.use("/", adminReviewRoute);
app.use("/api/orders", adminOrderRoute);
app.use('/', adminInventoryRoutes);
app.use('/api', adminCustomizeRoutes);
app.use("/", adminPromoRoute);
app.use('/api/products', adminAuth, productRoutes);
app.use("/", adminUsersRoute);
app.use("/api", adminWhatsAppRoute);

// Site content routes (Public GET for storefront, admin updates)
app.use('/api/site-content', siteRoutes);

// User routes
app.use("/", userProductRoute);
app.use("/", userPromoRoutes);
app.use("/", userReturnRoutes);
app.use("/", customizeRoutes);
app.use("/", userCheckoutRoutes);
app.use("/", userReviewRoute);
app.use("/", googleAuthRoute);
app.use("/", notificationRoute);

// Public Site Assets Endpoint (Cloudinary asset catalog from TiDB)
app.get("/api/assets", (req, res) => {
  const pool = require("./config/db");
  pool.query("SELECT asset_key, category, file_name, file_type, cloudinary_url FROM site_assets", (err, results) => {
    if (err) {
      console.error("Error fetching site assets:", err);
      return res.status(500).json({ error: "Failed to fetch site assets" });
    }
    const assetMap = {};
    results.forEach(item => {
      assetMap[item.asset_key] = item.cloudinary_url;
    });
    res.status(200).json({ success: true, assets: results, assetMap });
  });
});

// Safe Health Check & Keep-Alive endpoints (for UptimeRobot, cron jobs, and Render)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Humming Tone API Server is Running", timestamp: Date.now() });
});

// 404 handler
app.use((req, res, next) => {
    next(createError.NotFound("api not found"));
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(error.status || 500);
    res.send({
        error: {
            status: error.status || 500,
            message: error.message
        }
    });
});

app.listen(PORT, () => console.log("Server runs on http://localhost:" + PORT));