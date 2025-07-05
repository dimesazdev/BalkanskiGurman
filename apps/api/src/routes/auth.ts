import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail"
import { generateEmailTemplate } from "../utils/emailTemplates";

import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';

dotenv.config();
const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';
const SALT_ROUNDS = 10;

// Register
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
      profilePictureUrl,
      language
    } = req.body;

    type LangKey = 'en' | 'mk' | 'sl' | 'sr';
    const lang: LangKey = (language && ['en', 'mk', 'sl', 'sr'].includes(language)) ? language : "en";

    const existingUser = await prisma.user.findUnique({
      where: { Email: email }
    });

    if (existingUser) {
      res.status(409).json({ error: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const roleEntry = await prisma.role.findFirst({ where: { Name: 'User' } });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await prisma.user.create({
      data: {
        Email: email,
        PasswordHash: hashedPassword,
        Name: name,
        Surname: surname,
        PhoneNumber: phoneNumber || null,
        City: city || null,
        Country: country,
        ProfilePictureUrl: profilePictureUrl || '',
        EmailConfirmed: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpiresAt: verificationExpiresAt,
        StatusId: 1,
        BadgeLevel: 1,
        userRoles: {
          create: {
            RoleId: roleEntry?.RoleId || 'User',
          }
        }
      }
    });

    const translations = {
      en: {
        subject: "Confirm Your Email",
        body: "Thank you for registering. Please confirm your email by clicking the button below.",
        button: "Verify Email",
        disclaimer: "If you did not create an account, you can safely ignore this email.",
        footerNote: "© 2025 Balkanski Gurman - All rights reserved."
      },
      mk: {
        subject: "Потврдете ја вашата е-пошта",
        body: "Ви благодариме за регистрацијата. Ве молиме потврдете ја вашата е-пошта со кликање на копчето подолу.",
        button: "Потврди е-пошта",
        disclaimer: "Доколку не сте креирале профил, слободно занемарете го овој е-маил.",
        footerNote: "© 2025 Balkanski Gurman - Сите права се задржани."
      },
      sl: {
        subject: "Potrdite svoj e-poštni naslov",
        body: "Hvala za registracijo. Prosimo, potrdite svoj e-poštni naslov s klikom na spodnji gumb.",
        button: "Potrdi e-pošto",
        disclaimer: "Če niste ustvarili računa, lahko to e-pošto prezrete.",
        footerNote: "© 2025 Balkanski Gurman - Vse pravice pridržane."
      },
      sr: {
        subject: "Potvrdite vaš e-mail",
        body: "Hvala što ste se registrovali. Molimo potvrdite vaš e-mail klikom na dugme ispod.",
        button: "Potvrdi e-mail",
        disclaimer: "Ako niste kreirali nalog, možete slobodno ignorisati ovu poruku.",
        footerNote: "© 2025 Balkanski Gurman - Sva prava zadržana."
      },
    };

    const t = translations[lang] || translations.en;

    const link = `http://localhost:5173/verify-email?token=${verificationToken}`;

    const html = generateEmailTemplate({
      subject: t.subject,
      body: t.body,
      buttonText: t.button,
      buttonUrl: link,
      disclaimer: t.disclaimer,
      footerNote: t.footerNote,
    });

    await sendEmail({
      to: email,
      subject: t.subject,
      html,
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ error: "Token is required" });
    return;
  }

  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpiresAt: {
        gte: new Date()
      }
    }
  });

  if (!user) {
    res.status(400).json({ error: "Invalid or expired token" });
    return;
  }

  await prisma.user.update({
    where: { UserId: user.UserId },
    data: {
      EmailConfirmed: true,
      emailVerificationToken: null,
      emailVerificationExpiresAt: null
    }
  });

  res.json({ success: true });
});


// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { Email: email },
      include: {
        status: true,
        userRoles: {
          include: { role: true }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!user.EmailConfirmed) {
      res.status(403).json({ error: "Please confirm your email before logging in." });
      return;
    }

    if (user.status?.Name === "Banned") {
      res.status(403).json({ code: "BANNED_ACCOUNT" });
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
        role: user.userRoles?.[0]?.RoleId || 'User',
        status: user.status?.Name,
        suspendedUntil: user.SuspendedUntil
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

// Request password reset (email sending)
router.post("/request-password-reset", async (req, res) => {
  const { email, language } = req.body;
  type LangKey = 'en' | 'mk' | 'sl' | 'sr';
  const lang: LangKey = (language && ['en', 'mk', 'sl', 'sr'].includes(language)) ? language : "en";

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { Email: email },
  });

  if (!user) {
    res.json({ message: "If an account exists, a reset link has been sent." });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { UserId: user.UserId },
    data: {
      passwordResetToken: token,
      passwordResetExpiresAt: expires,
    },
  });

  const translations = {
    en: {
      subject: "Reset Your Password",
      body: "Click the button below to reset your password. This link expires in 1 hour.",
      button: "Reset Password",
      disclaimer: "If you did not request this, you can safely ignore this email.",
      footerNote: "© 2025 Balkanski Gurman - All rights reserved."
    },
    mk: {
      subject: "Ресетирај ја лозинката",
      body: "Кликнете на копчето подолу за да ја ресетирате вашата лозинка. Овој линк истекува за 1 час.",
      button: "Ресетирај лозинка",
      disclaimer: "Доколку не го побаравте ова, слободно занемарете го овој е-маил.",
      footerNote: "© 2025 Balkanski Gurman - Сите права се задржани."
    },
    sl: {
      subject: "Ponastavite geslo",
      body: "Kliknite spodnji gumb za ponastavitev gesla. Povezava poteče v 1 uri.",
      button: "Ponastavi geslo",
      disclaimer: "Če tega niste zahtevali, lahko to e-pošto prezrete.",
      footerNote: "© 2025 Balkanski Gurman - Vse pravice pridržane."
    },
    sr: {
      subject: "Resetujte lozinku",
      body: "Kliknite na dugme ispod da resetujete vašu lozinku. Ovaj link ističe za 1 sat.",
      button: "Resetuj lozinku",
      disclaimer: "Ako niste zatražili ovu poruku, možete je slobodno ignorisati.",
      footerNote: "© 2025 Balkanski Gurman - Sva prava zadržana."
    },
  };

  const t = translations[lang] || translations.en;

  const html = generateEmailTemplate({
    subject: t.subject,
    body: t.body,
    buttonText: t.button,
    buttonUrl: `http://localhost:5173/reset-password?token=${token}`,
    disclaimer: t.disclaimer,
    footerNote: t.footerNote,
  });

  await sendEmail({
    to: email,
    subject: t.subject,
    html,
  });

  res.json({ message: "If an account exists, a reset link has been sent." });
});

// Reset password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  if (newPassword !== confirmPassword) {
    res.status(400).json({ error: "Passwords do not match" });
    return;
  }

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpiresAt: {
        gte: new Date(),
      },
    },
  });

  if (!user) {
    res.status(400).json({ error: "Invalid or expired token" });
    return;
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { UserId: user.UserId },
    data: {
      PasswordHash: hashed,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  res.json({ message: "Password has been reset successfully." });
});


export default router;