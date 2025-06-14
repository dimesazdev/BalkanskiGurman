import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import cloudinary from '../utils/cloudinary';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

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

export default router;