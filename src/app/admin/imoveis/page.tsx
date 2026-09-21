'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, PlusCircle, Search, Trash2, 
  ExternalLink, Edit, Archive, Filter, RefreshCw, MapPin, Star
} from 'lucide-react';
import propertiesData from '@/data/properties.json';
import { Property } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { formatDateTime } from '@/lib/masks';
import { logAuditEvent } from '@/lib/audit';

const BASE_TIMESTAMP = 1773660000000;

export default function AdminImoveisPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>(() => {
    return (propertiesData as Property[]).map((p, index) => {
      const baseCreatedAt = (p as any).createdAt || new Date(BASE_TIMESTAMP - (index + 1) * 86400000 * 2).toISOString();
      return { ...p, createdAt: baseCreatedAt } as Property;
    });
  });
  const [currentTab, setCurrentTab] = useState<'ativos' | 'arquivados' | 'carrossel'>('ativos');

  // Filters
  const [search, setSearch] = useState<string>('');
  const [filterPurpose, setFilterPurpose] = useState<string>('todos');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterNeighborhood, setFilterNeighborhood] = useState<string>('todos');
  const [filterPrice, setFilterPrice] = useState<string>('todos');

  const loadProperties = () => {
    // 1. Fetch from server API to guarantee disk sync
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProperties(data);
          try {
            localStorage.setItem('gallo_custom_properties', JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(() => {
        // Fallback to localStorage merged with propertiesData
        try {
          const customProps: Property[] = JSON.parse(localStorage.getItem('gallo_custom_properties') || '[]');
          const map = new Map<string, Property>();
          (propertiesData as Property[]).forEach((p, index) => {
            const baseCreatedAt = (p as any).createdAt || new Date(BASE_TIMESTAMP - (index + 1) * 86400000 * 2).toISOString();
            map.set(p.id.toLowerCase(), { ...p, createdAt: baseCreatedAt } as Property);
          });
          customProps.forEach(p => map.set(p.id.toLowerCase(), p));
          setProperties(Array.from(map.values()));
        } catch (err) {
          setProperties(propertiesData as Property[]);
        }
      });
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // Update status directly from inline select
  const handleStatusChange = (id: string, newStatus: string) => {
    const targetProp = properties.find(p => p.id === id);
    const updated = properties.map(p => {
      if (p.id === id) {
        return { ...p, status: newStatus as any };
      }
      return p;
    });
    setProperties(updated);

    try {
      localStorage.setItem('gallo_custom_properties', JSON.stringify(updated));

      // Persist to Server Filesystem
      if (targetProp) {
        fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...targetProp, status: newStatus }),
        }).catch(err => console.error('Erro ao sincronizar status:', err));
      }

      // Audit log
      logAuditEvent(
        newStatus === 'arquivado' ? 'IMOVEL_ARQUIVADO' : 'IMOVEL_STATUS',
        `Status do Imóvel ${id.toUpperCase()} alterado`,
        `Novo status: ${newStatus.toUpperCase()} (Título: ${targetProp?.title})`,
        'imovel',
        'Administrador Miyashiro'
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeatured = (id: string) => {
    const targetProp = properties.find(p => p.id === id);
    if (!targetProp) return;
    const nextFeatured = !targetProp.featured;
    const updated = properties.map(p => {
      if (p.id === id) {
        return { ...p, featured: nextFeatured };
      }
      return p;
    });
    setProperties(updated);

    try {
      localStorage.setItem('gallo_custom_properties', JSON.stringify(updated));

      // Persist to Server Filesystem
      fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...targetProp, featured: nextFeatured }),
      }).catch(err => console.error('Erro ao sincronizar featured:', err));

      // Audit log
      logAuditEvent(
        'IMOVEL_STATUS',
        `Imóvel ${id.toUpperCase()} ${nextFeatured ? 'Adicionado aos' : 'Removido dos'} Destaques`,
        `Exibição no Topo da Página Inicial: ${nextFeatured ? 'SIM' : 'NÃO'}`,
        'imovel',
        'Administrador Miyashiro'
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id: string) => {
    const target = properties.find(p => p.id === id);
    if (confirm(`Deseja realmente excluir permanentemente o imóvel ${id.toUpperCase()}?`)) {
      const updated = properties.filter(p => p.id !== id);
      setProperties(updated);
      try {
        localStorage.setItem('gallo_custom_properties', JSON.stringify(updated));

        // Delete from server filesystem
        fetch(`/api/properties?id=${id}`, {
          method: 'DELETE',
        }).catch(err => console.error('Erro ao deletar imóvel no servidor:', err));

        logAuditEvent(
          'IMOVEL_STATUS',
          `Imóvel ${id.toUpperCase()} Removido`,
          `Exclusão definitiva de: ${target?.title}`,
          'imovel',
          'Administrador Miyashiro'
        );
      } catch (err) {}
    }
  };

  // Extract distinct neighborhoods for filter
  const neighborhoods = Array.from(new Set(properties.map(p => p.address?.neighborhood))).filter(Boolean);

  // Tab separation: Active vs Archived vs Carousel Featured
  const activeProperties = properties.filter(p => p.status !== 'arquivado');
  const archivedProperties = properties.filter(p => p.status === 'arquivado');
  const featuredProperties = properties.filter(p => p.featured && p.status !== 'arquivado');

  const listToFilter = currentTab === 'ativos'
    ? activeProperties
    : currentTab === 'arquivados'
    ? archivedProperties
    : featuredProperties;

  const filtered = listToFilter.filter((p) => {
    if (filterPurpose !== 'todos' && p.purpose !== filterPurpose) return false;
    if (filterType !== 'todos' && p.type !== filterType) return false;
    if (filterStatus !== 'todos' && p.status !== filterStatus) return false;
    if (filterNeighborhood !== 'todos' && p.address?.neighborhood !== filterNeighborhood) return false;

    if (filterPrice !== 'todos') {
      if (filterPrice === 'ate-500k' && p.price > 500000) return false;
      if (filterPrice === '500k-1m' && (p.price < 500000 || p.price > 1000000)) return false;
      if (filterPrice === '1m-2m' && (p.price < 1000000 || p.price > 2000000)) return false;
      if (filterPrice === 'acima-2m' && p.price < 2000000) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.address?.neighborhood && p.address.neighborhood.toLowerCase().includes(q)) ||
        (p.address?.street && p.address.street.toLowerCase().includes(q)) ||
        (p.address?.city && p.address.city.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentTab, search, filterPurpose, filterType, filterStatus, filterNeighborhood, filterPrice, itemsPerPage]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = itemsPerPage === -1 ? filtered.length : Math.min(startIdx + itemsPerPage, filtered.length);
  const displayedProperties = itemsPerPage === -1 ? filtered : filtered.slice(startIdx, endIdx);

  return (
    <div className="space-y-6 w-full pb-28">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-stone-900 font-urbanist">
            Gerenciamento de Imóveis
          </h1>
          <p className="text-stone-500 text-xs mt-0.5">
            Clique em qualquer linha para editar o imóvel • Inventário com sincronização em tempo real
          </p>
        </div>

        <Link
          href="/admin/imoveis/novo"
          className="inline-flex items-center gap-2 bg-[#00873E] hover:bg-[#15803d] text-white px-4 py-2.5 rounded-xl text-xs font-medium transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Cadastrar Novo Imóvel</span>
        </Link>
      </div>

      {/* Tabs: Active vs Archived vs Carousel */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setCurrentTab('ativos')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 ${
            currentTab === 'ativos'
              ? 'bg-[#00873E] text-white shadow-sm'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Imóveis Ativos ({activeProperties.length})</span>
        </button>

        <button
          onClick={() => setCurrentTab('carrossel')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 ${
            currentTab === 'carrossel'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${currentTab === 'carrossel' ? 'fill-white' : 'fill-amber-500 text-amber-600'}`} />
          <span>Destaques da Página Inicial ({featuredProperties.length})</span>
        </button>

        <button
          onClick={() => setCurrentTab('arquivados')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 ${
            currentTab === 'arquivados'
              ? 'bg-stone-800 text-white shadow-sm'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Arquivados ({archivedProperties.length})</span>
        </button>

        <div className="ml-auto text-xs text-stone-500 hidden sm:block">
          Mostrando <strong>{filtered.length}</strong> de {listToFilter.length} imóveis
        </div>
      </div>

      {/* Advanced Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <input
              type="text"
              placeholder="Buscar por título, rua, ref ou bairro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-[#00873E]"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Finalidade */}
          <div>
            <select
              value={filterPurpose}
              onChange={(e) => setFilterPurpose(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-2.5 text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#00873E]"
            >
              <option value="todos">Finalidade: Todas</option>
              <option value="venda">Venda</option>
              <option value="aluguel">Locação</option>
            </select>
          </div>

          {/* Tipo */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-2.5 text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#00873E]"
            >
              <option value="todos">Tipo: Todos</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="chacara">Chácara</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>

          {/* Status (Only on Ativos tab) */}
          {currentTab === 'ativos' && (
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-2.5 text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#00873E]"
              >
                <option value="todos">Status: Todos</option>
                <option value="disponivel">Disponível</option>
                <option value="reservado">Reservado</option>
                <option value="vendido">Vendido</option>
                <option value="alugado">Alugado</option>
              </select>
            </div>
          )}

          {/* Bairro */}
          <div>
            <select
              value={filterNeighborhood}
              onChange={(e) => setFilterNeighborhood(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-2.5 text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#00873E]"
            >
              <option value="todos">Bairro: Todos</option>
              {neighborhoods.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Faixa de Preço */}
          <div>
            <select
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-2.5 text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#00873E]"
            >
              <option value="todos">Faixa de Preço: Todas</option>
              <option value="ate-500k">Até R$ 500 mil</option>
              <option value="500k-1m">R$ 500 mil a R$ 1 mi</option>
              <option value="1m-2m">R$ 1 mi a R$ 2 mi</option>
              <option value="acima-2m">Acima de R$ 2 mi</option>
            </select>
          </div>

        </div>
      </div>

      {/* 1. Mobile Cards View (Layout Idêntico ao da Primavera para Celulares - < md) */}
      <div className="block md:hidden space-y-3.5 w-full mb-6">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-400 font-mono text-xs">
            Nenhum imóvel localizado com os filtros selecionados.
          </div>
        ) : (
          displayedProperties.map((property) => {
            const createdAtFormatted = formatDateTime(
              (property as any).createdAt || new Date(BASE_TIMESTAMP).toISOString()
            );
            const displayCode = property.id.toUpperCase();

            return (
              <div
                key={`mob-prop-${property.id}`}
                className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs space-y-3"
              >
                {/* Header do Card Mobile: Thumbnail, Título, Preço e REF */}
                <div className="flex gap-3">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    <Image
                      src={property.images?.[0] || '/images/properties/gallo_prop_1.jpg'}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                    {property.featured && (
                      <span className="absolute top-1 left-1 bg-amber-500 text-white rounded-md p-0.5 shadow-xs">
                        <Star className="w-3 h-3 fill-white text-white" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-mono text-stone-400 font-semibold">
                          REF: {displayCode}
                        </span>
                        <span className="text-[10px] bg-stone-100 text-[#00873E] px-1.5 py-0.5 rounded capitalize font-medium">
                          {property.purpose} • {property.type}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-stone-900 line-clamp-1 font-urbanist">
                        {property.title}
                      </h3>
                      <p className="text-sm font-bold text-[#00873E] mt-0.5 font-mono">
                        {formatCurrency(property.price)}
                        {property.purpose === 'aluguel' && <span className="text-[10px] text-stone-400 font-normal ml-1">/mês</span>}
                      </p>
                    </div>

                    {/* Endereço Resumido */}
                    <div className="flex items-center gap-1 text-[11px] text-stone-500 truncate mt-1">
                      <MapPin className="w-3 h-3 text-[#00873E] shrink-0" />
                      <span className="truncate">
                        {property.address?.neighborhood}, {property.address?.city || 'Amparo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Especificações e Data */}
                <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-[11px] text-stone-500 font-mono">
                  <div className="flex items-center gap-2">
                    {property.bedrooms ? <span>{property.bedrooms} qtos</span> : null}
                    {property.bathrooms ? <span>• {property.bathrooms} banh</span> : null}
                    {property.suites ? <span>• {property.suites} suítes</span> : null}
                    {(property.areaBuilt || property.areaTotal) ? <span>• {property.areaBuilt || property.areaTotal} m²</span> : null}
                  </div>
                  <span className="text-[10px] text-stone-400" suppressHydrationWarning>{createdAtFormatted}</span>
                </div>

                {/* Ações e Seletor de Status Mobile em 2 Sessões */}
                <div className="border-t border-stone-100 pt-3 space-y-2.5">
                  {/* Sessão 1: Status do Imóvel & Destaque */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={property.status}
                        onChange={(e) => handleStatusChange(property.id, e.target.value)}
                        className={`w-full text-xs rounded-xl px-3 py-2 font-semibold border transition cursor-pointer appearance-none pr-8 ${
                          property.status === 'disponivel'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : property.status === 'reservado'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : property.status === 'vendido'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : property.status === 'alugado'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-stone-100 text-stone-700 border-stone-300'
                        }`}
                      >
                        <option value="disponivel">● Disponível</option>
                        <option value="reservado">● Reservado</option>
                        <option value="vendido">● Vendido</option>
                        <option value="alugado">● Alugado</option>
                        <option value="arquivado">● Arquivado</option>
                      </select>
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                        ▾
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(property.id)}
                      className={`h-9 px-3 rounded-xl flex items-center gap-1.5 border text-xs font-medium transition shrink-0 cursor-pointer ${
                        property.featured
                          ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-xs'
                          : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                      }`}
                      title={property.featured ? 'Remover destaque' : 'Marcar como destaque'}
                    >
                      <Star className={`w-3.5 h-3.5 ${property.featured ? 'fill-amber-400 text-amber-500' : ''}`} />
                      <span>{property.featured ? 'Destaque' : 'Destacar'}</span>
                    </button>
                  </div>

                  {/* Sessão 2: Ações de Gestão (Editar, Ver no site, Excluir) */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/imoveis/editar/${property.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 px-3 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition active:scale-98"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar Imóvel</span>
                    </Link>

                    <Link
                      href={`/imovel/${property.slug || property.id}`}
                      target="_blank"
                      className="h-9 w-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition shrink-0"
                      title="Ver no site"
                      aria-label="Ver imóvel no site"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(property.id)}
                      className="h-9 w-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 border border-rose-200/60 transition shrink-0 cursor-pointer"
                      title="Excluir imóvel"
                      aria-label="Excluir imóvel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Properties Table - Desktop (> md) */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden w-full">
        <div className="w-full">
          <table className="w-full text-left text-xs table-auto">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-100 font-medium font-urbanist">
              <tr>
                <th className="py-3.5 px-4 w-[32%]">Imóvel</th>
                <th className="py-3.5 px-4 w-[24%]">Endereço Completo</th>
                <th className="py-3.5 px-4 w-[12%]">Valor</th>
                <th className="py-3.5 px-4 w-[14%]">Data de Cadastro</th>
                <th className="py-3.5 px-4 w-[11%]">Status</th>
                <th className="py-3.5 px-4 w-[7%] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    Nenhum imóvel localizado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                displayedProperties.map((property) => {
                  const createdAtFormatted = formatDateTime(
                    (property as any).createdAt || new Date(BASE_TIMESTAMP).toISOString()
                  );

                  const fullAddress = `${property.address?.street ? property.address.street + ', ' : ''}${property.address?.neighborhood || ''}, ${property.address?.city || 'Amparo'}/${property.address?.state || 'SP'}`;

                  return (
                    <tr
                      key={property.id}
                      onClick={() => router.push(`/admin/imoveis/editar/${property.id}`)}
                      className="hover:bg-stone-50/80 transition cursor-pointer group"
                      title="Clique para editar este imóvel"
                    >
                      
                      {/* Property Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                            <Image
                              src={property.images?.[0] || '/images/properties/gallo_prop_1.jpg'}
                              alt={property.title}
                              fill
                              className="object-cover group-hover:scale-105 transition duration-200"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-stone-900 truncate font-urbanist group-hover:text-[#00873E] transition">
                              {property.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono text-stone-400">
                                REF: {property.id.toUpperCase()}
                              </span>
                              {property.featured && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded font-medium">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  No Carrossel
                                </span>
                              )}
                              <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded capitalize">
                                {property.purpose}
                              </span>
                              <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded capitalize">
                                {property.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Minimized Complete Address */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-1.5 max-w-sm">
                          <MapPin className="w-3.5 h-3.5 text-[#00873E] mt-0.5 shrink-0" />
                          <div className="min-w-0" title={fullAddress}>
                            <span className="font-medium text-stone-800 text-xs block truncate">
                              {property.address?.street || property.address?.neighborhood}
                            </span>
                            <span className="text-stone-400 text-[10px] block truncate">
                              {property.address?.street ? `${property.address.neighborhood}, ` : ''}{property.address?.city || 'Amparo'} - {property.address?.state || 'SP'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-medium text-[#00873E] font-urbanist text-sm whitespace-nowrap">
                        {formatCurrency(property.price)}
                      </td>

                      {/* Registration Date & Time */}
                      <td className="py-3.5 px-4 text-stone-600 font-mono text-[11px] whitespace-nowrap" suppressHydrationWarning>
                        {createdAtFormatted}
                      </td>

                      {/* Inline Status Select (NO EMOJIS) */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={property.status}
                          onChange={(e) => handleStatusChange(property.id, e.target.value)}
                          className={`text-xs rounded-lg px-2.5 py-1.5 font-medium border transition cursor-pointer ${
                            property.status === 'disponivel'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : property.status === 'reservado'
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              : property.status === 'vendido'
                              ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                              : property.status === 'alugado'
                              ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                              : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                          }`}
                        >
                          <option value="disponivel">Disponível</option>
                          <option value="reservado">Reservado</option>
                          <option value="vendido">Vendido</option>
                          <option value="alugado">Alugado</option>
                          <option value="arquivado">Arquivado</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(property.id)}
                            className={`p-1.5 rounded-lg transition ${
                              property.featured
                                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 ring-1 ring-amber-300'
                                : 'text-stone-300 hover:text-amber-500 hover:bg-stone-100'
                            }`}
                            title={property.featured ? 'Remover dos Destaques da Página Inicial' : 'Destacar na Página Inicial'}
                          >
                            <Star className={`w-4 h-4 ${property.featured ? 'fill-amber-400 text-amber-500' : ''}`} />
                          </button>
                          <Link
                            href={`/admin/imoveis/editar/${property.id}`}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
                            title="Editar Imóvel"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/imovel/${property.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                            title="Ver no site público"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(property.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-emerald-50 transition"
                            title="Excluir Permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filtered.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
              <span>
                Mostrando <strong className="text-stone-800">{filtered.length === 0 ? 0 : startIdx + 1}</strong> a <strong className="text-stone-800">{endIdx}</strong> de <strong className="text-stone-800">{filtered.length}</strong> imóveis
              </span>
              <div className="flex items-center gap-1.5 ml-2 border-l border-stone-200 pl-3">
                <span className="text-stone-400">Por página:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-white border border-stone-200 text-stone-700 text-xs rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={-1}>Todos</option>
                </select>
              </div>
            </div>

            {/* Page Buttons */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium text-stone-700 transition"
                  aria-label="Página anterior"
                >
                  Anterior
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
                            currentPage === page
                              ? 'bg-[#00873E] text-white shadow-xs'
                              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-1 text-stone-400 text-xs">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium text-stone-700 transition"
                  aria-label="Próxima página"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
