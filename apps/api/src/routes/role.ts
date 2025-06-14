import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';

const router = Router();
const prisma = new PrismaClient();

// GET all roles
router.get('/', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.role.findMany();
    res.json(result);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET one role
router.get('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.role.findUnique({
      where: { RoleId: req.params.id }
    });

    if (!result) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE role
router.post('/', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.role.create({ data: req.body });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(400).json({ error: 'Invalid input or role already exists' });
  }
});

// UPDATE role
router.put('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.role.update({
      where: { RoleId: req.params.id },
      data: req.body
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(400).json({ error: 'Update failed or role not found' });
  }
});

// DELETE role
router.delete('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    await prisma.role.delete({
      where: { RoleId: req.params.id }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(409).json({ error: 'Cannot delete role: it is in use by one or more users.' });
    } else {
      console.error('Error deleting role:', error);
      res.status(400).json({ error: 'Delete failed or role not found' });
    }
  }
});

export default router;