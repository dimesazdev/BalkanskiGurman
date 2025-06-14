import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';

const router = Router();
const prisma = new PrismaClient();

// GET all users
router.get('/', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET one user
router.get('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { UserId: req.params.id },
      include: {
        _count: { select: { reviews: true } }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE user
router.post('/', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const user = await prisma.user.create({ data: req.body });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: 'Invalid input or user already exists' });
  }
});

// UPDATE user
router.put('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const updated = await prisma.user.update({
      where: { UserId: req.params.id },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: 'Update failed or user not found' });
  }
});

// DELETE user
router.delete('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    await prisma.user.delete({
      where: { UserId: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(400).json({ error: 'Delete failed or user not found' });
  }
});

export default router;