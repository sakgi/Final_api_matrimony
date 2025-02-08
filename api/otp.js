// routes/otpRoutes.js
const express = require('express');
const { sendOtp } = require('../controllers/otpcontroller');

const router = express.Router();

// Route to send OTP
router.post('/send-otp', sendOtp);

module.exports = router;
