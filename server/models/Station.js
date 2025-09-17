// models/Station.js
const mongoose = require('mongoose');

// Define DWLR Station
const StationSchema = new mongoose.Schema({
  stationId: {
    type: String,
    required: true,
    unique: true // Each station must have a unique ID
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String, // This will be 'Point'
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  baselineValue: { 
    type: Number,
    required: true
  }
}, {
  timestamps: true 
});


StationSchema.index({ location: '2dsphere' });


module.exports = mongoose.model('Station', StationSchema);