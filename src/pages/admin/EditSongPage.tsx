import { Link, useNavigate, useParams } from 'react-router-dom';
import SongForm from '../../components/songs/SongForm';
import { useSong } from '../../hooks/useSongs';
import { toSongInput } from '../../models/song.model';
import { updateSong } from '../../services/songService';

export default function EditSongPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { song, loading, error } = useSong(id);

  if (loading) return <p className="admin-muted">Loading…</p>;
  if (error || !song) {
    return (
      <>
        <p className="admin-error">{error ?? 'Song not found.'}</p>
        <Link to="/admin" className="gt-btn">← Back</Link>
      </>
    );
  }

  return (
    <>
      <div className="admin-head"><h1>Edit song</h1></div>
      <SongForm
        initial={toSongInput(song)}
        submitLabel="Save changes"
        onSubmit={async (values) => {
          await updateSong(song.id, values);
          navigate('/admin');
        }}
        onCancel={() => navigate('/admin')}
      />
    </>
  );
}
