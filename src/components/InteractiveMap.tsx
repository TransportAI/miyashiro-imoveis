'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Compass, Layers, Home, Eye, X, ArrowUpRight, Bed, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface InteractiveMapProps {
  properties: Property[];
  onOpenBoardingPass?: (property: Property) => void;
}

// Coordinate offsets centered around Amparo - SP (-22.7087, -46.7722)
const AMPARO_COORDS = [
  { top: '38%', left: '46%', neighborhood: 'Ribeirão' },
  { top: '48%', left: '52%', neighborhood: 'Centro' },
  { top: '32%', left: '58%', neighborhood: 'Silvestre' },
  { top: '62%', left: '42%', neighborhood: 'Jardim Modelo' },
  { top: '25%', left: '35%', neighborhood: 'Chácaras das Águas' },
  { top: '55%', left: '68%', neighborhood: 'São Dimas' },
  { top: '42%', left: '30%', neighborhood: 'Vale Verde' },
  { top: '70%', left: '58%', neighborhood: 'Ponto Nobre' },
  { top: '28%', left: '65%', neighborhood: 'Residencial Provence' },
  { top: '50%', left: '38%', neighborhood: 'Morada dos Ipês' },
];

export default function InteractiveMap({ properties, onOpenBoardingPass }: InteractiveMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('todos');

  const filteredProperties = properties.filter((p) => {
    if (activeFilter === 'todos') return true;
    if (activeFilter === 'venda') return p.purpose === 'venda';
    if (activeFilter === 'aluguel') return p.purpose === 'aluguel';
    if (activeFilter === 'chacara') return p.type === 'chacara';
    return true;
  });

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-[#00873E]/30 bg-[#070B14] shadow-2xl">
      {/* Top Map Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-[#0B132B]/80 backdrop-blur-md p-2 rounded-2xl border border-[#00873E]/30">
        <div className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-[#FF7A59] font-semibold border-r border-slate-700/60">
          <Navigation className="w-3.5 h-3.5 animate-spin-slow text-[#FF7A59]" />
          <span>AMPARO / SP • MAP VIEW</span>
        </div>
        <button
          onClick={() => setActiveFilter('todos')}
          className={`px-3 py-1 rounded-xl text-xs font-mono transition-colors ${
            activeFilter === 'todos' ? 'bg-[#00873E] text-white font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          Todos ({properties.length})
        </button>
        <button
          onClick={() => setActiveFilter('venda')}
          className={`px-3 py-1 rounded-xl text-xs font-mono transition-colors ${
            activeFilter === 'venda' ? 'bg-[#00873E] text-white font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          Venda
        </button>
        <button
          onClick={() => setActiveFilter('aluguel')}
          className={`px-3 py-1 rounded-xl text-xs font-mono transition-colors ${
            activeFilter === 'aluguel' ? 'bg-[#00873E] text-white font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          Locação
        </button>
        <button
          onClick={() => setActiveFilter('chacara')}
          className={`px-3 py-1 rounded-xl text-xs font-mono transition-colors ${
            activeFilter === 'chacara' ? 'bg-[#00873E] text-white font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          Chácaras
        </button>
      </div>

      {/* Styled Dark Mode Map Background Canvas Simulation */}
      <div className="absolute inset-0 z-0 bg-[#070B14] overflow-hidden">
        {/* Stylized Grid Lines */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, #1E293B 1px, transparent 1px), linear-gradient(to bottom, #1E293B 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Contour Curves & Rivers of Amparo Region (Circuito das Águas) */}
        <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Rio Camanducaia Simulation */}
          <path
            d="M -100 200 C 150 220, 300 180, 500 320 C 700 460, 950 380, 1400 450"
            fill="none"
            stroke="#00873E"
            strokeWidth="8"
            strokeLinecap="round"
            filter="blur(2px)"
          />
          <path
            d="M -100 200 C 150 220, 300 180, 500 320 C 700 460, 950 380, 1400 450"
            fill="none"
            stroke="#DC2626"
            strokeWidth="3"
            strokeDasharray="8 6"
          />

          {/* SP-095 / Major Highway Lines */}
          <path
            d="M 100 -50 L 320 280 L 620 340 L 980 650"
            fill="none"
            stroke="#334155"
            strokeWidth="5"
          />
          <path
            d="M 100 -50 L 320 280 L 620 340 L 980 650"
            fill="none"
            stroke="#F8FAFC"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            opacity="0.6"
          />

          {/* Secondary Arteries */}
          <path d="M 280 280 Q 450 150 780 180" fill="none" stroke="#1E293B" strokeWidth="3" />
          <path d="M 520 340 Q 600 520 850 560" fill="none" stroke="#1E293B" strokeWidth="3" />
        </svg>

        {/* Region Labels */}
        <div className="absolute top-[35%] left-[44%] text-[11px] font-mono tracking-widest text-slate-500 font-bold uppercase pointer-events-none">
          Bairro Ribeirão • Unidade Miyashiro
        </div>
        <div className="absolute top-[49%] left-[53%] text-[11px] font-mono tracking-widest text-slate-500 font-bold uppercase pointer-events-none">
          Centro Histórico • Amparo
        </div>
        <div className="absolute top-[20%] left-[30%] text-[11px] font-mono tracking-widest text-red-500/50 font-bold uppercase pointer-events-none">
          Circuito das Águas Paulista
        </div>
      </div>

      {/* Interactive Markers */}
      {filteredProperties.map((prop, idx) => {
        const coord = AMPARO_COORDS[idx % AMPARO_COORDS.length];
        const isSelected = selectedProperty?.id === prop.id;
        const formattedShortPrice =
          prop.price >= 1000000
            ? `R$ ${(prop.price / 1000000).toFixed(2).replace('.', ',')}M`
            : `R$ ${(prop.price / 1000).toFixed(0)}k`;

        return (
          <div
            key={prop.id}
            style={{ top: coord.top, left: coord.left }}
            className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
          >
            <motion.button
              whileHover={{ scale: 1.15, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedProperty(isSelected ? null : prop)}
              className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs font-bold transition-all shadow-xl ${
                isSelected
                  ? 'bg-[#00873E] text-white ring-4 ring-red-600/40 scale-110 z-30'
                  : 'bg-[#0B132B] text-rose-200 border border-[#00873E]/40 hover:border-red-500 hover:bg-[#00873E]/20'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  prop.purpose === 'venda' ? 'bg-[#00873E]' : 'bg-amber-400'
                }`}
              />
              <span>{formattedShortPrice}</span>
            </motion.button>
          </div>
        );
      })}

      {/* Popover Preview Card on Pin Select */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="absolute bottom-6 right-6 left-6 sm:left-auto sm:w-96 z-30 bg-[#0F172A]/95 backdrop-blur-xl border border-[#00873E]/40 rounded-2xl shadow-2xl p-4 text-slate-100"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-[#00873E]/40 text-emerald-400 uppercase font-semibold">
                {selectedProperty.id.toUpperCase().replace(/^(PRI|GAL)-/i, 'MIY-')} • {selectedProperty.address.neighborhood || 'Amparo'}
              </span>
              <button
                onClick={() => setSelectedProperty(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-3">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-slate-700">
                <Image
                  src={selectedProperty.images?.[0] || '/images/properties/casa_condominio_1.jpg'}
                  alt={selectedProperty.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-urbanist font-semibold text-white truncate">
                  {selectedProperty.title}
                </h4>
                <p className="text-xs text-[#FF7A59] font-urbanist font-bold mt-1">
                  {formatCurrency(selectedProperty.price)}
                </p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Bed className="w-3 h-3 text-[#FF7A59]" />
                    {selectedProperty.bedrooms} {selectedProperty.bedrooms === 1 ? 'quarto' : 'quartos'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Maximize2 className="w-3 h-3 text-[#FF7A59]" />
                    {selectedProperty.areaTotal}m²
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              {onOpenBoardingPass && (
                <button
                  onClick={() => {
                    onOpenBoardingPass(selectedProperty);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-[#FF7A59]" />
                  Ficha Boarding Pass
                </button>
              )}

              <Link
                href={`/imovel/${selectedProperty.slug}`}
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#00873E] hover:bg-[#15803d] text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-md shadow-red-950/20"
              >
                Ver Detalhes
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Legend / Watermark */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#0B132B]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#00873E]/30 flex items-center gap-3 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00873E]" /> Venda
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Locação
        </span>
        <span className="text-[#FF7A59] font-semibold">CRECI 155957F</span>
      </div>
    </div>
  );
}
