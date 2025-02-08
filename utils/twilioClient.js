// utils/twilioClient.js
const twilio = require('twilio');

// Twilio credentials
const accountSid = 'AC4ed772f04e5bdb7f7b5ce51aca4e6241'; // Your Account SID from Twilio
const authToken = 'd1d9ab0734e4a0715dd57013286e3574';  // Your Auth Token from Twilio

// Initialize Twilio client
const client = twilio(accountSid, authToken);

module.exports = client;
