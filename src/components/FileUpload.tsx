import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { useBackground } from '../contexts/BackgroundContext';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const { backgroundUrl } = useBackground();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        onFileUpload(file);
        toast.success(t('songUploadSuccess'));
      } else {
        toast.error(t('audioFileOnly'));
      }
    }
  };

  return (
    <div className="w-full md:w-[800px] flex items-start justify-start p-4 md:p-6 border-2 border-dashed border-white/10 rounded-lg hover:border-primary/50 transition-colors">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center gap-2 text-text-muted hover:text-text transition-colors w-full ${backgroundUrl ? 'text-shadow' : ''}`}
      >
        <Upload size={24} />
        <span>{t('uploadSong')}</span>
      </button>
    </div>
  );
};