import PropertyDetailActions from '@/components/PropertyDetailActions';
import ScheduleVisitForm from '@/components/ScheduleVisitForm';
import PropertyMediaViewer from '@/components/PropertyMediaViewer';
import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Bed, Bath, Car, Maximize, MapPin, CheckCircle2, 
  MessageCircle, Phone, Calendar, Share2, ShieldCheck, 
  ArrowLeft, ChevronRight, Compass, Video, ArrowUpRight
} from 'lucide-react';
import propertiesData from '@/data/properties.json';
import { Property } from '@/lib/types';
import { formatCurrency, formatArea, getPurposeLabel, getTypeLabel } from '@/lib/utils';

import { getPropertyBySlug, getProperties } from '@/lib/properties';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const properties = getProperties();
  return properties.map((p) => ({
    slug: p.slug,
  }));
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const whatsappMessage = encodeURIComponent(
    `Olá Miyashiro Imóveis! Tenho interesse no imóvel REF: ${property.id.toUpperCase()} - ${property.title} (${formatCurrency(property.price)}). Poderia me passar mais detalhes e agendar uma visita?`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumbs & Back */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-1.5">
          <Link href="/" className="hover:text-stone-800 transition">Início</Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <Link href="/imoveis" className="hover:text-stone-800 transition">Imóveis</Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="text-stone-800 truncate max-w-xs">{property.title}</span>
        </div>
        <Link
          href="/imoveis"
          className="flex items-center gap-1 hover:text-gallo-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao catálogo
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-gallo-700 text-white text-xs font-medium">
              {getPurposeLabel(property.purpose)}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 text-xs font-medium">
              {getTypeLabel(property.type)}
            </span>
            <span className="text-xs font-mono text-stone-500">
              REF: {property.id.toUpperCase()}
            </span>
            {property.virtualTourUrl && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium">
                <Compass className="w-3 h-3 text-amber-600" />
                <span>Passeio Virtual 360°</span>
              </span>
            )}
            {property.videoUrl && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-900 border border-rose-200 text-xs font-medium">
                <Video className="w-3 h-3 text-rose-600" />
                <span>Vídeo HD</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-stone-900 font-urbanist">
            {property.title}
          </h1>
          <div className="flex items-center gap-1.5 text-stone-600 text-xs sm:text-sm">
            <MapPin className="w-4 h-4 text-gallo-700 shrink-0" />
            <span>{property.address.street}, {property.address.neighborhood} - {property.address.city} / {property.address.state}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="text-left lg:text-right">
          <p className="text-xs text-stone-500">Valor do Imóvel</p>
          <p className="text-3xl sm:text-4xl font-medium text-gallo-800 font-urbanist">
            {formatCurrency(property.price)}
            {property.purpose === 'aluguel' && <span className="text-sm font-normal text-stone-500"> /mês</span>}
          </p>
          <div className="flex items-center lg:justify-end gap-3 text-xs text-stone-500 mt-1">
            {property.iptu && property.iptu > 0 ? (
              <span>IPTU: {formatCurrency(property.iptu)}/mês</span>
            ) : null}
            {property.condoFee && property.condoFee > 0 ? (
              <span>Condomínio: {formatCurrency(property.condoFee)}/mês</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Interactive Media Viewer (Fotos, Tour 360°, Vídeo) */}
      <PropertyMediaViewer property={property} />

      {/* Main Content & Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left 2 Columns: Specs, Description, Amenities */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Key Metrics Bar */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {property.bedrooms > 0 && (
              <div className="space-y-1">
                <Bed className="w-5 h-5 text-gallo-700 mx-auto" />
                <p className="text-base font-medium text-stone-900 font-urbanist">{property.bedrooms} Quartos</p>
                <p className="text-[11px] text-stone-500">{property.suites > 0 ? `${property.suites} suíte(s)` : 'Dormitórios'}</p>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="space-y-1">
                <Bath className="w-5 h-5 text-gallo-700 mx-auto" />
                <p className="text-base font-medium text-stone-900 font-urbanist">{property.bathrooms} Banheiros</p>
                <p className="text-[11px] text-stone-500">Com acabamento</p>
              </div>
            )}
            {property.parkingSpots > 0 && (
              <div className="space-y-1">
                <Car className="w-5 h-5 text-gallo-700 mx-auto" />
                <p className="text-base font-medium text-stone-900 font-urbanist">{property.parkingSpots} Vagas</p>
                <p className="text-[11px] text-stone-500">De garagem</p>
              </div>
            )}
            <div className="space-y-1">
              <Maximize className="w-5 h-5 text-gallo-700 mx-auto" />
              <p className="text-base font-medium text-stone-900 font-urbanist">{formatArea(property.areaBuilt || property.areaTotal)}</p>
              <p className="text-[11px] text-stone-500">Área privativa</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium text-stone-900 font-urbanist">Sobre o Imóvel</h2>
            <p className="text-stone-700 leading-relaxed text-sm whitespace-pre-line font-light">
              {property.description}
            </p>
          </div>

          {/* Amenities & Features */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-stone-900 font-urbanist">Características</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-white border border-stone-200/80 text-xs text-stone-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location Details Card */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-stone-900 font-urbanist">Localização no Google Maps</h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Bairro <strong>{property.address.neighborhood}</strong>, Amparo - SP{property.address.street ? `, ${property.address.street}` : ''}.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#00873E] bg-[#00873E]/5 px-2.5 py-1 rounded-full border border-[#00873E]/20 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Amparo / SP
              </span>
            </div>

            {/* Real Interactive Google Maps Iframe */}
            <div className="h-72 sm:h-96 rounded-2xl overflow-hidden border border-stone-200 shadow-inner bg-stone-100">
              <iframe
                title={`Mapa do Imóvel: ${property.title}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  `${property.address.street ? property.address.street + ', ' : ''}${property.address.neighborhood}, ${property.address.city || 'Amparo'} - ${property.address.state || 'SP'}, Brasil`
                )}&output=embed`}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-stone-500">
              <p className="text-stone-400">
                * Localização aproximada por segurança e privacidade do proprietário. O endereço completo e número são fornecidos após agendamento de visita com a Miyashiro Imóveis (CRECI 155957F).
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${property.address.street ? property.address.street + ', ' : ''}${property.address.neighborhood}, ${property.address.city || 'Amparo'} - ${property.address.state || 'SP'}, Brasil`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1 font-medium text-[#00873E] hover:underline"
              >
                <span>Abrir rota no Google Maps</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

        {/* Right Column: Fast Contact & Schedule Visit */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-white rounded-3xl p-6 border border-stone-200/90 shadow-lg space-y-6">
            
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-gallo-700">Atendimento Exclusivo</span>
              <h3 className="text-lg font-medium text-stone-900 mt-1 font-urbanist">Interessado neste imóvel?</h3>
              <p className="text-xs text-stone-500 mt-1">
                Fale agora com a corretora responsável por este cadastro na Miyashiro Imóveis.
              </p>
            </div>

            {/* Interactive Actions: Save Property, Interest Modal, WhatsApp */}
            <PropertyDetailActions property={property} />

            {/* Quick Visit Schedule Form */}
            <ScheduleVisitForm property={property} />

            {/* Credibility Guarantee */}
            <div className="pt-2 text-[11px] text-stone-400 flex items-center gap-1.5 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Garantia de atendimento CRECI 155957F</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
