import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';

const router = Router();
const prisma = new PrismaClient();

// GET all amenities
router.get('/', async (req, res) => {
  try {
    const result = await prisma.amenity.findMany();
    res.json(result);
  } catch (error) {
    console.error('Error fetching amenities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET one amenity
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.amenity.findUnique({
      where: { AmenityId: id }
    });

    if (!result) {
      res.status(404).json({ error: 'Amenity not found' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching amenity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE amenity
router.post('/', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.amenity.create({ data: req.body });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating amenity:', error);
    res.status(400).json({ error: 'Invalid input or duplicate amenity' });
  }
});

// UPDATE amenity
router.put('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.amenity.update({
      where: { AmenityId: id },
      data: req.body
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating amenity:', error);
    res.status(400).json({ error: 'Update failed or amenity not found' });
  }
});

// DELETE amenity
router.delete('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.amenity.delete({
      where: { AmenityId: id }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(409).json({ error: 'Cannot delete amenity: it is linked to one or more restaurants.' });
    } else {
      console.error('Error deleting amenity:', error);
      res.status(400).json({ error: 'Delete failed or amenity not found' });
    }
  }
});

export default router;