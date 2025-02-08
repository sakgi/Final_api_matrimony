const express = require('express');
const router = express.Router();
const clientController = require('../controllers/successstoryseparatelistController')

router.get('/matrimony-data', clientController.getMatrimonyData);

module.exports = router;