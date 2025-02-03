export interface Song {
  id: string;
  name: string;
  artist: string;
  url: string;
  duration?: number;
  imageUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  imageUrl?: string;
  order: number;
}