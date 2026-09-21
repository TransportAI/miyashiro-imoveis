'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, MessageCircle, ShieldCheck, Lock } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Oculta a Navbar pública em todas as páginas de administração e login
  if (pathname?.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', href: '/' },
    { name: 'Imóveis', href: '/imoveis' },
    { name: 'Comparador', href: '/comparador' },
    { name: 'Anuncie seu Imóvel', href: '/anunciar' },
    { name: 'Sobre Nós', href: '/sobre' },
    { name: 'Contato', href: '/contato' },
  ];

  return (
    <header className="sticky top-0 z-40 flex flex-col w-full">
      {/* Main Navbar */}
      <nav
        className={`w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200/80 py-2'
            : 'bg-white border-b border-stone-200/60 py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center group py-0.5">
            <div className="relative w-36 sm:w-44 h-14 sm:h-16 flex items-center justify-center">
              <Image
                src="/images/brand/logo.png"
                alt="Miyashiro Imóveis"
                fill
                sizes="(max-width: 640px) 144px, 176px"
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-gallo-700 relative py-1 ${
                    isActive
                      ? 'text-gallo-700 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gallo-600 after:rounded-full'
                      : 'text-stone-700'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Fast Action CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="https://wa.me/5519993673949?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20im%C3%B3veis%20em%20Amparo."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#00873E] hover:bg-[#15803d] text-white text-xs font-medium px-4 py-2.5 rounded-full transition shadow-sm hover:shadow active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>(19) 99367-3949</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href="https://wa.me/5519993673949"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gallo-700 bg-gallo-50 rounded-full"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-stone-700 hover:bg-stone-100 transition"
              aria-label="Alternar Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="lg:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 space-y-3">
            <div className="flex flex-col space-y-2 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 text-base font-medium text-stone-800 hover:bg-stone-50 rounded-lg"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 border-t border-stone-100 flex flex-col gap-2">
              <a
                href="https://wa.me/5519993673949"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#00873E] text-white py-2.5 rounded-xl font-medium text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Falar no WhatsApp (19 99367-3949)
              </a>
              <Link
                href="/admin/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2 text-xs text-stone-500 hover:text-stone-700"
              >
                Acessar Painel Administrativo
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Institutional bar */}
      <div className="bg-[#061e12] text-stone-300 text-xs py-2 px-4 hidden md:block border-t border-emerald-950 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-normal text-stone-300">
              <ShieldCheck className="w-3.5 h-3.5 text-gallo-300" />
              CRECI 155957F • Tradição e Confiança em Amparo / SP
            </span>
            <span className="text-stone-500">|</span>
            <span className="text-stone-300">Rua Ana Cintra, 246 - Centro</span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="tel:19996095119"
              className="hover:text-white transition flex items-center gap-1 text-stone-300"
            >
              <Phone className="w-3 h-3 text-gallo-300" />
              (19) 99609-5119
            </a>
            <span className="text-stone-500">|</span>
            <Link
              href="/admin/login"
              className="text-stone-400 hover:text-stone-200 transition flex items-center gap-1 text-[11px]"
            >
              <Lock className="w-2.5 h-2.5" />
              Painel Corretor
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
