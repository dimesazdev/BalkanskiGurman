import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';

const router = Router();
const prisma = new PrismaClient();

// GET all cuisines
router.get('/', async (req, res) => {
  try {
    const result = await prisma.cuisine.findMany();
    res.json(result);
  } catch (error) {
    console.error('Error fetching cuisines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET one cuisine
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.cuisine.findUnique({
      where: { CuisineId: id }
    });

    if (!result) {
      res.status(404).json({ error: 'Cuisine not found' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching cuisine:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE cuisine
router.post('/', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.cuisine.create({ data: req.body });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating cuisine:', error);
    res.status(400).json({ error: 'Invalid input or duplicate cuisine' });
  }
});

// UPDATE cuisine
router.put('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.cuisine.update({
      where: { CuisineId: id },
      data: req.body
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating cuisine:', error);
    res.status(400).json({ error: 'Update failed or cuisine not found' });
  }
});

// DELETE cuisine
router.delete('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.cuisine.delete({
      where: { CuisineId: id }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(409).json({ error: 'Cannot delete cuisine: it is linked to one or more restaurants.' });
    } else {
      console.error('Error deleting cuisine:', error);
      res.status(400).json({ error: 'Delete failed or cuisine not found' });
    }
  }
});

export default router;