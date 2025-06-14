import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';

const router = Router();
const prisma = new PrismaClient();

// GET all statuses
router.get('/', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.status.findMany();
    res.json(result);
  } catch (error) {
    console.error('Error fetching statuses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET one status
router.get('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.status.findUnique({
      where: { StatusId: id }
    });

    if (!result) {
      res.status(404).json({ error: 'Status not found' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE status
router.post('/', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.status.create({ data: req.body });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating status:', error);
    res.status(400).json({ error: 'Invalid input or status already exists' });
  }
});

// UPDATE status
router.put('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.status.update({
      where: { StatusId: id },
      data: req.body
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(400).json({ error: 'Update failed or status not found' });
  }
});

// DELETE status
router.delete('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.status.delete({
      where: { StatusId: id }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(409).json({ error: 'Cannot delete status: it is in use by one or more users.' });
    } else {
      console.error('Error deleting status:', error);
      res.status(400).json({ error: 'Delete failed' });
    }
  }
});

export default router;