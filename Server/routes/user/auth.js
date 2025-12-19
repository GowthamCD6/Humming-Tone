const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth"); // importing auth file
const userAuth = require("../middlewares/userAuth");

router.post("/auth/register", auth.register);
router.post("/auth/login", auth.login);
router.post("auth/logout", auth.logout);

module.exports = router;