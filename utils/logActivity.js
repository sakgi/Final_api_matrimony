// const { Timestamp } = require("firebase/firestore");
const {db, admin} = require("../config/db");

/* while employee log-in, will notice his activity and store in collection */

const logActivity = async(message, userId) => {
    try{
        
        const activityRef = db.collection("logActivity");
        const abc = await activityRef.add({
            activityName: message,
            activityBy: userId || "Anonymous",
            activityTime: admin.firestore.FieldValue.serverTimestamp(),
        }); 
        console.log(`Activity logged for user: ${userId}`);
    } catch(error) {
        console.error("Error log activity", error);
        throw error;
    }
}
const loginActivity = async (message, userId) => {
    try {
        const activityRef = db.collection("loginHistory");
        const abc = await activityRef.add({
            activityName: message,
            activityBy: userId || "Anonymous",
            loginTime: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Employee login by :${userId}`);
    } catch (error) {
        console.log("Error Employee Login Activity", error);
        throw error;
    }
}



module.exports = {
    logActivity,
    loginActivity
};