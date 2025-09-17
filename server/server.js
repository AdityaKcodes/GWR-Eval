const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

// Models
const Station = require('./models/Station');
const Reading = require('./models/Reading');
const User = require('./models/User');

// Routes
const stationRoutes = require('./routes/stationRoutes');
const readingRoutes = require('./routes/readingRoutes');
const exportRoutes = require('./routes/exportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const authRoutes = require('./routes/authRoutes');
const stationStatusRoutes = require('./routes/stationStatusRoutes');

// Middleware
const { auth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.io 
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// MongoDB 
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jal-darpan', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully! 🗄️');
  generateTestData(); 
})
.catch((err) => console.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});


app.set('io', io);

app.use('/api/export', exportRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/stations-with-status', stationStatusRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
  res.send('Hello from Jal Darpan Server! API routes are active.');
});

app.get('/api/public-test', (req, res) => {
  res.json({ 
    message: 'Public API is working!', 
    timestamp: new Date(),
    status: 'OK'
  });
});


app.get('/api/private-test', auth, (req, res) => {
  res.json({ 
    message: 'Private API is working!', 
    timestamp: new Date(),
    status: 'AUTHENTICATED',
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

app.get('/api/debug/station/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    
    // if station exists
    const station = await Station.findOne({ stationId });
    if (!station) {
      return res.json({ 
        success: false, 
        message: `Station ${stationId} not found in database` 
      });
    }
    
    // if readings exist
    const readings = await Reading.find({ stationId }).limit(5);
    
    res.json({
      success: true,
      stationExists: true,
      station: {
        id: station._id,
        stationId: station.stationId,
        name: station.name,
        baseline: station.baselineValue
      },
      readingsCount: await Reading.countDocuments({ stationId }),
      recentReadings: readings
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.get('/api/stations-test', async (req, res) => {
  try {
    const stations = await Station.find().limit(5);
    res.json({
      success: true,
      message: 'Stations API test',
      count: stations.length,
      stations: stations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/export/test', async (req, res) => {
  try {
    
    const testData = [
      { stationId: 'TEST-001', waterLevel: 12.5, timestamp: new Date() },
      { stationId: 'TEST-001', waterLevel: 12.8, timestamp: new Date(Date.now() - 3600000) },
      { stationId: 'TEST-001', waterLevel: 13.1, timestamp: new Date(Date.now() - 7200000) }
    ];

    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=test_export.csv');
    res.send('stationId,waterLevel,timestamp\n' +
      testData.map(d => `${d.stationId},${d.waterLevel},${d.timestamp.toISOString()}`).join('\n'));
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.post('/api/test-setup', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, error: 'Not allowed in production' });
  }

  try {
    
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'researcher',
      organization: 'Test Organization'
    });

    await testUser.save();

    
    const testStations = [
      {
        stationId: 'DWLR-0001',
        name: 'Mumbai Central Station',
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760] // [lng, lat]
        },
        state: 'Maharashtra',
        district: 'Mumbai',
        baselineValue: 12.5
      },
      {
        stationId: 'DWLR-0002',
        name: 'Delhi Monitoring Station',
        location: {
          type: 'Point',
          coordinates: [77.1025, 28.7041] // [lng, lat]
        },
        state: 'Delhi',
        district: 'New Delhi',
        baselineValue: 15.2
      }
    ];

    await Station.insertMany(testStations);

    res.json({
      success: true,
      message: 'Test data created successfully',
      user: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start the simulation 
const startSimulation = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🚀 Starting real-time data simulation...');
    
    // Simulate data every 5 seconds
    setInterval(async () => {
      try {
        const stations = await Station.find();
        
        if (stations.length === 0) {
          console.log('No stations found for simulation');
          return;
        }

        const randomStation = stations[Math.floor(Math.random() * stations.length)];
        const fluctuation = (Math.random() - 0.5) * 4;
        const newWaterLevel = randomStation.baselineValue + fluctuation;

        const newReading = new Reading({
          stationId: randomStation.stationId,
          waterLevel: newWaterLevel,
          timestamp: new Date()
        });

        await newReading.save();

        
        const percentageDifference = ((newWaterLevel - randomStation.baselineValue) / randomStation.baselineValue) * 100;
        const isCritical = percentageDifference > 20;
        const isWarning = percentageDifference > 10 && percentageDifference <= 20;

        
        io.emit('new-reading', {
          stationId: randomStation.stationId,
          waterLevel: newWaterLevel,
          timestamp: new Date(),
          isCritical,
          isWarning
        });

        console.log(`📊 ${randomStation.stationId}: ${newWaterLevel.toFixed(2)}m ${isCritical ? '🚨 CRITICAL' : isWarning ? '⚠️ WARNING' : '✅ OK'}`);

      } catch (error) {
        console.error('Error in simulateNewReading:', error);
      }
    }, 5000); 
  }
};

const generateTestData = async () => {
  try {
    
    const stationCount = await Station.countDocuments();
    if (stationCount === 0) {
      console.log('❌ No stations found in database');
      return;
    }

    
    const readingCount = await Reading.countDocuments();
    if (readingCount > 0) {
      console.log(`✅ Already have ${readingCount} readings in database`);
      return;
    }

    console.log('📝 Generating test data...');
    
    
    const stations = await Station.find();
    
    
    for (const station of stations) {
      const readings = [];
      const now = new Date();
      
      
      for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() - (i * 3600000)); 
        const fluctuation = (Math.random() - 0.5) * 2; 
        const waterLevel = station.baselineValue + fluctuation;
        
        readings.push({
          stationId: station.stationId,
          waterLevel: parseFloat(waterLevel.toFixed(2)),
          timestamp: timestamp
        });
      }
      
      await Reading.insertMany(readings);
      console.log(`✅ Generated ${readings.length} readings for station ${station.stationId}`);
    }
    
    console.log('✅ Test data generation completed');
  } catch (error) {
    console.error('❌ Error generating test data:', error);
  }
};

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT}/api/test-setup to create test data`);
  startSimulation();
});

module.exports = { app, server, io };