import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/authenticate';
import requireRole from "../middleware/requireRole";

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

// GET all reviews
router.get('/', authenticate, requireRole("Admin"), async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            UserId: true,
            Name: true,
            Surname: true,
            City: true,
            Country: true,
            ProfilePictureUrl: true,
            StatusId: true,
            status: true,
            _count: { select: { reviews: true } }
          }
        },
        restaurant: {
          select: {
            Name: true,
            address: {
              select: {
                City: true,
                Country: true
              }
            },
            Details: true
          }
        },
        status: true
      },
      orderBy: {
        CreatedAt: 'desc'
      }
    });

    res.json(reviews);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPDATE own review
router.put('/:id', authenticate, async (req, res) => {
  try {
    const reviewId = Number(req.params.id);
    const review = await prisma.review.findUnique({
      where: { ReviewId: reviewId },
      select: { RestaurantId: true, UserId: true }
    });

    if (!review || review.UserId !== req.user.userId) {
      res.status(403).json({ error: 'You can only edit your own review' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Update review
      await tx.review.update({
        where: { ReviewId: reviewId },
        data: {
          ...req.body,
          IsEdited: true,
          EditedAt: new Date(),
          UpdatedAt: new Date()
        }
      });

      // Recalculate average
      const { _avg } = await tx.review.aggregate({
        where: { RestaurantId: review.RestaurantId },
        _avg: { Rating: true }
      });

      await tx.restaurant.update({
        where: { RestaurantId: review.RestaurantId },
        data: { AverageRating: _avg.Rating ?? 0 }
      });
    });

    res.json({ message: 'Review updated and average rating updated' });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(400).json({ error: 'Update failed' });
  }
});

// PUT Approve/Reject review (Admin action)
router.put('/:id/status', authenticate, requireRole("Admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const action = req.body.action as "approve" | "reject";

    const statusMap: Record<"approve" | "reject", number> = {
      approve: 5,
      reject: 6,
    };

    if (!(action in statusMap)) {
      res.status(400).json({ error: "Invalid action" });
      return;
    }

    const updated = await prisma.review.update({
      where: { ReviewId: id },
      data: {
        StatusId: statusMap[action],
        UpdatedAt: new Date(),
      },
      include: { status: true }
    });

    res.json(updated);
  } catch (err) {
    console.error("Status update failed:", err);
    res.status(500).json({ error: "Failed to update review status" });
  }
});

// DELETE own review
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const reviewId = Number(req.params.id);
    const review = await prisma.review.findUnique({
      where: { ReviewId: reviewId },
      select: { RestaurantId: true, UserId: true }
    });

    if (!review || review.UserId !== req.user.userId) {
      res.status(403).json({ error: 'You can only delete your own review' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { ReviewId: reviewId } });

      const { _avg } = await tx.review.aggregate({
        where: { RestaurantId: review.RestaurantId },
        _avg: { Rating: true }
      });

      await tx.restaurant.update({
        where: { RestaurantId: review.RestaurantId },
        data: { AverageRating: _avg.Rating ?? 0 }
      });
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(400).json({ error: 'Delete failed or review not found' });
  }
});

export default router;