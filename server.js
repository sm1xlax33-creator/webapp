import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import fileUpload from 'express-fileupload';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import uploadRoutes from './routes/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const adminPath = path.join(dataDir, 'admin.json');
const productsPath = path.join(dataDir, 'products.json');
const ordersPath = path.join(dataDir, 'orders.json');

async function initData() {
  if (!fs.existsSync(adminPath)) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'MhShop@2026', 12);
    fs.writeFileSync(adminPath, JSON.stringify({ username: process.env.ADMIN_USER || 'admin', passwordHash: hash }, null, 2));
    console.log('✅ تم إنشاء admin.json');
  }
  if (!fs.existsSync(productsPath)) fs.writeFileSync(productsPath, '[]');
  if (!fs.existsSync(ordersPath)) fs.writeFileSync(ordersPath, '[]');
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(fileUpload({ limits: { fileSize: 3 * 1024 * 1024 }, abortOnLimit: true, responseOnLimit: 'Image too large' }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many attempts' } });
const orderLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, message: { error: 'Too many orders' } });

app.use(generalLimiter);
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', etag: true }));

app.get('/api/health', (_, res) => res.json({ ok: true, name: 'MH Shop API' }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderLimiter, orderRoutes);
app.use('/api/upload', uploadRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

await initData();
app.listen(PORT, () => console.log(`🚀 MH Shop API → http://localhost:${PORT}`));
