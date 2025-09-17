// server/controllers/exportController.js
const Reading = require('../models/Reading');
const Station = require('../models/Station');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');

// @desc    Export readings for a station as CSV
// @route   GET /api/export/readings/:stationId/csv
// @access  Public
const exportReadingsCSV = async (req, res) => {
  try {
    const { stationId } = req.params;
    const { startDate, endDate, limit = 1000 } = req.query;

    let query = { stationId };
    
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const readings = await Reading.find(query)
      .sort({ timestamp: 1 })
      .limit(parseInt(limit))
      .select('stationId waterLevel timestamp -_id');

    if (readings.length === 0) {
      return res.status(404).json({ success: false, error: 'No data found for the specified criteria' });
    }

    
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(readings);

    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${stationId}_readings_${Date.now()}.csv`);
    
    res.send(csv);

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Export readings for a station as JSON
// @route   GET /api/export/readings/:stationId/json
// @access  Public
const exportReadingsJSON = async (req, res) => {
  try {
    const { stationId } = req.params;
    const { startDate, endDate, limit = 1000 } = req.query;

    let query = { stationId };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const readings = await Reading.find(query)
      .sort({ timestamp: 1 })
      .limit(parseInt(limit))
      .select('stationId waterLevel timestamp -_id');

    if (readings.length === 0) {
      return res.status(404).json({ success: false, error: 'No data found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${stationId}_readings_${Date.now()}.json`);
    
    res.json({ success: true, data: readings });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Export readings for a station as Excel
// @route   GET /api/export/readings/:stationId/excel
// @access  Public
const exportReadingsExcel = async (req, res) => {
  try {
    const { stationId } = req.params;
    const { startDate, endDate, limit = 1000 } = req.query;

    let query = { stationId };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const readings = await Reading.find(query)
      .sort({ timestamp: 1 })
      .limit(parseInt(limit))
      .select('stationId waterLevel timestamp -_id');

    if (readings.length === 0) {
      return res.status(404).json({ success: false, error: 'No data found' });
    }

    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Water Level Readings');

    
    worksheet.columns = [
      { header: 'Station ID', key: 'stationId', width: 15 },
      { header: 'Water Level (m)', key: 'waterLevel', width: 18 },
      { header: 'Timestamp', key: 'timestamp', width: 25 }
    ];

    
    worksheet.addRows(readings);

    
    worksheet.getColumn('timestamp').numFmt = 'yyyy-mm-dd hh:mm:ss';

    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${stationId}_readings_${Date.now()}.xlsx`);

    
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Export station metadata
// @route   GET /api/export/stations
// @access  Public
const exportStations = async (req, res) => {
  try {
    const stations = await Station.find().select('-_id -__v');
    
    const format = req.query.format || 'json';

    if (format === 'csv') {
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(stations);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=stations_${Date.now()}.csv`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=stations_${Date.now()}.json`);
      res.json({ success: true, data: stations });
    }

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  exportReadingsCSV,
  exportReadingsJSON,
  exportReadingsExcel,
  exportStations
};