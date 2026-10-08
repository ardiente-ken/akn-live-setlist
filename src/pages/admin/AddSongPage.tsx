import { useNavigate } from 'react-router-dom';
import SongForm from '../../components/songs/SongForm';
import { createSong } from '../../services/songService';

export default function AddSongPage() {
  const navigate = useNavigate();
  return (
    <>
      <div className="admin-head"><h1>Add song</h1></div>
      <SongForm
        submitLabel="Add song"
        onSubmit={async (values) => {
          await createSong(values);
          navigate('/admin');
        }}
        onCancel={() => navigate('/admin')}
      />
    </>
  );
}
