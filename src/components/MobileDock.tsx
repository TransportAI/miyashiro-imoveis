'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, MessageCircle, PlusCircle, ShieldCheck, Home } from 'lucide-react';

export default function MobileDock() {
  const pathname = usePathname();

  // Oculta a barra de navegação pública nas rotas de administração
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isHome = pathname === '/';
  const isImoveis = pathname.startsWith('/imoveis');
  const isAnunciar = pathname.startsWith('/anunciar');
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden w-[92%] max-w-sm pointer-events-auto">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="bg-[#1E1412]/95 backdrop-blur-2xl border border-white/10 px-3 py-2.5 rounded-full shadow-2xl flex items-center justify-around text-stone-300"
      >
        {/* Home */}
        <Link href="/" className="relative flex flex-col items-center">
          <motion.div whileTap={{ scale: 0.85 }} className={`p-2 rounded-full ${isHome ? 'bg-[#00873E] text-white font-bold' : 'hover:text-stone-100'}`}>
            <Home className="w-4 h-4" />
          </motion.div>
          <span className={`text-[9px] font-mono mt-0.5 ${isHome ? 'text-amber-400 font-bold' : 'text-stone-400'}`}>Início</span>
        </Link>

        {/* Buscar Imóveis */}
        <Link href="/imoveis" className="relative flex flex-col items-center">
          <motion.div whileTap={{ scale: 0.85 }} className={`p-2 rounded-full ${isImoveis ? 'bg-[#00873E] text-white font-bold' : 'hover:text-stone-100'}`}>
            <Search className="w-4 h-4" />
          </motion.div>
          <span className={`text-[9px] font-mono mt-0.5 ${isImoveis ? 'text-amber-400 font-bold' : 'text-stone-400'}`}>Busca</span>
        </Link>

        {/* WhatsApp Direct - Highlighted CTA */}
        <a
          href="https://wa.me/5519993673949?text=Ol%C3%A1%2C%20Imobili%C3%A1ria%20Gallo!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20im%C3%B3veis%20em%20Amparo."
          target="_blank"
          rel="noopener noreferrer"
          className="relative -top-2 flex flex-col items-center"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#00873E] to-[#B91C1C] text-white flex items-center justify-center shadow-lg shadow-emerald-900/30 border-2 border-[#1E1412]"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
          </motion.div>
          <span className="text-[9px] font-mono font-bold text-amber-400">Whats</span>
        </a>

        {/* Anunciar */}
        <Link href="/anunciar" className="relative flex flex-col items-center">
          <motion.div whileTap={{ scale: 0.85 }} className={`p-2 rounded-full ${isAnunciar ? 'bg-[#00873E] text-white font-bold' : 'hover:text-stone-100'}`}>
            <PlusCircle className="w-4 h-4" />
          </motion.div>
          <span className={`text-[9px] font-mono mt-0.5 ${isAnunciar ? 'text-amber-400 font-bold' : 'text-stone-400'}`}>Anunciar</span>
        </Link>

        {/* Admin / Login */}
        <Link href="/admin/login" className="relative flex flex-col items-center">
          <motion.div whileTap={{ scale: 0.85 }} className={`p-2 rounded-full ${isAdmin ? 'bg-[#00873E] text-white font-bold' : 'hover:text-stone-100'}`}>
            <ShieldCheck className="w-4 h-4" />
          </motion.div>
          <span className={`text-[9px] font-mono mt-0.5 ${isAdmin ? 'text-amber-400 font-bold' : 'text-stone-400'}`}>Admin</span>
        </Link>
      </motion.div>
    </div>
  );
}
