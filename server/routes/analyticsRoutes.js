// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Reading = require('../models/Reading');
const Station = require('../models/Station');


router.get('/trends/:stationId', auth, async (req, res) => {
  try {
    const { stationId } = req.params;
    const { days = 30 } = req.query;

    
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    
    const readings = await Reading.find({
      stationId,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 });

    if (readings.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No data available for this period'
      });
    }

    
    const waterLevels = readings.map(r => r.waterLevel);
    const average = waterLevels.reduce((sum, val) => sum + val, 0) / waterLevels.length;
    const min = Math.min(...waterLevels);
    const max = Math.max(...waterLevels);
    const range = max - min;

    const firstReading = waterLevels[0];
    const lastReading = waterLevels[waterLevels.length - 1];
    const change = lastReading - firstReading;
    const percentageChange = (change / firstReading) * 100;

    let direction;
    if (percentageChange > 5) direction = 'rising';
    else if (percentageChange < -5) direction = 'falling';
    else direction = 'stable';

    res.json({
      success: true,
      data: {
        stationId,
        period: `${days} days`,
        readingsCount: readings.length,
        trend: {
          direction,
          percentageChange: `${percentageChange.toFixed(1)}%`,
          change: `${change.toFixed(2)}m`
        },
        statistics: {
          average: parseFloat(average.toFixed(2)),
          min: parseFloat(min.toFixed(2)),
          max: parseFloat(max.toFixed(2)),
          range: parseFloat(range.toFixed(2))
        },
        readings: readings.map(r => ({
          waterLevel: r.waterLevel,
          timestamp: r.timestamp
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching trend data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trend data'
    });
  }
});

//regional data
router.get('/regional', auth, async (req, res) => {
  try {
    const { state } = req.query;

    if (!state) {
      return res.status(400).json({
        success: false,
        error: 'State parameter is required'
      });
    }

    //all stations in the state
    const stations = await Station.find({ state });

    if (stations.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No stations found in this state'
      });
    }

    //latest readings for each station
    const stationData = [];
    let criticalStations = 0;
    let warningStations = 0;
    let normalStations = 0;

    for (const station of stations) {
      const latestReading = await Reading.findOne({ stationId: station.stationId })
        .sort({ timestamp: -1 });

      let status = 'normal';
      if (latestReading) {
        const percentageDifference = ((latestReading.waterLevel - station.baselineValue) / station.baselineValue) * 100;
        
        if (percentageDifference > 20) {
          status = 'critical';
          criticalStations++;
        } else if (percentageDifference > 10) {
          status = 'warning';
          warningStations++;
        } else {
          normalStations++;
        }
      }

      stationData.push({
        stationId: station.stationId,
        name: station.name,
        district: station.district,
        latestReading: latestReading ? latestReading.waterLevel : null,
        status
      });
    }

    res.json({
      success: true,
      data: {
        region: state,
        totalStations: stations.length,
        stationsWithData: stationData.filter(s => s.latestReading !== null).length,
        criticalStations,
        warningStations,
        normalStations,
        stations: stationData
      }
    });

  } catch (error) {
    console.error('Error fetching regional data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regional data'
    });
  }
});

//seasonal patterns
router.get('/seasonal/:stationId', auth, async (req, res) => {
  try {
    const { stationId } = req.params;
    const { years = 2 } = req.query;

    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - parseInt(years));

    
    const readings = await Reading.find({
      stationId,
      timestamp: { $gte: startDate, $lte: endDate }
    });

    if (readings.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No data available for seasonal analysis'
      });
    }

    
    const monthlyData = {};
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];

    readings.forEach(reading => {
      const month = reading.timestamp.getMonth();
      if (!monthlyData[month]) {
        monthlyData[month] = {
          total: 0,
          count: 0
        };
      }
      monthlyData[month].total += reading.waterLevel;
      monthlyData[month].count++;
    });

    // Calculate averages
    const seasonalPatterns = [];
    for (let month = 0; month < 12; month++) {
      if (monthlyData[month]) {
        seasonalPatterns.push({
          month,
          monthName: monthNames[month],
          average: parseFloat((monthlyData[month].total / monthlyData[month].count).toFixed(2)),
          readings: monthlyData[month].count
        });
      } else {
        seasonalPatterns.push({
          month,
          monthName: monthNames[month],
          average: 0,
          readings: 0
        });
      }
    }

    res.json({
      success: true,
      data: {
        stationId,
        totalReadings: readings.length,
        seasonalPatterns
      }
    });

  } catch (error) {
    console.error('Error fetching seasonal data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seasonal data'
    });
  }
});

module.exports = router;