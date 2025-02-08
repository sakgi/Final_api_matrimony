const { merge } = require("../api/auth");
const { db } = require("../config/db");
const { successStoriesSchema } = require("../models/successStoryModel");
const { logActivity } = require("../utils/logActivity");
const multer = require("multer");

const upload = multer();

const currentDate = new Date().toLocaleDateString().split("T")[0];
const currentTime = new Date().toTimeString().split(" ")[0];

const convertToDate = (dateStr) => {
  const [day, month, year] = dateStr.split("-");
  return new Date(`${year}-${month}-${day}`);
};

const getsuccessStoryProfile = async (req, res) => {
  try {
    const ssData = [];
    const snapshot = await db
      .collection("scsData")
      .where("flag", "==", "ACTIVE")
      .get();

    snapshot.forEach((docSnap) => {
      ssData.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    const message = `Fetching success story profile`;
    const userId = req.userId;
    await logActivity(message, userId);

    return ssData.length == 0
      ? res.status(200).send({ message: "No Active SucessStory Data found " })
      : res
          .status(200)
          .send({ message: "list fetched successfully", data: ssData });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
};

const updatesuccessStoryProfile = async (req, res) => {
  try {
    const { uid } = req.body; // Get uid and other data from request body
    if (!uid) {
      return res.status(404).send(`UID is required to update the user profile`);
    }

    const userRef = db.collection("scsData").doc(uid); // Use uid to get the correct document reference

    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).send(`Profiles Not Found`);
    }

    const message = `Updated success story profile`;
    const userId = req.userId;
    await logActivity(message, userId);

    const updatedData = {
      ...req.body,
      updatedDate: currentDate,
      updatedTime: currentTime
    };

    await userRef.update(updatedData, {merge: true}); // Update the document with new data
    
    return res.status(200).send(`User profile updated successfully`);
  } catch (error) {
    console.error(error); // Changed console.log to console.error
    return res.status(500).send(error.message);
  }
};



// const createsuccessStoryProfile = async (req, res) => {
//   upload.none()(req, res, async (err) => {
//     if (err) {
//       return res.status(500).send("Error parsing form data");
//     }

//     let {
//       maleName,
//       femaleName,
//       femaleFile,
//       maleFile,
//       weddingDate,
//       Fid,
//       Mid,
//     } = req.body;

//     if (!Fid || !Mid) {
//       return res.status(400).send("Both Fid and Mid are required.");
//     }

//     if (!req.userId) {
//       return res.status(400).send("User ID is missing");
//     }

//     // Validate the input before conversion
//     const { error } = successStoriesSchema.validate({
//       maleName,
//       femaleName,
//       femaleFile,
//       maleFile,
//       weddingDate, // This will validate the ISO format
//     });

//     if (error) {
//       return res.status(400).send(error.details[0].message);
//     }

//     // Convert weddingDate after validation
//     // if (weddingDate) weddingDate = convertToDate(weddingDate);

//     let flag = "ACTIVE";

//     try {
//       const scsData = {
//         maleName,
//         femaleName,
//         femaleFile,
//         maleFile,
//         weddingDate,
//         addDate: currentDate,
//         addTime: currentTime,
//         updatedDate: null,
//         updatedTime: null,
//         deletedDate: null,
//         deletedTime: null,
//         flag: flag,
//       };

//       const userRef = db.collection("scsData").doc();

//       const message = `Created success story profile`;
//       const userId = req.userId;

//       await logActivity(message, userId);
//       await userRef.set(scsData);

//       const clientDataUpdates = [];
//       if (Fid) {
//         const clientDataRefFid = db.collection("clientData").doc(Fid);
//         clientDataUpdates.push(clientDataRefFid.update({ marriagestatus: true }));
//       } else {
//         console.warn("Fid is missing, marriageStatus not updated for Fid.");
//       }

//       if (Mid) {
//         const clientDataRefMid = db.collection("clientData").doc(Mid);
//         clientDataUpdates.push(clientDataRefMid.update({ marriagestatus: true }));
//       } else {
//         console.warn("Mid is missing, marriageStatus not updated for Mid.");
//       }

//       await Promise.all(clientDataUpdates);

//       res.status(201).send(`Story added successfully with id: ${userRef.id}`);
//     } catch (error) {
//       console.log(error);
//       return res.status(500).send(error.message);
//     }
//   });
// };



const createsuccessStoryProfile = async (req, res) => {
  upload.none()(req, res, async (err) => {
    if (err) {
      return res.status(500).send("Error parsing form data");
    }

    let {
      maleName,
      femaleName,
      femaleFile,
      maleFile,
      weddingDate,
      Fid,
      Mid,
    } = req.body;

    if (!Fid || !Mid) {
      return res.status(400).send("Both Fid and Mid are required.");
    }

    if (!req.userId) {
      return res.status(400).send("User ID is missing");
    }

    // Validate the input before conversion
    const { error } = successStoriesSchema.validate({
      maleName,
      femaleName,
      femaleFile,
      maleFile,
      weddingDate, // This will validate the ISO format
    });

    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    let flag = "ACTIVE";

    try {
      const scsData = {
        maleName,
        femaleName,
        femaleFile,
        maleFile,
        weddingDate,
        addDate: currentDate,
        addTime: currentTime,
        updatedDate: null,
        updatedTime: null,
        deletedDate: null,
        deletedTime: null,
        flag: flag,
      };

      const userRef = db.collection("scsData").doc();

      const message = `Created success story profile`;
      const userId = req.userId;

      await logActivity(message, userId);
      await userRef.set(scsData);

      // Update marriage status for Fid and Mid
      const clientDataUpdates = [];
      if (Fid) {
        const clientDataRefFid = db.collection("clientData").doc(Fid);
        clientDataUpdates.push(clientDataRefFid.update({ marriagestatus: true }));
      } else {
        console.warn("Fid is missing, marriageStatus not updated for Fid.");
      }

      if (Mid) {
        const clientDataRefMid = db.collection("clientData").doc(Mid);
        clientDataUpdates.push(clientDataRefMid.update({ marriagestatus: true }));
      } else {
        console.warn("Mid is missing, marriageStatus not updated for Mid.");
      }

      await Promise.all(clientDataUpdates);

      // Update the success story count
      const counterRef = db.collection("counters").doc("successStory");
      await db.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let newCount = 1; // Default to 1 if the document does not exist

        if (counterDoc.exists) {
          newCount = counterDoc.data().count + 1; // Increment the existing count
        }

        transaction.set(counterRef, { count: newCount }); // Update the count
      });

      res.status(201).send(`Story added successfully with id: ${userRef.id}`);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error.message);
    }
  });
};





