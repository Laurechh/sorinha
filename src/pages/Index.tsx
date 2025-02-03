import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { MusicPlayer } from '../components/MusicPlayer';
import { SongGrid } from '../components/SongGrid';
import { FileUpload } from '../components/FileUpload';
import { PlaylistGrid } from '../components/PlaylistGrid';
import { Song, Playlist } from '../types/types';
import { Routes, Route, useLocation } from 'react-router-dom';
import PlaylistPage from './PlaylistPage';
import { initDB, saveSong, getSongs, savePlaylists, getPlaylists } from '../utils/indexedDB';
import { useLanguage } from '../contexts/LanguageContext';
import { useBackground } from '../contexts/BackgroundContext';
import { useIsMobile } from '../hooks/use-mobile';

const Index = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | undefined>();
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShuffleMode, setIsShuffleMode] = useState(false);
  const [shuffledSongs, setShuffledSongs] = useState<Song[]>([]);
  const location = useLocation();
  const { t } = useLanguage();
  const { backgroundUrl } = useBackground();

  const handleResetImage = async (songId: string) => {
    const updatedSongs = songs.map(song => 
      song.id === songId ? { ...song, imageUrl: undefined } : song
    );
    await safelyUpdateStorage('songs', updatedSongs);
    setSongs(updatedSongs);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await initDB();
        const savedSongs = await getSongs();
        const savedPlaylists = await getPlaylists();
        
        if (savedSongs) setSongs(savedSongs as Song[]);
        if (savedPlaylists) setPlaylists(savedPlaylists as Playlist[]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  const safelyUpdateStorage = async (key: 'songs' | 'playlists', data: Song[] | Playlist[]) => {
    try {
      if (key === 'songs') {
        await saveSong(data as Song[]);
      } else {
        await savePlaylists(data as Playlist[]);
      }
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return false;
    }
  };

  const handlePlaylistReorder = async (playlistId: string, newOrder: number) => {
    const updatedPlaylists = [...playlists];
    const oldIndex = playlists.findIndex(p => p.id === playlistId);
    const [movedPlaylist] = updatedPlaylists.splice(oldIndex, 1);
    updatedPlaylists.splice(newOrder, 0, movedPlaylist);
    
    const reorderedPlaylists = updatedPlaylists.map((playlist, index) => ({
      ...playlist,
      order: index
    }));
    
    try {
      await safelyUpdateStorage('playlists', reorderedPlaylists);
      setPlaylists(reorderedPlaylists);
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  };

  const handlePlaylistImageUpload = async (playlistId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageUrl = reader.result as string;
      const updatedPlaylists = playlists.map(playlist => 
        playlist.id === playlistId ? { ...playlist, imageUrl } : playlist
      );
      await safelyUpdateStorage('playlists', updatedPlaylists);
      setPlaylists(updatedPlaylists);
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
    await safelyUpdateStorage('playlists', updatedPlaylists);
    setPlaylists(updatedPlaylists);
  };

  const handleUpdatePlaylist = async (playlistId: string, updates: Partial<Playlist>) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return { ...playlist, ...updates };
      }
      return playlist;
    });
    
    await safelyUpdateStorage('playlists', updatedPlaylists);
    setPlaylists(updatedPlaylists);
  };

  const getCurrentPlaylist = () => {
    const path = location.pathname;
    if (path.startsWith('/playlist/')) {
      const playlistId = path.split('/')[2];
      return playlists.find(p => p.id === playlistId);
    }
    return null;
  };

  const getPlaybackSongs = () => {
    const currentPlaylist = getCurrentPlaylist();
    return currentPlaylist ? currentPlaylist.songs : songs;
  };

  const handleFileUpload = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const audioUrl = reader.result as string;
          const audio = new Audio(audioUrl);
          
          await new Promise((resolveAudio) => {
            audio.addEventListener('loadedmetadata', async () => {
              const artist = file.name.includes('-') ? 
                file.name.split('-')[0].trim() : 
                'Bilinmeyen Sanatçı';
              
              const songName = file.name.includes('-') ? 
                file.name.split('-')[1].replace(/\.[^/.]+$/, '').trim() : 
                file.name.replace(/\.[^/.]+$/, '');

              const newSong: Song = {
                id: Date.now().toString(),
                name: songName,
                artist: artist,
                url: audioUrl,
                duration: audio.duration
              };

              const updatedSongs = [...songs, newSong];
              await safelyUpdateStorage('songs', updatedSongs);
              setSongs(updatedSongs);
              resolveAudio(null);
            });

            audio.addEventListener('error', () => {
              reject(new Error('Ses dosyası yüklenemedi'));
            });
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Dosya okunamadı'));
      reader.readAsDataURL(file);
    });
  };

  const handleAddImage = async (songId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageUrl = reader.result as string;
      const updatedSongs = songs.map(song => 
        song.id === songId ? { ...song, imageUrl } : song
      );
      await safelyUpdateStorage('songs', updatedSongs);
      setSongs(updatedSongs);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteSong = async (songId: string) => {
    const updatedSongs = songs.filter(song => song.id !== songId);
    await safelyUpdateStorage('songs', updatedSongs);
    setSongs(updatedSongs);

    const updatedPlaylists = playlists.map(playlist => ({
      ...playlist,
      songs: playlist.songs.filter(song => song.id !== songId)
    }));
    await safelyUpdateStorage('playlists', updatedPlaylists);
    setPlaylists(updatedPlaylists);
  };

  const createPlaylist = async (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      songs: [],
      order: playlists.length
    };

    const updatedPlaylists = [...playlists, newPlaylist];
    await safelyUpdateStorage('playlists', updatedPlaylists);
    setPlaylists(updatedPlaylists);
  };

  const addSongToPlaylist = async (playlistId: string, songOrSongs: Song | Song[]) => {
    const songsToAdd = Array.isArray(songOrSongs) ? songOrSongs : [songOrSongs];
    
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        const newSongs = songsToAdd.filter(newSong => 
          !playlist.songs.some(existingSong => existingSong.id === newSong.id)
        );
        
        if (newSongs.length === 0) {
          return playlist;
        }

        return {
          ...playlist,
          songs: [...playlist.songs, ...newSongs]
        };
      }
      return playlist;
    });

    await safelyUpdateStorage('playlists', updatedPlaylists);
    setPlaylists(updatedPlaylists);
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          songs: playlist.songs.filter(s => s.id !== songId)
        };
      }
      return playlist;
    });

    await safelyUpdateStorage('playlists', updatedPlaylists);
    setPlaylists(updatedPlaylists);
  };

  const handlePlaySong = (song: Song) => {
    console.log('Şarkı çalınıyor:', song.name);
    const location = window.location.pathname;
    let playbackSongs: Song[];
    
    // Mevcut rotaya göre çalma listesini belirle
    if (location.startsWith('/playlist/')) {
      const playlistId = location.split('/')[2];
      const currentPlaylist = playlists.find(p => p.id === playlistId);
      playbackSongs = currentPlaylist?.songs || [];
      console.log('Çalma listesinden çalınıyor:', currentPlaylist?.name);
    } else {
      playbackSongs = songs;
      console.log('Ana sayfadan çalınıyor');
    }
    
    setCurrentSong(song);
    const index = playbackSongs.findIndex(s => s.id === song.id);
    setCurrentSong(song);
    setCurrentSongIndex(index);
    console.log('Şarkı indeksi:', index, 'Toplam şarkı:', playbackSongs.length);
  };

  const handleNextSong = () => {
    const playbackSongs = isShuffleMode ? shuffledSongs : getPlaybackSongs();
    if (currentSongIndex < playbackSongs.length - 1) {
      const nextSong = playbackSongs[currentSongIndex + 1];
      setCurrentSong(nextSong);
      setCurrentSongIndex(currentSongIndex + 1);
    }
  };

  const handlePrevSong = () => {
    const playbackSongs = isShuffleMode ? shuffledSongs : getPlaybackSongs();
    if (currentSongIndex > 0) {
      const prevSong = playbackSongs[currentSongIndex - 1];
      setCurrentSong(prevSong);
      setCurrentSongIndex(currentSongIndex - 1);
    }
  };

  const filteredSongs = songs.filter(song => 
    song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSongChange = (song: Song) => {
    setCurrentSong(song);
    const playbackSongs = getCurrentPlaylist()?.songs || songs;
    const index = playbackSongs.findIndex(s => s.id === song.id);
    setCurrentSongIndex(index);
  };

  const isMobile = useIsMobile();
  const mainContentClass = isMobile ? 'w-full pb-24' : 'ml-64 pb-24';

  return (
    <div className="min-h-screen flex w-full">
      <div className="z-50 relative">
        <Sidebar 
          playlists={playlists.sort((a, b) => (a.order || 0) - (b.order || 0))}
          onCreatePlaylist={createPlaylist}
          onDeletePlaylist={handleDeletePlaylist}
          onSearch={setSearchQuery}
          onReorderPlaylist={handlePlaylistReorder}
        />
      </div>
      
      <div className="flex-1 relative min-h-screen w-full">
        {backgroundUrl && (
          <div
            style={{
              backgroundImage: `url(${backgroundUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
              width: '100vw',
              height: '100vh',
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: -1
            }}
          />
        )}
        <div className={`relative ${backgroundUrl ? 'text-shadow' : ''}`}>
          <Routes>
            <Route path="/" element={
              <main className={mainContentClass}>
                <div className={`p-4 md:p-8 max-w-[1400px] mx-auto ${isMobile ? 'pt-16' : ''}`}>
                  <div className="flex justify-center w-full">
                    <FileUpload onFileUpload={handleFileUpload} />
                  </div>
                  
                  {playlists.length > 0 && (
                    <section className="mt-8">
                      <h2 className="text-xl font-bold mb-6 text-left">{t('allPlaylists')}</h2>
                      <PlaylistGrid 
                        playlists={filteredPlaylists} 
                        onPlaylistImageUpload={handlePlaylistImageUpload}
                        onDeletePlaylist={handleDeletePlaylist}
                      />
                    </section>
                  )}

                  <section className="mt-8 mb-24 md:mb-32">
                    <h2 className="text-xl font-bold mb-6 text-left">{t('allSongs')}</h2>
                    {songs.length === 0 ? (
                      <div className="text-center text-text-muted p-8">
                        <p className="mb-2">{t('noSongs')}</p>
                        <p>{t('uploadMessage')}</p>
                      </div>
                    ) : (
                      <SongGrid
                        songs={filteredSongs}
                        onSongClick={handlePlaySong}
                        onAddToPlaylist={addSongToPlaylist}
                        onDeleteSong={handleDeleteSong}
                        onAddImage={handleAddImage}
                        onResetImage={handleResetImage}
                        playlists={playlists}
                      />
                    )}
                  </section>
                </div>
              </main>
            } />
            <Route 
              path="/playlist/:id" 
              element={
                <div className={mainContentClass}>
                  <div className={isMobile ? 'pt-16' : ''}>
                    <PlaylistPage
                      playlists={playlists}
                      allSongs={songs}
                      onPlaySong={handlePlaySong}
                      onRemoveSong={removeSongFromPlaylist}
                      onAddSongsToPlaylist={addSongToPlaylist}
                      onUpdatePlaylist={handleUpdatePlaylist}
                      onDeletePlaylist={handleDeletePlaylist}
                    />
                  </div>
                </div>
              }
            />
          </Routes>
        </div>

        {currentSong && (
          <MusicPlayer 
            currentSong={currentSong}
            songs={isShuffleMode ? shuffledSongs : getPlaybackSongs()}
            onNextSong={handleNextSong}
            onPrevSong={handlePrevSong}
            playlistId={getCurrentPlaylist()?.id}
            onSongChange={handleSongChange}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
