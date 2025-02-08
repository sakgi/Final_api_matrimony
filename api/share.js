const express = require("express");
const {
  sendClientDataToWhatsApp,
sendClientDataToWhatsAppWithMoreInfo ,
} = require("../controllers/whatsappController");

const verifyToken = require("../middlewares/authenticateUser");
const { sendEmails, secondMail } = require("../controllers/emailController");
const logActivity = require('../utils/logActivity');
// const sendclientDataToWhatsApp = require("../controllers/whatsappController");
const router = express.Router();

/* Sharing client data to another client/user etc. */
router.post("/first-whatsapp", verifyToken, async (req, res) => {
  const { clientIds, numbers } = req.body; // Expecting an array of client IDs and an array of numbers
  const userId = req.userId;

  if (!Array.isArray(clientIds) || !Array.isArray(numbers)) {
    return res.status(400).json({ error: "Invalid input format" });
  }

  try {
    const results = await sendClientDataToWhatsApp(clientIds, numbers, userId);
    res.status(200).json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


router.post("/second-whatsapp",verifyToken, async (req, res) => {
  const { clientIds, numbers } = req.body;

  
  const userId = req.userId;
  if (!Array.isArray(clientIds) || !Array.isArray(numbers)) {
    return res.status(400).json({ error: `Invalid Input Format` });
  }

  try {
    const results = await sendClientDataToWhatsAppWithMoreInfo(clientIds, numbers, userId);
    res.status(200).json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* Update SCs profile */
router.post("/first-email",verifyToken, sendEmails);


// router.post("/first-whatsapp",verifyToken,sendclientDataToWhatsApp);
/* Second email update */
router.post("/second-email",verifyToken, secondMail);

module.exports = router;
