
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Scale, ArrowLeft, Plus, X, Check,
  MapPin, MessageCircle, ExternalLink, Compass, Video, 
  Bed, Bath, Car 
} from 'lucide-react';
import { Property } from '@/lib/types';
import { formatCurrency, formatArea, getPurposeLabel, getTypeLabel } from '@/lib/utils';
import propertiesData from '@/data/properties.json';

export default function ComparadorPage() {
  const [allProperties, setAllProperties] = useState<Property[]>(propertiesData as Property[]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadSelection = () => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem('gallo_comparison_ids') || '[]');
      setSelectedIds(stored);
    } catch (e) {
      setSelectedIds([]);
    }
  };

  useEffect(() => {
    loadSelection();

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

  const handleRemove = (id: string) => {
    const next = selectedIds.filter(item => item.toLowerCase() !== id.toLowerCase());
    localStorage.setItem('gallo_comparison_ids', JSON.stringify(next));
    setSelectedIds(next);
    window.dispatchEvent(new Event('gallo_comparison_change'));
  };

  const handleAdd = (id: string) => {
    if (selectedIds.length >= 3) {
      alert('Você pode comparar até 3 imóveis simultaneamente.');
      return;
    }
    if (!selectedIds.map(i => i.toLowerCase()).includes(id.toLowerCase())) {
      const next = [...selectedIds, id];
      localStorage.setItem('gallo_comparison_ids', JSON.stringify(next));
      setSelectedIds(next);
      window.dispatchEvent(new Event('gallo_comparison_change'));
    }
  };

  const selectedProperties = selectedIds
    .map(id => allProperties.find(p => p.id.toLowerCase() === id.toLowerCase()))
    .filter(Boolean) as Property[];

  // Properties available to add
  const availableToAdd = allProperties.filter(
    p => !selectedIds.map(i => i.toLowerCase()).includes(p.id.toLowerCase()) && p.status !== 'arquivado'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-200/80 pb-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-stone-800 transition">Início</Link>
          <span>/</span>
          <Link href="/imoveis" className="hover:text-stone-800 transition">Imóveis</Link>
          <span>/</span>
          <span className="text-stone-900 font-medium">Comparador Lado a Lado</span>
        </div>

        <Link
          href="/imoveis"
          className="inline-flex items-center gap-1.5 text-gallo-700 hover:text-gallo-800 font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao catálogo</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-medium text-stone-900 font-urbanist">
            Comparador de Imóveis Lado a Lado
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl font-light">
            Compare valores totais, preço por metro quadrado, características, vídeos e passeios virtuais de até 3 imóveis para encontrar a opção perfeita com total transparência.
          </p>
        </div>

        {selectedProperties.length > 0 && availableToAdd.length > 0 && selectedProperties.length < 3 && (
          <div className="flex items-center gap-2 shrink-0">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAdd(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-gallo-700"
            >
              <option value="" disabled>+ Adicionar outro imóvel à comparação...</option>
              {availableToAdd.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({formatCurrency(p.price)})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Empty State */}
      {selectedProperties.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-14 text-center space-y-6 shadow-xs max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
            <Scale className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-stone-900 font-urbanist">
              Nenhum imóvel selecionado para comparar
            </h2>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Você pode selecionar até 3 imóveis diretamente no catálogo ou escolher abaixo uma das opções em destaque para começar a comparação agora:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left">
            {allProperties.slice(0, 3).map(p => (
              <div key={p.id} className="bg-stone-50 rounded-2xl p-3 border border-stone-200 flex flex-col justify-between space-y-3">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-stone-200">
                  <Image
                    src={p.images?.[0] || '/images/properties/gallo_prop_1.jpg'}
                    alt={p.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-900 truncate font-urbanist">{p.title}</p>
                  <p className="text-xs font-semibold text-gallo-800 mt-0.5">{formatCurrency(p.price)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAdd(p.id)}
                  className="w-full bg-gallo-700 hover:bg-gallo-800 text-white rounded-xl py-2 text-xs font-medium transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar à Comparação</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Comparison Table Matrix */
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/60">
                  <th className="p-4 sm:p-6 w-1/4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Critério de Comparação
                  </th>
                  {selectedProperties.map(p => (
                    <th key={p.id} className="p-4 sm:p-6 w-1/3 min-w-[260px] align-top">
                      <div className="space-y-3">
                        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm">
                          <Image
                            src={p.images?.[0] || '/images/properties/gallo_prop_1.jpg'}
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemove(p.id)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-stone-900/80 hover:bg-red-600 text-white flex items-center justify-center transition shadow"
                            title="Remover este imóvel da comparação"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-stone-400">REF: {p.id.toUpperCase()}</span>
                          <h3 className="font-urbanist font-medium text-base text-stone-900 line-clamp-2">
                            {p.title}
                          </h3>
                        </div>
                      </div>
                    </th>
                  ))}
                  {/* Empty Slot if less than 3 */}
                  {selectedProperties.length < 3 && (
                    <th className="p-4 sm:p-6 w-1/3 min-w-[240px] border-l border-dashed border-stone-200 bg-stone-50/30 align-middle text-center">
                      <div className="py-12 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-300 flex items-center justify-center mx-auto text-stone-400">
                          <Plus className="w-6 h-6" />
                        </div>
                        <p className="text-xs text-stone-500 font-medium">Espaço Disponível</p>
                        {availableToAdd.length > 0 && (
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAdd(e.target.value);
                                e.target.value = '';
                              }
                            }}
                            defaultValue=""
                            className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-700"
                          >
                            <option value="" disabled>+ Adicionar Imóvel...</option>
                            {availableToAdd.map(p => (
                              <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 text-xs text-stone-800">
                {/* 1. Preço de Venda / Locação */}
                <tr className="hover:bg-stone-50/50 transition">
                  <td className="p-4 sm:p-5 font-semibold text-stone-900 bg-stone-50/30">
                    Valor do Imóvel
                  </td>
                  {selectedProperties.map(p => (
                    <td key={p.id} className="p-4 sm:p-5">
                      <span className="text-lg sm:text-xl font-bold text-gallo-800 font-urbanist">
                        {formatCurrency(p.price)}
                      </span>
                      {p.purpose === 'aluguel' && <span className="text-stone-500 text-xs font-normal"> /mês</span>}
                    </td>
                  ))}
                  {selectedProperties.length < 3 && <td className="bg-stone-50/20" />}
                </tr>

                {/* 2. Custo por m² Calculado */}
                <tr className="hover:bg-stone-50/50 transition">
                  <td className="p-4 sm:p-5 font-semibold text-stone-900 bg-stone-50/30">
                    Valor por m² (Calculado)
                  </td>
                  {selectedProperties.map(p => {
                    const area = p.areaBuilt || p.areaTotal;
                    const pricePerM2 = area > 0 ? (p.price / area) : 0;
                    return (
                      <td key={p.id} className="p-4 sm:p-5">
                        <span className="font-semibold text-stone-900">
                          {pricePerM2 > 0 ? formatCurrency(pricePerM2) + '/m²' : 'Sob consulta'}
                        </span>
                        <span className="text-[10px] text-stone-500 block mt-0.5">
                          Baseado em {formatArea(area)}
                        </span>
                      </td>
                    );
                  })}
                  {selectedProperties.length < 3 && <td className="bg-stone-50/20" />}
                </tr>

                {/* 3. Finalidade & Tipo */}
                <tr className="hover:bg-stone-50/50 transition">
                  <td className="p-4 sm:p-5 font-semibold text-stone-900 bg-stone-50/30">
                    Categoria e Tipo
                  </td>
                  {selectedProperties.map(p => (
                    <td key={p.id} className="p-4 sm:p-5 capitalize">
                      <span className="bg-stone-100 text-stone-800 px-2 py-1 rounded-md font-medium mr-1.5">
                        {getPurposeLabel(p.purpose)}
                      </span>
                      <span className="bg-stone-100 text-stone-800 px-2 py-1 rounded-md font-medium">
                        {getTypeLabel(p.type)}
                      </span>
                    </td>
                  ))}
                  {selectedProperties.length < 3 && <td className="bg-stone-50/20" />}
                </tr>

                {/* 4. Localização */}
                <tr className="hover:bg-stone-50/50 transition">
                  <td className="p-4 sm:p-5 font-semibold text-stone-900 bg-stone-50/30">
                    Bairro e Localização
                  </td>
                  {selectedProperties.map(p => (
                    <td key={p.id} className="p-4 sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gallo-700 shrink-0" />
                        <span>{p.address?.neighborhood}, {p.address?.city || 'Amparo'} - {p.address?.state || 'SP'}</span>
                      </div>
                    </td>
                  ))}
                  {selectedProperties.length < 3 && <td className="bg-stone-50/20" />}
                </tr>

                {/* 5. Área Construída e Total */}
                <tr className="hover:bg-stone-50/50 transition">
                  <td className="p-4 sm:p-5 font-semibold text-stone-900 bg-stone-50/30">
                    Área Construída / Terreno
                  </td>
                  {selectedProperties.map(p => (
                    <td key={p.id} className="p-4 sm:p-5 space-y-0.5">
                      <div><strong>Construída:</strong> {p.areaBuilt > 0 ? formatArea(p.areaBuilt) : 'N/D'}</div>
                      <div className="text-stone-500"><strong>Total:</strong> {p.areaTotal > 0 ? formatArea(p.areaTotal) : 'N/D'}</div>
                    </td>
                  ))}
                  {selectedProperties.length < 3 && <td className="bg-stone-50/20" />}
                </tr>

                {/* 6. Quartos e Suítes */}
                <tr className="hover:bg-stone-50/50 transition">
                  <td className="p-4 sm:p-5 font-semibold text-stone-900 bg-stone-50/30">
                    Quartos e Suítes
                  </td>
                  {selectedProperties.map(p => (
                    <td key={p.id} className="p-4 sm:p-5">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Bed className="w-3.5 h-3.5 text-gallo-700" />
                        <span>{p.bedrooms} Quartos ({p.suites} Suíte{p.suites > 1 ? 's' : ''})</span>
                      </div>
                    </td>
                  ))}
                  {selectedProperties.length < 3 && <td className="bg-stone-50/20" />}
                </tr>

                {/* 7. Banheiros e Vagas */}
                <tr className="hover:bg-stone-50/50 transition">
                  <td className="p-4 sm:p-5 font-semibold text-stone-900 bg-stone-50/30">
                    Banheiros e Garagem
                  </td>
                  {selectedProperties.map(p => (
                    <td key={p.id} className="p-4 sm:p-5 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Bath className="w-3.5 h-3.5 text-stone-500" />
                        <span>{p.bathrooms} Banheiro{p.bathrooms > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-stone-500" />
                        <span>{p.parkingSpots} Vaga{p.parkingSpots > 1 ? 's' : ''}</span>
                      </div>
                    </td>
                  ))}
                  {selectedProperties.length < 3 && <td className="bg-stone-50/20" />}
                </tr>

                {/* 8. Condomínio e IPTU */}
                <tr className="hover:bg-stone-50/50 transition">
                  <td className="p-4 sm:p-5 font-semibold text-stone-900 bg-stone-50/30">
                    Condomínio e IPTU
                  </td>
                  {selectedProperties.map(p => (
                    <td key={p.id} className="p-4 sm:p-5 space-y-0.5">
                      <div>Condomínio: {p.condoFee && p.condoFee > 0 ? formatCurrency(p.condoFee) : 'Isento / Não possui'}</div>
                      <div className="text-stone-500">IPTU: {p.iptu && p.iptu > 0 ? formatCurrency(p.iptu) + '/mês' : 'Consulte'}</div>
                    </td>
                  ))}
                  {selectedProperties.length < 3 && <td className="bg-stone-50/20" />}
                </tr>

                {/* 9. Mídias Avançadas (Tour 360 e Vídeo) */}
                <tr className="hover:bg-stone-50/50 transition bg-amber-50/20">
                  <td className="p-4 sm:p-5 font-semibold text-stone-900 bg-stone-50/30">
                    Tour 360° e Vídeo HD
                  </td>
                  {selectedProperties.map(p => (
                    <td key={p.id} className="p-4 sm:p-5 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-amber-600" />
                        {p.virtualTourRooms && p.virtualTourRooms.length > 0 ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Tour Virtual 360° ({p.virtualTourRooms.length} cômodos)
                          </span>
                        ) : (
                          <span className="text-stone-400">Não disponível</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-rose-600" />
                        {p.videoUrl ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Vídeo HD Disponível
                          </span>
                        ) : (
                          <span className="text-stone-400">Não disponível</span>
                        )}
                      </div>
                    </td>
                  ))}
                  {selectedProperties.length < 3 && <td className="bg-stone-50/20" />}
                </tr>

                {/* 10. Características */}
                <tr className="hover:bg-stone-50/50 transition">
                  <td className="p-4 sm:p-5 font-semibold text-stone-900 bg-stone-50/30">
                    Características do Imóvel
                  </td>
                  {selectedProperties.map(p => (
                    <td key={p.id} className="p-4 sm:p-5">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {p.amenities && p.amenities.length > 0 ? (
                          p.amenities.map((item, idx) => (
                            <span key={idx} className="bg-stone-100 text-stone-700 text-[10px] px-2 py-0.5 rounded-md font-medium">
                              {item}
                            </span>
                          ))
                        ) : (
                          <span className="text-stone-400 text-xs">Consulte na ficha</span>
                        )}
                      </div>
                    </td>
                  ))}
                  {selectedProperties.length < 3 && <td className="bg-stone-50/20" />}
                </tr>

                {/* 11. Botões de Ação */}
                <tr className="bg-stone-50/80">
                  <td className="p-4 sm:p-6 font-semibold text-stone-900">
                    Ações de Atendimento
                  </td>
                  {selectedProperties.map(p => (
                    <td key={p.id} className="p-4 sm:p-6 space-y-2">
                      <Link
                        href={'/imovel/' + p.slug}
                        className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-xl py-2.5 px-3 text-xs font-medium transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>Ver Ficha Completa</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <a
                        href={'https://wa.me/5519993673949?text=' + encodeURIComponent(
                          'Olá Miyashiro Imóveis! Comparei os imóveis no site e gostaria de agendar uma visita para o imóvel ' + p.title + ' (REF: ' + p.id.toUpperCase() + ' - ' + formatCurrency(p.price) + ').'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 px-3 text-xs font-medium transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Agendar no WhatsApp</span>
                      </a>
                    </td>
                  ))}
                  {selectedProperties.length < 3 && <td className="bg-stone-50/20" />}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
