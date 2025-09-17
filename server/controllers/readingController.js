// server/controllers/readingController.js
const Reading = require('../models/Reading');

// @desc    Get all readings for a specific station
// @route   GET /api/readings/:stationId
// @access  Public
const getReadingsForStation = async (req, res) => {
  try {
    const { stationId } = req.params;
    const { limit = 100, hours } = req.query; 

    let query = { stationId };
    let sortLimit = parseInt(limit);

    
    if (hours) {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - parseInt(hours));
      query.timestamp = { $gte: startTime };
      sortLimit = 500; 
    }

    const readings = await Reading.find(query)
                                  .sort({ timestamp: 1 }) 
                                  .limit(sortLimit);

    res.status(200).json({ success: true, data: readings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getReadingsForStation
};