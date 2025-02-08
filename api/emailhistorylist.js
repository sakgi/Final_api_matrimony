// src/api/client.js
const express = require('express');
const router = express.Router();
const { fetchEmailHistory } = require('../controllers/emailhostorylistcontroller');

router.get('/email-history', fetchEmailHistory);

module.exports = router;