'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Check, RotateCcw } from 'lucide-react';

interface BottomSheetFilterProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearFilters: () => void;
  totalResults: number;
}

const AVAILABLE_TAGS = [
  'Chácaras',
  'Condomínio Fechado',
  'Piscina',
  'Área Gourmet',
  'Até R$ 500k',
  'R$ 500k a R$ 1M',
  'Acima de R$ 1M',
  'Amparo - Centro',
  'Ribeirão',
  'Circuito das Águas',
  'Comprar',
  'Alugar',
  '3+ Dormitórios',
  'Tour Virtual 360°'
];

export default function BottomSheetFilter({
  isOpen,
  onClose,
  selectedTags,
  onToggleTag,
  onClearFilters,
  totalResults,
}: BottomSheetFilterProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="relative w-full max-w-lg bg-[#0F172A] border-t border-[#00873E]/40 rounded-t-3xl p-6 shadow-2xl z-10 text-slate-100 max-h-[85vh] overflow-y-auto"
          >
            {/* Grab Bar */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-5" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#FF7A59]" />
                <h3 className="font-urbanist text-lg font-semibold text-white">
                  Filtros Rápidos & Tags
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {selectedTags.length > 0 && (
                  <button
                    onClick={onClearFilters}
                    className="text-xs font-mono text-slate-400 hover:text-[#FF7A59] flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Limpar
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tags Cloud */}
            <div className="py-5">
              <span className="text-xs font-mono text-slate-400 block mb-3 uppercase tracking-wider">
                Selecione as características desejadas:
              </span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <motion.button
                      key={tag}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onToggleTag(tag)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#00873E] text-white font-bold shadow-lg shadow-red-950/30 ring-2 ring-[#00873E]'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/60'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      {tag}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Apply CTA */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-slate-400">
                <strong className="text-[#FF7A59] font-bold">{totalResults}</strong> imóveis encontrados
              </span>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#00873E] hover:bg-[#15803d] text-white font-semibold text-xs shadow-lg shadow-red-950/30"
              >
                Ver Imóveis
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
