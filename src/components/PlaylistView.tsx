import React, { useState } from 'react';
import { Play, Trash2, Music, Plus, Edit, Image } from 'lucide-react';
import { Song, Playlist } from '../types/types';
import { SongSelector } from './SongSelector';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface PlaylistViewProps {
  playlist: Playlist;
  allSongs: Song[];
  onPlaySong: (song: Song) => void;
  onRemoveSong: (songId: string) => void;
  onAddSongs: (songs: Song[]) => void;
  onUpdatePlaylist: (playlistId: string, updates: Partial<Playlist>) => void;
  onDeletePlaylist: (playlistId: string) => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  playlist,
  allSongs,
  onPlaySong,
  onRemoveSong,
  onAddSongs,
  onUpdatePlaylist,
  onDeletePlaylist,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState(playlist.name);
  const { t } = useLanguage();

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdatePlaylist(playlist.id, { imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = () => {
    onUpdatePlaylist(playlist.id, { imageUrl: undefined });
  };

  const handleNameUpdate = () => {
    if (editName.trim() !== '') {
      onUpdatePlaylist(playlist.id, { name: editName });
      setIsEditMode(false);
    }
  };

  const handleDeletePlaylist = () => {
    onDeletePlaylist(playlist.id);
  };

  return (
    <div className="w-full max-w-5xl mx-auto pt-10">
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6 mb-6 md:mb-8 p-3 md:p-0">
        <div className="w-full md:w-auto flex flex-col items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 bg-dark-lighter rounded-lg overflow-hidden">
            {playlist.imageUrl ? (
              <img 
                src={playlist.imageUrl} 
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted">
                <Music size={48} />
              </div>
            )}
          </div>
          
          <div className="w-full mt-4">
            <div className="mb-4 text-left">
              {isEditMode ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-dark-lighter border border-white/10 rounded px-3 py-2 text-lg md:text-2xl font-bold w-full"
                    autoFocus
                  />
                  <button
                    onClick={handleNameUpdate}
                    className="px-4 py-2 text-white rounded-md transition-colors hover:text-primary whitespace-nowrap"
                  >
                    {t('update')}
                  </button>
                </div>
              ) : (
                <h2 className="text-2xl md:text-3xl font-bold">{playlist.name}</h2>
              )}
              <p className="text-text-muted">{playlist.songs.length} {t('songs')}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-full md:w-auto px-4 py-2 bg-primary/20 hover:bg-primary/30 text-white rounded-md transition-colors flex items-center justify-center gap-2">
                    <Plus size={20} />
                    {t('addSong')}
                  </button>
                </DialogTrigger>
                <DialogContent className="w-[90vw] md:w-[600px] max-w-[600px] p-0 border-0">
                  <SongSelector
                    songs={allSongs}
                    playlistSongs={playlist.songs}
                    onAddSongs={onAddSongs}
                  />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-full md:w-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-md transition-colors flex items-center justify-center gap-2">
                    <Edit size={20} />
                    {t('edit')}
                  </button>
                </DialogTrigger>
                <DialogContent className="w-[90vw] md:w-[600px] max-w-[600px] border-0">
                  <DialogHeader>
                    <DialogTitle>{t('editPlaylist')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('playlistName')}</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-dark-lighter border border-white/10 rounded px-3 py-2"
                      />
                      <button
                        onClick={handleNameUpdate}
                        className="mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors rounded-md w-full"
                      >
                        {t('update')}
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-2">{t('addImage')}</label>
                      <label className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors rounded-md px-4 py-2 cursor-pointer w-full justify-center">
                        <Image size={20} />
                        {t('selectImage')}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {playlist.imageUrl && (
                        <button
                          onClick={handleResetImage}
                          className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors rounded-md text-red-500 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                          {t('resetImage')}
                        </button>
                      )}
                    </div>

                    <div>
                      <button
                        onClick={handleDeletePlaylist}
                        className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-500 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 size={20} />
                        {t('deletePlaylist')}
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 px-3 md:px-0">
        {playlist.songs.map((song, index) => (
          <div
            key={song.id}
            className="flex items-center justify-between p-2 md:p-3 glass hover:bg-white/5 rounded-lg group w-full"
          >
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              <button
                onClick={() => onPlaySong(song)}
                className="p-2 hover:bg-white/10 rounded-full flex-shrink-0"
              >
                <Play size={20} className="md:w-5 md:h-5" />
              </button>
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-dark-lighter rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                  {song.imageUrl ? (
                    <img 
                      src={song.imageUrl} 
                      alt={song.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-5 h-5 md:w-6 md:h-6 text-text-muted" />
                  )}
                </div>
                <div className="text-left flex-1 min-w-0 pr-2">
                  <h3 className="font-medium text-sm md:text-base truncate">{song.name}</h3>
                  <p className="text-xs md:text-sm text-text-muted truncate">{song.artist}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                {song.duration && (
                  <span className="text-xs md:text-sm text-text-muted">{formatDuration(song.duration)}</span>
                )}
                <span className="text-xs md:text-sm font-bold">{index + 1}</span>
              </div>
              <button
                onClick={() => onRemoveSong(song.id)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-full text-red-500"
              >
                <Trash2 size={20} className="md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};