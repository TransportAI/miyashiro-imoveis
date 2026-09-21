'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Star, Image as ImageIcon } from 'lucide-react';

interface DropzoneUploadProps {
  images: string[];
  coverImage?: string;
  onChange: (images: string[], coverImage: string) => void;
}

export default function DropzoneUpload({ images, coverImage, onChange }: DropzoneUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    const readers: Promise<string>[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        readers.push(
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                resolve(event.target.result as string);
              }
            };
            reader.readAsDataURL(file);
          })
        );
      }
    });

    Promise.all(readers).then((loadedImages) => {
      const combined = [...images, ...loadedImages];
      const newCover = coverImage && combined.includes(coverImage) ? coverImage : combined[0] || '';
      onChange(combined, newCover);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const target = images[index];
    const nextImages = images.filter((_, i) => i !== index);
    let nextCover = coverImage;
    if (coverImage === target) {
      nextCover = nextImages[0] || '';
    }
    onChange(nextImages, nextCover || '');
  };

  const handleSetCover = (img: string) => {
    onChange(images, img);
  };

  return (
    <div className="space-y-4">
      {/* Drop area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 md:p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-emerald-600 bg-emerald-50/50'
            : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <span className="font-urbanist font-medium text-slate-800 hover:underline">
              Clique para fazer upload
            </span>{' '}
            <span className="text-slate-500">ou arraste e solte fotos aqui</span>
          </div>
          <p className="text-xs text-slate-600 font-urbanist">
            PNG, JPG, WEBP ou GIF (Recomendado: 1200x800 px ou fotos do celular)
          </p>
        </div>
      </div>

      {/* Thumbnails grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-700 font-urbanist uppercase tracking-wider">
              Fotos Selecionadas ({images.length})
            </span>
            <span className="text-xs text-slate-600 font-urbanist">
              Clique na estrela para definir a foto de capa
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((img, idx) => {
              const isCover = (coverImage === img) || (!coverImage && idx === 0);
              return (
                <div
                  key={idx}
                  className={`relative group rounded-lg overflow-hidden border transition-all ${
                    isCover
                      ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="aspect-[4/3] bg-slate-100 relative">
                    <img
                      src={img}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Badges / Controls */}
                  {isCover && (
                    <div className="absolute top-1.5 left-1.5 bg-emerald-800 text-white text-[10px] font-urbanist font-medium px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Capa
                    </div>
                  )}

                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetCover(img);
                        }}
                        title="Definir como Imagem de Capa"
                        className="bg-white/90 hover:bg-white text-slate-700 hover:text-amber-500 p-1 rounded-full shadow transition-colors"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(idx);
                      }}
                      title="Excluir foto"
                      className="bg-white/90 hover:bg-rose-50 text-slate-700 hover:text-rose-600 p-1 rounded-full shadow transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
