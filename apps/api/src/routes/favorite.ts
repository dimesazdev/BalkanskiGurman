import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/authenticate';

const router = Router();
const prisma = new PrismaClient();

// Get all favorites for the logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { UserId: req.user.userId },
      include: {
        restaurant: {
          include: {
            cuisines: {
              include: {
                cuisine: true
              }
            },
            amenities: {
              include: {
                amenity: true
              }
            },
            images: true,
            workingHours: true
          }
        }
      }
    });
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new favorite for the logged-in user
router.post('/', authenticate, async (req, res) => {
  try {
    const { RestaurantId } = req.body;
    const favorite = await prisma.favorite.create({
      data: {
        UserId: req.user.userId,
        RestaurantId
      }
    });
    res.status(201).json(favorite);
  } catch (error) {
    console.error('Error creating favorite:', error);
    res.status(400).json({ error: 'Invalid request or duplicate favorite' });
  }
});

// Delete a favorite
router.delete('/by-restaurant/:restaurantId', authenticate, async (req, res) => {
  try {
    const restaurantId = Number(req.params.restaurantId);

    await prisma.favorite.deleteMany({
      where: {
        UserId: req.user.userId,
        RestaurantId: restaurantId
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting favorite:', error);
    res.status(400).json({ error: 'Delete failed or favorite not found' });
  }
});

export default router;
