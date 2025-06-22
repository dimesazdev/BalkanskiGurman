import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';

const router = Router();
const prisma = new PrismaClient();

// GET all restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        cuisines: { include: { cuisine: true } },
        amenities: { include: { amenity: true } },
        workingHours: {
          select: {
            DayOfWeek: true,
            OpenHour: true,
            OpenMinute: true,
            CloseHour: true,
            CloseMinute: true,
            IsClosed: true
          }
        },
        images: true,
        reviews: true
      }
    });

    const transformed = restaurants.map(r => ({
      RestaurantId: r.RestaurantId,
      Name: r.Name,
      PriceRange: r.PriceRange,
      AverageRating: r.AverageRating,
      Details: r.Details,
      IsClaimed: r.IsClaimed,
      cuisines: r.cuisines.map(rc => rc.cuisine),
      amenities: r.amenities.map(ra => ra.amenity),
      workingHours: r.workingHours,
      images: r.images,
      reviews: r.reviews
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET one restaurant
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const restaurant = await prisma.restaurant.findUnique({
      where: { RestaurantId: id },
      include: {
        cuisines: { include: { cuisine: true } },
        amenities: { include: { amenity: true } },
        workingHours: true,
        address: true,
        images: true,
        reviews: { include: { user: true } }
      }
    });

    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE a restaurant
router.post('/', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const restaurant = await prisma.restaurant.create({
      data: {
        ...req.body,
        AverageRating: 0,
        IsClaimed: false
      }
    });
    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(400).json({ error: 'Invalid input or related entity missing' });
  }
});

// Update restaurant
router.put('/:id', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const restaurant = await prisma.restaurant.findUnique({
      where: { RestaurantId: id }
    });

    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    const { userId, role } = req.user;

    const isAdmin = role === 'ADMIN';
    const isOwner = role === 'OWNER' && restaurant.ClaimedByUserId === userId;

    if (!isAdmin && !isOwner) {
      res.status(403).json({ error: 'Not authorized to update this restaurant' });
      return;
    }

    const updated = await prisma.restaurant.update({
      where: { RestaurantId: id },
      data: req.body
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(400).json({ error: 'Update failed or restaurant not found' });
  }
});

// DELETE a restaurant
router.delete('/:id', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const restaurant = await prisma.restaurant.findUnique({
      where: { RestaurantId: id },
      select: { AddressId: true }
    });

    await prisma.$transaction([
      prisma.restaurant.update({
        where: { RestaurantId: id },
        data: {
          cuisines: { deleteMany: {} },
          amenities: { deleteMany: {} },
          workingHours: { deleteMany: {} },
          images: { deleteMany: {} },
        },
      }),
      prisma.restaurant.delete({
        where: { RestaurantId: id },
      }),
      prisma.address.delete({
        where: { AddressId: restaurant?.AddressId }
      })
    ]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(400).json({ error: 'Delete failed or restaurant not found' });
  }
});

// CREATE a review for a restaurant and update AverageRating
router.post('/:id/reviews', authenticate, async (req, res) => {
  try {
    const restaurantId = Number(req.params.id);
    const { rating, comment, photoUrl1, photoUrl2, photoUrl3 } = req.body;

    await prisma.$transaction(async (tx) => {
      // 1. Create the review
      await tx.review.create({
        data: {
          RestaurantId: restaurantId,
          UserId: req.user.userId,
          Rating: Number(rating),
          Comment: comment,
          PhotoUrl1: photoUrl1 || null,
          PhotoUrl2: photoUrl2 || null,
          PhotoUrl3: photoUrl3 || null,
          CreatedAt: new Date(),
          UpdatedAt: new Date(),
          IsEdited: false,
          StatusId: 1
        }
      });

      // 2. Recalculate the average
      const { _avg } = await tx.review.aggregate({
        where: { RestaurantId: restaurantId },
        _avg: { Rating: true }
      });

      // 3. Update the restaurant's average rating
      await tx.restaurant.update({
        where: { RestaurantId: restaurantId },
        data: { AverageRating: _avg.Rating ?? 0 }
      });
    });

    res.status(201).json({ message: 'Review created and average updated' });
  } catch (error) {
    console.error('Error creating review or updating average:', error);
    res.status(400).json({ error: 'Invalid input or related entity missing' });
  }
});

// GET all reviews for a restaurant
router.get('/:id/reviews', async (req, res) => {
  try {
    const restaurantId = Number(req.params.id);
    const reviews = await prisma.review.findMany({
      where: { RestaurantId: restaurantId },
      include: {
        user: {
          select: {
            UserId: true,
            Name: true,
            Surname: true,
            ProfilePictureUrl: true,
            City: true,
            Country: true,
            _count: { select: { reviews: true } }
          }
        }
      }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;