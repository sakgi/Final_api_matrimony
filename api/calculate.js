const express = require('express');
const { calculatee } = require("../controllers/calculateController");
const router = express.Router();

// Define the route for calculating the success story rate
router.get('/rate', calculatee);

module.exports = router;