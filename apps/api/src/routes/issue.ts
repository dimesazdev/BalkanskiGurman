import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';

const router = Router();
const prisma = new PrismaClient();

// GET all issues
router.get('/', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const result = await prisma.issue.findMany({
      include: {
        user: {
          include: {
            userRoles: {
              include: { role: true }
            },
            status: true,
            _count: {
              select: { reviews: true }
            }
          }
        },
        status: true,
        restaurant: {
          include: {
            images: true,
            address: true
          }
        }
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET one issue
router.get('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.issue.findUnique({
      where: { IssueId: id }
    });

    if (!result) {
      res.status(404).json({ error: 'Issue not found' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE issue
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      IssueType,
      Explanation,
      ReviewId,
      RestaurantId,
      PhotoUrl1,
      PhotoUrl2,
      PhotoUrl3
    } = req.body;

    const issue = await prisma.issue.create({
      data: {
        UserId: req.user.userId,
        IssueType,
        Explanation,
        ReviewId: ReviewId ?? null,
        RestaurantId: RestaurantId ?? null,
        PhotoUrl1: PhotoUrl1 ?? null,
        PhotoUrl2: PhotoUrl2 ?? null,
        PhotoUrl3: PhotoUrl3 ?? null,
        StatusId: 4, // 4 = pending
        CreatedAt: new Date()
      }
    });

    // Automatically mark the review as 'Requested Recheck'
    if (IssueType === 'Review Recheck' && ReviewId) {
      await prisma.review.update({
        where: { ReviewId },
        data: { StatusId: 7 } // 7 = Requested Recheck
      });
    }

    res.status(201).json({ message: 'Issue reported', issue });
  } catch (error) {
    console.error('Error reporting issue:', error);
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2003') {
      res.status(400).json({ error: 'Foreign key constraint failed (missing User, Review, or Restaurant)' });
      return;
    }
    res.status(400).json({ error: 'Issue report failed' });
    return;
  }
});


// UPDATE issue
router.put('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.issue.update({
      where: { IssueId: id },
      data: req.body
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(400).json({ error: 'Update failed or issue not found' });
  }
});

// DELETE issue
router.delete('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.issue.delete({
      where: { IssueId: id }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(409).json({ error: 'Cannot delete issue: it is referenced elsewhere.' });
    } else {
      console.error('Error deleting issue:', error);
      res.status(400).json({ error: 'Delete failed or issue not found' });
    }
  }
});

export default router;