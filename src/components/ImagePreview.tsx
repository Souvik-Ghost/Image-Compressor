'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface ImagePreviewProps {
  file: File;
}

export function ImagePreview({ file }: ImagePreviewProps) {
  const [preview, setPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setError(null);
      
      // Create an image element to check if the image loads correctly
      const img = new Image();
      img.src = objectUrl;
      img.onload = () => setIsLoading(false);
      img.onerror = () => {
        setError('Failed to load image');
        setIsLoading(false);
      };

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } catch (err) {
      setError('Failed to create preview');
      setIsLoading(false);
    }
  }, [file]);

  const formatSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  if (error) {
    return (
      <div className="relative aspect-square bg-red-50 rounded-lg flex items-center justify-center">
        <p className="text-red-500 text-sm text-center p-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-square group">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      )}
      <Image
        src={preview}
        alt={file.name}
        fill
        className={`object-cover rounded-lg transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
        <div className="text-white text-center p-2">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs">{formatSize(file.size)}</p>
        </div>
      </div>
    </div>
  );
}
