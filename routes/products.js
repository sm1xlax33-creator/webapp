import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsPath = path.join(__dirname, '../data/products.json');

function read() { return JSON.parse(fs.readFileSync(productsPath, 'utf8')); }
function write(d) { fs.writeFileSync(productsPath, JSON.stringify(d, null, 2)); }

router.get('/', (_req, res) => {
  const products = read().filter(p => p.active !== false);
  res.set('Cache-Control', 'public, max-age=30');
  res.json(products);
});

router.get('/all', requireAdmin, (_req, res) => res.json(read()));

router.get('/:id', (req, res) => {
  const p = read().find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'غير موجود' });
  res.json(p);
});

router.post('/', requireAdmin, (req, res) => {
  const { name, price } = req.body || {};
  if (!name || price === undefined || Number(price) < 0)
    return res.status(400).json({ error: 'الاسم والسعر مطلوبان' });
  const product = { id: uuid(), name, price: Number(price), description: '', size: '', color: '', stock: 10, image: '', active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...req.body };
  const list = read();
  list.unshift(product);
  write(list);
  res.status(201).json(product);
});

router.put('/:id', requireAdmin, (req, res) => {
  const list = read();
  const i = list.findIndex(x => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'غير موجود' });
  list[i] = { ...list[i], ...req.body, id: list[i].id, createdAt: list[i].createdAt, updatedAt: new Date().toISOString() };
  write(list);
  res.json(list[i]);
});

router.delete('/:id', requireAdmin, (req, res) => {
  const list = read().filter(x => x.id !== req.params.id);
  write(list);
  res.json({ ok: true });
});

export default router;
