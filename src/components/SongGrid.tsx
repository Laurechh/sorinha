import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Plus, Trash2, Image, Music, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Song, Playlist } from '../types/types';
import { useLanguage } from '../contexts/LanguageContext';

interface SongGridProps {
  songs: Song[];
  onSongClick: (song: Song) => void;
  onAddToPlaylist: (playlistId: string, songOrSongs: Song | Song[]) => void;
  onDeleteSong: (songId: string) => void;
  onAddImage: (songId: string, file: File) => void;
  onResetImage?: (songId: string) => void;
  playlists: Playlist[];
}

export const SongGrid: React.FC<SongGridProps> = ({
  songs,
  onSongClick,
  onAddToPlaylist,
  onDeleteSong,
  onAddImage,
  onResetImage,
  playlists,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [playlistSearch, setPlaylistSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click was outside both the dropdown and the trigger button
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
        setPlaylistSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleImageUpload = (songId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAddImage(songId, file);
      setActiveDropdown(null);
    }
  };

  const handleResetImage = (songId: string) => {
    if (onResetImage) {
      onResetImage(songId);
      setActiveDropdown(null);
      toast.success(t('imageResetSuccess'));
    }
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(playlistSearch.toLowerCase())
  );

  const displayedPlaylists = playlistSearch === '' 
    ? playlists.slice(0, 3) 
    : filteredPlaylists;

  const hasMorePlaylists = playlistSearch === '' && playlists.length > 3;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 p-2 md:p-4">
      {songs.map((song) => (
        <div
          key={song.id}
          className="glass p-3 md:p-4 rounded-lg hover:bg-white/10 transition-colors group animate-fade-in relative"
        >
          <button
            onClick={() => onSongClick(song)}
            className="w-full text-left"
          >
            <div className="aspect-square bg-dark-lighter rounded-md mb-2 md:mb-3 flex items-center justify-center text-text-muted overflow-hidden">
              {song.imageUrl ? (
                <img 
                  src={song.imageUrl} 
                  alt={song.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music size={32} className="md:w-12 md:h-12" />
              )}
            </div>
            <h3 className="font-medium text-sm md:text-base truncate">{song.name}</h3>
            <p className="text-xs md:text-sm text-text-muted truncate">{song.artist || t('unknownArtist')}</p>
            {song.duration && (
              <p className="text-xs md:text-sm text-text-muted mt-1">{formatDuration(song.duration)}</p>
            )}
          </button>

          <div className="absolute top-2 right-2">
            <button
              ref={buttonRef}
              onClick={() => setActiveDropdown(activeDropdown === song.id ? null : song.id)}
              className="p-1 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical size={20} />
            </button>

            {activeDropdown === song.id && (
              <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-dark-lighter rounded-lg shadow-lg py-1 z-10">
                <div className="px-3 py-2 text-sm text-text-muted">{t('addToPlaylist')}:</div>
                <div className="px-3 py-2">
                  <div className="flex items-center gap-2 bg-white/5 rounded-md px-2">
                    <Search size={14} className="text-text-muted" />
                    <input
                      type="text"
                      placeholder={t('searchPlaylists')}
                      value={playlistSearch}
                      onChange={(e) => setPlaylistSearch(e.target.value)}
                      className="w-full bg-transparent py-1 text-sm focus:outline-none"
                    />
                  </div>
                </div>
                {displayedPlaylists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => {
                      onAddToPlaylist(playlist.id, song);
                      setActiveDropdown(null);
                      setPlaylistSearch('');
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-white/10 flex items-center gap-2"
                  >
                    <Plus size={16} />
                    {playlist.name}
                  </button>
                ))}
                {hasMorePlaylists && playlistSearch === '' && (
                  <div className="px-3 py-2 text-sm text-text-muted text-center">...</div>
                )}
                <label className="w-full px-3 py-2 text-sm text-left hover:bg-white/10 flex items-center gap-2 cursor-pointer">
                  <Image size={16} />
                  {t('addImage')}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(song.id, e)}
                  />
                </label>
                {song.imageUrl && onResetImage && (
                  <button
                    onClick={() => handleResetImage(song.id)}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-white/10 flex items-center gap-2 text-red-500"
                  >
                    <Image size={16} className="text-red-500" />
                    {t('resetImage')}
                  </button>
                )}
                <button
                  onClick={() => {
                    onDeleteSong(song.id);
                    setActiveDropdown(null);
                  }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-white/10 flex items-center gap-2 text-red-500"
                >
                  <Trash2 size={16} />
                  {t('deleteSong')}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
