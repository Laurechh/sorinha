import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Image, Trash2, Music } from 'lucide-react';
import { Playlist } from '../types/types';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

interface PlaylistGridProps {
  playlists: Playlist[];
  onPlaylistImageUpload: (playlistId: string, file: File) => void;
  onDeletePlaylist: (playlistId: string) => void;
}

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({
  playlists,
  onPlaylistImageUpload,
  onDeletePlaylist,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageUpload = (playlistId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onPlaylistImageUpload(playlistId, file);
      setActiveDropdown(null);
    }
  };

  const handleDeletePlaylist = (playlistId: string) => {
    onDeletePlaylist(playlistId);
    setActiveDropdown(null);
    toast.success(t('playlistDeleted'));
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          className="glass p-3 md:p-4 rounded-lg hover:bg-white/10 transition-colors group relative"
        >
          <Link to={`/playlist/${playlist.id}`} className="block">
            <div className="aspect-square bg-dark-lighter rounded-md mb-2 md:mb-3 flex items-center justify-center text-text-muted overflow-hidden">
              {playlist.imageUrl ? (
                <img 
                  src={playlist.imageUrl} 
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music size={32} className="md:w-12 md:h-12" />
              )}
            </div>
            <h3 className="font-medium text-sm md:text-base truncate">{playlist.name}</h3>
            <p className="text-xs md:text-sm text-text-muted">{playlist.songs.length} {t('songs')}</p>
          </Link>

          <div className="absolute top-2 right-2" ref={dropdownRef}>
            <button
              onClick={() => setActiveDropdown(activeDropdown === playlist.id ? null : playlist.id)}
              className="p-1 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical size={20} />
            </button>

            {activeDropdown === playlist.id && (
              <div className="absolute right-0 mt-2 w-48 bg-dark-lighter rounded-lg shadow-lg py-1 z-10">
                <label className="w-full px-3 py-2 text-sm text-left hover:bg-white/10 flex items-center gap-2 cursor-pointer">
                  <Image size={16} />
                  {t('addImage')}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(playlist.id, e)}
                  />
                </label>
                <button
                  onClick={() => handleDeletePlaylist(playlist.id)}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-white/10 flex items-center gap-2 text-red-500"
                >
                  <Trash2 size={16} />
                  {t('deletePlaylist')}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
