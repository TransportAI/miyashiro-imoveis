'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, Car, Maximize, MapPin, MessageCircle, Bookmark, Compass, ArrowUpRight } from 'lucide-react';
import { Property } from '@/lib/types';
import { formatCurrency, getPurposeLabel, getTypeLabel } from '@/lib/utils';
import PropertyGalleryModal from './PropertyGalleryModal';

interface PropertyCardProps {
  property: Property;
  onSavedChange?: (propertyId: string, isSaved: boolean) => void;
  onOpenBoardingPassDirectly?: (property: Property) => void;
}

export default function PropertyCard({ property, onSavedChange, onOpenBoardingPassDirectly }: PropertyCardProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [boardingPassOpen, setBoardingPassOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const displayCode = property.id.toUpperCase().replace(/^(PRI|GAL)-/i, 'MIY-');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('gallo_saved_properties') || '[]');
      setIsSaved(saved.includes(property.id));
    } catch (e) {}
  }, [property.id]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('gallo_saved_properties') || '[]');
      let next: string[];
      if (saved.includes(property.id)) {
        next = saved.filter(id => id !== property.id);
        setIsSaved(false);
      } else {
        next = [...saved, property.id];
        setIsSaved(true);
      }
      localStorage.setItem('gallo_saved_properties', JSON.stringify(next));
      window.dispatchEvent(new Event('gallo_saved_change'));
      onSavedChange?.(property.id, !isSaved);
    } catch (e) {}
  };

  const tourImageUrls = new Set((property.virtualTourRooms || []).map(r => r.image));
  const regularImages = (property.images || []).filter(img => !tourImageUrls.has(img));
  const primaryImage = regularImages.length > 0 
    ? regularImages[0] 
    : (property.images && property.images.length > 0 ? property.images[0] : '/images/properties/casa_condominio_1.jpg');

  const city = property.address?.city || 'Amparo';
  const neighborhood = property.address?.neighborhood || 'Centro';

  const whatsappMessage = encodeURIComponent(
    `Olá, Miyashiro Imóveis! Gostei do imóvel ${property.title} (Código: ${displayCode}) no valor de ${formatCurrency(property.price)} em ${neighborhood}, ${city}. Poderiam me passar mais detalhes e agendar uma visita?`
  );
  const whatsappUrl = `https://wa.me/5519993673949?text=${whatsappMessage}`;

  return (
    <>
      <article
        className="group relative flex flex-col bg-white/95 backdrop-blur-xl rounded-3xl border border-stone-200/90 hover:border-[#00873E]/30 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden shadow-sm"
      >
        {/* Top Header: Technical Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50/80 border-b border-stone-200/80 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-stone-500 font-medium tracking-wide">
              {displayCode}
            </span>
            <span className="text-neutral-400">•</span>
            <span className="text-stone-600 uppercase font-semibold">
              {getPurposeLabel(property.purpose)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {property.virtualTourRooms && property.virtualTourRooms.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#00873E] bg-[#00873E]/10 px-2 py-0.5 rounded-full border border-[#00873E]/20 font-medium">
                <Compass className="w-2.5 h-2.5" /> 360°
              </span>
            )}
            <button
              type="button"
              onClick={handleToggleSave}
              className={`p-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isSaved
                  ? 'text-[#00873E] bg-emerald-50'
                  : 'text-stone-400 hover:text-stone-800 hover:bg-stone-100'
              }`}
              title={isSaved ? 'Imóvel Salvo' : 'Salvar Imóvel'}
              aria-label="Salvar Imóvel"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Media Container com Aspect Ratio e Hover Zoom */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
          <Link href={`/imovel/${property.slug}`} className="relative block w-full h-full">
            <Image
              src={primaryImage}
              alt={property.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            />
          </Link>

          {/* Quick Details View Button */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
            <Link
              href={`/imovel/${property.slug}`}
              className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-xl border border-stone-200 text-stone-800 hover:text-stone-950 text-[10px] font-urbanist font-bold flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Ver Detalhes do Imóvel"
            >
              <span>Ver Detalhes</span>
              <ArrowUpRight className="w-3 h-3 text-[#00873E]" />
            </Link>
          </div>

          {/* Location & Type Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-mono pointer-events-none">
            <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 truncate max-w-[70%] text-white font-medium">
              {neighborhood}, {city}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 capitalize text-white font-medium">
              {getTypeLabel(property.type)}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
          <div>
            <Link href={`/imovel/${property.slug}`} className="group/link block">
              <h3 className="text-sm font-urbanist font-semibold text-stone-900 line-clamp-2 group-hover/link:text-[#00873E] transition-colors leading-snug">
                {property.title}
              </h3>
            </Link>

            {/* Price Tag */}
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-xl font-urbanist font-bold text-stone-900 tracking-tight">
                {formatCurrency(property.price)}
              </span>
              {property.purpose === 'aluguel' && (
                <span className="text-xs font-mono text-stone-500">/mês</span>
              )}
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-stone-100 mt-3 text-stone-600 font-mono text-[11px]">
              <div className="flex items-center gap-1.5" title="Quartos">
                <Bed className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">
                  {property.bedrooms} {property.bedrooms === 1 ? 'quarto' : 'quartos'}
                </span>
              </div>
              <div className="flex items-center gap-1.5" title="Banheiros">
                <Bath className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">
                  {property.bathrooms} {property.bathrooms === 1 ? 'banheiro' : 'banheiros'}
                </span>
              </div>
              <div className="flex items-center gap-1.5" title="Vagas">
                <Car className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">
                  {property.parkingSpots} {property.parkingSpots === 1 ? 'vaga' : 'vagas'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row: Ver Detalhes Direto & WhatsApp */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <Link
              href={`/imovel/${property.slug}`}
              className="py-2.5 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 hover:text-stone-950 border border-stone-200/80 text-xs font-urbanist font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <span>Ver Detalhes</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#00873E]" />
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-2xl bg-[#00873E] hover:bg-[#15803d] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-red-950/20 active:scale-95 hover:shadow-lg hover:-translate-y-0.5"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </article>

      {/* Gallery Modal */}
      <PropertyGalleryModal
        property={property}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </>
  );
}
