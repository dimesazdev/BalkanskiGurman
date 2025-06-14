import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/authenticate';

const router = Router();
const prisma = new PrismaClient();

// GET all restaurant images (public)
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const restaurantId = Number(req.params.restaurantId);
    const images = await prisma.image.findMany({
      where: { RestaurantId: restaurantId }
    });
    res.json(images);
  } catch (error) {
    console.error('Error fetching restaurant images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all review images (public)
router.get('/review/:reviewId', async (req, res) => {
  try {
    const reviewId = Number(req.params.reviewId);
    const images = await prisma.review.findUnique({
      where: { ReviewId: reviewId },
      select: {
        PhotoUrl1: true,
        PhotoUrl2: true,
        PhotoUrl3: true
      }
    });
    res.json(images);
  } catch (error) {
    console.error('Error fetching review images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST image to restaurant (Admin or Owner only)
router.post('/restaurant/:restaurantId', authenticate, async (req, res) => {
  try {
    const restaurantId = Number(req.params.restaurantId);
    const restaurant = await prisma.restaurant.findUnique({ where: { RestaurantId: restaurantId } });

    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    const { userId, role } = req.user;
    const isAdmin = role === 'Admin';
    const isOwner = role === 'Owner' && restaurant.ClaimedByUserId === userId;

    if (!isAdmin && !isOwner) {
      res.status(403).json({ error: 'Not authorized to add images to this restaurant' });
      return;
    }

    const result = await prisma.image.create({
      data: {
        RestaurantId: restaurantId,
        Url: req.body.Url
      }
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error uploading restaurant image:', error);
    res.status(400).json({ error: 'Invalid data or image upload failed' });
  }
});

// DELETE restaurant image (Admin or Owner only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const imageId = Number(req.params.id);
    const image = await prisma.image.findUnique({ where: { ImageId: imageId } });

    if (!image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { RestaurantId: image.RestaurantId } });
    const { userId, role } = req.user;
    const isAdmin = role === 'Admin';
    const isOwner = role === 'Owner' && restaurant?.ClaimedByUserId === userId;

    if (!isAdmin && !isOwner) {
      res.status(403).json({ error: 'Not authorized to delete this image' });
      return;
    }

    await prisma.image.delete({ where: { ImageId: imageId } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(400).json({ error: 'Delete failed or image not found' });
  }
});

export default router;