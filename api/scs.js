const express = require("express");
const {
  createsuccessStoryProfile,
  getsuccessStoryProfile,
  updatesuccessStoryProfile,
  deletesuccessStoryProfile,
  countSuccessStories,
} = require("../controllers/scsController");
const verifyToken = require("../middlewares/authenticateUser");

const router = express.Router();

/* fetch scs profile */
router.get("/list", verifyToken, getsuccessStoryProfile);

/* create scs profile */
router.post("/create", verifyToken, createsuccessStoryProfile);

/* update scs profile */
router.put("/update", verifyToken, updatesuccessStoryProfile);

/* update scs profile */
router.delete("/delete", verifyToken, deletesuccessStoryProfile);

router.get('/success-stories/count', countSuccessStories);

module.exports = router;
