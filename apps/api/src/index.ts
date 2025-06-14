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

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

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

app.listen(port, () => {
  console.log(`\u{1F680} API running on http://localhost:${port}`);
});