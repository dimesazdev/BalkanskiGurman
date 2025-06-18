import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';

dotenv.config();
const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';
const SALT_ROUNDS = 10;

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      surname,
      phoneNumber,
      city,
      country,
      profilePictureUrl
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { Email: email }
    });

    if (existingUser) {
      res.status(409).json({ error: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const roleEntry = await prisma.role.findFirst({ where: { Name: 'User' } });

    const newUser = await prisma.user.create({
      data: {
        Email: email,
        PasswordHash: hashedPassword,
        Name: name,
        Surname: surname,
        PhoneNumber: phoneNumber || null,
        City: city,
        Country: country,
        ProfilePictureUrl: profilePictureUrl || '',
        EmailConfirmed: true,
        StatusId: 1,
        BadgeLevel: 1,
        userRoles: {
          create: {
            RoleId: roleEntry?.RoleId || 'User',
          }
        }
      }
    });

    res.status(201).json({ message: 'User registered successfully' });
    return;

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { Email: email },
      include: {
        userRoles: {
          include: { role: true }
        }
      }
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.PasswordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const roles = user.userRoles.map(ur => ur.role.NormalizedName);
    const token = jwt.sign(
      {
        userId: user.UserId,
        role: roles[0],       
        roles: roles           
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.UserId,
        name: user.Name,
        surname: user.Surname,
        profilePicture: user.ProfilePictureUrl,
        role: user.userRoles?.[0]?.RoleId || 'User'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { UserId: req.user.userId },
      include: {
        _count: {
          select: { reviews: true }
        },
        userRoles: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update current user profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, surname, phoneNumber, city, country, profilePictureUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { UserId: req.user.userId },
      data: {
        Name: name,
        Surname: surname,
        PhoneNumber: phoneNumber,
        City: city,
        Country: country,
        ProfilePictureUrl: profilePictureUrl
      },
      include: {
        _count: {
          select: { reviews: true }
        }
      }
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.patch('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: 'New passwords do not match' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { UserId: req.user.userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, user.PasswordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { UserId: req.user.userId },
      data: { PasswordHash: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;