import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';

const router = Router();
const prisma = new PrismaClient();

// GET all addresses
router.get('/', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.address.findMany();
    res.json(result);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET one address
router.get('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.address.findUnique({
      where: { AddressId: id }
    });

    if (!result) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE address
router.post('/', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.address.create({ data: req.body });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(400).json({ error: 'Invalid input or address already exists' });
  }
});

// UPDATE address
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.address.update({
      where: { AddressId: id },
      data: req.body
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(400).json({ error: 'Update failed or address not found' });
  }
});

// DELETE address
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.address.delete({
      where: { AddressId: id }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(409).json({ error: 'Cannot delete address: it is linked to one or more restaurants.' });
    } else {
      console.error('Error deleting address:', error);
      res.status(400).json({ error: 'Delete failed or address not found' });
    }
  }
});

export default router;