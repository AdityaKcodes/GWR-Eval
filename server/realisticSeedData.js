// server/realisticSeedData.js - FIXED & SIMPLIFIED
const mongoose = require('mongoose');
require('dotenv').config();

const Station = require('./models/Station');
const Reading = require('./models/Reading');

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected for seeding...'))
.catch((err) => console.error('Seeding connection error:', err));

const getRandomFloat = (min, max, decimals = 2) => {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. CLEAN EXISTING DATA
    await Station.deleteMany({});
    await Reading.deleteMany({});
    console.log('Existing data cleaned.');

    // 2. CREATE CORE STATIONS (Using the original DWLR format)
    const stationsToCreate = [
      {
        stationId: 'DWLR-0001',
        name: 'Mumbai Central Station',
        location: { type: 'Point', coordinates: [72.8777, 19.0760] }, // [lng, lat]
        state: 'Maharashtra',
        district: 'Mumbai',
        baselineValue: 12.5
      },
      {
        stationId: 'DWLR-0002',
        name: 'Delhi Monitoring Station',
        location: { type: 'Point', coordinates: [77.1025, 28.7041] }, // [lng, lat]
        state: 'Delhi',
        district: 'New Delhi',
        baselineValue: 15.2
      },
      {
        stationId: 'DWLR-0003',
        name: 'Chennai Reservoir Station',
        location: { type: 'Point', coordinates: [80.2707, 13.0827] }, // [lng, lat]
        state: 'Tamil Nadu',
        district: 'Chennai',
        baselineValue: 10.8
      },
      {
        stationId: 'DWLR-0004',
        name: 'Kolkata Groundwater Station',
        location: { type: 'Point', coordinates: [88.3639, 22.5726] }, // [lng, lat]
        state: 'West Bengal',
        district: 'Kolkata',
        baselineValue: 9.5
      },
      {
        stationId: 'DWLR-0005',
        name: 'Bangalore Urban Station',
        location: { type: 'Point', coordinates: [77.5946, 12.9716] }, // [lng, lat]
        state: 'Karnataka',
        district: 'Bangalore',
        baselineValue: 18.3
      }
    ];

    await Station.insertMany(stationsToCreate);
    console.log('✅ Core DWLR stations created successfully!');

    // 3. GENERATE READINGS FOR EACH STATION
    // This is VITAL for the color logic on the map
    console.log('Generating historical readings...');
    const allStations = await Station.find();
    const now = new Date();

    for (const station of allStations) {
      const readingsToCreate = [];
      
      // Generate 48 hours of data (one reading per hour)
      for (let hoursAgo = 48; hoursAgo >= 0; hoursAgo--) {
        const readingTimestamp = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));

        // Create a realistic water level that fluctuates around the baseline
        const fluctuation = (Math.random() - 0.5) * 4; // Random change ±2m
        const waterLevel = station.baselineValue + fluctuation;

        readingsToCreate.push({
          stationId: station.stationId,
          waterLevel: waterLevel,
          timestamp: readingTimestamp,
        });
      }
      // Insert all readings for this station
      await Reading.insertMany(readingsToCreate);
      console.log(`✅ ${readingsToCreate.length} readings added for ${station.stationId}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('The map markers will now change color based on their latest reading.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();