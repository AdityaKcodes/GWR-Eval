// server/controllers/stationController.js
const Station = require('../models/Station');
const Reading = require('../models/Reading');

// @desc    Get all stations
// @route   GET /api/stations
// @access  Private
const getStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.status(200).json({ success: true, data: stations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get a single station by its ID
// @route   GET /api/stations/:id
// @access  Private
const getStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, error: 'Station not found' });
    }
    res.status(200).json({ success: true, data: station });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all stations WITH their latest reading
// @route   GET /api/stations-with-status
// @access  Private
const getStationsWithStatus = async (req, res) => {
  try {
    const stations = await Station.find();

    const stationsWithStatus = await Promise.all(
      stations.map(async (station) => {
        const latestReading = await Reading.findOne({ stationId: station.stationId })
          .sort({ timestamp: -1 })
          .limit(1);

        return {
          ...station.toObject(),
          latestReading: latestReading ? latestReading.waterLevel : null,
        };
      })
    );

    res.status(200).json({ success: true, data: stationsWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getStations,
  getStation,
  getStationsWithStatus
};