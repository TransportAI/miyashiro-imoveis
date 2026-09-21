'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera, Compass, Play, ExternalLink, Sparkles } from 'lucide-react';
import { Property } from '@/lib/types';
import PropertyGalleryModal from './PropertyGalleryModal';
import NativeVirtualTour from './NativeVirtualTour';

interface PropertyMediaViewerProps {
  property: Property;
}

export default function PropertyMediaViewer({ property }: PropertyMediaViewerProps) {
  const hasTour = Boolean(property.virtualTourRooms && property.virtualTourRooms.length > 0);
  const hasVideo = Boolean(property.videoUrl);

  // Filter out any 360 tour images from standard 2D photos
  const tourImageSet = new Set((property.virtualTourRooms || []).map(r => r.image));
  const rawImages = property.images || [];
  const regularImages = rawImages.filter(img => !tourImageSet.has(img));
  const hasRegularPhotos = regularImages.length > 0;

  const [activeTab, setActiveTab] = useState<'photos' | 'tour' | 'video'>(
    !hasRegularPhotos && hasTour ? 'tour' : 'photos'
  );
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);

  // Helper to parse YouTube Video URL
  const getVideoEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
      } else if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1].split(/[?#&]/)[0];
      } else if (url.includes('/embed/')) {
        videoId = url.split('/embed/')[1].split(/[?#]/)[0];
      }
      return videoId ? 'https://www.youtube-nocookie.com/embed/' + videoId + '?rel=0&modestbranding=1' : url;
    }
    return url;
  };

  const videoEmbedUrl = getVideoEmbedUrl(property.videoUrl);

  const primaryImage = hasRegularPhotos
    ? regularImages[0]
    : (rawImages[0] || '/images/properties/gallo_prop_1.jpg');

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md overflow-hidden">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 bg-stone-50 border-b border-stone-200/70">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {/* Photos Tab */}
          {hasRegularPhotos && (
            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ' + (
                activeTab === 'photos'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/80'
              )}
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Fotos ({regularImages.length})</span>
            </button>
          )}

          {/* 360 Virtual Tour Tab */}
          {hasTour && (
            <button
              type="button"
              onClick={() => setActiveTab('tour')}
              className={'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition relative ' + (
                activeTab === 'tour'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-200'
              )}
            >
              <Compass className="w-4 h-4 text-amber-200" />
              <span>Tour Virtual 360°</span>
            </button>
          )}

          {/* HD Video Tab */}
          {hasVideo && (
            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ' + (
                activeTab === 'video'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-rose-900 hover:bg-rose-50 border border-rose-200'
              )}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Vídeo do Imóvel</span>
            </button>
          )}
        </div>

        {/* Right Info Badges */}
        <div className="flex items-center gap-2 text-xs text-stone-500">
          {activeTab === 'video' && property.videoUrl && (
            <a
              href={property.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-900 font-medium px-2.5 py-1.5 rounded-lg bg-stone-200/70 hover:bg-stone-200 transition"
              title="Assistir no YouTube"
            >
              <span>Ver no YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Media Display Area */}
      <div className="relative w-full bg-stone-900">
        {/* Tab 1: Photos Grid */}
        {activeTab === 'photos' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 sm:p-4 bg-stone-100">
            <div
              onClick={() => setGalleryModalOpen(true)}
              className="md:col-span-2 relative aspect-[16/10] bg-stone-200 group overflow-hidden rounded-2xl cursor-pointer"
            >
              <Image
                src={primaryImage}
                alt={property.title}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover group-hover:scale-102 transition duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
                <span className="text-xs font-medium bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Clique para ver todas as {regularImages.length} fotos</span>
                </span>
                <span className="text-xs bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                  Ampliar Fotos
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
              {regularImages.slice(1, 3).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setGalleryModalOpen(true)}
                  className="relative aspect-[16/10] md:aspect-auto md:h-full bg-stone-200 group overflow-hidden rounded-2xl cursor-pointer"
                >
                  <Image
                    src={img}
                    alt={property.title + ' - Foto ' + (idx + 2)}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: 360 Virtual Tour (100% Nativo) */}
        {activeTab === 'tour' && property.virtualTourRooms && property.virtualTourRooms.length > 0 && (
          <NativeVirtualTour
            rooms={property.virtualTourRooms}
            propertyTitle={property.title}
          />
        )}

        {/* Tab 3: HD Video Embed */}
        {activeTab === 'video' && videoEmbedUrl && (
          <div className="relative w-full aspect-[16/9] min-h-[420px] sm:min-h-[520px] bg-stone-950">
            <iframe
              src={videoEmbedUrl}
              title={'Vídeo do Imóvel - ' + property.title}
              className="w-full h-full absolute inset-0 border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Modal de Galeria Completa */}
      <PropertyGalleryModal
        property={property}
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
      />
    </div>
  );
}
