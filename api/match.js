// const express = require("express");
// const router = express.Router();
// const { matchProfiles } = require("../controllers/matchController");

// // Endpoint to match profiles
// router.post("/match", matchProfiles);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { findMatches } = require('../controllers/matchController'); // Import the controller

// Route to handle matching logic
router.post('/match', findMatches);

module.exports = router;
