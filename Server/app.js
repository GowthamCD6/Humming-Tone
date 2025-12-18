require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const createError = require("http-errors");
const bodyParser = require("body-parser");

const app = require("express");
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin:  "http://localhost:5173" || "http://localhost:5174" || "http://localhost:5175",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(morgan('dev'));
app.use(bodyParser.json);


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

