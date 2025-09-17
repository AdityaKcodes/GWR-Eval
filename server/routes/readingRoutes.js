// server/routes/readingRoutes.js
const express = require('express');
const { getReadingsForStation } = require('../controllers/readingController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/:stationId', auth, getReadingsForStation);

module.exports = router;