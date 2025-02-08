const admin = require('firebase-admin');
const { userSchema } = require('../models/userModel');
const { db } = require('../config/db');
const { logActivity } = require('../utils/logActivity');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dsldqwbze', 
  api_key: '177753248943978', 
  api_secret: '3DldiErA8BO5kF6ENTaHeEwUEzE',
});

const currentTime = new Date().toTimeString().split(' ')[0];

// Function to format date from "DD/MM/YYYY" to "YYYY-MM-DD"


const formatDateToISO = (dateString) => {
  if (!dateString || !dateString.includes('/')) return null; // Handle invalid input
  
  const parts = dateString.split('/');
  if (parts.length !== 3) return null; // Ensure proper splitting

  let [day, month, year] = parts.map((part) => part.padStart(2, '0')); 

  return `${year}-${month}-${day}`; // Format to "YYYY-MM-DD"
};

const calculateAge = (birthDate) => {
  const birthDateObj = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDifference = today.getMonth() - birthDateObj.getMonth();

  // Adjust age if the birth date hasn't occurred yet this year
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }

  return age;
};


const addClientProfile = async (req, res) => {
  const {
    userName,
    birthDate,
    education,
    job,
    cast,
    subCast,
    devak,
    ras,
    gan,
    address,
    phoneNumber,
    bloodGroup,
    demands,
    email,
    height,
    gender,
    vip,
    jobtype,
    marriagetime,
    marriagestatus = false,
  } = req.body;

  const { error } = userSchema.validate({
    userName,
    birthDate,
    education,
    job,
    cast,
    subCast,
    devak,
    ras,
    gan,
    height,
    address,
    phoneNumber,
    jobtype,
    bloodGroup,
    demands,
    email,
    gender,
    vip,
  });

  if (error) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      details: error.details[0].message,
    });
  }

  // Calculate age based on birthDate
  const age = calculateAge(birthDate);

  const formatDate = (date) => {
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const createdAt = formatDate(new Date());
  const addDate = formatDateToISO(currentTime);

  try {
    if (!req.userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is missing",
      });
    }

    // Fetch the branch name based on the userId
    const userRef = db.collection("employeeData").doc(req.userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    const branchName = userDoc.data().Branch || "Unknown"; // Default to "Unknown" if branchName is not present

    // Determine the prefix based on gender and marriage time
    let prefix = '';
    if (gender === 'male' && marriagetime === 'First') {
      prefix = 'MF';
    } else if (gender === 'female' && marriagetime === 'First') {
      prefix = 'FF';
    } else if (gender === 'male' && marriagetime === 'Second') {
      prefix = 'MS';
    } else if (gender === 'female' && marriagetime === 'Second') {
      prefix = 'FS';
    } else {
      return res.status(400).json({
        status: "error",
        message: "Invalid gender or marriage time",
      });
    }

    const counterRef = db.collection('counters').doc(`${prefix}Counter`);
    const counterDoc = await counterRef.get();
    let newId = 1;

    if (counterDoc.exists) {
      newId = counterDoc.data().count + 1;
    }

    await counterRef.set({ count: newId }, { merge: true });

    const finalId = `${prefix}${newId}`;

    let fileUrl = '';
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'client_profiles', resource_type: 'auto' },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(new Error(`Cloudinary error: ${error.message}`));
              } else {
                resolve(result);
              }
            }
          ).end(req.file.buffer);
        });
        fileUrl = result.secure_url;
      } catch (cloudError) {
        console.error("Cloudinary upload failed:", cloudError);
        throw new Error(`Cloudinary error: ${cloudError.message}`);
      }
    }

    const documentData = {
      id: finalId,
      userName,
      birthDate,
      education,
      job,
      cast,
      subCast,
      devak,
      ras,
      gan,
      jobtype,
      address,
      phoneNumber,
      bloodGroup,
      demands,
      email,
      height,
      gender,
      age,
      marriagetime,
      marriagestatus,
      createdAt,
      addDate,
      addTime: currentTime,
      updatedDate: null,
      updatedTime: null,
      deletedDate: null,
      deletedTime: null,
      vip,
      flag: "ACTIVE",
      registered_by: req.userId, // Add registered_by field
      branch_name: branchName,  // Add branch_name field
    };

    if (fileUrl) {
      documentData.file = fileUrl;
    }

    const clientRef = db.collection("clientData").doc(finalId);
    await clientRef.set(documentData, { merge: true });

    await logActivity("Client registered", req.userId);

    res.status(201).json({
      status: "success",
      message: "Client profile created successfully",
      data: { id: finalId, userName },
    });
  } catch (err) {
    console.error("Error adding client profile:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};




const getClientProfile = async (req, res) => {
  try {
    const clientsList = [];
    const snapshot = await db.collection("clientData").where("flag", "==", "ACTIVE").get();

    if (snapshot.empty) {
      return res.status(404).json({
        status: "error",
        message: "No active clients found",
      });
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      // Check if marriageStatus is true, if so, skip this client
      if (data.marriagestatus === true) {
        return; // Skip this iteration
      }
      const age = calculateAge(data.birthDate); // Calculate age based on birthDate
      clientsList.push({ id: doc.id, ...data, age }); // Include age in the response
    });

    // Sort clientsList by createdAt in descending order
    clientsList.sort((a, b) => {
      const createdAtA = a.createdAt;
      const createdAtB = b.createdAt;

      // Debugging: Log the createdAt values
      console.log(`Sorting: ${createdAtA} vs ${createdAtB}`);

      // Check if createdAt exists and is a valid string
      if (typeof createdAtA !== 'string' || typeof createdAtB !== 'string') {
        return typeof createdAtA === 'string' ? -1 : 1; // Move valid date to the front
      }

      // Convert createdAt to Date object
      const dateA = new Date(createdAtA.replace(/ at /, 'T')); // Convert createdAt to Date object
      const dateB = new Date(createdAtB.replace(/ at /, 'T')); // Convert createdAt to Date object

      // Debugging: Log the parsed dates
      console.log(`Parsed Dates: ${dateA} vs ${dateB}`);

      // Check for valid dates
      if (isNaN(dateA) || isNaN(dateB)) {
        return isNaN(dateA) ? 1 : -1; // Move valid date to the front
      }

      return dateB - dateA; // Sort in descending order
    });

    await logActivity("Fetched client profiles", req.userId);

    res.status(200).json({
      status: "success",
      data: clientsList,
    });
  } catch (error) {
    console.error("Error in getClientProfile:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch client profiles",
      details: error.message,
    });
  }
};





