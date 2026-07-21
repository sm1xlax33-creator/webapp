import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '../api';

export default function AdminLogin() {
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await api.login(username.trim(), password);
      if (!data?.token) throw new Error('لا يوجد رمز دخول');
      setToken(data.token);
      nav('/admin', { replace: true });
    } catch (err) { setError(err.message); setToken(''); } finally { setLoading(false); }
  };

  return (
    <div className="login-wrap container">
      <form className="card" style={{ padding: '1.5rem', width: 'min(380px, 100%)' }} onSubmit={submit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1rem' }}>
  <img
    src="/uploads/logo.png"
    alt="Mehdi Shop"
    style={{ height: 42, borderRadius: 10, boxShadow: '0 4px 16px rgba(61,214,198,.2)' }}
  />
  <div><h2 style={{ margin: 0, fontSize: '1.2rem' }}>دخول الإدارة</h2><div className="meta">Mehdi Shop</div></div>
</div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="field"><label className="label">اسم المستخدم</label><input className="input" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required /></div>
        <div className="field"><label className="label">كلمة المرور</label><input className="input" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? '...' : 'تسجيل الدخول'}</button>
      </form>
    </div>
  );
}
