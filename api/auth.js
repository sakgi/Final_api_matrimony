const express = require("express");
// const auth = require('../controllers/authController');
const { login, deleteEmployee,register, verifyOtp, forgotPassword,requestOtp } = require("../controllers/authController");

const router = express.Router();

// public routes
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password",forgotPassword);
router.post("/request-otp", requestOtp); 
router.delete("/employeedelete",deleteEmployee)
module.exports = router;