const getClientProfileByID = async (req, res) => {
  const { id } = req.params;

  try {
    const clientRef = db.collection ("clientData").doc(id);
    const clientDoc = await clientRef.get();

    if (!clientDoc.exists || clientDoc.data().flag !== "ACTIVE") {
      return res.status(404).json({
        status: "error",
        message: "Client not found or inactive",
      });
    }

    await logActivity("Fetched client profile by ID", req.userId);

    res.status(200).json({
      status: "success",
      data: { id: clientDoc.id, ...clientDoc.data() },
    });
  } catch (error) {
    console.error("Error in getClientProfileByID:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch client profile",
      details: error.message,
    });
  }
};






const updateClientProfile = async (req, res) => {
  // const { id } = req.params; 
  // Get the client ID from the URL
  const updateData = req.body; // Get the data to update from the request body

  // Validate the id parameter
  const id=updateData.id;
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({
      status: "error",
      message: "Invalid client ID",
    });
  }

  try {
    const clientRef = db.collection("clientData").doc(id);
    const clientDoc = await clientRef.get();

    if (!clientDoc.exists || clientDoc.data().flag !== "ACTIVE") {
      return res.status(404).json({
        status: "error",
        message: "Client not found or inactive",
      });
    }

    // Define currentDate and currentTime
    const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const currentTime = new Date().toISOString().split('T')[1].split('.')[0]; // Format: HH:mm:ss

    await clientRef.set({
      ...updateData,
      updatedDate: currentDate,
      updatedTime: currentTime,
    }, { merge: true });

    // Assuming logActivity is defined somewhere in your code
    await logActivity("Updated client profile", req.userId);

    res.status(200).json({
      status: "success",
      message: "Client profile updated successfully",
    });
  } catch (error) {
    console.error("Error in updateClientProfile:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to update client profile",
      details: error.message,
    });
  }
};


const deleteClientProfile = async (req, res) => {
  const { id } = req.body; // Extracting the ID from the request body

  // Check if the ID is valid
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      status: "error",
      message: "Invalid client ID",
    });
  }

  // Define current date and time
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const currentTime = new Date().toLocaleTimeString(); // HH:MM:SS format

  try {
    const clientRef = db.collection("clientData").doc(id); // Reference to the document with ID
    const clientDoc = await clientRef.get(); // Fetch the document

    // Check if the document exists and is active
    if (!clientDoc.exists || clientDoc.data().flag !== "ACTIVE") {
      return res.status(404).json({
        status: "error",
        message: "Client not found or inactive",
      });
    }

    // Mark the client as deleted
    await clientRef.set({
      flag: "DELETED",
      deletedDate: currentDate,
      deletedTime: currentTime,
    }, { merge: true });

    // Log the activity
    await logActivity("Deleted client profile", req.userId);

    res.status(200).json({
      status: "success",
      message: "Client profile deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteClientProfile:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to delete client profile",
      details: error.message,
    });
  }
};





module.exports = {
  addClientProfile,
  getClientProfile,
  getClientProfileByID,
  updateClientProfile,
  deleteClientProfile,
};