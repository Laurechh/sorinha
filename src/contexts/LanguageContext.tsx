import React, { createContext, useContext, useState } from 'react';

type Language = 'tr' | 'en';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  tr: {
    home: 'Ana Sayfa',
    library: 'Kütüphanem',
    search: 'Kütüphanemde ara...',
    playlists: 'Çalma Listelerim',
    settings: 'Ayarlar',
    language: 'Dil',
    searchPlaylists: 'Çalma listesi ara...',
    createPlaylist: 'Yeni Çalma Listesi Oluştur',
    playlistName: 'Çalma listesi adı',
    create: 'Oluştur',
    update: 'Değiştir',
    addToPlaylist: 'Çalma listesine ekle',
    addImage: 'Görsel Ekle',
    resetImage: 'Görseli Sıfırla',
    deleteSong: 'Şarkıyı Sil',
    uploadSong: 'Cihazımdan Şarkı Yükle',
    allPlaylists: 'Tüm Çalma Listelerim',
    allSongs: 'Tüm Şarkılarım',
    noSongs: 'Henüz hiç şarkı eklenmemiş.',
    uploadMessage: '"Cihazımdan Şarkı Yükle" butonuna tıklayarak cihazınızdaki şarkıları kütüphanenize ekleyebilirsiniz. Çevrimiçi olarak şarkı eklemek için soldaki Ana Sayfa butonuna tıklayarak şarkı arayabilirsiniz.',
    songs: 'şarkı',
    deletePlaylist: 'Çalma Listesini Sil',
    playlistDeleted: 'Çalma listesi silindi',
    unknownArtist: 'Bilinmeyen Sanatçı',
    addSong: 'Şarkı Ekle',
    edit: 'Düzenle',
    editPlaylist: 'Çalma Listesini Düzenle',
    selectImage: 'Görsel Seç',
    imageResetSuccess: 'Görsel başarıyla sıfırlandı',
    addSelected: 'Seçilenleri Ekle',
    selectSongsError: 'Lütfen en az bir şarkı seçin',
    songsAddedSuccess: 'Şarkılar başarıyla eklendi',
    customBackground: 'Özel Arkaplan',
    resetBackground: 'Arkaplanı Sıfırla',
    selectBackground: 'Arkaplan Seç',
    backgroundReset: 'Arkaplan sıfırlandı',
    songUploadSuccess: 'Şarkı başarıyla yüklendi',
    audioFileOnly: 'Lütfen sadece ses dosyası yükleyin'
  },
  en: {
    home: 'Home',
    library: 'My Library',
    search: 'Search in my library...',
    playlists: 'My Playlists',
    settings: 'Settings',
    language: 'Language',
    searchPlaylists: 'Search playlists...',
    createPlaylist: 'Create New Playlist',
    playlistName: 'Playlist name',
    create: 'Create',
    update: 'Update',
    addToPlaylist: 'Add to playlist',
    addImage: 'Add Image',
    resetImage: 'Reset Image',
    deleteSong: 'Delete Song',
    uploadSong: 'Upload Song from Device',
    allPlaylists: 'All My Playlists',
    allSongs: 'All My Songs',
    noSongs: 'No songs have been added yet.',
    uploadMessage: 'You can add songs from your device to your library by clicking the "Upload Songs from My Device" button. To add songs online, you can search for songs by clicking the Home button on the left.',
    songs: 'songs',
    deletePlaylist: 'Delete Playlist',
    playlistDeleted: 'Playlist deleted',
    unknownArtist: 'Unknown Artist',
    addSong: 'Add Song',
    edit: 'Edit',
    editPlaylist: 'Edit Playlist',
    selectImage: 'Select Image',
    imageResetSuccess: 'Image reset successfully',
    addSelected: 'Add Selected',
    selectSongsError: 'Please select at least one song',
    songsAddedSuccess: 'Songs added successfully',
    customBackground: 'Custom Background',
    resetBackground: 'Reset Background',
    selectBackground: 'Select Background',
    backgroundReset: 'Background has been reset',
    songUploadSuccess: 'Song uploaded successfully',
    audioFileOnly: 'Please upload audio files only'
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('tr');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};