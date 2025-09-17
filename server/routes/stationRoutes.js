// server/routes/stationRoutes.js
const express = require('express');
const { getStations, getStation, getStationsWithStatus } = require('../controllers/stationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Existing routes
router.get('/', auth, getStations);
router.get('/:id', auth, getStation);


router.get('/paginated/all', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const Station = require('../models/Station');
    
    const stations = await Station.find()
      .skip(skip)
      .limit(limit)
      .select('stationId name location state district baselineValue');

    const total = await Station.countDocuments();

    res.json({
      success: true,
      data: stations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;