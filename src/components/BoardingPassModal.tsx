'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, MapPin, Bed, Bath, Car, Maximize2, Shield, Share2, MessageSquare, ArrowUpRight, Compass } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface BoardingPassModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BoardingPassModal({ property, isOpen, onClose }: BoardingPassModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!property) return null;

  const code = property.id.toUpperCase().replace(/^(PRI|GAL)-/i, 'MIY-');
  const encodedMsg = encodeURIComponent(
    `Olá, Miyashiro Imóveis! Estou com a Ficha Técnica / Boarding Pass do imóvel ${property.title} (Cód: ${code}) no valor de ${formatCurrency(property.price)} em Amparo. Gostaria de tirar dúvidas e agendar uma visita.`
  );
  const whatsappUrl = `https://wa.me/5519993673949?text=${encodedMsg}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#070B14]/85 backdrop-blur-md"
          />

          {/* Ticket Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="relative w-full max-w-3xl bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden z-10 text-stone-900"
          >
            {/* Top Bar / Header */}
            <div className="bg-stone-50 px-5 py-3.5 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 rounded-full bg-[#00873E] animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#00873E] font-semibold">
                  Ficha Técnica Oficial
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-stone-500">CRECI 155957F • AMPARO-SP</span>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 relative">
              {/* Left Segment: Property Image (5 cols) */}
              <div className="md:col-span-5 p-5 bg-stone-50/50 flex flex-col justify-center border-b md:border-b-0 md:border-r border-stone-200 relative">
                <div className="relative aspect-[4/3] md:h-full md:min-h-[300px] w-full rounded-2xl overflow-hidden border border-stone-200 group shadow-xs">
                  <Image
                    src={property.images?.[0] || '/images/properties/casa_condominio_1.jpg'}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-stone-800 border border-stone-200 shadow-xs font-semibold">
                    REF: {code}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-[#00873E] text-white px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm">
                    {property.purpose === 'venda' ? 'Disponível p/ Venda' : 'Disponível p/ Locação'}
                  </div>
                </div>
              </div>

              {/* Right Segment: Technical Data & Actions (7 cols) */}
              <div className="md:col-span-7 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-mono font-semibold text-[#00873E] tracking-wider uppercase">
                        {property.type} • {property.address.neighborhood || 'Amparo'}
                      </span>
                      <h3 className="text-xl font-urbanist font-semibold text-stone-900 mt-1 leading-snug">
                        {property.title}
                      </h3>
                      <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#00873E] flex-shrink-0" />
                        {property.address.street}, {property.address.neighborhood} - {property.address.city || 'Amparo'}/SP
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-mono uppercase text-stone-400 block font-medium">Preço</span>
                      <span className="text-xl font-urbanist font-bold text-[#00873E]">
                        {formatCurrency(property.price)}
                      </span>
                      {property.condoFee ? (
                        <span className="text-[10px] text-stone-500 block">
                          Cond: {formatCurrency(property.condoFee)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Technical Metrics Grid */}
                  <div className="grid grid-cols-4 gap-2 my-5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                    <div className="text-center p-1.5">
                      <Bed className="w-4 h-4 mx-auto text-[#00873E] mb-1" />
                      <span className="text-sm font-semibold font-mono text-stone-900">{property.bedrooms}</span>
                      <span className="text-[10px] text-stone-500 block">Quartos</span>
                    </div>
                    <div className="text-center p-1.5 border-l border-stone-200">
                      <Bath className="w-4 h-4 mx-auto text-[#00873E] mb-1" />
                      <span className="text-sm font-semibold font-mono text-stone-900">{property.bathrooms}</span>
                      <span className="text-[10px] text-stone-500 block">Banheiros</span>
                    </div>
                    <div className="text-center p-1.5 border-l border-stone-200">
                      <Car className="w-4 h-4 mx-auto text-[#00873E] mb-1" />
                      <span className="text-sm font-semibold font-mono text-stone-900">{property.parkingSpots}</span>
                      <span className="text-[10px] text-stone-500 block">Vagas</span>
                    </div>
                    <div className="text-center p-1.5 border-l border-stone-200">
                      <Maximize2 className="w-4 h-4 mx-auto text-[#00873E] mb-1" />
                      <span className="text-sm font-semibold font-mono text-stone-900">{property.areaTotal}m²</span>
                      <span className="text-[10px] text-stone-500 block">Área</span>
                    </div>
                  </div>

                  {/* Features tags */}
                  <div>
                    <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block mb-2 font-medium">
                      Destaques do Imóvel:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(property.amenities || [
                        'Área Gourmet',
                        'Piscina',
                        'Condomínio Fechado',
                        'Segurança 24h',
                        'Vista Panorâmica',
                        'Ar Condicionado'
                      ]).map((feat, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-[11px] bg-stone-100 text-stone-700 border border-stone-200 font-mono"
                        >
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Row */}
                <div className="mt-6 pt-4 border-t border-stone-200 flex flex-col sm:flex-row gap-2.5 items-center justify-between">
                  <Link
                    href={`/imovel/${property.slug}`}
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Ver Página Completa
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00873E] hover:bg-[#15803d] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-red-950/20 transition-all transform hover:-translate-y-0.5"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    Solicitar Ficha via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
