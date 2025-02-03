import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, VolumeX, Music } from 'lucide-react';
import { Slider } from './ui/slider';
import { Song } from '../types/types';
import { useLocation } from 'react-router-dom';

interface MusicPlayerProps {
  currentSong?: Song;
  songs: Song[];
  onNextSong: () => void;
  onPrevSong: () => void;
  playlistId?: string;
  onSongChange: (song: Song) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  currentSong, 
  songs, 
  onNextSong, 
  onPrevSong,
  playlistId,
  onSongChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [shuffledSongs, setShuffledSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const previousVolume = useRef(volume);
  const location = useLocation();
  const lastSongRef = useRef<string | null>(null);

  // Get the current playlist ID from the URL
  const currentPlaylistId = location.pathname.startsWith('/playlist/') 
    ? location.pathname.split('/')[2] 
    : undefined;

  // Get the latest song data from the main songs array
  const getLatestSongData = () => {
    if (!currentSong) return undefined;
    
    // First try to find the song in the current playlist's songs
    const latestSong = songs.find(song => song.id === currentSong.id);
    
    // Always return the latest song data with image from the main songs array
    if (latestSong?.imageUrl) {
      console.log('Using latest song data with image:', latestSong.name, latestSong.imageUrl);
      return latestSong;
    }
    
    // If no image in latest data, keep the current song's image if it exists
    if (currentSong.imageUrl) {
      console.log('Keeping current song image:', currentSong.name, currentSong.imageUrl);
      return {
        ...latestSong || currentSong,
        imageUrl: currentSong.imageUrl
      };
    }
    
    console.log('No image available for song:', currentSong.name);
    return latestSong || currentSong;
  };

  const latestSongData = getLatestSongData();

  useEffect(() => {
    if (latestSongData) {
      const newIndex = songs.findIndex(s => s.id === latestSongData.id);
      if (newIndex !== -1) {
        setCurrentIndex(newIndex);
        console.log('Updated current index to:', newIndex, 'in playlist:', currentPlaylistId || 'main');
      }

      if (audioRef.current) {
        // Only update source if it's a different song
        if (lastSongRef.current !== latestSongData.id) {
          const wasPlaying = isPlaying;
          audioRef.current.src = latestSongData.url;
          audioRef.current.currentTime = 0;

          if (wasPlaying) {
            audioRef.current.play()
              .then(() => {
                setIsPlaying(true);
                console.log('Started playing:', latestSongData.name);
              })
              .catch(error => console.error('Playback failed:', error));
          }
          lastSongRef.current = latestSongData.id;
        }
      }
    }
  }, [latestSongData, songs, currentPlaylistId]);

  useEffect(() => {
    if (isShuffling) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      setShuffledSongs(shuffled);
    } else {
      setShuffledSongs([]);
    }
  }, [isShuffling, songs]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => console.error('Playback failed:', error));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = previousVolume.current;
        setVolume(previousVolume.current);
      } else {
        previousVolume.current = volume;
        audioRef.current.volume = 0;
        setVolume(0);
      }
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isSeeking) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current && !isNaN(value[0]) && isFinite(value[0]) && value[0] >= 0) {
      const newTime = Math.min(value[0], audioRef.current.duration);
      setProgress(newTime);
      if (!isSeeking) {
        audioRef.current.currentTime = newTime;
      }
    }
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
    }
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    if (audioRef.current) {
      audioRef.current.currentTime = progress;
      if (isPlaying) {
        audioRef.current.play().catch(error => console.error('Playback failed:', error));
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (!isNaN(newVolume) && isFinite(newVolume) && newVolume >= 0 && newVolume <= 1) {
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
      if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
    }
  };

  const handleEnded = () => {
    console.log('Song ended, checking next action...');
    
    if (!songs || songs.length === 0) {
      console.log('No songs available to play next');
      return;
    }

    if (isLooping) {
      console.log('Looping current song');
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(error => console.error('Playback failed:', error));
      }
      return;
    }

    if (currentIndex >= songs.length - 1) {
      console.log('Reached the end of the playlist, returning to the start');
      setCurrentIndex(0);
      if (songs[0]) {
        onSongChange(songs[0]);
      }
    } else {
      console.log('Moving to next song in playlist');
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (songs[nextIndex]) {
        onSongChange(songs[nextIndex]);
      }
    }
  };

  useEffect(() => {
    const handleMediaKeys = (event: MediaSessionActionDetails) => {
      switch (event.action) {
        case "play":
          if (!isPlaying && audioRef.current) {
            audioRef.current.play().catch(error => console.error('Playback failed:', error));
            setIsPlaying(true);
          }
          break;
        case "pause":
          if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
          break;
        case "previoustrack":
          onPrevSong();
          break;
        case "nexttrack":
          onNextSong();
          break;
      }
    };

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => handleMediaKeys({ action: 'play' }));
      navigator.mediaSession.setActionHandler('pause', () => handleMediaKeys({ action: 'pause' }));
      navigator.mediaSession.setActionHandler('previoustrack', () => handleMediaKeys({ action: 'previoustrack' }));
      navigator.mediaSession.setActionHandler('nexttrack', () => handleMediaKeys({ action: 'nexttrack' }));
    }

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }
    };
  }, [isPlaying, onNextSong, onPrevSong]);

  useEffect(() => {
    if (latestSongData && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: latestSongData.name,
        artist: latestSongData.artist,
        artwork: latestSongData.imageUrl ? [
          {
            src: latestSongData.imageUrl,
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ] : undefined
      });
    }
  }, [latestSongData]);

  if (!latestSongData) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-darker p-2 md:p-4 z-50 md:ml-64">
      <audio
        ref={audioRef}
        src={latestSongData?.url}
        loop={isLooping}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
      />
      
      <div className="max-w-screen-lg mx-auto flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <Slider
          defaultValue={[0]}
          max={duration}
          step={0.1}
          value={[progress]}
          onValueChange={handleProgressChange}
          onPointerDown={handleSeekStart}
          onPointerUp={handleSeekEnd}
          className="w-full cursor-pointer"
        />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
          <div className="flex items-center gap-4 order-2 md:order-1 w-full md:w-auto justify-center md:justify-start">
            {latestSongData && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-dark-lighter rounded overflow-hidden flex items-center justify-center">
                  {latestSongData.imageUrl ? (
                    <img 
                      src={latestSongData.imageUrl} 
                      alt={latestSongData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-6 h-6 text-text-muted" />
                  )}
                </div>
                <div className="block">
                  <h3 className="text-sm font-medium truncate max-w-[150px] md:max-w-[200px]">{latestSongData.name}</h3>
                  <p className="text-xs text-text-muted truncate max-w-[150px] md:max-w-[200px]">{latestSongData.artist}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 md:gap-4 order-1 md:order-2">
            <button
              onClick={() => setIsShuffling(!isShuffling)}
              className={`p-2 md:p-2 rounded-full ${isShuffling ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'}`}
            >
              <Shuffle size={22} className="md:w-5 md:h-5" />
            </button>
            
            <button 
              onClick={onPrevSong}
              className="p-2 md:p-2 hover:bg-white/5 rounded-full"
            >
              <SkipBack size={22} className="md:w-5 md:h-5" />
            </button>
            
            <button
              onClick={togglePlay}
              className="p-2.5 md:p-3 bg-primary hover:bg-primary-hover rounded-full transition-colors"
            >
              {isPlaying ? 
                <Pause size={24} className="md:w-6 md:h-6" /> : 
                <Play size={24} className="md:w-6 md:h-6" />
              }
            </button>
            
            <button 
              onClick={onNextSong}
              className="p-2 md:p-2 hover:bg-white/5 rounded-full"
            >
              <SkipForward size={22} className="md:w-5 md:h-5" />
            </button>
            
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 md:p-2 rounded-full ${isLooping ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'}`}
            >
              <Repeat size={22} className="md:w-5 md:h-5" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 w-32 order-3">
            <button
              onClick={toggleMute}
              className="hover:text-primary transition-colors"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <Slider
              defaultValue={[1]}
              max={1}
              step={0.1}
              value={[volume]}
              onValueChange={handleVolumeChange}
              className="w-24 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
