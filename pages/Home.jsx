import { useEffect, useState } from 'react';
import { api, mediaUrl } from '../api';

export default function Home({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.products().then(d => { if (alive) setProducts(d); }).catch(() => {}).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="container page"><div className="empty">جاري التحميل...</div></div>;

  return (
    <main className="container page">
      <section className="hero-section">
  <h1> 👜🛍 Welcome to store - Mehdi Shop</h1>
  <p>مرحبا بكم في متجر 👡 Mehdi shop - التوصيل لجميع المدن ✅️</p>
</section>
      {!products.length ? (
        <div className="empty">لا توجد منتجات بعد. أضفها من لوحة الإدارة.</div>
      ) : (
        <section className="products-grid">
          {products.map(p => (
            <article className="card" key={p.id} style={{ overflow: 'hidden' }}>
              <div className="product-img">
                {p.image ? <img src={mediaUrl(p.image)} alt={p.name} loading="lazy" /> : <span>📸</span>}
              </div>
              <div className="product-body">
                <h3 style={{ margin: 0 }}>{p.name}</h3>
                <div className="price">{p.price} د.م</div>
                <div className="meta">{p.size ? `مقاس: ${p.size}` : ''} {p.color ? `· ${p.color}` : ''}</div>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '.5rem' }}
                  disabled={p.stock < 1} onClick={() => addToCart(p)}>
                  {p.stock < 1 ? 'غير متوفر' : 'أضف للسلة'}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
