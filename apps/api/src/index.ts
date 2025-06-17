import express from 'express';
import { PrismaClient } from '@prisma/client';
import bodyParser from 'body-parser';
import userRoutes from './routes/user';
import restaurantRoutes from './routes/restaurant';
import reviewRoutes from './routes/review';
import statusRoutes from './routes/status';
import roleRoutes from './routes/role';
import cuisineRoutes from './routes/cuisine';
import amenityRoutes from './routes/amenity';
import addressRoutes from './routes/address';
import imageRoutes from './routes/image';
import workingHoursRoutes from './routes/workingHours';
import issueRoutes from './routes/issue';
import favoriteRoutes from './routes/favorite';
import userRoleRoutes from './routes/userRole';
import restaurantAmenityRoutes from './routes/restaurantAmenity';
import restaurantCuisineRoutes from './routes/restaurantCuisine';
import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;
dotenv.config();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, 
}));

app.use(bodyParser.json());

app.use('/users', userRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/reviews', reviewRoutes);
app.use('/statuses', statusRoutes);
app.use('/roles', roleRoutes);
app.use('/cuisines', cuisineRoutes);
app.use('/amenities', amenityRoutes);
app.use('/addresses', addressRoutes);
app.use('/images', imageRoutes);
app.use('/working-hours', workingHoursRoutes);
app.use('/issues', issueRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/user-roles', userRoleRoutes);
app.use('/restaurant-amenities', restaurantAmenityRoutes);
app.use('/restaurant-cuisines', restaurantCuisineRoutes);
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);

app.post('/translate', async (req, res) => {
  const { text, to } = req.body;

  if (!text || !to) {
    res.status(400).json({ error: 'Missing "text" or "to" in request body' });
    return;
  }

  try {
    const azureKey = process.env.AZURE_TRANSLATOR_KEY;
    const region = process.env.AZURE_TRANSLATOR_REGION;
    const endpoint = 'https://api.cognitive.microsofttranslator.com/translate';
    const url = `${endpoint}?api-version=3.0&to=${to}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey!,
        'Ocp-Apim-Subscription-Region': region!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{ Text: text }])
    });

    const result = await response.json();

    if (!Array.isArray(result)) {
      res.status(500).json({ error: 'Unexpected response from Azure Translator' });
      return;
    }

    const translatedText = result[0]?.translations?.[0]?.text || text;
    const detectedLanguage = result[0]?.detectedLanguage?.language || null;

    res.json({ translatedText, detectedLanguage });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

app.listen(port, () => {
  console.log(`\u{1F680} API running on http://localhost:${port}`);
});