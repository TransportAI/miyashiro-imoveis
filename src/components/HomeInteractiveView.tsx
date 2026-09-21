'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, ShieldCheck, Award, Users, Key, Building2, Trees, Sparkles, MapPin, 
  LayoutGrid, Map as MapIcon, Compass, Filter, Ticket, CheckCircle2, ChevronRight, PhoneCall, MessageCircle
} from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import PropertyCard from '@/components/PropertyCard';
import HeroCarousel from '@/components/HeroCarousel';
import HeroBackgroundCarousel from '@/components/HeroBackgroundCarousel';
import MortgageCalculator from '@/components/MortgageCalculator';
import InteractiveMap from '@/components/InteractiveMap';
import BottomSheetFilter from '@/components/BottomSheetFilter';
import { Property } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface HomeInteractiveViewProps {
  initialProperties: Property[];
}

export default function HomeInteractiveView({ initialProperties }: HomeInteractiveViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  // Client-side instant filter com sanitização defensiva
  const filteredProperties = useMemo(() => {
    return initialProperties.filter((p) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchNeighborhood = p.address?.neighborhood?.toLowerCase().includes(q);
        const matchCity = p.address?.city?.toLowerCase().includes(q);
        const matchType = p.type.toLowerCase().includes(q);
        const matchCode = p.id.toLowerCase().includes(q);
        if (!matchTitle && !matchNeighborhood && !matchCity && !matchType && !matchCode) {
          return false;
        }
      }

      // Quick Tag filter
      if (selectedTag) {
        if (selectedTag === 'Chácaras') {
          if (p.type !== 'chacara') return false;
        } else if (selectedTag === 'Condomínio Fechado') {
          const allFeatures = [...(p.amenities || []), ...(p.features || [])];
          const hasCondo = p.title.toLowerCase().includes('condomínio') || p.description.toLowerCase().includes('condomínio') || allFeatures.some(f => f.toLowerCase().includes('condomínio'));
          if (!hasCondo) return false;
        } else if (selectedTag === 'Piscina') {
          const allFeatures = [...(p.amenities || []), ...(p.features || [])];
          const hasPool = allFeatures.some(f => f.toLowerCase().includes('piscina'));
          if (!hasPool) return false;
        } else if (selectedTag === 'Até R$ 500k') {
          if (p.price > 500000) return false;
        } else if (selectedTag === 'Ribeirão') {
          if (!p.address?.neighborhood?.toLowerCase().includes('ribeirão')) return false;
        } else if (selectedTag === 'Centro') {
          if (!p.address?.neighborhood?.toLowerCase().includes('centro')) return false;
        }
      }

      return true;
    });
  }, [initialProperties, searchQuery, selectedTag]);

  const featured = useMemo(() => {
    return initialProperties.filter((p) => p.featured && p.status !== 'arquivado');
  }, [initialProperties]);

  return (
    <div className="relative min-h-screen bg-[#FAF7F2] text-stone-900 selection:bg-[#00873E]/20 selection:text-[#00873E]">
      {/* Conteúdo da Landing Page com Camadas Elegantes e Fundo Claro */}
      <div className="relative z-10 space-y-16 sm:space-y-24 pb-24">
        
        {/* 1. Hero Section Imersiva com Fundo Claro e Carrossel de Fotos de Fundo */}
        <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
          {/* Carrossel de Fotos Animado no Fundo */}
          <HeroBackgroundCarousel />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
              
              {/* Badge de Confiança Estilo Origin Kit */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-stone-300/80 text-stone-800 text-xs font-mono shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00873E] animate-pulse" />
                <span>Amparo & Circuito das Águas Paulista • CRECI 155957F</span>
              </div>

              {/* Título Principal com Paleta Terracota e Urbanist */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-urbanist font-medium tracking-tight text-stone-900 leading-[1.15]">
                As melhores opções em imóveis em{' '}
                <span className="text-[#00873E] font-semibold">
                  Amparo
                </span>{' '}
                e região.
              </h1>

              {/* Subtítulo Claro e Elegante */}
              <p className="text-base sm:text-lg text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
                Casas de alto padrão, chácaras cinematográficas e apartamentos selecionados com a segurança jurídica e tradição da Miyashiro Imóveis.
              </p>
            </div>

            {/* Carrossel de Imóveis em Destaque no Topo */}
            {featured.length > 0 && (
              <div className="mb-10 relative z-20">
                <HeroCarousel properties={featured} />
              </div>
            )}

            {/* Barra de Busca Rápida Integrada */}
            <div className="max-w-4xl mx-auto relative z-30">
              <SearchBar
                onSearchChange={(query) => setSearchQuery(query)}
                onTagSelect={(tag) => setSelectedTag(selectedTag === tag ? '' : tag)}
                selectedTag={selectedTag}
              />
            </div>

            {/* Trust Stats Bar Translúcida */}
            <div className="mt-14 pt-8 border-t border-stone-300/60 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center max-w-4xl mx-auto font-mono">
              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/80 shadow-xs flex flex-col items-center justify-center">
                <p className="text-2xl sm:text-3xl font-urbanist font-semibold text-[#00873E] leading-tight">+10 Anos</p>
                <p className="text-xs text-stone-500 mt-1 font-medium">Tradição em Amparo / SP</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/80 shadow-xs flex flex-col items-center justify-center">
                <p className="text-2xl sm:text-3xl font-urbanist font-semibold text-[#00873E] leading-tight">CRECI 155957F</p>
                <p className="text-xs text-stone-500 mt-1 font-medium">Vistoria & Jurídico Seguro</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/80 shadow-xs flex flex-col items-center justify-center">
                <p className="text-2xl sm:text-3xl font-urbanist font-semibold text-[#00873E] leading-tight">2 Unidades</p>
                <p className="text-xs text-stone-500 mt-1 font-medium">Ribeirão & Centro</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/80 shadow-xs flex flex-col items-center justify-center">
                <p className="text-2xl sm:text-3xl font-urbanist font-semibold text-[#00873E] leading-tight">+1000</p>
                <p className="text-xs text-stone-500 mt-1 font-medium">Clientes Atendidos</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Seção de Filtros Rápidos (Gatilho ScrollTrigger #busca) */}
        <section id="busca" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-stone-600">
                Exibindo <strong className="text-[#00873E] font-semibold">{filteredProperties.length}</strong> imóveis disponíveis em Amparo
              </span>
              {selectedTag && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#00873E]/10 text-[#00873E] border border-[#00873E]/20 font-medium">
                  Tag: {selectedTag}
                  <button onClick={() => setSelectedTag('')} className="ml-1 hover:text-stone-900">×</button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                    viewMode === 'grid'
                      ? 'bg-[#00873E] text-white font-semibold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Vitrine</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                    viewMode === 'map'
                      ? 'bg-[#00873E] text-white font-semibold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Mapa</span>
                </button>
              </div>

              <button
                onClick={() => setBottomSheetOpen(true)}
                className="sm:hidden px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs font-mono text-stone-700 flex items-center gap-1"
              >
                <Filter className="w-3.5 h-3.5 text-[#00873E]" />
                <span>Filtros</span>
              </button>
            </div>
          </div>
        </section>

        {/* 3. Vitrine de Imóveis em Destaque (Gatilho ScrollTrigger #destaques) */}
        <section id="destaques" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {viewMode === 'map' ? (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-stone-200 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-urbanist font-semibold text-stone-900">Mapa Interativo de Amparo</h3>
                  <p className="text-xs text-stone-500 font-mono">Toque nos pinos para ver o resumo do imóvel e abrir a ficha técnica</p>
                </div>
              </div>
              <InteractiveMap
                properties={filteredProperties}
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#00873E] font-semibold">
                    Catálogo em Destaque
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-urbanist font-medium text-stone-900 mt-1">
                    Imóveis Selecionados em Amparo
                  </h2>
                </div>
                <Link
                  href="/imoveis"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00873E] hover:text-[#15803d] transition group font-medium"
                >
                  <span>Ver Catálogo Completo</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 4. Simulador de Financiamento */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MortgageCalculator />
        </section>

        {/* 5. Explore por Categoria */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-stone-200/80 shadow-xs">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="text-2xl font-urbanist font-medium text-stone-900">Explore por Categoria</h2>
              <p className="text-stone-500 text-xs font-mono mt-1">Navegue pelas principais tipologias de imóveis em Amparo e Região</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                href="/imoveis?tipo=casa"
                className="p-6 rounded-2xl bg-stone-50/90 hover:bg-white border border-stone-200/80 hover:border-red-500/40 text-center transition flex flex-col items-center group shadow-xs hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#00873E] border border-emerald-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition mb-3">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-sm font-urbanist font-semibold text-stone-900">Casas & Condomínios</span>
                <span className="text-[11px] font-mono text-stone-500 mt-0.5">Venda e Locação</span>
              </Link>

              <Link
                href="/imoveis?tipo=apartamento"
                className="p-6 rounded-2xl bg-stone-50/90 hover:bg-white border border-stone-200/80 hover:border-red-500/40 text-center transition flex flex-col items-center group shadow-xs hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#00873E] border border-emerald-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-sm font-urbanist font-semibold text-stone-900">Apartamentos</span>
                <span className="text-[11px] font-mono text-stone-500 mt-0.5">Centro & Ribeirão</span>
              </Link>

              <Link
                href="/imoveis?tipo=chacara"
                className="p-6 rounded-2xl bg-stone-50/90 hover:bg-white border border-stone-200/80 hover:border-red-500/40 text-center transition flex flex-col items-center group shadow-xs hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#00873E] border border-emerald-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition mb-3">
                  <Trees className="w-6 h-6" />
                </div>
                <span className="text-sm font-urbanist font-semibold text-stone-900">Chácaras & Sítios</span>
                <span className="text-[11px] font-mono text-stone-500 mt-0.5">Circuito das Águas</span>
              </Link>

              <Link
                href="/imoveis?tipo=terreno"
                className="p-6 rounded-2xl bg-stone-50/90 hover:bg-white border border-stone-200/80 hover:border-red-500/40 text-center transition flex flex-col items-center group shadow-xs hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#00873E] border border-emerald-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition mb-3">
                  <Key className="w-6 h-6" />
                </div>
                <span className="text-sm font-urbanist font-semibold text-stone-900">Terrenos & Lotes</span>
                <span className="text-[11px] font-mono text-stone-500 mt-0.5">Prontos p/ construir</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 6. Banner Institucional: Anuncie seu Imóvel */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#120603] via-stone-900 to-[#3A0F02] text-white p-8 md:p-14 shadow-xl border border-stone-800">
            <div className="absolute -right-12 -bottom-12 w-72 h-72 rounded-full bg-[#00873E]/20 pointer-events-none blur-3xl" />
            <div className="absolute right-1/4 -top-10 w-60 h-60 rounded-full bg-[#00873E]/10 pointer-events-none blur-3xl" />

            <div className="relative z-10 max-w-2xl space-y-5">
              <span className="inline-block px-3 py-1 rounded-full bg-[#00873E]/30 text-rose-200 text-xs font-mono font-semibold border border-[#00873E]/40">
                Para Proprietários em Amparo e Região
              </span>
              <h2 className="text-3xl sm:text-4xl font-urbanist font-medium leading-tight">
                Deseja vender ou alugar seu imóvel com agilidade e avaliação precisa?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed">
                A Miyashiro Imóveis oferece assessoria jurídica documental completa, produção de média profissional (incluindo Tour Virtual 360°) e ampla divulgação regional para compradores qualificados.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/anunciar"
                  className="bg-[#00873E] hover:bg-[#15803d] text-white font-mono font-semibold text-xs px-6 py-3 rounded-full transition shadow-md shadow-red-950/30"
                >
                  Cadastrar Meu Imóvel
                </Link>
                <a
                  href="https://wa.me/5519993673949?text=Ol%C3%A1%2C%20quero%20anunciar%20meu%20im%C3%B3vel%20com%20a%20Gallo%20Im%C3%B3veis."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-full text-xs font-mono transition flex items-center gap-2"
                >
                  Falar com Avaliador via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Contato / Corretor / Footer (Gatilho ScrollTrigger #contato) */}
        <section id="contato" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#00873E] font-semibold">
              Diferenciais Gallo
            </span>
            <h2 className="text-2xl sm:text-3xl font-urbanist font-medium text-stone-900 mt-1">
              Por que escolher a Miyashiro Imóveis?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#00873E] border border-emerald-200 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-urbanist font-semibold text-stone-900">Segurança Jurídica Rigorosa</h3>
              <p className="text-stone-600 text-xs leading-relaxed font-light">
                Análise minuciosa de matrículas, certidões negativas e documentação imobiliária. Garantia de transações sem riscos em Amparo e no Circuito das Águas.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#00873E] border border-emerald-200 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-urbanist font-semibold text-stone-900">Domínio do Mercado de Amparo</h3>
              <p className="text-stone-600 text-xs leading-relaxed font-light">
                Mais de uma década com duas unidades de atendimento estratégico (Ribeirão e Centro), acompanhando o valor de cada metro quadrado da região.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#00873E] border border-emerald-200 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-urbanist font-semibold text-stone-900">Atendimento Humanizado & Ágil</h3>
              <p className="text-stone-600 text-xs leading-relaxed font-light">
                Equipe de corretores credenciados que realizam consultoria sob medida, desde o primeiro contato até a assinatura da escritura e entrega das chaves.
              </p>
            </div>
          </div>
        </section>

        {/* Mobile Bottom Sheet Filters */}
        <BottomSheetFilter
          isOpen={bottomSheetOpen}
          onClose={() => setBottomSheetOpen(false)}
          selectedTags={selectedTag ? [selectedTag] : []}
          onToggleTag={(t) => setSelectedTag(selectedTag === t ? '' : t)}
          onClearFilters={() => setSelectedTag('')}
          totalResults={filteredProperties.length}
        />
      </div>
    </div>
  );
}
