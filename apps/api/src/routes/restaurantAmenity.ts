import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';

const router = Router();
const prisma = new PrismaClient();

// GET all restaurant-amenity mappings
router.get('/', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.restaurantAmenity.findMany();
    res.json(result);
  } catch (error) {
    console.error('Error fetching restaurant-amenity entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all amenities for a specific restaurant
router.get('/restaurant/:restaurantId', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.restaurantAmenity.findMany({
      where: { RestaurantId: Number(req.params.restaurantId) },
      include: { amenity: true }, // assumes relation is set in Prisma
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching amenities for restaurant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all restaurants that have a specific amenity
router.get('/amenity/:amenityId', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.restaurantAmenity.findMany({
      where: { AmenityId: Number(req.params.amenityId) },
      include: { restaurant: true }, // assumes relation is set in Prisma
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching restaurants for amenity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE new restaurant-amenity mapping
router.post('/', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.restaurantAmenity.create({ data: req.body });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating restaurant-amenity mapping:', error);
    res.status(400).json({ error: 'Invalid input or duplicate entry' });
  }
});

// UPDATE restaurant-amenity by composite key
router.put('/:restaurantId/:amenityId', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const { restaurantId, amenityId } = req.params;
    const result = await prisma.restaurantAmenity.update({
      where: {
        RestaurantId_AmenityId: {
          RestaurantId: Number(restaurantId),
          AmenityId: Number(amenityId),
        },
      },
      data: req.body,
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating restaurant-amenity mapping:', error);
    res.status(400).json({ error: 'Update failed or entry not found' });
  }
});

// DELETE restaurant-amenity by composite key
router.delete('/:restaurantId/:amenityId', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const { restaurantId, amenityId } = req.params;
    await prisma.restaurantAmenity.delete({
      where: {
        RestaurantId_AmenityId: {
          RestaurantId: Number(restaurantId),
          AmenityId: Number(amenityId),
        },
      },
    });

    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(409).json({ error: 'Cannot delete: mapping is referenced elsewhere.' });
    } else {
      console.error('Error deleting restaurant-amenity mapping:', error);
      res.status(400).json({ error: 'Delete failed or entry not found' });
    }
  }
});

export default router;