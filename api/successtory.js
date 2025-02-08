const express = require('express');
const router = express.Router();

// Import the controller
const { getSuccessStories } = require('../controllers/successstoriescontroller');

// Define the route
router.get('/success-stories', getSuccessStories);

module.exports = router;
