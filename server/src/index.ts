import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { runGeminiSimulation } from './gemini.js';
import { findInfrastructure, geocodeArea } from './infrastructure.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && !process.env.GEMINI_API_KEY.includes('your_gemini_api_key'));
  res.json({
    status: 'healthy',
    service: 'Policy Impact Agent API',
    isLiveGeminiAvailable: hasApiKey,
    timestamp: new Date().toISOString()
  });
});

// Real-time geocoding endpoint for specific corridors & areas
app.get('/api/geocode', async (req, res) => {
  const query = String(req.query.query || '');
  const district = String(req.query.district || '');
  const city = String(req.query.city || '');
  const referenceLat = req.query.latitude ? Number(req.query.latitude) : undefined;
  const referenceLon = req.query.longitude ? Number(req.query.longitude) : undefined;

  if (!query.trim()) {
    return res.status(400).json({ error: 'Query parameter is required.' });
  }

  const result = await geocodeArea(query, district, city, referenceLat, referenceLon);
  res.json(result);
});

// Location-aware infrastructure lookup using OpenStreetMap/Overpass data.
app.get('/api/infrastructure', async (req, res) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);
  const district = String(req.query.district || 'Selected district');
  const area = String(req.query.area || '');
  const cityName = String(req.query.city || req.query.locationName || '');
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return res.status(400).json({ error: 'Valid latitude and longitude are required.' });
  }
  const result = await findInfrastructure(latitude, longitude, district, area, cityName);
  res.json(result);
});

// Primary simulation route
app.post('/api/simulate', async (req, res) => {
  try {
    const {
      description,
      location,
      district,
      city,
      town,
      village,
      area,
      locationName,
      latitude,
      longitude,
      selectedAsset,
      selectedAssetId,
      selectedAssetSource,
      duration,
      reason,
      department,
      constraints
    } = req.body;

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ error: 'Description is required in natural language.' });
    }

    console.log(`[API] Processing simulation request: "${description.substring(0, 50)}..."`);
    
    const result = await runGeminiSimulation({
      description,
      location,
      district,
      city,
      town,
      village,
      area,
      locationName,
      latitude,
      longitude,
      selectedAsset,
      selectedAssetId,
      selectedAssetSource,
      duration,
      reason,
      department,
      constraints
    });

    res.json(result);
  } catch (error: any) {
    console.error('[API] Simulation processing failed:', error);
    res.status(500).json({
      error: 'Failed to process policy simulation.',
      message: error?.message || 'Unknown server error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Policy Impact Agent Backend Running on Port ${PORT}`);
  console.log(`   Live Gemini API Key Present: ${Boolean(process.env.GEMINI_API_KEY)}`);
  console.log(`====================================================`);
});
