import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-row">
        <strong>AKN</strong>
        <span>Thanks for listening 🎶</span>
        <Link to="/admin" className="footer-admin">Admin</Link>
      </div>
    </footer>
  );
}