import { Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import RequireAdmin from './components/admin/RequireAdmin';
import AddSongPage from './pages/admin/AddSongPage';
import AdminPage from './pages/admin/AdminPage';
import EditSongPage from './pages/admin/EditSongPage';
import FolderEditorPage from './pages/admin/FolderEditorPage';
import FoldersPage from './pages/admin/FoldersPage';
import PerformanceLayout from './pages/performance/PerformanceLayout';
import PerformancePage from './pages/performance/PerformancePage';
import PerformanceSongPage from './pages/performance/PerformanceSongPage';
import RequestPage from './pages/requests/RequestPage';
import SongbookIndexPage from './pages/songbook/SongbookIndexPage';
import SongbookLayout from './pages/songbook/SongbookLayout';
import SongbookPage from './pages/songbook/SongbookPage';
import SongbookSongPage from './pages/songbook/SongbookSongPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Your existing public site, untouched */}
      <Route path="/" element={<App />} />

      {/* Audience: request a song */}
      <Route path="/request" element={<RequestPage />} />

      {/* Performance Mode: read-only, shares one live request queue */}
      <Route path="/perform" element={<PerformanceLayout />}>
        <Route index element={<PerformancePage />} />
        <Route path=":id" element={<PerformanceSongPage />} />
      </Route>

      {/* Public songbooks: read-only, only folders marked public */}
      <Route path="/songbook" element={<SongbookIndexPage />} />
      <Route path="/songbook/:slug" element={<SongbookLayout />}>
        <Route index element={<SongbookPage />} />
        <Route path=":id" element={<SongbookSongPage />} />
      </Route>

      {/* Admin: signed-in admins only */}
      <Route path="/admin" element={<RequireAdmin />}>
        <Route index element={<AdminPage />} />
        <Route path="songs/new" element={<AddSongPage />} />
        <Route path="songs/:id/edit" element={<EditSongPage />} />
        <Route path="folders" element={<FoldersPage />} />
        <Route path="folders/new" element={<FolderEditorPage />} />
        <Route path="folders/:id" element={<FolderEditorPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
