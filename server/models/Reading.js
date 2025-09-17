// models/Reading.js
const mongoose = require('mongoose');


const ReadingSchema = new mongoose.Schema({
  stationId: {
    type: String,
    ref: 'Station', 
    required: true
  },
  waterLevel: {
    type: Number, 
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    index: true 
  }
}, {
  timestamps: true
});


ReadingSchema.index({ stationId: 1, timestamp: -1 });

module.exports = mongoose.model('Reading', ReadingSchema);