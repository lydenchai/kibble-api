import { Router } from 'express';
import { upload } from '../utils/cloudinary';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

// Allow single image upload for now
router.post('/', authenticate, authorizeRole('admin', 'staff'), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
  }
  res.status(200).json({ success: true, data: { url: req.file.path } });
});

export default router;
