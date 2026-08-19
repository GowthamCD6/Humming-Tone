require("dotenv").config();
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
const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');

const rawOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(",").map(s => s.trim()) 
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];
if (process.env.CLIENT_URL && !rawOrigins.includes(process.env.CLIENT_URL)) {
  rawOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
    origin: rawOrigins,
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use("/", adminDashboardRoute);
app.use("/", adminAuthRoute);
app.use("/", adminReturnRoute);
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

// Root health check endpoint (useful for Render health checks and browser verification)
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Humming Tone API Server is Running" });
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