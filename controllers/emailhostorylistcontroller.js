const { db } = require('../config/firebaseConfig');
const { collection, getDocs } = require("firebase/firestore");

const fetchEmailHistory = async (req, res) => {
  try {
    // Reference to Firestore collection
    const emailHistoryRef = collection(db, "emailHistory");
    const snapshot = await getDocs(emailHistoryRef);

    if (snapshot.empty) {
      return res.status(404).send('No email history found');
    }

    // Extract data from Firestore snapshot
    const emailHistoryList = [];
    snapshot.forEach((doc) => {
      emailHistoryList.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json(emailHistoryList);
    return res.status(200).json(emailHistoryList);
  } catch (error) {
    console.error('Error fetching email history:', error);
    return res.status(500).send('Internal Server Error');
  }
};

module.exports = { fetchEmailHistory };
