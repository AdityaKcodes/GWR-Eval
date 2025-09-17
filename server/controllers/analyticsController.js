// server/controllers/analyticsController.js
const Reading = require('../models/Reading');
const Station = require('../models/Station');

// @desc    Get trend analysis for a station
// @route   GET /api/analytics/trends/:stationId
// @access  Public
const getStationTrends = async (req, res) => {
  try {
    const { stationId } = req.params;
    const { days = 30 } = req.query;

    console.log(`📊 Analytics request for station: ${stationId}, days: ${days}`);

    
    const station = await Station.findOne({ stationId });
    if (!station) {
      console.log(`❌ Station ${stationId} not found`);
      return res.status(404).json({ 
        success: false, 
        error: `Station ${stationId} not found` 
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const readings = await Reading.find({
      stationId,
      timestamp: { $gte: startDate }
    })
    .sort({ timestamp: 1 })
    .select('waterLevel timestamp -_id')
    .limit(100);

    console.log(`📈 Found ${readings.length} readings for station ${stationId}`);

    if (readings.length === 0) {
      console.log(`ℹ️ No data found for station ${stationId} in the last ${days} days`);
      return res.status(404).json({ 
        success: false, 
        error: `No data found for station ${stationId} in the last ${days} days` 
      });
    }

    //  trend calculation
    const firstReading = readings[0].waterLevel;
    const lastReading = readings[readings.length - 1].waterLevel;
    const trendChange = lastReading - firstReading;
    const percentageChange = (trendChange / firstReading) * 100;

    //  statistics
    const values = readings.map(r => r.waterLevel);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    res.json({
      success: true,
      data: {
        stationId,
        stationName: station.name,
        period: `${days} days`,
        readingsCount: readings.length,
        trend: {
          direction: trendChange > 0 ? 'rising' : trendChange < 0 ? 'falling' : 'stable',
          percentageChange: percentageChange.toFixed(2),
          change: trendChange.toFixed(2)
        },
        statistics: {
          average: average.toFixed(2),
          min: min.toFixed(2),
          max: max.toFixed(2),
          range: (max - min).toFixed(2)
        },
        readings: readings
      }
    });

  } catch (error) {
    console.error('❌ Trend analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get regional analysis
// @route   GET /api/analytics/regional
// @access  Public
const getRegionalAnalysis = async (req, res) => {
  try {
    const { state } = req.query;

    //  all stations in the state
    const stations = await Station.find(state ? { state } : {});
    
    if (stations.length === 0) {
      return res.status(404).json({ success: false, error: 'No stations found' });
    }

    
    const stationData = await Promise.all(
      stations.map(async (station) => {
        const latestReading = await Reading.findOne({ stationId: station.stationId })
          .sort({ timestamp: -1 })
          .select('waterLevel timestamp -_id');

        return {
          stationId: station.stationId,
          name: station.name,
          district: station.district,
          latestReading: latestReading ? latestReading.waterLevel : null,
          status: latestReading ? 
            (latestReading.waterLevel > station.baselineValue * 1.2 ? 'critical' : 
             latestReading.waterLevel > station.baselineValue * 1.1 ? 'warning' : 'normal') 
            : 'unknown'
        };
      })
    );

    const validStations = stationData.filter(s => s.latestReading !== null);

    res.json({
      success: true,
      data: {
        region: state || 'all',
        totalStations: stations.length,
        stationsWithData: validStations.length,
        criticalStations: validStations.filter(s => s.status === 'critical').length,
        warningStations: validStations.filter(s => s.status === 'warning').length,
        normalStations: validStations.filter(s => s.status === 'normal').length,
        stations: stationData
      }
    });

  } catch (error) {
    console.error('Regional analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get seasonal patterns
// @route   GET /api/analytics/seasonal/:stationId
// @access  Public
const getSeasonalPatterns = async (req, res) => {
  try {
    const { stationId } = req.params;

    const readings = await Reading.find({ stationId })
      .sort({ timestamp: 1 })
      .select('waterLevel timestamp -_id')
      .limit(500); 

    if (readings.length === 0) {
      return res.status(404).json({ success: false, error: 'No data found' });
    }

    
    const monthlyAverages = {};
    readings.forEach(reading => {
      const month = reading.timestamp.getMonth(); // 0-11
      if (!monthlyAverages[month]) {
        monthlyAverages[month] = { sum: 0, count: 0 };
      }
      monthlyAverages[month].sum += reading.waterLevel;
      monthlyAverages[month].count += 1;
    });

    const seasonalPatterns = Object.keys(monthlyAverages).map(month => ({
      month: parseInt(month),
      monthName: new Date(2023, parseInt(month), 1).toLocaleString('default', { month: 'long' }),
      average: (monthlyAverages[month].sum / monthlyAverages[month].count).toFixed(2),
      readings: monthlyAverages[month].count
    }));

    // Sort by month
    seasonalPatterns.sort((a, b) => a.month - b.month);

    res.json({
      success: true,
      data: {
        stationId,
        totalReadings: readings.length,
        seasonalPatterns
      }
    });

  } catch (error) {
    console.error('Seasonal analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getStationTrends,
  getRegionalAnalysis,
  getSeasonalPatterns
};