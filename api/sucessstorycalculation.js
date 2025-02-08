const express = require('express');
const { calculateSuccessStoryRate } = require("../controllers/sucessstorycalculationController");
const router = express.Router();

// Define the route for calculating the success story rate
router.get('/rate', calculateSuccessStoryRate);

module.exports = router;