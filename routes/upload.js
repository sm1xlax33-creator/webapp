import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../uploads');

router.post('/', requireAdmin, async (req, res) => {
  try {
    if (!req.files || !req.files.image)
      return res.status(400).json({ error: 'اختر صورة' });
    const file = req.files.image;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype))
      return res.status(400).json({ error: 'نوع غير مدعوم (JPG, PNG, WebP, GIF)' });
    if (file.size > 3 * 1024 * 1024)
      return res.status(400).json({ error: 'أكبر من 3MB' });
    const ext = path.extname(file.name).toLowerCase() || '.jpg';
    const filename = `${uuid()}${ext}`;
    await file.mv(path.join(uploadsDir, filename));
    res.json({ url: `/uploads/${filename}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'فشل رفع الصورة' });
  }
});

export default router;
