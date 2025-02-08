// clerkConfig.js
const { Clerk } = require("@clerk/clerk-sdk-node");
require("dotenv").config(); // Load environment variables

const clerk = new Clerk({
  apiKey: process.env.CLERK_API_KEY, // Replace with your API key
  frontendApi: process.env.CLERK_FRONTEND_API, // Replace with your frontend API
});

module.exports = clerk;
