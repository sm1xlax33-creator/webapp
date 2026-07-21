import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminPath = path.join(__dirname, '../data/admin.json');

function readAdmin() {
  return JSON.parse(fs.readFileSync(adminPath, 'utf8'));
}

router.post('/login', async (req, res) => {
  try {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');

    if (!username || !password) {
      return res.status(400).json({ error: 'أدخل اسم المستخدم وكلمة المرور' });
    }

    const admin = readAdmin();
    if (username !== admin.username) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }

    const token = jwt.sign(
      { role: 'admin', username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { username: admin.username, role: 'admin' },
      expiresIn: 8 * 60 * 60,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'فشل تسجيل الدخول' });
  }
});

router.get('/me', requireAdmin, (req, res) => {
  res.json({ username: req.admin.username, role: 'admin' });
});

export default router;
