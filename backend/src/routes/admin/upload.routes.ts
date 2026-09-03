// backend/src/routes/admin/upload.routes.ts
// Single image upload endpoint for admin flows (products, categories, etc.)
// Files are saved to the local uploads dir and served back at /uploads/<filename>.

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, authorizeAdmin } from '../../middleware/auth.middleware';

const router = express.Router();

// Only admins may upload files to the server
router.use(authenticate);
router.use(authorizeAdmin);

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_PATH || './uploads');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  }
});

const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB default

const upload = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Validate both the declared MIME type AND the file extension (MIME can be spoofed).
    if (ALLOWED_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'));
  }
});

// POST /api/admin/upload  (multipart/form-data, field name: "image")
router.post('/', (req, res) => {
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? `File too large. Maximum size is ${Math.floor(maxSize / (1024 * 1024))}MB.`
          : err.message || 'Upload failed';
      return res.status(400).json({ success: false, message });
    }

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file received. Upload with a file field named "image".'
      });
    }

    // Absolute URL so the stored value works when rendered from the frontend origin.
    const origin = `${req.protocol}://${req.get('host')}`;
    const url = `${origin}/uploads/${file.filename}`;

    return res.status(201).json({
      success: true,
      url,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype
    });
  });
});

export default router;
