'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, MessageCircle, Phone } from 'lucide-react';
import { Property } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import InterestModal from './InterestModal';

interface PropertyDetailActionsProps {
  property: Property;
}

export default function PropertyDetailActions({ property }: PropertyDetailActionsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('gallo_saved_properties') || '[]');
      setIsSaved(saved.includes(property.id));
    } catch (e) {}
  }, [property.id]);

  const whatsappMessage = encodeURIComponent(
    `Olá Miyashiro Imóveis! Tenho interesse no imóvel REF: ${property.id.toUpperCase()} - ${property.title} (${formatCurrency(property.price)}). Poderia me passar mais detalhes e agendar uma visita?`
  );

  return (
    <div className="space-y-3">
      {/* Primary Save / Interest Button */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-xl font-medium text-xs transition shadow-sm active:scale-98"
      >
        <Bookmark className="w-4 h-4 fill-current" />
        <span>{isSaved ? 'Imóvel Salvo nos Seus Favoritos' : 'Salvar Imóvel & Registrar Interesse'}</span>
      </button>

      {/* Direct WhatsApp Button */}
      <a
        href={`https://wa.me/5519993673949?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-xl font-medium text-xs transition shadow-md hover:shadow-lg active:scale-98"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Falar com Corretor no WhatsApp</span>
      </a>

      {/* Direct Phone Call */}
      <a
        href="tel:19996095119"
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium text-xs transition"
      >
        <Phone className="w-3.5 h-3.5 text-stone-500" />
        <span>Ligar (19) 99609-5119</span>
      </a>

      {/* Modal */}
      <InterestModal
        property={property}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => setIsSaved(true)}
      />
    </div>
  );
}
