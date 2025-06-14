import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/authenticate';

const router = Router();
const prisma = new PrismaClient();

// GET single review by ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const review = await prisma.review.findUnique({
      where: { ReviewId: id },
      include: { user: true, restaurant: true }
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE own review
router.put('/:id', authenticate, async (req, res) => {
  try {
    const reviewId = Number(req.params.id);
    const review = await prisma.review.findUnique({ where: { ReviewId: reviewId } });

    if (!review || review.UserId !== req.user.userId) {
      res.status(403).json({ error: 'You can only edit your own review' });
      return;
    }

    const updated = await prisma.review.update({
      where: { ReviewId: reviewId },
      data: { ...req.body, IsEdited: true, UpdatedAt: new Date() }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(400).json({ error: 'Update failed' });
  }
});

// DELETE own review
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const reviewId = Number(req.params.id);
    const review = await prisma.review.findUnique({ where: { ReviewId: reviewId } });

    if (!review || review.UserId !== req.user.userId) {
      res.status(403).json({ error: 'You can only delete your own review' });
      return;
    }

    await prisma.review.delete({ where: { ReviewId: reviewId } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(400).json({ error: 'Delete failed or review not found' });
  }
});

export default router;