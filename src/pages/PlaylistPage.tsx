import React from 'react';
import { useParams } from 'react-router-dom';
import { PlaylistView } from '../components/PlaylistView';
import { Song, Playlist } from '../types/types';
import { useIsMobile } from '../hooks/use-mobile';

interface PlaylistPageProps {
  playlists: Playlist[];
  allSongs: Song[];
  onPlaySong: (song: Song) => void;
  onRemoveSong: (playlistId: string, songId: string) => void;
  onAddSongsToPlaylist: (playlistId: string, songs: Song[]) => void;
  onUpdatePlaylist: (playlistId: string, updates: Partial<Playlist>) => void;
  onDeletePlaylist: (playlistId: string) => void;
}

const PlaylistPage: React.FC<PlaylistPageProps> = ({ 
  playlists, 
  allSongs,
  onPlaySong, 
  onRemoveSong,
  onAddSongsToPlaylist,
  onUpdatePlaylist,
  onDeletePlaylist
}) => {
  const { id } = useParams<{ id: string }>();
  const playlist = playlists.find(p => p.id === id);
  const isMobile = useIsMobile();

  if (!playlist) {
    return <div className={`${!isMobile && 'ml-64'}`}>Çalma listesi bulunamadı.</div>;
  }

  return (
    <div className={`${!isMobile ? 'ml-64 -ml-4 pt-2' : 'w-full'} flex`}>
      <PlaylistView
        playlist={playlist}
        allSongs={allSongs}
        onPlaySong={onPlaySong}
        onRemoveSong={(songId) => onRemoveSong(playlist.id, songId)}
        onAddSongs={(songs) => onAddSongsToPlaylist(playlist.id, songs)}
        onUpdatePlaylist={onUpdatePlaylist}
        onDeletePlaylist={onDeletePlaylist}
      />
    </div>
  );
};

export default PlaylistPage;