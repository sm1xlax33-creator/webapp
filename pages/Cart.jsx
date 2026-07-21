import { Link } from 'react-router-dom';
import { mediaUrl } from '../api';

export default function Cart({ cart, updateQty, removeItem }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (!cart.length) return (
    <main className="container page">
      <h1 className="page-title">السلة</h1>
      <div className="empty">السلة فارغة. <Link to="/" style={{ color: 'var(--brand)' }}>تسوق الآن</Link></div>
    </main>
  );
  return (
    <main className="container page">
      <h1 className="page-title">السلة ({cart.length})</h1>
      <div className="card table-wrap" style={{ padding: '0', overflow: 'auto' }}>
        <table>
          <thead><tr><th>المنتج</th><th>السعر</th><th>الكمية</th><th>المجموع</th><th></th></tr></thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.productId}>
                <td>
                  <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                    {item.image && <img src={mediaUrl(item.image)} alt="" width="40" height="40" style={{ borderRadius: 8, objectFit: 'cover' }} />}
                    <strong>{item.name}</strong>
                  </div>
                </td>
                <td>{item.price}</td>
                <td><input className="input" style={{ width: 70 }} type="number" min={1} max={20} value={item.qty} onChange={e => updateQty(item.productId, Number(e.target.value))} /></td>
                <td>{item.price * item.qty}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => removeItem(item.productId)}>حذف</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>الإجمالي: <span style={{ color: 'var(--brand)' }}>{total} د.م</span></div>
        <Link className="btn btn-primary" to="/checkout">إتمام الشراء</Link>
      </div>
    </main>
  );
}
