'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="relative z-30 bg-[#061e12] text-stone-300 pt-16 pb-12 border-t border-emerald-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand & Credibility */}
          <div className="space-y-4">
            <div className="bg-white/95 rounded-xl p-3 inline-block shadow-sm">
              <Image
                src="/images/brand/logo.png"
                alt="Miyashiro Imóveis"
                width={180}
                height={50}
                className="object-contain"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
            <p className="text-stone-400 text-sm leading-relaxed font-light">
              Desde a nossa fundação em Amparo / SP, conectamos pessoas a lares e oportunidades com integridade, segurança jurídica e excelência.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-stone-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>CRECI 155957F • Registro Oficial</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white text-base font-medium mb-4 font-urbanist">Navegação Rápida</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/imoveis?finalidade=venda" className="hover:text-white transition flex items-center gap-1.5 text-stone-400">
                  <ArrowRight className="w-3 h-3 text-emerald-400" /> Imóveis à Venda
                </Link>
              </li>
              <li>
                <Link href="/imoveis?finalidade=aluguel" className="hover:text-white transition flex items-center gap-1.5 text-stone-400">
                  <ArrowRight className="w-3 h-3 text-emerald-400" /> Imóveis para Locação
                </Link>
              </li>
              <li>
                <Link href="/imoveis?tipo=chacara" className="hover:text-white transition flex items-center gap-1.5 text-stone-400">
                  <ArrowRight className="w-3 h-3 text-emerald-400" /> Chácaras & Sítios
                </Link>
              </li>
              <li>
                <Link href="/anunciar" className="hover:text-white transition flex items-center gap-1.5 text-stone-400">
                  <ArrowRight className="w-3 h-3 text-emerald-400" /> Anuncie seu Imóvel
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-white transition flex items-center gap-1.5 text-stone-400">
                  <ArrowRight className="w-3 h-3 text-emerald-400" /> Sobre a Imobiliária
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Address */}
          <div>
            <h3 className="text-white text-base font-medium mb-4 font-urbanist">Atendimento & Sede</h3>
            <ul className="space-y-3 text-sm text-stone-400 font-light">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Rua Ana Cintra, 246 - Centro, Amparo - SP, CEP 13900-011</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>(19) 99367-3949 / (19) 99609-5119</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>miyashiroimoveis@gmail.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Seg a Sex: 08:30 às 18:00 • Sáb: 08:30 às 12:00</span>
              </li>
            </ul>
          </div>

          {/* Column 4: WhatsApp Direct */}
          <div>
            <h3 className="text-white text-base font-medium mb-4 font-urbanist">Plantão Digital</h3>
            <p className="text-stone-400 text-sm mb-4 font-light">
              Fale diretamente com nossa corretora credenciada para agendamento de visitas ou avaliações.
            </p>
            <a
              href="https://wa.me/5519993673949?text=Ol%C3%A1%20Miyashiro%20Im%C3%B3veis%2C%20gostaria%20de%20conversar%20com%20um%20corretor."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#00873E] hover:bg-[#15803d] text-white py-3 px-4 rounded-xl text-sm font-medium transition shadow"
            >
              <span>Conversar pelo WhatsApp</span>
            </a>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-emerald-950 text-xs text-stone-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <p suppressHydrationWarning>© {new Date().getFullYear()} S. Miyashiro Corretora de Imóveis. Todos os direitos reservados. CRECI 155957F.</p>
          
          {/* Developed by Teralis Tecnologia */}
          <a
            href="https://teralis.pro"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group hover:text-white transition duration-200"
            title="Visitar Teralis Tecnologia (teralis.pro)"
          >
            <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 group-hover:scale-110 transition shadow-sm border border-stone-700 bg-stone-900 flex items-center justify-center p-0.5">
              <Image
                src="/images/brand/teralis_logo_white.png"
                alt="Teralis Tecnologia Logo"
                width={20}
                height={20}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-stone-400 group-hover:text-stone-200 transition">
              Desenvolvido com ❤️ por &copy; <span className="text-white font-medium group-hover:underline">Teralis Tecnologia</span>
            </span>
          </a>

          <div className="flex items-center gap-6">
            <Link href="/sobre" className="hover:text-stone-400 transition">Termos & Privacidade</Link>
            <Link href="/admin/login" className="hover:text-stone-400 transition">Acesso Restrito</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
