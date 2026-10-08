import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { signIn } from '../../services/authService';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
      setBusy(false);
    }
  };

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h1>Admin sign in</h1>
      <label>
        Email
        <input className="gt-input" type="email" autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        Password
        <input className="gt-input" type="password" autoComplete="current-password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
      </label>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <button className="gt-btn gt-btn-primary" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
      <Link to="/" className="admin-muted">← Back to site</Link>
    </form>
  );
}
