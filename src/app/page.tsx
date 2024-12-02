'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FileUploader } from '@/components/FileUploader';
import { ImagePreview } from '@/components/ImagePreview';

export default function Home() {
  const [images, setImages] = useState<File[]>([]);
  const [compressedImages, setCompressedImages] = useState<{
    url: string;
    originalSize: number;
    compressedSize: number;
  }[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileSelect = (files: FileList) => {
    setImages(Array.from(files));
    setCompressedImages([]);
  };

  const handleCompress = async () => {
    setIsCompressing(true);
    const compressed = [];

    try {
      for (const image of images) {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('quality', '80');

        const response = await fetch('/api/compress', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (result.success) {
          compressed.push({
            url: result.data,
            originalSize: result.originalSize,
            compressedSize: result.compressedSize,
          });
        }
      }

      setCompressedImages(compressed);
    } catch (error) {
      console.error('Error compressing images:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Bulk Image Compressor
        </h1>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <FileUploader onFileSelect={handleFileSelect} />

          {images.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Selected Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <ImagePreview key={index} file={image} />
                ))}
              </div>
              
              <button
                onClick={handleCompress}
                disabled={isCompressing}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors w-full md:w-auto"
              >
                {isCompressing ? 'Compressing...' : 'Compress Images'}
              </button>
            </div>
          )}

          {compressedImages.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Compressed Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {compressedImages.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <div className="relative aspect-square">
                      <Image
                        src={image.url}
                        alt={`Compressed image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Original: {formatSize(image.originalSize)}</p>
                      <p>Compressed: {formatSize(image.compressedSize)}</p>
                      <p className="text-green-600">
                        Saved: {formatSize(image.originalSize - image.compressedSize)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
