const {
    auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    
  } = require("../config/firebaseConfig"); // Adjust the path as needed

  const { db } = require("../config/db");
  const { getFirestore, doc, getDoc } = require("firebase/firestore");
  const { loginActivity } = require("../utils/logActivity.js");
  require("dotenv").config();
  const { registerSchema, loginSchema } = require("../models/authModel.js");
  const admin = require("firebase-admin");
  const currentDate = new Date().toLocaleDateString().split('T')[0];
  const currentTime = new Date().toTimeString().split(' ')[0];
  const twilio = require('twilio');


  // Twilio credentials
  const accountSid = 'AC4ed772f04e5bdb7f7b5ce51aca4e6241'; // Your Account SID from Twilio
  const authToken = 'b45cdd20c804107e2318d8527355fa4f';  // Your Auth Token from Twilio
  
  // Initialize Twilio client
  const client = twilio(accountSid, authToken);
  
  // Registration handler
  const register = async (req, res) => {
    try {
      const { employeeName, phoneNumber, branch, email, password, confirmPassword } = req.body;
      const { error } = registerSchema.validate({
        employeeName,
        phoneNumber,
        branch,
        email,
        password,
      });
      if (error) return res.status(400).json({ error: error.details[0].message });
  
      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Password does not match" });
      }
  
      let flag = "ACTIVE";
  
      const user = await createUserWithEmailAndPassword(auth, email, password);
      const userId = user.user.uid;
  
      const employeeData = {
        "Employee_Name": employeeName,
        Email: email,
        "Phone_Number": phoneNumber,
        Branch: branch,
        role:"Employee",
        addDate: currentDate,
        addTime: currentTime,
        updatedDate: null,
        uid:userId ,
        updatedTime: null,
        deletedDate: null,
        deletedTime: null,
        flag: flag,
      };
  
      await db.collection("employeeData").doc(userId).set(employeeData);
      res.status(201).json({ message: "User registered successfully", userId, employeeData });
    } catch (err) {
      console.error("Firebase error: ", err.message);
      res.status(500).json({ message: "Internal Server Error: " + err.message });
    }
  };
  
  

  const deleteEmployee = async (req, res) => {
    try {
      const { userId } = req.body;
  
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
  
      // Check if the user exists
      const employeeRef = db.collection("employeeData").doc(userId);
      const employeeDoc = await employeeRef.get();
  
      if (!employeeDoc.exists) {
        return res.status(404).json({ error: "Employee not found" });
      }
  
      // Update the employee's flag and deletion details
      const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
      const currentTime = new Date().toLocaleTimeString(); // Format: HH:MM:SS
  
      await employeeRef.update({
        flag: "DELETED",
        deletedDate: currentDate,
        deletedTime: currentTime,
      });
  
      res.status(200).json({ message: "Employee marked as deleted successfully" });
    } catch (err) {
      console.error("Firebase error: ", err.message);
      res.status(500).json({ error: "Internal server error: " + err.message });
    }
  };
  
  const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate input
      const { error } = loginSchema.validate({ email, password });
      if (error) return res.status(400).json({ error: error.details[0].message });
  
      // Authenticate the user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userId = user.uid;
  
      // Debugging logs
      console.log("Firestore DB instance:", db);
      console.log("User ID:", userId);
  
      // Fetch the user document from both collections
      let userData = null;
  
      // Check from employeeData collection
      let employeeDocSnap = await db.collection("employeeData").doc(userId).get();
      if (employeeDocSnap.exists) {
        userData = employeeDocSnap.data();
      } else {
        // If not found in employeeData, check AdminData collection
        let adminDocSnap = await db.collection("AdminData").doc(userId).get();
        if (adminDocSnap.exists) {
          userData = adminDocSnap.data();
        }
      }
  
      // If userData is still null, user doesn't exist
      if (!userData) {
        return res.status(404).json({ error: "User not found in employeeData or AdminData" });
      }
  
      // Check if the user is active
      if (userData.flag !== "ACTIVE") {
        return res.status(403).json({ error: "User is not active. Please contact support." });
      }
  
      // Generate Firebase ID token
      const token = await user.getIdToken();
  
      // Log the login activity
      const message = `User login: ${userData.role || "Unknown Role"}`;
      await loginActivity(message, userId);
  
      // Send the successful response
      res.status(200).json({
        message: "Login successful",
        userId,
        token,
        userData,
      });
    } catch (err) {
      console.error("Firebase error: ", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    }
  };
  
  

  
  // const requestOtp = async(req, res)=>{
  
  //   const {phoneNumber} = req.body;
  
  //   try {
  //     client.verify.v2.services("VA232ccd2b01608c044818c8572aad84a3")
  //       .verifications
  //       .create({to: phoneNumber, channel: 'sms'})
  //       .then(verification => {
  //         console.log(verification.sid);
  //         return res.status(200).send({message: "OTP sent successfully"});
  //       });
  //   } catch (error) {
  //     console.log(`Exception: ${error}`);
  //     return res.status(500).send({message: "Internal Server Error"});
  //   }
    
  // };
  
  const requestOtp = async (req, res) => {
    const { phoneNumber } = req.body;
  
    try {
      const verification = await client.verify.v2.services("VA232ccd2b01608c044818c8572aad84a3")
        .verifications
        .create({ to: phoneNumber, channel: 'sms' });
  
      console.log(verification.sid);
      return res.status(200).send({ message: "OTP sent successfully" });
    } catch (error) {
      console.error(`Twilio Error: ${error.message}`);
      return res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
  };
  
  const verifyOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;
    try {
      client.verify.v2.services("VA232ccd2b01608c044818c8572aad84a3")
        .verificationChecks
        .create({to: phoneNumber, code: otp})
        .then(verification_check => {
          console.log(verification_check.status);
          return res.status(200).send({message: verification_check.status});
        });
  
    } catch (err) {
      console.log(`Exception=====> ${err}`);
      return res.status(500).send({ message: "Something went wrong" });
    }
  };
  
  // Forgot password handler
  const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
  
    try {
      await sendPasswordResetEmail(auth, email);
      res.status(200).json({
        message: "Password reset link sent successfully. Please check your inbox.",
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        res.status(404).json({ message: "No user found with this email" });
      } else if (error.code === 'auth/invalid-email') {
        res.status(400).json({ message: "Invalid email address" });
      } else {
        res.status(500).json({
          message: "Error sending password reset email",
          details: error.message,
        });
      }
    }
  };
  
  module.exports = { register,deleteEmployee, login, requestOtp, verifyOtp, forgotPassword };