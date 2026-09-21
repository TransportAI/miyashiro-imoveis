'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, CheckCircle2, MapPin, Star, Video, Plus, X, Tag } from 'lucide-react';
import Link from 'next/link';
import { Property, TourRoom } from '@/lib/types';
import DropzoneUpload from '@/components/DropzoneUpload';
import TourRoomBuilder from '@/components/admin/TourRoomBuilder';
import { logAuditEvent } from '@/lib/audit';
import { formatPriceMask, parsePriceMask } from '@/lib/masks';

const SUGGESTED_CHARACTERISTICS = [
  'Piscina',
  'Churrasqueira',
  'Espaço Gourmet',
  'Portão Eletrônico',
  'Ar Condicionado',
  'Armários Embutidos',
  'Cozinha Planejada',
  'Quintal Amplo',
  'Varanda / Sacada',
  'Murado',
  'Topografia Plana',
  'Água Encanada',
  'Energia Elétrica',
  'Rede de Esgoto',
  'Rua Asfaltada',
  'Documentação Escriturada',
  'Vista Panorâmica',
  'Segurança 24h',
  'Poço Artesiano',
  'Pomar / Horta'
];

interface EditPropertyFormProps {
  initialProperty: Property;
}

export default function EditPropertyForm({ initialProperty }: EditPropertyFormProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  // 1. Informações Principais
  const [title, setTitle] = useState(initialProperty.title);
  const [status, setStatus] = useState<'disponivel' | 'reservado' | 'vendido' | 'alugado' | 'arquivado'>(
    initialProperty.status as any
  );
  const [purpose, setPurpose] = useState<'venda' | 'aluguel'>(initialProperty.purpose);
  const [type, setType] = useState(initialProperty.type);
  const [price, setPrice] = useState(formatPriceMask(initialProperty.price));
  const [iptu, setIptu] = useState(initialProperty.iptu ? formatPriceMask(initialProperty.iptu) : '');
  const [condoFee, setCondoFee] = useState(initialProperty.condoFee ? formatPriceMask(initialProperty.condoFee) : '');
  const [featured, setFeatured] = useState<boolean>(initialProperty.featured ?? false);

  // 2. Localização
  const [city, setCity] = useState(initialProperty.address?.city || 'Amparo');
  const [state, setState] = useState(initialProperty.address?.state || 'SP');
  const [neighborhood, setNeighborhood] = useState(initialProperty.address.neighborhood);
  const [street, setStreet] = useState(initialProperty.address.street || '');

  // 3. Detalhes e Métricas
  const [bedrooms, setBedrooms] = useState(initialProperty.bedrooms ?? 0);
  const [suites, setSuites] = useState(initialProperty.suites ?? 0);
  const [bathrooms, setBathrooms] = useState(initialProperty.bathrooms ?? 0);
  const [parkingSpots, setParkingSpots] = useState(initialProperty.parkingSpots ?? 0);
  const [areaBuilt, setAreaBuilt] = useState(initialProperty.areaBuilt ?? 0);
  const [areaTotal, setAreaTotal] = useState(initialProperty.areaTotal ?? 0);

  // 4. Características
  const [amenities, setAmenities] = useState<string[]>(initialProperty.amenities || []);
  const [customAmenity, setCustomAmenity] = useState('');

  // 5. Descrição
  const [description, setDescription] = useState(initialProperty.description);

  // 6. Fotos e Mídias (Sempre por último)
  const [images, setImages] = useState<string[]>(initialProperty.images || ['/images/properties/gallo_prop_1.jpg']);
  const [coverImage, setCoverImage] = useState<string>(initialProperty.images?.[0] || '/images/properties/gallo_prop_1.jpg');
  const [virtualTourRooms, setVirtualTourRooms] = useState<TourRoom[]>(initialProperty.virtualTourRooms || []);
  const [virtualTourUrl, setVirtualTourUrl] = useState<string>(initialProperty.virtualTourUrl || '');
  const [videoUrl, setVideoUrl] = useState<string>(initialProperty.videoUrl || '');

  const handleImagesChange = (newImages: string[], newCover: string) => {
    setImages(newImages);
    setCoverImage(newCover);
  };

  const handleAddCharacteristic = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!amenities.some(item => item.toLowerCase() === trimmed.toLowerCase())) {
      setAmenities([...amenities, trimmed]);
    }
    setCustomAmenity('');
  };

  const handleRemoveCharacteristic = (name: string) => {
    setAmenities(amenities.filter(item => item !== name));
  };

  const handleToggleCharacteristic = (name: string) => {
    if (amenities.includes(name)) {
      handleRemoveCharacteristic(name);
    } else {
      handleAddCharacteristic(name);
    }
  };

  const addressQuery = `${street ? street + ', ' : ''}${neighborhood}, ${city} - ${state}, Brasil`;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Reorder images so cover is first
    const orderedImages = [
      coverImage,
      ...images.filter((img) => img !== coverImage)
    ];

    const updated: Property = {
      ...initialProperty,
      title,
      featured,
      videoUrl: videoUrl.trim() || undefined,
      virtualTourUrl: virtualTourUrl.trim() || undefined,
      virtualTourRooms: virtualTourRooms.length > 0 ? virtualTourRooms : undefined,
      purpose,
      type: type as any,
      status: status as any,
      price: parsePriceMask(price),
      iptu: iptu ? parsePriceMask(iptu) : undefined,
      condoFee: condoFee ? parsePriceMask(condoFee) : undefined,
      address: {
        ...initialProperty.address,
        city,
        state,
        neighborhood,
        street,
      },
      bedrooms: Number(bedrooms) || 0,
      suites: Number(suites) || 0,
      bathrooms: Number(bathrooms) || 0,
      parkingSpots: Number(parkingSpots) || 0,
      areaBuilt: Number(areaBuilt) || 0,
      areaTotal: Number(areaTotal) || 0,
      amenities,
      description,
      images: orderedImages
    };

    try {
      const customProps: Property[] = JSON.parse(localStorage.getItem('gallo_custom_properties') || '[]');
      const existingIdx = customProps.findIndex(p => p.id === initialProperty.id);
      if (existingIdx >= 0) {
        customProps[existingIdx] = updated;
      } else {
        customProps.unshift(updated);
      }
      localStorage.setItem('gallo_custom_properties', JSON.stringify(customProps));

      // Persist to Server Filesystem
      fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(err => console.error('Erro ao sincronizar com properties.json:', err));

      // Audit Log
      logAuditEvent(
        'IMOVEL_EDITADO',
        `Imóvel Atualizado (${initialProperty.id.toUpperCase()})`,
        `${title} - R$ ${Number(parsePriceMask(price)).toLocaleString('pt-BR')} (Status: ${status})`,
        'imovel',
        'Administrador Miyashiro'
      );
    } catch (err) {
      console.error(err);
    }

    setSaved(true);
    setTimeout(() => {
      router.push('/admin/imoveis');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/imoveis" className="p-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-gallo-800 bg-gallo-50 px-2 py-0.5 rounded text-[10px]">
              REF: {initialProperty.id.toUpperCase()}
            </span>
            <h1 className="text-2xl font-medium text-stone-900 font-urbanist">
              Editar Imóvel
            </h1>
          </div>
          <p className="text-stone-500 text-xs">
            Atualize valores, status, características, descrição e mídias
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
        {saved ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-xl font-medium text-stone-900 font-urbanist">Alterações Salvas com Sucesso!</h3>
            <p className="text-xs text-stone-500">Retornando para a listagem...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8 text-xs">
            
            {/* 1. INFORMAÇÕES PRINCIPAIS */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-stone-900 font-urbanist border-b border-stone-100 pb-2">
                1. Informações Principais
              </h2>
              <div>
                <label className="font-medium text-stone-700 mb-1 block">Título do Anúncio</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-medium text-stone-700 mb-1 block">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-medium"
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="reservado">Reservado</option>
                    <option value="vendido">Vendido</option>
                    <option value="alugado">Alugado</option>
                    <option value="arquivado">Arquivado</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-stone-700 mb-1 block">Finalidade</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs"
                  >
                    <option value="venda">Venda</option>
                    <option value="aluguel">Aluguel</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-stone-700 mb-1 block">Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs"
                  >
                    <option value="casa">Casa Residencial</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="chacara">Chácara e Sítio</option>
                    <option value="terreno">Terreno / Lote</option>
                    <option value="comercial">Comercial</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-stone-700 mb-1 block">Preço (R$)</label>
                  <input
                    required
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(formatPriceMask(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-medium text-[#00873E] focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-stone-700 mb-1 block">IPTU Anual / Mensal (R$) (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: 150,00"
                    value={iptu}
                    onChange={(e) => setIptu(formatPriceMask(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                  />
                </div>
                <div>
                  <label className="font-medium text-stone-700 mb-1 block">Condomínio (R$) (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: 350,00"
                    value={condoFee}
                    onChange={(e) => setCondoFee(formatPriceMask(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                  />
                </div>
              </div>

              {/* Destaque no Carrossel Hero */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl transition ${featured ? 'bg-amber-500 text-white shadow-sm' : 'bg-stone-200 text-stone-500'}`}>
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-stone-900 text-xs font-urbanist">
                        Destaque Principal na Página Inicial
                      </h3>
                      {featured && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                          ATIVO NO TOPO
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Exibe este imóvel na vitrine rotativa principal do topo da página inicial.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer ml-auto shrink-0">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>

            {/* 2. LOCALIZAÇÃO E MAPA */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-stone-900 font-urbanist border-b border-stone-100 pb-2">
                2. Localização e Mapa
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-stone-700 mb-1 block">Cidade *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-medium text-stone-700 mb-1 block">Estado (UF) *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-medium uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-stone-700 mb-1 block">Bairro</label>
                  <input
                    type="text"
                    required
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-stone-700 mb-1 block">Rua e Número</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              {/* Real-time Google Maps Embed Preview */}
              <div className="rounded-2xl border border-stone-200 overflow-hidden bg-stone-50">
                <div className="px-4 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-700 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#00873E]" />
                    <span>Pré-visualização do Google Maps</span>
                  </div>
                  <span className="text-[10px] text-stone-600 truncate max-w-xs">{addressQuery}</span>
                </div>
                <div className="aspect-[21/9] sm:aspect-[24/7] w-full">
                  <iframe
                    title="Localização do Imóvel"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(addressQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  />
                </div>
              </div>
            </div>

            {/* 3. DETALHES E MÉTRICAS */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-stone-900 font-urbanist border-b border-stone-100 pb-2">
                3. Detalhes e Métricas
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="font-medium text-stone-700 mb-1 block">Quartos</label>
                  <input
                    type="number"
                    min="0"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="font-medium text-stone-700 mb-1 block">Suítes</label>
                  <input
                    type="number"
                    min="0"
                    value={suites}
                    onChange={(e) => setSuites(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="font-medium text-stone-700 mb-1 block">Banheiros</label>
                  <input
                    type="number"
                    min="0"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="font-medium text-stone-700 mb-1 block">Vagas</label>
                  <input
                    type="number"
                    min="0"
                    value={parkingSpots}
                    onChange={(e) => setParkingSpots(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-stone-700 mb-1 block">Área Construída (m²)</label>
                  <input
                    type="number"
                    min="0"
                    value={areaBuilt}
                    onChange={(e) => setAreaBuilt(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="font-medium text-stone-700 mb-1 block">Área Total do Terreno (m²)</label>
                  <input
                    type="number"
                    min="0"
                    value={areaTotal}
                    onChange={(e) => setAreaTotal(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                  />
                </div>
              </div>
            </div>

            {/* 4. CARACTERÍSTICAS (Totalmente gerenciável / cadastrável para qualquer tipo de imóvel) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#00873E]" />
                  <h2 className="text-sm font-medium text-stone-900 font-urbanist">
                    4. Características do Imóvel
                  </h2>
                </div>
                <span className="text-[11px] text-stone-400">
                  {amenities.length} {amenities.length === 1 ? 'adicionada' : 'adicionadas'}
                </span>
              </div>

              {/* Selected Characteristics Tags */}
              <div>
                <label className="font-medium text-stone-700 mb-2 block">
                  Características Ativas no Imóvel:
                </label>
                {amenities.length === 0 ? (
                  <p className="text-[11px] text-stone-400 italic bg-stone-50 p-3 rounded-xl border border-dashed border-stone-200">
                    Nenhuma característica selecionada. Clique nas sugestões abaixo ou digite novas características.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200 min-h-[50px]">
                    {amenities.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-stone-800 border border-stone-200/90 text-xs font-medium shadow-xs group"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCharacteristic(item)}
                          className="text-stone-400 hover:text-rose-600 ml-1 p-0.5 rounded transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Custom Characteristic */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cadastrar nova característica (ex: Topografia Plana, Vista para a Serra, Poço Artesiano...)"
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCharacteristic(customAmenity);
                    }
                  }}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                />
                <button
                  type="button"
                  onClick={() => handleAddCharacteristic(customAmenity)}
                  className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>

              {/* Fast suggestions */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] text-stone-500 font-medium block">
                  Sugestões Rápidas (Casas, Apartamentos e Terrenos):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_CHARACTERISTICS.map((sug) => {
                    const isSelected = amenities.includes(sug);
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleToggleCharacteristic(sug)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {sug}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 5. DESCRIÇÃO DO IMÓVEL */}
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-stone-900 font-urbanist border-b border-stone-100 pb-2">
                5. Descrição do Imóvel
              </h2>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a arquitetura, acabamento, detalhes da vizinhança, documentação..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00873E]"
              />
            </div>

            {/* 6. FOTOS E MÍDIAS (SEMPRE POR ÚLTIMO) */}
            <div className="space-y-6 pt-4 border-t border-stone-200/80">
              <div>
                <h2 className="text-sm font-medium text-stone-900 font-urbanist border-b border-stone-100 pb-2 flex items-center justify-between">
                  <span>6. Fotos, Tour 360° e Vídeo do Imóvel</span>
                  <span className="text-[11px] text-stone-400 font-normal">Mídias do Anúncio</span>
                </h2>
                <p className="text-[11px] text-stone-500 mt-1">
                  Gerencie as fotos tradicionais de catálogo, o tour virtual imersivo 360° e o vídeo do imóvel.
                </p>
              </div>

              {/* Fotos Tradicionais */}
              <div className="space-y-2">
                <label className="font-medium text-stone-700 block">
                  Galeria de Fotos (2D) e Foto de Capa
                </label>
                <DropzoneUpload
                  images={images}
                  coverImage={coverImage}
                  onChange={handleImagesChange}
                />
              </div>

              {/* Construtor Nativo de Tour 360 */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <TourRoomBuilder
                  rooms={virtualTourRooms}
                  onChange={setVirtualTourRooms}
                  availableImages={images}
                />
              </div>

              {/* Vídeo YouTube */}
              <div className="pt-2 border-t border-stone-100">
                <div className="space-y-1.5 max-w-xl">
                  <label className="font-medium text-stone-700 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-rose-600" />
                    <span>Link do Vídeo do Imóvel (YouTube)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                  />
                  <p className="text-[10px] text-stone-400">
                    Insira o link público ou não-listado do YouTube para exibir o player integrado.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-stone-200">
              <Link
                href="/admin/imoveis"
                className="px-5 py-3 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="bg-[#00873E] hover:bg-[#15803d] text-white px-6 py-3 rounded-xl font-medium text-xs transition shadow flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
