'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send } from 'lucide-react';

export default function WhatsAppCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [hasComparison, setHasComparison] = useState(false);
  const [isModalOr360Open, setIsModalOr360Open] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkComparison = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('gallo_comparison_ids') || '[]');
        setHasComparison(Array.isArray(stored) && stored.length > 0 && pathname !== '/comparador');
      } catch (e) {
        setHasComparison(false);
      }
    };

    const handleModalToggle = (e: any) => {
      setIsModalOr360Open(!!e?.detail?.isOpen);
    };

    const handle360Toggle = (e: any) => {
      // On mobile screens (< 768px), hide floating button if 360 view is active on the page
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setIsModalOr360Open(!!e?.detail?.active);
      }
    };

    checkComparison();
    window.addEventListener('gallo_comparison_change', checkComparison);
    window.addEventListener('storage', checkComparison);
    window.addEventListener('gallo_modal_toggle', handleModalToggle);
    window.addEventListener('gallo_360_active', handle360Toggle);

    return () => {
      window.removeEventListener('gallo_comparison_change', checkComparison);
      window.removeEventListener('storage', checkComparison);
      window.removeEventListener('gallo_modal_toggle', handleModalToggle);
      window.removeEventListener('gallo_360_active', handle360Toggle);
    };
  }, [pathname]);

  if (pathname?.startsWith('/admin') || isModalOr360Open) {
    return null;
  }

  const toggleOpen = (state?: boolean) => {
    const nextState = typeof state === 'boolean' ? state : !isOpen;
    setIsOpen(nextState);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gallo_whatsapp_toggle', { detail: { isOpen: nextState } }));
    }
  };

  const sendWhatsApp = (msg?: string) => {
    const textToSend = msg || customMsg || 'Olá! Gostaria de conversar com a equipe da Miyashiro Imóveis.';
    const url = `https://wa.me/5519993673949?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank');
    toggleOpen(false);
  };

  return (
    <div className={`hidden md:flex fixed z-50 flex-col items-end transition-all duration-300 ${
      hasComparison ? 'bottom-20 sm:bottom-24 lg:bottom-6 right-3 sm:right-6' : 'bottom-6 right-3 sm:right-6'
    }`}>
      {/* Popover Window */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-24px)] max-w-sm sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-urbanist text-lg font-bold">
                M
              </div>
              <div>
                <h4 className="text-sm font-medium font-urbanist">Plantão Miyashiro Imóveis</h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1 font-light">
                  <span className="w-2 h-2 rounded-full bg-white inline-block animate-pulse"></span>
                  Online no WhatsApp • Amparo/SP
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
              aria-label="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 bg-[#FAF7F2] space-y-3 text-xs text-stone-700">
            <div className="bg-white p-3 rounded-xl shadow-xs border border-stone-200/60">
              <p className="leading-relaxed">
                Olá! Seja bem-vindo à <strong>Miyashiro Imóveis</strong>. Como podemos te ajudar hoje?
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => sendWhatsApp('Olá, quero comprar um imóvel em Amparo.')}
                className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 transition text-[11px] text-stone-800 cursor-pointer"
              >
                🏡 Quero comprar uma casa ou terreno em Amparo
              </button>
              <button
                onClick={() => sendWhatsApp('Olá, procuro imóvel para locação em Amparo.')}
                className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 transition text-[11px] text-stone-800 cursor-pointer"
              >
                🔑 Procuro imóvel para locação residencial/comercial
              </button>
              <button
                onClick={() => sendWhatsApp('Olá, quero avaliar e anunciar meu imóvel com vocês.')}
                className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 transition text-[11px] text-stone-800 cursor-pointer"
              >
                📋 Quero anunciar meu imóvel na Miyashiro Imóveis
              </button>
            </div>
          </div>

          <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendWhatsApp()}
              className="flex-1 text-xs border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <button
              onClick={() => sendWhatsApp()}
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-2 rounded-xl transition cursor-pointer"
              aria-label="Enviar WhatsApp"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl shadow-emerald-600/30 transition-all duration-300 transform active:scale-95 group cursor-pointer"
        aria-label="Conversar no WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-white transition group-hover:scale-110" />
        <span className="hidden sm:inline text-xs font-bold font-sans tracking-wide text-white">Falar no WhatsApp</span>
      </button>
    </div>
  );
}
