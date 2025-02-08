const express = require("express");
const router = express.Router();
const clientController = require("../controllers/profilecompletioncalculatecontroller");

// Route to calculate profile completion
router.get("/profile-completion/:userId", clientController.getProfileCompletion);

module.exports = router;
