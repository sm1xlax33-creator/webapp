import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';
import { notifyOrder } from '../utils/notify.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ordersPath = path.join(__dirname, '../data/orders.json');
const productsPath = path.join(__dirname, '../data/products.json');

function readOrders() { return JSON.parse(fs.readFileSync(ordersPath, 'utf8')); }
function writeOrders(d) { fs.writeFileSync(ordersPath, JSON.stringify(d, null, 2)); }
function readProducts() { return JSON.parse(fs.readFileSync(productsPath, 'utf8')); }

router.post('/', async (req, res) => {
  try {
    const { customerName, phone, address, city, notes, items } = req.body || {};
    if (!customerName || !phone || !address || !Array.isArray(items) || !items.length)
      return res.status(400).json({ error: 'أكمل بيانات الطلب' });

    const catalog = readProducts();
    const normalized = [];
    let total = 0;

    for (const it of items) {
      const p = catalog.find(x => x.id === it.productId && x.active !== false);
      if (!p) return res.status(400).json({ error: `منتج غير متوفر` });
      const qty = Math.min(Math.max(parseInt(it.qty, 10) || 1, 1), 20);
      normalized.push({ productId: p.id, name: p.name, price: p.price, qty, size: it.size || p.size || '' });
      total += p.price * qty;
    }

    const order = {
      id: uuid(),
      customerName: String(customerName).slice(0, 80),
      phone: String(phone),
      address: String(address).slice(0, 300),
      city: String(city || '').slice(0, 80),
      notes: String(notes || '').slice(0, 500),
      paymentMethod: 'COD',
      status: 'pending',
      items: normalized,
      total,
      createdAt: new Date().toISOString(),
    };

    const orders = readOrders();
    orders.unshift(order);
    writeOrders(orders);

    // 🔔 إرسال إشعار إلى بوت تيليجرام (غير متزامن — لا يوقف الطلب)
    notifyOrder(order).catch(err => {
      console.error('❌ فشل إشعار تيليجرام:', err.message);
    });

    res.status(201).json({
      ok: true,
      orderId: order.id,
      total: order.total,
      message: 'تم استلام الطلب بنجاح ✓',
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'فشل إنشاء الطلب' });
  }
});

router.get('/', requireAdmin, (_req, res) => res.json(readOrders()));

router.patch('/:id/status', requireAdmin, (req, res) => {
  const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(req.body?.status))
    return res.status(400).json({ error: 'حالة غير صالحة' });
  const orders = readOrders();
  const i = orders.findIndex(o => o.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'الطلب غير موجود' });
  orders[i].status = req.body.status;
  orders[i].updatedAt = new Date().toISOString();
  writeOrders(orders);
  res.json(orders[i]);
});

export default router;
