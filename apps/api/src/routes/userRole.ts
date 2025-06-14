import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET all user-role mappings
router.get('/', async (req, res) => {
  try {
    const result = await prisma.userRole.findMany();
    res.json(result);
  } catch (error) {
    console.error('Error fetching user-role mappings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all roles for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const result = await prisma.userRole.findMany({
      where: { UserId: req.params.userId },
      include: { role: true }, // assumes role relation is defined
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching roles for user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all users for a specific role
router.get('/role/:roleId', async (req, res) => {
  try {
    const result = await prisma.userRole.findMany({
      where: { RoleId: req.params.roleId },
      include: { user: true }, // assumes user relation is defined
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching users for role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE user-role mapping
router.post('/', async (req, res) => {
  try {
    const result = await prisma.userRole.create({ data: req.body });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating user-role mapping:', error);
    res.status(400).json({ error: 'Invalid input or duplicate entry' });
  }
});

// UPDATE user-role mapping (composite key)
router.put('/:userId/:roleId', async (req, res) => {
  try {
    const { userId, roleId } = req.params;
    const result = await prisma.userRole.update({
      where: {
        UserId_RoleId: { UserId: userId, RoleId: roleId },
      },
      data: req.body,
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating user-role mapping:', error);
    res.status(400).json({ error: 'Update failed or entry not found' });
  }
});

// DELETE user-role mapping (composite key)
router.delete('/:userId/:roleId', async (req, res) => {
  try {
    const { userId, roleId } = req.params;
    await prisma.userRole.delete({
      where: {
        UserId_RoleId: { UserId: userId, RoleId: roleId },
      },
    });

    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(409).json({ error: 'Cannot delete: mapping is referenced elsewhere' });
    } else {
      console.error('Error deleting user-role mapping:', error);
      res.status(400).json({ error: 'Delete failed or entry not found' });
    }
  }
});

export default router;