import { Link, NavLink } from 'react-router-dom';

export default function Navbar({ cartCount }) {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo">
          {/* صورة الشعار — غيّر المسار لصورة شعارك */}
          <img
            src="/uploads/logo.png"
            alt="MH Shop"
            style={{ height: 80, borderRadius: 10, boxShadow: '0 4px 16px rgba(61,214,198,.2)' }}
          />
          <span>Mehdi Shop</span>
        </Link>
        <nav className="nav-links">
          <NavLink className="btn btn-ghost btn-sm" to="/">store</NavLink>
          <NavLink className="btn btn-ghost btn-sm" to="/cart">
            panier
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </NavLink>
          <NavLink className="btn btn-primary btn-sm" to="/admin">admin panel</NavLink>
        </nav>
      </div>
    </header>
  );
}
