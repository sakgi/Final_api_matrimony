const { db } = require("../config/db");
const admin = require('firebase-admin');
const logActivity = require('../utils/logActivity');
const { merge } = require("../api/auth");
const fieldValue = admin.firestore.FieldValue;
//get employee profile
const currentDate = new Date().toLocaleDateString().split('T')[0];
const currentTime = new Date().toTimeString().split(' ')[0];

const getEmployeeProfile = async (req, res) => {
  try {
    const emplist = [];
    const userRef = await db.collection("employeeData").where("flag", "==", "ACTIVE").get();

    userRef.forEach((docSnap)=>{
      emplist.push(docSnap.data());
    });
    if (emplist.length===0) {
      return res.status(404).send({message: "No Active client found"});
    }
    return res.status(200).json({
      message: 'Employee profiles fetched successfully', data: emplist
    });
  } catch (err) {
    console.error('Error fetching employee profiles:', err);    
    return res.status(500).send(err.message);
  }
};

const getEmployeeProfileByID = async (req, res) => {
  try {
    const id = req.params.id;
    const userRef = db.collection("employeeData").doc(id);
    const doc = await userRef.get();
    if (!doc.exists || doc.data().flag !== "ACTIVE") {
      return res.status(404).send(`No ACTIVE Client Profile found`);
    }

    /*const message = `Employee fetching Profile by Id`;
    const userId = req.userId;  
    await logActivity(message, userId);*/

    return res.status(200).send(doc.data());
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
};

const updateEmployeeProfile = async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).send(`UID is required to update the user profile`);
    }
    const userRef = await db.collection("employeeData").doc(uid);

    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).send(`User profile not found`);
    }
    
    const updatedData = {
      ...req.body,
      updatedDate: currentDate,
      updatedTime: currentTime
    };

    await userRef.update( updatedData, {merge: true} );

    /*const message = `Employee updating Profile`;
    const userId = req.userId;  
    await logActivity(message, userId);*/

    return res.status(200).send(`User profile updated successfully`);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
};

const deleteEmployeeProfile = async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) {
      return res.status(404).send(`UID is required to delete the user profile`);
    }

    const userRef = db.collection("employeeData").doc(uid);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).send(`User profile not found`);
    }

    // Record deletion date and time
    const deletedDate = currentDate// YYYY-MM-DD
    const deletedTime = currentTime // Locale time format
    const fieldsToDelete = {
      flag: "DELETED",
      deletedDate: currentDate,
      deletedTime: currentTime,
    }
    
    await userRef.update(fieldsToDelete, {merge: true});
    
    /*const message = `Employee deleting Profile`;
    const userId = req.userId;  
    await logActivity(message, userId);*/

    return res.status(200).send(`User deleted successfully at ${deletedDate} ${deletedTime}`);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
};

module.exports = {
  getEmployeeProfile,
  getEmployeeProfileByID,
  updateEmployeeProfile,
  deleteEmployeeProfile,
};
