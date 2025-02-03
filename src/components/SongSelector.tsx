import React from 'react';
import { Plus, Music } from 'lucide-react';
import { Song } from '../types/types';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

interface SongSelectorProps {
  songs: Song[];
  playlistSongs: Song[];
  onAddSongs: (songs: Song[]) => void;
}

export const SongSelector: React.FC<SongSelectorProps> = ({ songs, playlistSongs, onAddSongs }) => {
  const [selectedSongs, setSelectedSongs] = React.useState<Set<string>>(new Set());
  const { t } = useLanguage();

  const availableSongs = songs.filter(song => 
    !playlistSongs.some(pSong => pSong.id === song.id)
  );

  const handleToggleSong = (songId: string) => {
    const newSelected = new Set(selectedSongs);
    if (newSelected.has(songId)) {
      newSelected.delete(songId);
    } else {
      newSelected.add(songId);
    }
    setSelectedSongs(newSelected);
  };

  const handleAddSongs = () => {
    if (selectedSongs.size === 0) {
      toast.error(t('selectSongsError'));
      return;
    }
    const songsToAdd = songs.filter(song => selectedSongs.has(song.id));
    onAddSongs(songsToAdd);
    setSelectedSongs(new Set());
    toast.success(t('songsAddedSuccess'));
  };

  return (
    <div className="max-h-[80vh] md:max-h-[600px] overflow-y-auto">
      <div className="sticky top-0 z-10 flex justify-between items-center p-4 glass-darker">
        <h2 className="text-lg font-semibold">{t('addSong')}</h2>
        <button
          onClick={handleAddSongs}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-white rounded-md transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={20} />
          {t('addSelected')}
        </button>
      </div>
      <div className="p-4 grid grid-cols-1 gap-2">
        {availableSongs.map((song) => (
          <div
            key={song.id}
            onClick={() => handleToggleSong(song.id)}
            className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-4 ${
              selectedSongs.has(song.id) ? 'bg-primary/20' : 'hover:bg-white/5'
            }`}
          >
            <div className="w-12 h-12 bg-dark-lighter rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
              {song.imageUrl ? (
                <img 
                  src={song.imageUrl} 
                  alt={song.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music className="w-6 h-6 text-text-muted" />
              )}
            </div>
            <div className="text-left flex-1 min-w-0">
              <h3 className="font-medium text-base md:text-lg truncate">{song.name}</h3>
              <p className="text-text-muted text-sm truncate">{song.artist || t('unknownArtist')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};