const deletesuccessStoryProfile = async (req, res) => {
  try {
    const { uid } = req.body; // Expecting the UID from the body of the request
    console.log(uid);

    if (!uid) {
      return res.status(400).send("User id is required to delete the user profile");
    }

    const userRef = db.collection("scsData").doc(uid);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send("Success story profile not found");
    }

    const message = `Success story profile deleted.`;
    const userId = req.userId; // Ensure req.userId is defined

    await logActivity(message, userId);

    const fieldsToDelete = {
      flag: 'DELETED',
      deletedDate: currentDate,
      deletedTime: currentTime,
    }

    await userRef.update(fieldsToDelete, {merge: true});

    return res.status(200).send("Success story profile deleted.");
  } catch (error) {
    console.error("Error deleting success story profile:", error);
    return res.status(500).send(error.message);
  }
};


const countSuccessStories = async (req, res) => {
  try {
    const successStoriesSnapshot = await db.collection('scsData').get();
    const count = successStoriesSnapshot.size; // Get the number of documents

    return res.status(200).json({
      success: true,
      message: 'Success stories count fetched successfully',
      count: count,
    });
  } catch (error) {
    console.error('Error fetching success stories count:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch success stories count',
      error: error.message,
    });
  }
};


module.exports = {
  createsuccessStoryProfile,
  getsuccessStoryProfile,
  updatesuccessStoryProfile,
  deletesuccessStoryProfile,
  countSuccessStories,
};
