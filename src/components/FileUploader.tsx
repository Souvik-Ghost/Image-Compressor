'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  onFileSelect: (files: FileList) => void;
}

export function FileUploader({ onFileSelect }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const dataTransfer = new DataTransfer();
    acceptedFiles.forEach((file) => {
      dataTransfer.items.add(file);
    });
    onFileSelect(dataTransfer.files);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="text-4xl">📸</div>
        {isDragActive ? (
          <p className="text-lg">Drop the images here...</p>
        ) : (
          <>
            <p className="text-lg">Drag & drop images here, or click to select files</p>
            <p className="text-sm text-gray-500">Supports: JPG, PNG, WebP</p>
          </>
        )}
      </div>
    </div>
  );
}
