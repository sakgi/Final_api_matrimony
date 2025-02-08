
const { db } = require("../config/db");
const calculateProfileCompletion = (userData) => {
    const totalFields = 15; // Total number of fields to check
    let filledFields = 0;

    // List of fields to check for completion
    const fields = [
        "gan", "gender", "job", "phoneNumber", "ras", "subCast",
        "userName", "address", "birthDate", "bloodGroup", "cast",
        "devak", "education", "email", "file"
    ];

    // Count how many fields are filled
    fields.forEach((field) => {
        if (userData[field] && userData[field].toString().trim() !== "") {
            filledFields++;
        }
    });

    // Calculate percentage
    const percentage = Math.round((filledFields / totalFields) * 100);
    return percentage;
};

exports.getProfileCompletion = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch user data from the database
        const userDoc = await db.collection("clientData").doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        const userData = userDoc.data();

        // Calculate profile completion percentage
        const profileCompletion = calculateProfileCompletion(userData);

        return res.status(200).json({
            message: "Profile completion calculated successfully",
            profileCompletion,
        });
    } catch (error) {
        console.error("Error calculating profile completion:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
