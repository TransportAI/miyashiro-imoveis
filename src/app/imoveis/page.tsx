'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import propertiesData from '@/data/properties.json';
import { Property } from '@/lib/types';
import { Filter, SlidersHorizontal, ArrowUpDown, Search, RefreshCw, Bookmark, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { showToast } from '@/components/Toast';

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialPurpose = searchParams.get('finalidade') || 'todos';
  const initialType = searchParams.get('tipo') || 'todos';
  const initialNeighborhood = searchParams.get('bairro') || 'todos';
  const initialPriceMax = searchParams.get('precoMax') || '';

  const initialTab = initialPurpose === 'venda' ? 'venda' : initialPurpose === 'aluguel' ? 'aluguel' : 'todos';

  const [viewTab, setViewTab] = useState<'todos' | 'venda' | 'aluguel' | 'salvos'>(initialTab);
  const [purpose, setPurpose] = useState<string>(initialPurpose);
  const [type, setType] = useState<string>(initialType);
  const [neighborhood, setNeighborhood] = useState<string>(initialNeighborhood);
  const [priceMax, setPriceMax] = useState<string>(initialPriceMax);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<string>('recentes');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>(propertiesData as Property[]);

  // Bairros disponíveis de forma dinâmica e desencadeada
  const availableNeighborhoods = useMemo(() => {
    return Array.from(
      new Set(
        properties
          .filter((p) => p.status !== 'arquivado')
          .map((p) => p.address?.neighborhood)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [properties]);

  // Smooth drag-to-scroll for horizontal tabs
  const tabsRef = useRef<HTMLDivElement>(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDownRef.current = true;
    hasMovedRef.current = false;
    if (!tabsRef.current) return;
    startXRef.current = e.pageX - tabsRef.current.offsetLeft;
    scrollLeftRef.current = tabsRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current || !tabsRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 5) {
      hasMovedRef.current = true;
    }
    tabsRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDownRef.current = false;
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showAll, setShowAll] = useState<boolean>(false);
  const ITEMS_PER_PAGE = 21;

  // React to URL search params (e.g. clicking Comprar or Alugar in navbar)
  useEffect(() => {
    const p = searchParams.get('finalidade');
    if (p === 'venda') {
      setViewTab('venda');
      setPurpose('venda');
      setCurrentPage(1);
    } else if (p === 'aluguel') {
      setViewTab('aluguel');
      setPurpose('aluguel');
      setCurrentPage(1);
    } else if (p === 'todos') {
      setViewTab('todos');
      setPurpose('todos');
      setCurrentPage(1);
    }

    const t = searchParams.get('tipo');
    if (t) setType(t);
    const b = searchParams.get('bairro');
    if (b) setNeighborhood(b);
    const qParam = searchParams.get('q') || searchParams.get('localizacao');
    if (qParam) setSearchQuery(qParam);
  }, [searchParams]);

  // Load saved IDs & live data from API and custom localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('gallo_saved_properties') || '[]');
      setSavedIds(saved);
    } catch (e) {}

    // Synchronize with local custom properties & API
    try {
      const customProps: Property[] = JSON.parse(localStorage.getItem('gallo_custom_properties') || '[]');
      if (customProps.length > 0) {
        const map = new Map<string, Property>();
        (propertiesData as Property[]).forEach(p => map.set(p.id.toLowerCase(), p));
        customProps.forEach(p => map.set(p.id.toLowerCase(), p));
        setProperties(Array.from(map.values()));
      }
    } catch (e) {}

    fetch('/api/properties', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProperties(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSavedChange = (propId: string, isSaved: boolean) => {
    if (isSaved) {
      setSavedIds(prev => [...new Set([...prev, propId])]);
    } else {
      setSavedIds(prev => prev.filter(id => id !== propId));
    }
  };

  // Filtered Properties with deduplication
  const filteredProperties = useMemo(() => {
    const list = properties.filter((p) => {
      // Exclude archived properties from the public catalog
      if (p.status === 'arquivado') return false;

      // Tab filter & purpose filter
      if (viewTab === 'venda' && p.purpose !== 'venda') return false;
      if (viewTab === 'aluguel' && p.purpose !== 'aluguel') return false;
      if (viewTab === 'salvos' && !savedIds.includes(p.id)) return false;

      if (purpose !== 'todos' && p.purpose !== purpose) return false;

      // Select filters
      if (type !== 'todos' && p.type !== type) return false;
      if (neighborhood !== 'todos' && p.address.neighborhood.toLowerCase() !== neighborhood.toLowerCase()) return false;
      if (priceMax && p.price > Number(priceMax)) return false;
      if (bedrooms !== 'todos' && p.bedrooms < Number(bedrooms)) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchNeighborhood = p.address.neighborhood.toLowerCase().includes(q);
        const matchStreet = p.address.street?.toLowerCase().includes(q);
        const matchCity = p.address.city?.toLowerCase().includes(q);
        const matchRef = p.id.toLowerCase().includes(q);
        if (!matchTitle && !matchNeighborhood && !matchRef && !matchStreet && !matchCity) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'menor-preco') return a.price - b.price;
      if (sortBy === 'maior-preco') return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const seen = new Set<string>();
    return list.filter((p) => {
      const lowerId = p.id.toLowerCase();
      if (seen.has(lowerId)) return false;
      seen.add(lowerId);
      return true;
    });
  }, [properties, viewTab, purpose, savedIds, type, neighborhood, priceMax, searchQuery, bedrooms, sortBy]);

  // Pagination calculation (21 per page)
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE) || 1;
  const displayedProperties = useMemo(() => {
    if (showAll) return filteredProperties;
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage, showAll]);

  const handleTabChange = (tab: 'todos' | 'venda' | 'aluguel' | 'salvos') => {
    if (tab === 'salvos') {
      try {
        const saved = JSON.parse(localStorage.getItem('gallo_saved_properties') || '[]');
        setSavedIds(saved);
        if (!Array.isArray(saved) || saved.length === 0) {
          showToast('Você ainda não possui nenhum imóvel salvo! Clique no ícone de salvar em qualquer card para adicioná-lo aos favoritos.', 'info');
        }
      } catch (e) {}
    }
    setViewTab(tab);
    setPriceMax('');
    if (tab === 'venda') {
      setPurpose('venda');
    } else if (tab === 'aluguel') {
      setPurpose('aluguel');
    } else {
      setPurpose('todos');
    }
    setCurrentPage(1);
    setShowAll(false);
  };

  const resetFilters = () => {
    setViewTab('todos');
    setPurpose('todos');
    setType('todos');
    setNeighborhood('todos');
    setPriceMax('');
    setSearchQuery('');
    setBedrooms('todos');
    setSortBy('recentes');
    setCurrentPage(1);
    setShowAll(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-medium text-stone-900 font-urbanist">
          Catálogo de Imóveis em Amparo
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Explore as melhores opções para compra e locação no Circuito das Águas Paulista
        </p>
      </div>

      {/* Main Tabs: Todos, Venda, Locação, Imóveis Salvos */}
      <div 
        ref={tabsRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar touch-pan-x select-none cursor-grab active:cursor-grabbing"
      >
        <button
          type="button"
          onClick={() => {
            if (!hasMovedRef.current) handleTabChange('todos');
          }}
          className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-medium transition ${
            viewTab === 'todos'
              ? 'bg-[#00873E] text-white shadow-sm'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          Todos os Imóveis ({properties.filter(p => p.status !== 'arquivado').length})
        </button>

        <button
          type="button"
          onClick={() => {
            if (!hasMovedRef.current) handleTabChange('venda');
          }}
          className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-medium transition ${
            viewTab === 'venda'
              ? 'bg-[#00873E] text-white shadow-sm'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          Comprar (Venda)
        </button>

        <button
          type="button"
          onClick={() => {
            if (!hasMovedRef.current) handleTabChange('aluguel');
          }}
          className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-medium transition ${
            viewTab === 'aluguel'
              ? 'bg-[#00873E] text-white shadow-sm'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          Alugar (Locação)
        </button>

        <button
          type="button"
          onClick={() => {
            if (!hasMovedRef.current) handleTabChange('salvos');
          }}
          className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
            viewTab === 'salvos'
              ? 'bg-amber-700 text-white shadow-sm'
              : 'bg-white border border-amber-200 text-amber-900 hover:bg-amber-50'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 fill-current" />
          <span>Imóveis Salvos ({savedIds.length})</span>
        </button>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 mb-8 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          
          {/* Search Term */}
          <div className="sm:col-span-2">
            <label className="text-[11px] font-medium text-stone-500 mb-1 block">Palavra-chave, Rua ou Ref</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cidade, bairro, rua ou ref..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-gallo-600 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="text-[11px] font-medium text-stone-500 mb-1 block">Tipo de Imóvel</label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setCurrentPage(1); }}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-gallo-600"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="chacara">Chácara</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>

          {/* Bairro */}
          <div>
            <label className="text-[11px] font-medium text-stone-500 mb-1 block">Bairro em Amparo</label>
            <select
              value={neighborhood}
              onChange={(e) => { setNeighborhood(e.target.value); setCurrentPage(1); }}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-gallo-600"
            >
              <option value="todos">Todos os Bairros ({availableNeighborhoods.length})</option>
              {availableNeighborhoods.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Dormitórios */}
          <div>
            <label className="text-[11px] font-medium text-stone-500 mb-1 block">Quartos mín.</label>
            <select
              value={bedrooms}
              onChange={(e) => { setBedrooms(e.target.value); setCurrentPage(1); }}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-gallo-600"
            >
              <option value="todos">Qualquer</option>
              <option value="1">1+ quarto</option>
              <option value="2">2+ quartos</option>
              <option value="3">3+ quartos</option>
              <option value="4">4+ quartos</option>
            </select>
          </div>

          {/* Valor Máximo */}
          <div>
            <label className="text-[11px] font-medium text-stone-500 mb-1 block">Valor Máximo</label>
            <select
              value={priceMax}
              onChange={(e) => { setPriceMax(e.target.value); setCurrentPage(1); }}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-gallo-600"
            >
              <option value="">Qualquer valor</option>
              {viewTab === 'aluguel' || purpose === 'aluguel' ? (
                <>
                  <option value="1500">Até R$ 1.500 /mês</option>
                  <option value="2500">Até R$ 2.500 /mês</option>
                  <option value="3500">Até R$ 3.500 /mês</option>
                  <option value="5000">Até R$ 5.000 /mês</option>
                  <option value="8000">Até R$ 8.000 /mês</option>
                  <option value="12000">Até R$ 12.000 /mês</option>
                </>
              ) : viewTab === 'venda' || purpose === 'venda' ? (
                <>
                  <option value="300000">Até R$ 300 mil</option>
                  <option value="500000">Até R$ 500 mil</option>
                  <option value="800000">Até R$ 800 mil</option>
                  <option value="1200000">Até R$ 1.2 mi</option>
                  <option value="2000000">Até R$ 2 mi</option>
                  <option value="3000000">Até R$ 3 mi</option>
                </>
              ) : (
                <>
                  <optgroup label="Compra (Venda)">
                    <option value="300000">Até R$ 300 mil</option>
                    <option value="500000">Até R$ 500 mil</option>
                    <option value="800000">Até R$ 800 mil</option>
                    <option value="1200000">Até R$ 1.2 mi</option>
                    <option value="2000000">Até R$ 2 mi</option>
                  </optgroup>
                  <optgroup label="Locação (Aluguel)">
                    <option value="2000">Até R$ 2.000 /mês</option>
                    <option value="3500">Até R$ 3.500 /mês</option>
                    <option value="5000">Até R$ 5.000 /mês</option>
                    <option value="8000">Até R$ 8.000 /mês</option>
                  </optgroup>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Bottom bar of filter box */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>
              Mostrando <strong>{displayedProperties.length}</strong> de <strong>{filteredProperties.length}</strong> imóveis
              {!showAll && totalPages > 1 && ` (Página ${currentPage} de ${totalPages})`}
            </span>
            {(viewTab !== 'todos' || type !== 'todos' || neighborhood !== 'todos' || searchQuery || priceMax) && (
              <button
                onClick={resetFilters}
                className="text-[#00873E] hover:underline flex items-center gap-1 font-medium ml-2"
              >
                <RefreshCw className="w-3 h-3" /> Limpar filtros
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-500">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg py-1 px-2.5 text-xs text-stone-700"
            >
              <option value="recentes">Mais recentes</option>
              <option value="menor-preco">Menor valor</option>
              <option value="maior-preco">Maior valor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {displayedProperties.length > 0 ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onSavedChange={handleSavedChange}
              />
            ))}
          </div>

          {/* Pagination Controls & "Ver todos os imóveis" Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-200">
            
            {/* Page number buttons (if more than 1 page and not showing all) */}
            {!showAll && totalPages > 1 ? (
              <div className="flex items-center gap-1.5 order-2 sm:order-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(p => Math.max(p - 1, 1));
                    window.scrollTo({ top: 200, behavior: 'smooth' });
                  }}
                  className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition text-stone-700"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 200, behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-[#00873E] text-white shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage(p => Math.min(p + 1, totalPages));
                    window.scrollTo({ top: 200, behavior: 'smooth' });
                  }}
                  className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition text-stone-700"
                  aria-label="Próxima página"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="order-2 sm:order-1 text-xs text-stone-500">
                Mostrando {displayedProperties.length} imóveis disponíveis
              </div>
            )}

            {/* "Mostrar todos os imóveis" Button */}
            <div className="order-1 sm:order-2">
              {(viewTab !== 'todos' || purpose !== 'todos' || type !== 'todos' || neighborhood !== 'todos' || priceMax !== '' || searchQuery !== '' || bedrooms !== 'todos') ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 hover:border-stone-300 text-stone-800 rounded-2xl text-xs font-medium transition shadow-xs"
                  title="Limpar todos os filtros e mostrar todos os imóveis do catálogo"
                >
                  <Eye className="w-4 h-4 text-stone-600" />
                  <span>Mostrar todos os imóveis</span>
                </button>
              ) : !showAll && filteredProperties.length > ITEMS_PER_PAGE ? (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-black text-white rounded-2xl text-xs font-medium transition shadow-sm"
                >
                  <Eye className="w-4 h-4 text-stone-300" />
                  <span>Ver Todos os Imóveis ({filteredProperties.length})</span>
                </button>
              ) : showAll && filteredProperties.length > ITEMS_PER_PAGE ? (
                <button
                  type="button"
                  onClick={() => setShowAll(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-2xl text-xs font-medium transition shadow-xs"
                >
                  <span>Voltar para Paginação (21 por página)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 hover:border-stone-300 text-stone-800 rounded-2xl text-xs font-medium transition shadow-xs"
                >
                  <Eye className="w-4 h-4 text-stone-600" />
                  <span>Mostrar todos os imóveis</span>
                </button>
              )}
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-medium text-stone-800 font-urbanist">
            {viewTab === 'salvos' ? 'Nenhum imóvel salvo ainda' : 'Nenhum imóvel encontrado'}
          </h3>
          <p className="text-xs text-stone-500">
            {viewTab === 'salvos'
              ? 'Você ainda não salvou nenhum imóvel. Clique no ícone de salvar em qualquer card para salvar e registrar seu interesse!'
              : 'Tente ajustar seus filtros de busca ou entre em contato direto pelo WhatsApp.'}
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-medium transition"
          >
            Ver todos os imóveis
          </button>
        </div>
      )}

    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-500 text-sm">Carregando catálogo...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
