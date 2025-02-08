const { Firestore } = require('firebase-admin/firestore');
const { db } = require("../config/db");

const getMatrimonyData = async (req, res) => {
  try {
    const snapshot = await db.collection('scsData').get();
    const results = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.femaleName && data.femaleEducation) {
        results.push({
          femaleName: data.femaleName,
          femaleEducation: data.femaleEducation,
          femaleFile: data.femaleFile,
        });
      }
      if (data.maleName && data.maleEducation) {
        results.push({
          maleName: data.maleName,
          maleEducation: data.maleEducation,
          maleFile: data.maleFile,
        });
      }
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching data: ", error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};



module.exports = {
  getMatrimonyData,
};