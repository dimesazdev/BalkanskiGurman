import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET all working hours
router.get('/', async (req, res) => {
  try {
    const result = await prisma.workingHours.findMany();
    res.json(result);
  } catch (error) {
    console.error('Error fetching working hours:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET one working hour entry
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.workingHours.findUnique({
      where: { WorkingHoursId: id }
    });

    if (!result) {
      res.status(404).json({ error: 'Working hours entry not found' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching working hours entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE working hours
router.post('/', async (req, res) => {
  try {
    const result = await prisma.workingHours.create({ data: req.body });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating working hours:', error);
    res.status(400).json({ error: 'Invalid input or related restaurant missing' });
  }
});

// UPDATE working hours
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.workingHours.update({
      where: { WorkingHoursId: id },
      data: req.body
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating working hours:', error);
    res.status(400).json({ error: 'Update failed or working hours entry not found' });
  }
});

// DELETE working hours
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.workingHours.delete({
      where: { WorkingHoursId: id }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(409).json({ error: 'Cannot delete: entry is referenced elsewhere.' });
    } else {
      console.error('Error deleting working hours:', error);
      res.status(400).json({ error: 'Delete failed or working hours entry not found' });
    }
  }
});

export default router;