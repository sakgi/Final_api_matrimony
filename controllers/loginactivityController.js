const { database } = require('firebase-admin');
const { db } = require('../config/db');


const employeeActivity = async (req, res) => {
    try {
        
        const activityList = [];
    const data = await db.collection("loginHistory").get();
    data.forEach((docSnap)=> {
        activityList.push(docSnap.data());
    });

    return res.status(200).json({
        message: 'activity list fetched successfully', data: activityList
    });
    } catch (error) {
        console.error('Error fetching activities:', error);
        return res.status(500).send(error.message);
        
    }
}


const emplogActivity = async (req, res) => {
    try {
        
        const activityList = [];
    const data = await db.collection("logActivity").get();
    data.forEach((docSnap)=> {
        activityList.push(docSnap.data());
    });

    return res.status(200).json({
        message: 'activity list fetched successfully', data: activityList
    });
    } catch (error) {
        console.error('Error fetching activities:', error);
        return res.status(500).send(error.message);
        
    }
}




const employeeActivityById = async (req, res) => {
    try {
        const {id} = req.params;
        if (!id) {
            return res.status(400).send('employee id is required');
        }
        console.log(id);
        const userRef =  db.collection("loginHistory");
        const querySnapshot = await userRef.where("activityBy", "==", id).get();
        if(querySnapshot.empty) {
            return res.status(500).send(`employee not found`);
        }

        const activities = [];
        querySnapshot.forEach((doc)=> {
            activities.push(doc.data());
        });
        return res.status(200).json({
            message: 'activity list fetched successfully',
            data: activities,
        });
    } catch (error) {
        console.error('Error fetching data', error);
        return res.status(500).send(error.message);
        
    }
};


const emplogActivityById = async (req, res) => {

    try {
        const {id} = req.params;
        if (!id) {
            return res.status(400).send('employee id is required');
        }
        console.log(id);
        const userRef =  db.collection("logActivity");
        const querySnapshot = await userRef.where("activityBy", "==", id).get();
        if(querySnapshot.empty) {
            return res.status(500).send(`employee not found`);
        }

        const activities = [];
        querySnapshot.forEach((doc)=> {
            activities.push(doc.data());
        });
        return res.status(200).json({
            message: 'activity list fetched successfully',
            data: activities,
        });
    } catch (error) {
        console.error('Error fetching data', error);
        return res.status(500).send(error.message);
        
    }
}


module.exports = {employeeActivity, employeeActivityById, emplogActivity, emplogActivityById};