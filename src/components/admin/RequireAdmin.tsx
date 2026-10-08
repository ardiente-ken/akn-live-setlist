import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../services/authService';
import '../../styles/gig-theme.css';
import './admin.css';
import AdminLogin from './AdminLogin';

/** Layout route: everything under /admin renders only for signed-in admins. */
export default function RequireAdmin() {
  const { session, isAdmin, loading } = useAuth();

  let content;
  if (loading) {
    content = <p className="admin-muted">Loading…</p>;
  } else if (!session) {
    content = <AdminLogin />;
  } else if (!isAdmin) {
    content = (
      <div className="login">
        <h1>Not authorized</h1>
        <p className="admin-muted">
          {session.user.email} is signed in but isn't in the admins table.
        </p>
        <button className="gt-btn" onClick={() => void signOut()}>Sign out</button>
        <Link to="/" className="admin-muted">← Back to site</Link>
      </div>
    );
  } else {
    content = <Outlet />;
  }

  return (
    <div className="admin gig-theme">
      <div className="admin-inner">{content}</div>
    </div>
  );
}
