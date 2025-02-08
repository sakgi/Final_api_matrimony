const express = require("express");
const {
  getEmployeeProfile,
  getEmployeeProfileByID,
  updateEmployeeProfile,
  deleteEmployeeProfile,
} = require("../controllers/empController");
const verifyToken = require("../middlewares/authenticateUser");
const router = express.Router();

/*Employees registration*/

// send employee data / or information
router.get("/list", verifyToken, getEmployeeProfile);

/* fetch employee data with GET method */
router.get("/list/:id", verifyToken, getEmployeeProfileByID);

// update employee data or field
router.put("/update", verifyToken, updateEmployeeProfile);

// delete employee data or field
router.delete("/delete", verifyToken, deleteEmployeeProfile);

module.exports = router;
