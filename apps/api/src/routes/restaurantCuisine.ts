import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';

const router = Router();
const prisma = new PrismaClient();

// GET all restaurant-cuisine mappings
router.get('/', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.restaurantCuisine.findMany();
    res.json(result);
  } catch (error) {
    console.error('Error fetching restaurant-cuisine entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all cuisines for a specific restaurant
router.get('/restaurant/:restaurantId', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.restaurantCuisine.findMany({
      where: { RestaurantId: Number(req.params.restaurantId) },
      include: { cuisine: true }, 
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching cuisines for restaurant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all restaurants with a specific cuisine
router.get('/cuisine/:cuisineId', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.restaurantCuisine.findMany({
      where: { CuisineId: Number(req.params.cuisineId) },
      include: { restaurant: true },
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching restaurants for cuisine:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE restaurant-cuisine mapping
router.post('/', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.restaurantCuisine.create({ data: req.body });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating restaurant-cuisine mapping:', error);
    res.status(400).json({ error: 'Invalid input or duplicate entry' });
  }
});

// UPDATE restaurant-cuisine by composite key
router.put('/:restaurantId/:cuisineId', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const { restaurantId, cuisineId } = req.params;
    const result = await prisma.restaurantCuisine.update({
      where: {
        RestaurantId_CuisineId: {
          RestaurantId: Number(restaurantId),
          CuisineId: Number(cuisineId),
        },
      },
      data: req.body,
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating restaurant-cuisine mapping:', error);
    res.status(400).json({ error: 'Update failed or entry not found' });
  }
});

// DELETE restaurant-cuisine by composite key
router.delete('/:restaurantId/:cuisineId', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const { restaurantId, cuisineId } = req.params;
    await prisma.restaurantCuisine.delete({
      where: {
        RestaurantId_CuisineId: {
          RestaurantId: Number(restaurantId),
          CuisineId: Number(cuisineId),
        },
      },
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(409).json({ error: 'Cannot delete: mapping is referenced elsewhere.' });
    } else {
      console.error('Error deleting restaurant-cuisine mapping:', error);
      res.status(400).json({ error: 'Delete failed or entry not found' });
    }
  }
});

export default router;