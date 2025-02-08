const admin = require('firebase-admin');
const db = admin.firestore();

// Function to compare birthdates and return true if the first date is earlier than the second
function compareBirthDates(birthDate1, birthDate2) {
    const date1 = new Date(birthDate1);
    const date2 = new Date(birthDate2);
    return date1 < date2; // Return true if date1 is earlier than date2
}

async function findMatches(req, res) {
    const { gender, birthDate, VIP,cast } = req.body; // Get the input from the request
    try {
        // Step 1: Check if the input has the necessary fields
        if (!gender || !birthDate || VIP === undefined || !cast) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Step 2: Determine the opposite gender based on the input gender
        const oppositeGender = gender === 'female' ? 'male' : 'female';

        // Step 3: Fetch the profiles that match the gender and VIP status
        let query = db.collection('clientData')
            .where('gender', '==', oppositeGender) // Match the opposite gender
            .where('VIP', '==', (VIP === 'true')) // Match the VIP status (true/false)
            .where('cast', '==', cast); // Match the cast
        const snapshot = await query.get();
        
        if (snapshot.empty) {
            return res.status(404).json({ message: 'No matching profiles found.' });
        }

        const matches = [];
        snapshot.forEach(doc => {
            const profile = doc.data();
            // Step 4: Compare the birthdates to check if the profile is older (for females) or younger (for males)
            if (
                (gender === 'female' && compareBirthDates(profile.birthDate, birthDate)) || // Female - male should be older
                (gender === 'male' && compareBirthDates(birthDate, profile.birthDate)) // Male - female should be younger
            ) {
                matches.push(profile); // Add profile to the list of matches
            }
        });

        // Step 5: Return the matching profiles
        if (matches.length === 0) {
            return res.status(404).json({ message: 'No matching profiles found based on criteria.' });
        }

        return res.status(200).json({ matches });

    } catch (error) {
        console.error('Error fetching matching profiles:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

module.exports = { findMatches };


