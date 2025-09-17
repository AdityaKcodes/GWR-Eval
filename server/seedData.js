// server/seedData.js - COMPLETE FIXED VERSION
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const Station = require('./models/Station');
const Reading = require('./models/Reading');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding...'))
.catch((err) => console.error('Seeding connection error:', err));

const getRandomFloat = (min, max, decimals = 2) => {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
};

// FIXED: Generate coordinates within India in [lat, lng] order
const getRandomIndianCoordinates = () => {
  // India's bounding box
  const minLat = 8.0;   // Southernmost point
  const maxLat = 35.0;  // Northernmost point
  const minLng = 68.0;  // Westernmost point
  const maxLng = 97.0;  // Easternmost point

  const lat = getRandomFloat(minLat, maxLat, 6);
  const lng = getRandomFloat(minLng, maxLng, 6);

  return [lat, lng]; // [latitude, longitude] for Leaflet
};

const indianStates = [
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 
  'Rajasthan', 'Gujarat', 'Punjab', 'West Bengal', 'Bihar',
  'Andhra Pradesh', 'Telangana', 'Kerala', 'Madhya Pradesh'
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clean existing data
    await Station.deleteMany({});
    await Reading.deleteMany({});
    console.log('Existing data cleaned.');

    // Generate stations
    const stationsToCreate = [];
    
    for (let i = 1; i <= 30; i++) {
      const state = faker.helpers.arrayElement(indianStates);
      const coordinates = getRandomIndianCoordinates(); // [lat, lng]

      stationsToCreate.push({
        stationId: `DWLR-${i.toString().padStart(3, '0')}`,
        name: `Groundwater Station ${i}`,
        location: {
          type: 'Point',
          coordinates: coordinates, // [lat, lng] format
        },
        state: state,
        district: faker.location.city(),
        baselineValue: getRandomFloat(5, 15),
      });
    }

    const createdStations = await Station.insertMany(stationsToCreate);
    console.log(`✅ ${createdStations.length} stations created successfully!`);

    // Generate readings
    const readingsToCreate = [];
    const now = new Date();

    for (const station of createdStations) {
      for (let h = 0; h < 24; h++) {
        const readingTimestamp = new Date(now);
        readingTimestamp.setHours(now.getHours() - h);

        const baseLevel = station.baselineValue;
        const randomWaterLevel = getRandomFloat(baseLevel - 2, baseLevel + 2);

        readingsToCreate.push({
          stationId: station.stationId,
          waterLevel: randomWaterLevel,
          timestamp: readingTimestamp,
        });
      }
    }

    await Reading.insertMany(readingsToCreate);
    console.log(`✅ ${readingsToCreate.length} readings created successfully!`);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();