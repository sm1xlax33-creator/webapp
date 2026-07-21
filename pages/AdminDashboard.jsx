import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, mediaUrl, setToken } from '../api';

export default function AdminDashboard() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', description: '', size: '', color: '', stock: 10, image: '', active: true });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => { const [p, o] = await Promise.all([api.productsAll(), api.orders()]); setProducts(p); setOrders(o); };

  useEffect(() => {
    api.me().then(() => load().then(() => setReady(true))).catch(() => { setToken(''); nav('/admin/login', { replace: true }); });
  }, [nav]);

  const logout = () => { setToken(''); nav('/admin/login', { replace: true }); };

  const save = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    try {
      const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editId) await api.updateProduct(editId, body); else await api.createProduct(body);
      setForm({ name: '', price: '', description: '', size: '', color: '', stock: 10, image: '', active: true });
      setEditId(null); setMsg(editId ? 'تم التحديث' : 'تمت الإضافة'); await load();
    } catch (ex) { setErr(ex.message); }
  };

  const startEdit = (p) => {
    setEditId(p.id); setForm({ name: p.name, price: p.price, description: p.description || '', size: p.size || '', color: p.color || '', stock: p.stock, image: p.image || '', active: p.active !== false });
  };

  const remove = async (id) => { if (!confirm('حذف؟')) return; await api.deleteProduct(id); await load(); };

  const upImg = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const { url } = await api.upload(file); setForm(f => ({ ...f, image: url })); setMsg('تم رفع الصورة'); } catch (ex) { setErr(ex.message); }
  };

  const setStatus = async (id, status) => { await api.setOrderStatus(id, status); await load(); };

  if (!ready) return <div className="container page"><div className="empty">جاري التحميل...</div></div>;

  return (
    <main className="container page">
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>لوحة الإدارة</h1>
        <button className="btn btn-ghost btn-sm" onClick={logout}>تسجيل الخروج</button>
      </div>

      <div className="admin-tabs">
        <button className={`tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>المنتجات ({products.length})</button>
        <button className={`tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>الطلبات ({orders.length})</button>
      </div>

      {msg && <div className="alert alert-ok">{msg}</div>}
      {err && <div className="alert alert-error">{err}</div>}

      {tab === 'products' && (
        <>
          <form className="card" style={{ padding: '1rem', marginBottom: '1rem' }} onSubmit={save}>
            <h3 style={{ marginTop: 0 }}>{editId ? 'تعديل' : 'إضافة منتج'}</h3>
            <div className="admin-grid">
              <div>
                <div className="field"><label className="label">الاسم</label><input className="input" name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div className="field"><label className="label">السعر</label><input className="input" name="price" type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required /></div>
                <div className="field"><label className="label">المقاس</label><input className="input" name="size" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} /></div>
                <div className="field"><label className="label">اللون</label><input className="input" name="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} /></div>
              </div>
              <div>
                <div className="field"><label className="label">المخزون</label><input className="input" name="stock" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
                <div className="field"><label className="label">الوصف</label><textarea className="textarea" name="description" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div className="field"><label className="label">الصورة</label><input className="input" type="file" accept="image/*" onChange={upImg} />{form.image && <img src={mediaUrl(form.image)} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginTop: '.3rem' }} />}</div>
                <label style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}><input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} /> ظاهر</label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
              <button className="btn btn-primary" type="submit">{editId ? 'حفظ' : 'إضافة'}</button>
              {editId && <button className="btn btn-ghost" type="button" onClick={() => { setEditId(null); setForm({ name: '', price: '', description: '', size: '', color: '', stock: 10, image: '', active: true }); }}>إلغاء</button>}
            </div>
          </form>
          <div className="card" style={{ overflow: 'auto' }}>
            <table>
              <thead><tr><th>صورة</th><th>الاسم</th><th>السعر</th><th>المخزون</th><th></th></tr></thead>
              <tbody>{products.map(p => <tr key={p.id}>
                <td>{p.image ? <img src={mediaUrl(p.image)} alt="" width="40" height="40" style={{ borderRadius: 6, objectFit: 'cover' }} /> : '—'}</td>
                <td>{p.name}</td><td>{p.price}</td><td>{p.stock}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => startEdit(p)}>تعديل</button> <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>حذف</button></td>
              </tr>)}</tbody>
            </table>
            {!products.length && <div className="empty">لا منتجات</div>}
          </div>
        </>
      )}

      {tab === 'orders' && (
        <div className="card" style={{ overflow: 'auto' }}>
          <table>
            <thead><tr><th>العميل</th><th>الهاتف</th><th>الإجمالي</th><th>الحالة</th><th>التفاصيل</th></tr></thead>
            <tbody>{orders.map(o => <tr key={o.id}>
              <td><strong>{o.customerName}</strong><div className="meta">{o.city}</div></td>
              <td dir="ltr">{o.phone}</td><td>{o.total}</td>
              <td><select className="select" value={o.status} onChange={e => setStatus(o.id, e.target.value)}>
                <option value="pending">قيد الانتظار</option>
                <option value="confirmed">مؤكد</option>
                <option value="shipped">تم الشحن</option>
                <option value="delivered">تم التسليم</option>
                <option value="cancelled">ملغى</option>
              </select></td>
              <td className="meta">{o.items.map(i => `${i.name}×${i.qty}`).join(', ')}</td>
            </tr>)}</tbody>
          </table>
          {!orders.length && <div className="empty">لا طلبات</div>}
        </div>
      )}
    </main>
  );
}
