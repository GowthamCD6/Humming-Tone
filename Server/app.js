require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const createError = require("http-errors");
const bodyParser = require("body-parser");
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
const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(morgan('dev'));
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Admin routes
app.use("/", adminProductRoute);
app.use("/", adminOrderRoute);
app.use("/", adminDashboardRoute);
app.use("/", adminAuthRoute);
app.use("/api/orders", adminOrderRoute);
app.use("/", adminPromoRoute);
app.use('/api', productRoutes);
app.use('/api', adminCustomizeRoutes);
// User routes
app.use("/", userProductRoute);
app.use("/", userPromoRoutes);
app.use("/",userReturnRoutes);
app.use("/", customizeRoutes);
app.use("/", userCheckoutRoutes);

// Site content routes
app.use('/api/site-content', siteRoutes);

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