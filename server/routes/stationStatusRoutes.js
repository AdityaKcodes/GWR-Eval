// server/routes/stationStatusRoutes.js
const express = require('express');
const { getStationsWithStatus } = require('../controllers/stationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', getStationsWithStatus);

module.exports = router;