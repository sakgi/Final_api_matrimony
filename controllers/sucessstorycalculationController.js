const { db } = require('../config/db'); // Ensure you have your Firestore DB initialized

// Function to calculate the success story rate
async function calculateSuccessStoryRate(req, res) {
  console.log("Calculating success story rate..."); // Debug log
  try {
    // Step 1: Fetch counts from the counters collection
    const counterDocs = ['FFCounter', 'FSCounter', 'MFCounter', 'MSCounter'];
    let totalRegisteredCount = 0;

    for (const docName of counterDocs) {
      const docRef = db.collection('counters').doc(docName);
      const doc = await docRef.get();
      if (doc.exists) {
        const count = doc.data().count || 0; // Default to 0 if count is not found
        totalRegisteredCount += count;
      }
    }

    // Step 2: Fetch the success story count
    const successStoryDocRef = db.collection('counters').doc('successStory');
    const successStoryDoc = await successStoryDocRef.get();
    let finalSuccessStoryCount = 0;

    if (successStoryDoc.exists) {
      const successStoryCount = successStoryDoc.data().count || 0; // Default to 0 if count is not found
      finalSuccessStoryCount = successStoryCount * 2; // Multiply by 2
    }

    // Step 3: Calculate the success story percentage
    let successStoryPercentage = 0;
    if (totalRegisteredCount > 0) {
      successStoryPercentage = (finalSuccessStoryCount / totalRegisteredCount) * 100;
    }

    // Step 4: Return the result
    return res.status(200).json({
      totalRegisteredCount,
      finalSuccessStoryCount,
      successStoryPercentage: successStoryPercentage.toFixed(2), // Format to 2 decimal places
    });
  } catch (error) {
    console.error("Error calculating success story rate:", error);
    return res.status(500).json({ error: "Failed to calculate success story rate" });
  }
}

module.exports = { calculateSuccessStoryRate };