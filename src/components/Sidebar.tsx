import React, { useState, useRef } from 'react';
import { Home, Search, List, Plus, Trash2, GripVertical, Settings, Menu, X, Library } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Playlist } from '../types/types';
import { useIsMobile } from '../hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '../contexts/LanguageContext';
import { useBackground } from '../contexts/BackgroundContext';
import { toast } from 'sonner';

interface SidebarProps {
  playlists: Playlist[];
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (id: string) => void;
  onSearch: (query: string) => void;
  onReorderPlaylist: (id: string, newOrder: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  playlists,
  onCreatePlaylist,
  onDeletePlaylist,
  onSearch,
  onReorderPlaylist,
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState('');
  const [draggedPlaylist, setDraggedPlaylist] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { backgroundUrl, setBackgroundUrl } = useBackground();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setOpen(false);
    }
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(playlistSearchQuery.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, playlistId: string) => {
    setDraggedPlaylist(playlistId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedPlaylist) {
      onReorderPlaylist(draggedPlaylist, targetIndex);
    }
    setDraggedPlaylist(null);
    setDragOverIndex(null);
  };

  const handleBackgroundSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetBackground = () => {
    setBackgroundUrl(null);
    toast.success(t('backgroundReset'));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const sidebarContent = (
    <>
      <div className="flex items-baseline gap-2 mb-8 text-shadow">
        <h1 className="text-2xl font-bold text-white">SORINHA</h1>
        <span className="text-xs text-text-muted">by LORALABS</span>
      </div>
      
      <nav className="space-y-6">
        <div className="space-y-4">
          <Link 
            to="/" 
            className="flex items-center gap-3 text-text-muted hover:text-text transition-colors text-shadow"
            onClick={() => isMobile && setIsSidebarOpen(false)}
          >
            <Home size={20} />
            <span>{t('home')}</span>
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-3 text-text-muted hover:text-text transition-colors text-shadow"
            onClick={() => isMobile && setIsSidebarOpen(false)}
          >
            <Library size={20} />
            <span>{t('library')}</span>
          </Link>
          {isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 text-text-muted hover:text-text transition-colors w-full text-shadow">
                  <Settings size={20} />
                  <span>{t('settings')}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-dark-lighter border-0 w-48">
                <div className="px-2 py-1.5 text-sm text-text-muted">
                  {t('language')}
                </div>
                <DropdownMenuItem
                  className={`${language === 'tr' ? 'bg-white/10' : ''} cursor-pointer`}
                  onClick={() => setLanguage('tr')}
                >
                  Türkçe
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`${language === 'en' ? 'bg-white/10' : ''} cursor-pointer`}
                  onClick={() => setLanguage('en')}
                >
                  English
                </DropdownMenuItem>
                <div className="border-t border-white/10 mt-2 pt-2">
                  <div className="px-2 py-1.5 text-sm text-text-muted">
                    {t('customBackground')}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleBackgroundSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left px-2 py-1.5 hover:bg-white/10 cursor-pointer"
                  >
                    {t('selectBackground')}
                  </button>
                  {backgroundUrl && (
                    <button
                      onClick={handleResetBackground}
                      className="w-full text-left px-2 py-1.5 hover:bg-white/10 text-red-400"
                    >
                      {t('resetBackground')}
                    </button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder={t('search')}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary text-shadow"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-text-muted text-shadow">{t('playlists')}</span>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <button className="p-1 hover:bg-white/5 rounded-full">
                    <Plus size={20} />
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-dark-lighter border-0">
                  <DialogHeader>
                    <DialogTitle>{t('createPlaylist')}</DialogTitle>
                  </DialogHeader>
                  <Input
                    placeholder={t('playlistName')}
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                  />
                  <Button 
                    onClick={handleCreatePlaylist}
                    className="bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {t('create')}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>

            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder={t('searchPlaylists')}
                value={playlistSearchQuery}
                onChange={(e) => setPlaylistSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white/5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              {filteredPlaylists.map((playlist, index) => (
                <div
                  key={playlist.id}
                  className={`flex items-center justify-between group rounded-md transition-colors ${
                    dragOverIndex === index ? 'bg-white/10' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, playlist.id)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className="flex items-center gap-2 w-full p-2">
                    <button className="p-1 opacity-50 group-hover:opacity-100 cursor-grab active:cursor-grabbing">
                      <GripVertical size={16} className="text-text-muted" />
                    </button>
                    <Link
                      to={`/playlist/${playlist.id}`}
                      className="flex items-center gap-3 text-text-muted hover:text-text transition-colors flex-grow"
                      onClick={() => isMobile && setIsSidebarOpen(false)}
                    >
                      <List size={20} />
                      <span>{playlist.name}</span>
                      <span className="text-xs text-text-muted">
                        ({playlist.songs.length})
                      </span>
                    </Link>
                    <button
                      onClick={() => onDeletePlaylist(playlist.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded-full text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!isMobile && (
          <div className="absolute bottom-6 left-6 right-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 text-text-muted hover:text-text transition-colors w-full p-2 rounded-md hover:bg-white/5 text-shadow">
                  <Settings size={20} />
                  <span>{t('settings')}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-dark-lighter border-0 w-48">
                <div className="px-2 py-1.5 text-sm text-text-muted">
                  {t('language')}
                </div>
                <DropdownMenuItem
                  className={`${language === 'tr' ? 'bg-white/10' : ''} cursor-pointer`}
                  onClick={() => setLanguage('tr')}
                >
                  Türkçe
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`${language === 'en' ? 'bg-white/10' : ''} cursor-pointer`}
                  onClick={() => setLanguage('en')}
                >
                  English
                </DropdownMenuItem>
                <div className="border-t border-white/10 mt-2 pt-2">
                  <div className="px-2 py-1.5 text-sm text-text-muted">
                    {t('customBackground')}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleBackgroundSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left px-2 py-1.5 hover:bg-white/10 cursor-pointer"
                  >
                    {t('selectBackground')}
                  </button>
                  {backgroundUrl && (
                    <button
                      onClick={handleResetBackground}
                      className="w-full text-left px-2 py-1.5 hover:bg-white/10 text-red-400"
                    >
                      {t('resetBackground')}
                    </button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </nav>
    </>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-dark-lighter rounded-full shadow-lg"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />
        <div
          className={`w-64 h-screen glass fixed left-0 top-0 p-6 overflow-y-auto z-50 transition-transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  return (
    <div className="w-64 h-screen glass fixed left-0 top-0 p-6 overflow-y-auto">
      {sidebarContent}
    </div>
  );
};