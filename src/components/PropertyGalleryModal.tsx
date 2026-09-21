'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  X, ChevronLeft, ChevronRight, MapPin, MessageCircle, 
  ArrowUpRight, Compass, Camera, Sparkles 
} from 'lucide-react';
import { Property, TourRoom } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import NativeVirtualTour from './NativeVirtualTour';

interface PropertyGalleryModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  startWith360?: boolean;
}

export default function PropertyGalleryModal({
  property,
  isOpen,
  onClose,
  initialIndex = 0,
  startWith360 = false,
}: PropertyGalleryModalProps) {
  const has360Tour = Boolean(property.virtualTourRooms && property.virtualTourRooms.length > 0);
  const rooms: TourRoom[] = property.virtualTourRooms || [];

  // Filter out any 360 tour images from the standard 2D photos gallery
  const tourImageUrls = new Set(rooms.map(r => r.image));
  const rawImages = property.images || [];
  const regularImages = rawImages.filter(img => !tourImageUrls.has(img));
  const images = regularImages.length > 0 
    ? regularImages 
    : (has360Tour ? [] : ['/images/properties/gallo_prop_1.jpg']);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [viewMode, setViewMode] = useState<'photos' | '360'>(
    (startWith360 && has360Tour) || (images.length === 0 && has360Tour) ? '360' : 'photos'
  );

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      if ((startWith360 && has360Tour) || (images.length === 0 && has360Tour)) {
        setViewMode('360');
      } else {
        setViewMode('photos');
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex, startWith360, has360Tour, images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (viewMode === 'photos') {
        if (e.key === 'ArrowLeft') {
          setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
        } else if (e.key === 'ArrowRight') {
          setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, viewMode, onClose]);

  if (!isOpen) return null;

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const whatsappMessage = encodeURIComponent(
    'Olá Miyashiro Imóveis! Gostaria de informações sobre o imóvel ref: ' + 
    property.id.toUpperCase() + ' (' + property.title + ') no valor de ' + 
    formatCurrency(property.price) + ' em ' + property.address.neighborhood + ', Amparo.'
  );

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Header */}
      <div 
        className="pb-2 sm:pb-3 border-b border-stone-800 text-white space-y-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Row 1: Title, REF, Price & Close Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <span className="text-xs sm:text-sm font-semibold text-emerald-400 font-urbanist shrink-0">
                {formatCurrency(property.price)}
              </span>
              <span className="text-[11px] text-stone-400 truncate hidden sm:inline">
                • {property.address.neighborhood}, {property.address.city} - {property.address.state}
              </span>
            </div>
            <h2 className="text-xs sm:text-sm md:text-base font-medium font-urbanist truncate text-stone-100 mt-0.5">
              {property.title}
            </h2>
          </div>

          {/* Desktop Mode Switcher (Hidden on Mobile) */}
          {has360Tour && (
            <div className="hidden md:flex items-center bg-stone-900 border border-stone-700 p-1 rounded-2xl shadow-inner shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('360')}
                className={'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ' + (
                  viewMode === '360'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                )}
              >
                <Compass className="w-3.5 h-3.5 text-amber-300" />
                <span>Tour 360° Interativo ({rooms.length})</span>
              </button>

              {images.length > 0 && (
                <button
                  type="button"
                  onClick={() => setViewMode('photos')}
                  className={'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ' + (
                    viewMode === 'photos'
                      ? 'bg-stone-800 text-white shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  )}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Fotos HD ({images.length})</span>
                </button>
              )}
            </div>
          )}

          {/* Close Button & Desktop Counter */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {viewMode === 'photos' && images.length > 0 && (
              <div className="text-[11px] font-medium text-stone-300 bg-white/10 px-2.5 py-1 rounded-full hidden sm:block">
                Foto {currentIndex + 1} de {images.length}
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Fechar Galeria"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Row 2 on Mobile: Mode Switcher Tabs (Never crushes title/price) */}
        {has360Tour && (
          <div className="flex md:hidden items-center justify-center pt-1">
            <div className="flex items-center bg-stone-900 border border-stone-700/90 p-0.5 rounded-xl shadow-inner w-full max-w-sm">
              <button
                type="button"
                onClick={() => setViewMode('360')}
                className={'flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ' + (
                  viewMode === '360'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                )}
              >
                <Compass className="w-3.5 h-3.5 text-amber-300" />
                <span>Tour 360° ({rooms.length})</span>
              </button>

              {images.length > 0 && (
                <button
                  type="button"
                  onClick={() => setViewMode('photos')}
                  className={'flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ' + (
                    viewMode === 'photos'
                      ? 'bg-stone-800 text-white shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  )}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Fotos HD ({images.length})</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Stage */}
      <div 
        className="relative flex-1 flex items-center justify-center my-2 overflow-hidden min-h-[360px]"
        onClick={(e) => e.stopPropagation()}
      >
        {viewMode === '360' && has360Tour ? (
          /* 360 Tour Rendered Right Here in the Catalog Gallery! */
          <div className="w-full h-full max-w-6xl max-h-[75vh] rounded-3xl overflow-hidden shadow-2xl border border-stone-800">
            <NativeVirtualTour
              rooms={rooms}
              propertyTitle={property.title}
              className="w-full h-full min-h-[380px] sm:min-h-[500px]"
            />
          </div>
        ) : (
          /* 2D Photo Slider Stage */
          <>
            {/* Navigation Arrow Left */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition shadow-lg backdrop-blur-sm group"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Current Image */}
            <div className="relative w-full h-full max-w-5xl max-h-[75vh]">
              <Image
                src={images[currentIndex]}
                alt={property.title + ' - Foto ' + (currentIndex + 1)}
                fill
                priority
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {/* Navigation Arrow Right */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition shadow-lg backdrop-blur-sm group"
                aria-label="Próxima foto"
              >
                <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Bottom Footer with Thumbnails and Actions */}
      <div 
        className="space-y-3 pt-2 border-t border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Thumbnails Row (Photos mode) */}
        {viewMode === 'photos' && images.length > 1 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 max-w-4xl mx-auto px-2 no-scrollbar touch-pan-x">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={'relative w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden shrink-0 transition border-2 ' + (
                  currentIndex === idx
                    ? 'border-[#00873E] scale-105 shadow-md'
                    : 'border-transparent opacity-50 hover:opacity-100'
                )}
              >
                <Image
                  src={img}
                  alt={'Miniatura ' + (idx + 1)}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          {has360Tour && viewMode === 'photos' && (
            <button
              type="button"
              onClick={() => setViewMode('360')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition shadow active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Entrar no Tour 360° Deste Imóvel</span>
            </button>
          )}

          <Link
            href={'/imovel/' + property.slug}
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-900 text-xs font-medium transition shadow"
          >
            <span>Ver Ficha Completa do Imóvel</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-700" />
          </Link>

          <a
            href={'https://wa.me/5519993673949?text=' + whatsappMessage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition shadow"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Falar com Corretor no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
