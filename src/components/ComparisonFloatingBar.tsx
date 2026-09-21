'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';
import { Property } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import propertiesData from '@/data/properties.json';

export default function ComparisonFloatingBar() {
  const pathname = usePathname();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>(propertiesData as Property[]);
  const [isMinimized, setIsMinimized] = useState(false);

  const loadSelection = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('gallo_comparison_ids') || '[]');
      setSelectedIds(Array.isArray(stored) ? stored : []);
    } catch (e) {
      setSelectedIds([]);
    }
  };

  useEffect(() => {
    loadSelection();

    // Fetch live properties if available
    fetch('/api/properties', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAllProperties(data);
        }
      })
      .catch(() => {});

    const handleStorage = () => loadSelection();
    window.addEventListener('gallo_comparison_change', handleStorage);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('gallo_comparison_change', handleStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // If on comparador page or admin, don't show the floating bar
  if (pathname === '/comparador' || pathname?.startsWith('/admin') || selectedIds.length === 0) {
    return null;
  }

  const selectedProperties = selectedIds
    .map(id => allProperties.find(p => p.id.toLowerCase() === id.toLowerCase()))
    .filter(Boolean) as Property[];

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = selectedIds.filter(item => item.toLowerCase() !== id.toLowerCase());
    localStorage.setItem('gallo_comparison_ids', JSON.stringify(next));
    setSelectedIds(next);
    window.dispatchEvent(new Event('gallo_comparison_change'));
  };

  const handleClear = () => {
    localStorage.removeItem('gallo_comparison_ids');
    setSelectedIds([]);
    window.dispatchEvent(new Event('gallo_comparison_change'));
  };

  return (
    <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1rem)] sm:w-full max-w-3xl px-1 sm:px-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-stone-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-stone-700/80 p-2.5 sm:p-4">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Left Title & Counter */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-semibold tracking-wide">
                  <span className="hidden sm:inline">Comparador de Imóveis</span>
                  <span className="inline sm:hidden">Comparar</span>
                </span>
                <span className="bg-amber-500 text-stone-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {selectedIds.length}/3
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden md:block">
                Selecione até 3 imóveis para confrontar preços, m² e diferenciais.
              </p>
            </div>
          </div>

          {/* Center Thumbnails */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5">
            {selectedProperties.map(p => (
              <div
                key={p.id}
                className="relative group/thumb w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl overflow-hidden border border-white/20 bg-stone-800 shrink-0 shadow-xs"
                title={p.title + ' - ' + formatCurrency(p.price)}
              >
                <Image
                  src={p.images?.[0] || '/images/properties/gallo_prop_1.jpg'}
                  alt={p.title}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => handleRemove(p.id, e)}
                  className="absolute inset-0 bg-red-600/85 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                  title="Remover"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 sm:p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition"
              title="Limpar seleção"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <Link
              href="/comparador"
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition flex items-center gap-1 sm:gap-1.5 shadow-md active:scale-95 shrink-0"
            >
              <span>Comparar</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
