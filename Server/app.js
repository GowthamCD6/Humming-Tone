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
const siteContent=require('./routes/admin/siteContent')
const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');
app.use(cors({
    origin:["http://localhost:5173","http://localhost:5174","http://localhost:5175"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// admin routes
app.use("/",adminProductRoute);
app.use("/",adminOrderRoute);
app.use("/",adminDashboardRoute);
app.use("/",adminAuthRoute);
app.use("/api/orders", adminOrderRoute); 
app.use("/",adminPromoRoute);

// user routes
app.use("/",userProductRoute);
app.use("/",userPromoRoutes);
app.use("/", siteContent);
app.use((req,res,next) => {
    next(createError.NotFound("api not found"));
})
app.use((error,req,res,next) => {
    res.status(error.status || 500);
    res.send({
        error:{
            status: error.status || 500,
            message: error.message
        }
    })
})

app.listen(PORT,() => console.log("Server runs on http://localhost:"+PORT));