const express = require('express');
const {employeeActivity, employeeActivityById, emplogActivity, emplogActivityById} = require('../controllers/loginactivityController');

 const router = express.Router();

 router.get('/emp-log', employeeActivity);

 router.post('/emp-log/:id',employeeActivityById);

 router.get('/emp-act', emplogActivity);

 router.post('/emp-act/:id', emplogActivityById);

 module.exports = router;