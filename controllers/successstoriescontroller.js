// Import Firestore
const { Firestore } = require('firebase-admin/firestore');
const { db } = require("../config/db");

// Function to fetch data from scsData
const getSuccessStories = async (req, res) => {
  try {
    const successStoriesSnapshot = await db.collection('scsData').get();
    const successStories = [];

    successStoriesSnapshot.forEach((doc) => {
      successStories.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({
      success: true,
      message: 'Success stories fetched successfully',
      data: successStories,
    });
  } catch (error) {
    console.error('Error fetching success stories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch success stories',
      error: error.message,
    });
  }
};

module.exports = { getSuccessStories };
