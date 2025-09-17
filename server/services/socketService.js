// server/services/socketService.js
const { io } = require('../server'); // Import the io instance
const Reading = require('../models/Reading');
const Station = require('../models/Station');

// Function to simulate new readings from DWLR stations
const simulateNewReading = async () => {
  try {
    
    const stations = await Station.find();
    
    if (stations.length === 0) {
      console.log('No stations found for simulation');
      return;
    }

    
    const randomStation = stations[Math.floor(Math.random() * stations.length)];
    
    
    const fluctuation = (Math.random() - 0.5) * 4; // ±2 meters
    const newWaterLevel = randomStation.baselineValue + fluctuation;

    
    const newReading = new Reading({
      stationId: randomStation.stationId,
      waterLevel: newWaterLevel,
      timestamp: new Date()
    });

    await newReading.save();

    
    io.emit('new-reading', {
      stationId: randomStation.stationId,
      waterLevel: newWaterLevel,
      timestamp: new Date()
    });

    console.log(`📊 Simulated new reading for ${randomStation.stationId}: ${newWaterLevel.toFixed(2)}m`);

  } catch (error) {
    console.error('Error in simulateNewReading:', error);
  }
};


const startSimulation = () => {
  console.log('🚀 Starting real-time data simulation...');
  setInterval(simulateNewReading, 5000); 
};

module.exports = { startSimulation };