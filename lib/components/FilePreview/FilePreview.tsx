import { File, FileArchive, FileAudio, FileCode, FileSpreadsheet, FileText, FileVideo } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { cn } from '../../../shadcn/utils';

export interface FilePreviewProps {
  file: File;
  size?: number;
  className?: string;
}

// Maps a MIME type to the appropriate lucide icon component
function getFileIcon(mimeType: string) {
  if (mimeType === 'application/pdf') return FileText;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.startsWith('audio/')) return FileAudio;
  if (mimeType === 'text/csv' || mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet;
  if (
    mimeType === 'application/zip' ||
    mimeType === 'application/gzip' ||
    mimeType === 'application/x-tar' ||
    mimeType.includes('compress') ||
    mimeType.includes('archive')
  )
    return FileArchive;
  if (mimeType.startsWith('text/')) return FileCode;
  return File;
}

// Renders a thumbnail for images or a MIME-type icon for other files
export const FilePreview: React.FC<FilePreviewProps> = ({ file, size = 40, className }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file.type.startsWith('image/')) return;

    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (file.type.startsWith('image/') && objectUrl) {
    return (
      <img
        src={objectUrl}
        alt={file.name}
        className={cn('rounded object-cover shrink-0', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  const IconComponent = getFileIcon(file.type);
  const iconSize = Math.round(size * 0.5);

  return (
    <div
      className={cn('flex items-center justify-center rounded bg-muted shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <IconComponent className="text-muted-foreground" style={{ width: iconSize, height: iconSize }} />
    </div>
  );
};

FilePreview.displayName = 'FilePreview';
