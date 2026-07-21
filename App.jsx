import { Routes, Route } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mh_cart') || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('mh_cart', JSON.stringify(cart)); }, [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const i = prev.findIndex(x => x.productId === product.id);
      if (i >= 0) { const c = [...prev]; c[i] = { ...c[i], qty: Math.min(c[i].qty + qty, 20) }; return c; }
      return [...prev, { productId: product.id, name: product.name, price: product.price, image: product.image, size: product.size, qty }];
    });
  };
  const updateQty = (productId, qty) => setCart(prev => prev.map(x => x.productId === productId ? { ...x, qty: Math.max(1, Math.min(20, qty)) } : x).filter(x => x.qty > 0));
  const removeItem = (productId) => setCart(prev => prev.filter(x => x.productId !== productId));
  const clearCart = () => setCart([]);

  return (
    <>
      <Navbar cartCount={cartCount} />
      <Routes>
        <Route path="/" element={<Home addToCart={addToCart} />} />
        <Route path="/cart" element={<Cart cart={cart} updateQty={updateQty} removeItem={removeItem} />} />
        <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <footer className="footer"><div className="container">© {new Date().getFullYear()} Copyrit of Salvatore 🏴‍☠️🥷 — Store mehdi shop </div></footer>
    </>
  );
}
