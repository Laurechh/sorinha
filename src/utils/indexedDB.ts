export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MusicPlayerDB', 1);

    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create songs store if it doesn't exist
      if (!db.objectStoreNames.contains('songs')) {
        db.createObjectStore('songs', { keyPath: 'id' });
      }
      
      // Create playlists store if it doesn't exist
      if (!db.objectStoreNames.contains('playlists')) {
        db.createObjectStore('playlists', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
};

export const saveSong = async (songs: any) => {
  const db = await initDB() as IDBDatabase;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['songs'], 'readwrite');
    const store = transaction.objectStore('songs');
    
    // Clear existing songs and add new ones
    store.clear();
    
    // Add all songs
    songs.forEach((song: any) => {
      store.add(song);
    });
    
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getSongs = async () => {
  const db = await initDB() as IDBDatabase;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['songs'], 'readonly');
    const store = transaction.objectStore('songs');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const savePlaylists = async (playlists: any) => {
  const db = await initDB() as IDBDatabase;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['playlists'], 'readwrite');
    const store = transaction.objectStore('playlists');
    
    // Clear existing playlists and add new ones
    store.clear();
    
    // Add all playlists
    playlists.forEach((playlist: any) => {
      store.add(playlist);
    });
    
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getPlaylists = async () => {
  const db = await initDB() as IDBDatabase;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['playlists'], 'readonly');
    const store = transaction.objectStore('playlists');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};