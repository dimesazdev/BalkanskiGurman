import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import cloudinary from '../utils/cloudinary';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload profile pcture
router.post('/profile-picture', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const filePath = path.resolve(req.file.path);

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'profile_pictures',
      use_filename: true,
      unique_filename: false,
    });

    fs.unlinkSync(filePath); // cleanup temp file

    res.status(200).json({ url: result.secure_url });
    return;
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
    return;
  }
});

// Upload review photos
router.post('/review-photos', upload.array('files', 3), async (req: Request, res: Response) => {
  try {
    if (!req.files || !(req.files instanceof Array)) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const results: string[] = [];

    for (const file of req.files) {
      const filePath = path.resolve(file.path);
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'review_photos',
        use_filename: true,
        unique_filename: false,
      });
      results.push(result.secure_url);
      fs.unlinkSync(filePath); // cleanup
    }

    res.status(200).json({ urls: results });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Upload restaurant photos
router.post('/restaurant-photos', upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    if (!req.files || !(req.files instanceof Array)) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const results: string[] = [];

    for (const file of req.files) {
      const filePath = path.resolve(file.path);
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'restaurant_photos',
        use_filename: true,
        unique_filename: false,
      });
      results.push(result.secure_url);
      fs.unlinkSync(filePath);
    }

    res.status(200).json({ urls: results });
    return;
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
    return;
  }
});

export default router;