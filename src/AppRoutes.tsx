import { Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import RequireAdmin from './components/admin/RequireAdmin';
import AddSongPage from './pages/admin/AddSongPage';
import AdminPage from './pages/admin/AdminPage';
import EditSongPage from './pages/admin/EditSongPage';
import PerformancePage from './pages/performance/PerformancePage';
import PerformanceSongPage from './pages/performance/PerformanceSongPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Your existing public site, untouched */}
      <Route path="/" element={<App />} />

      {/* Performance Mode: read-only */}
      <Route path="/perform" element={<PerformancePage />} />
      <Route path="/perform/:id" element={<PerformanceSongPage />} />

      {/* Admin: signed-in admins only */}
      <Route path="/admin" element={<RequireAdmin />}>
        <Route index element={<AdminPage />} />
        <Route path="songs/new" element={<AddSongPage />} />
        <Route path="songs/:id/edit" element={<EditSongPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
