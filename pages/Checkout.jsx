import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Checkout({ cart, clearCart }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ customerName: '', phone: '', city: '', address: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (!cart.length && !done) return (
    <main className="container page"><div className="empty"><Link to="/">العودة للمتجر</Link></div></main>
  );

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.createOrder({ ...form, items: cart.map(c => ({ productId: c.productId, qty: c.qty, size: c.size })) });
      clearCart(); setDone(res);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  if (done) return (
    <main className="container page">
      <div className="card" style={{ padding: '1.5rem', maxWidth: 500, margin: '0 auto' }}>
        <h2>✅ تم الطلب</h2>
        <p>رقم الطلب: <strong>{done.orderId}</strong></p>
        <p>الإجمالي: <strong style={{ color: 'var(--brand)' }}>{done.total} د.م</strong></p>
        <p>طريقة الدفع: <strong>الدفع عند الاستلام</strong></p>
        <button className="btn btn-primary" onClick={() => nav('/')}>العودة</button>
      </div>
    </main>
  );

  return (
    <main className="container page">
      <h1 className="page-title">إتمام الشراء</h1>
      <div className="admin-grid">
        <form className="card" style={{ padding: '1.2rem' }} onSubmit={submit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="field"><label className="label">الاسم</label><input className="input" name="customerName" required value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} /></div>
          <div className="field"><label className="label">الهاتف</label><input className="input" name="phone" dir="ltr" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div className="field"><label className="label">المدينة</label><input className="input" name="city" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
          <div className="field"><label className="label">العنوان</label><textarea className="textarea" name="address" rows={3} required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
          <div className="field"><label className="label">ملاحظات</label><textarea className="textarea" name="notes" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <div className="card" style={{ padding: '.8rem', background: 'rgba(61,214,198,.08)', borderColor: 'rgba(61,214,198,.3)', marginBottom: '1rem' }}>
            <strong>💵 الدفع عند الاستلام</strong> <span className="meta">— تدفع للمندوب</span>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? '...' : `تأكيد · ${total} د.م`}
          </button>
        </form>
        <div className="card" style={{ padding: '1.2rem' }}>
          <h3 style={{ marginTop: 0 }}>الطلبات</h3>
          {cart.map(i => <div key={i.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '.4rem 0', borderBottom: '1px solid var(--line)' }}><span>{i.name} × {i.qty}</span><strong>{i.price * i.qty}</strong></div>)}
          <div style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 800 }}>الإجمالي: <span style={{ color: 'var(--brand)' }}>{total} د.م</span></div>
        </div>
      </div>
    </main>
  );
}
