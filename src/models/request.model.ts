export type RequestStatus = 'pending' | 'played' | 'dismissed';

export interface SongRequest {
  id: string;
  /** Set when picked from the library; null for "something else" requests. */
  song_id: string | null;
  title: string;
  artist: string;
  requester_name: string;
  status: RequestStatus;
  created_at: string;
  handled_at: string | null;
}

export interface NewSongRequest {
  song_id: string | null;
  title: string;
  artist: string;
  requester_name: string;
}

/** Shared by the Performance routes via <Outlet context>. */
export interface QueueContext {
  requests: SongRequest[];
  openPanel: () => void;
}
