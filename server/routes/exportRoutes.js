// server/routes/exportRoutes.js
const express = require('express');
const {
  exportReadingsCSV,
  exportReadingsJSON,
  exportReadingsExcel,
  exportStations
} = require('../controllers/exportController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all export routes with authentication and role-based authorization
router.get('/readings/:stationId/csv', auth, authorize('researcher', 'admin'), exportReadingsCSV);
router.get('/readings/:stationId/json', auth, authorize('researcher', 'admin'), exportReadingsJSON);
router.get('/readings/:stationId/excel', auth, authorize('researcher', 'admin'), exportReadingsExcel);
router.get('/stations', auth, authorize('researcher', 'admin'), exportStations);

module.exports = router;