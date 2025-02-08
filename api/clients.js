const express = require("express");
const {
  addClientProfile,
  getClientProfile,
  getClientProfileByID,
  updateClientProfile,
  deleteClientProfile,
} = require("../controllers/clientController");
const verifyToken = require("../middlewares/authenticateUser");
const upload = require("../middlewares/multerConfig");
const router = express.Router();

// User registration

/* Handles client registration */
router.post("/register", verifyToken, upload.single("file"), (req, res) => {
  // Log the incoming request body and uploaded file for debugging
  console.log("Request Body:", req.body); // Log any other form fields
  console.log("Uploaded File:", req.file); // Log the uploaded file

  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // Call the addClientProfile function with the request and response objects
  addClientProfile(req, res);
});

/* Send client data / or information */
router.get("/list", verifyToken, getClientProfile);

/* To fetch client data by using ID */
router.get("/listbyid", verifyToken, getClientProfileByID);

/* Update client data or field */
router.put("/update", verifyToken, updateClientProfile);

/* Delete client data or field */
router.post("/delete", verifyToken, deleteClientProfile);

module.exports = router;


