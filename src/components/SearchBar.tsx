'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Tag, Sparkles, Building2, DollarSign } from 'lucide-react';
import { searchFilterSchema } from '@/lib/validations/forms';

interface SearchBarProps {
  onSearchChange?: (query: string) => void;
  onTagSelect?: (tag: string) => void;
  selectedTag?: string;
}

const QUICK_TAGS = [
  'Chácaras',
  'Condomínio Fechado',
  'Piscina',
  'Até R$ 500k',
  'Ribeirão',
  'Centro'
];

export default function SearchBar({ onSearchChange, onTagSelect, selectedTag }: SearchBarProps) {
  const router = useRouter();
  const [purpose, setPurpose] = useState<'todos' | 'venda' | 'aluguel'>('todos');
  const [type, setType] = useState<string>('todos');
  const [location, setLocation] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');

  const handlePurposeChange = (newPurpose: 'todos' | 'venda' | 'aluguel') => {
    setPurpose(newPurpose);
    setPriceMax('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitização e validação Zod (OWASP A03)
    const validation = searchFilterSchema.safeParse({
      query: location,
      finalidade: purpose,
      tipo: type,
      precoMax: priceMax ? Number(priceMax) : undefined,
    });

    const safeLocation = validation.success && validation.data.query ? validation.data.query : location.trim();

    const params = new URLSearchParams();
    if (purpose !== 'todos') params.append('finalidade', purpose);
    if (type !== 'todos') params.append('tipo', type);
    if (safeLocation) params.append('q', safeLocation);
    if (priceMax) params.append('precoMax', priceMax);
    
    router.push(`/imoveis?${params.toString()}`);
  };

  const handleLocationInput = (val: string) => {
    // Sanitizar caracteres perigosos no input
    const cleanVal = val.replace(/[<>\"'/]/g, '');
    setLocation(cleanVal);
    if (onSearchChange) {
      onSearchChange(cleanVal);
    }
  };

  const handleTagClick = (tag: string) => {
    if (onTagSelect) {
      onTagSelect(tag);
    } else {
      if (tag === 'Chácaras') {
        router.push('/imoveis?tipo=chacara');
      } else if (tag === 'Condomínio Fechado') {
        router.push('/imoveis?q=condominio');
      } else if (tag === 'Piscina') {
        router.push('/imoveis?q=piscina');
      } else if (tag === 'Até R$ 500k') {
        router.push('/imoveis?precoMax=500000');
      } else if (tag === 'Ribeirão') {
        router.push('/imoveis?bairro=Ribeir%C3%A3o');
      } else if (tag === 'Centro') {
        router.push('/imoveis?bairro=Centro');
      }
    }
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-stone-200/90 p-5 sm:p-7 text-stone-900 transition-all duration-300">
      {/* Purpose Tabs (Origin Kit Styled Segmented Control) */}
      <div className="flex items-center gap-1.5 mb-5 p-1 bg-stone-100/90 rounded-2xl w-fit border border-stone-200/60">
        <button
          type="button"
          onClick={() => handlePurposeChange('todos')}
          className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            purpose === 'todos'
              ? 'bg-[#00873E] text-white font-semibold shadow-md scale-[1.02]'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          Todos os Imóveis
        </button>
        <button
          type="button"
          onClick={() => handlePurposeChange('venda')}
          className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            purpose === 'venda'
              ? 'bg-[#00873E] text-white font-semibold shadow-md scale-[1.02]'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          Comprar
        </button>
        <button
          type="button"
          onClick={() => handlePurposeChange('aluguel')}
          className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            purpose === 'aluguel'
              ? 'bg-[#00873E] text-white font-semibold shadow-md scale-[1.02]'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          Alugar
        </button>
      </div>

      {/* Main Search Inputs Grid (Origin UI Refined Inputs) */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
        {/* Tipo de Imóvel */}
        <div className="flex flex-col">
          <label className="h-5 flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1.5 ml-1">
            <Building2 className="w-3.5 h-3.5 text-[#00873E]" />
            <span>Tipo de Imóvel</span>
          </label>
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-12 bg-stone-50/90 border border-stone-200 text-stone-900 rounded-2xl px-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00873E]/20 focus:border-[#00873E] focus:bg-white transition-all duration-200 cursor-pointer appearance-none shadow-xs"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="casa">Casa Residencial</option>
              <option value="apartamento">Apartamento</option>
              <option value="chacara">Sítio & Chácara</option>
              <option value="terreno">Terreno / Lote</option>
              <option value="comercial">Comercial</option>
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 text-xs">
              ▼
            </span>
          </div>
        </div>

        {/* Localização / Bairro */}
        <div className="flex flex-col">
          <label className="h-5 flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1.5 ml-1">
            <MapPin className="w-3.5 h-3.5 text-[#00873E] shrink-0" />
            <span>Região / Bairro</span>
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={100}
              placeholder="Ex: Ribeirão, Centro, Silvestre..."
              value={location}
              onChange={(e) => handleLocationInput(e.target.value)}
              className="w-full h-12 bg-stone-50/90 border border-stone-200 text-stone-900 placeholder-stone-400 rounded-2xl pl-3.5 pr-9 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00873E]/20 focus:border-[#00873E] focus:bg-white transition-all duration-200 shadow-xs"
            />
            <Sparkles className="w-3.5 h-3.5 text-[#00873E] absolute right-3.5 top-1/2 -translate-y-1/2 opacity-75 pointer-events-none" />
          </div>
        </div>

        {/* Faixa de Preço */}
        <div className="flex flex-col">
          <label className="h-5 flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1.5 ml-1">
            <DollarSign className="w-3.5 h-3.5 text-[#00873E]" />
            <span>Preço Máximo</span>
          </label>
          <div className="relative">
            <select
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full h-12 bg-stone-50/90 border border-stone-200 text-stone-900 rounded-2xl px-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00873E]/20 focus:border-[#00873E] focus:bg-white transition-all duration-200 cursor-pointer appearance-none shadow-xs"
            >
              <option value="">Qualquer Valor</option>
              {purpose === 'aluguel' ? (
                <>
                  <option value="1500">Até R$ 1.500/mês</option>
                  <option value="3000">Até R$ 3.000/mês</option>
                  <option value="5000">Até R$ 5.000/mês</option>
                  <option value="10000">Até R$ 10.000/mês</option>
                </>
              ) : (
                <>
                  <option value="350000">Até R$ 350.000</option>
                  <option value="500000">Até R$ 500.000</option>
                  <option value="800000">Até R$ 800.000</option>
                  <option value="1200000">Até R$ 1.200.000</option>
                  <option value="2000000">Até R$ 2.000.000</option>
                  <option value="3500000">Até R$ 3.500.000</option>
                </>
              )}
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 text-xs">
              ▼
            </span>
          </div>
        </div>

        {/* Botão de Busca Magnético */}
        <div>
          <button
            type="submit"
            className="w-full h-12 bg-[#00873E] hover:bg-[#15803d] text-white font-mono font-semibold text-xs uppercase tracking-wider rounded-2xl transition-all duration-200 shadow-lg shadow-red-950/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 hover:shadow-xl hover:-translate-y-0.5"
          >
            <Search className="w-4 h-4 text-white" />
            <span>Encontrar Imóveis</span>
          </button>
        </div>
      </form>

      {/* Quick Interactive Tags Row */}
      <div className="mt-5 pt-3.5 border-t border-stone-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar touch-pan-x">
        <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
          <Tag className="w-3 h-3 text-[#00873E]" />
          Filtros Rápidos:
        </span>
        {QUICK_TAGS.map((tag) => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-mono transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-[#00873E] text-white font-semibold shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200/80 hover:border-stone-300'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
