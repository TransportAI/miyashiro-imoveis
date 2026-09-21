'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MessageCircle, Phone, Mail, CheckCircle2, UserCheck } from 'lucide-react';
import { Corretor, Property } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface BrokerContactCardProps {
  corretor?: Corretor;
  property: Property;
}

export default function BrokerContactCard({ corretor, property }: BrokerContactCardProps) {
  const [hasAvatarError, setHasAvatarError] = useState(false);
  const defaultCorretor: Corretor = {
    id: 'gallo-central',
    nome: 'Equipe Miyashiro Imóveis',
    email: 'contato@miyashiroimoveis.com.br',
    creci: 'CRECI 155957F',
    whatsapp: '(19) 99896-3398',
    telefoneComercial: '(19) 3807-2200',
    avatarUrl: '/images/brand/logo.png',
    bio: 'Especialistas no mercado imobiliário de Amparo e Circuito das Águas há mais de uma década.',
    isActive: true
  };

  const activeBroker = (corretor && corretor.isActive) ? corretor : defaultCorretor;
  const rawPhone = activeBroker.whatsapp.replace(/\D/g, '');
  const cleanPhone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;

  const priceText = formatCurrency(property.price);
  const whatsappMessage = encodeURIComponent(
    `Olá ${activeBroker.nome}! Estou no site da Miyashiro Imóveis e tenho interesse no imóvel REF: ${property.id.toUpperCase()} - ${property.title} (${priceText}). Gostaria de agendar uma visita!`
  );

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-5">
      {/* Badge Top */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#00873E]/10 text-[#00873E] border border-[#00873E]/20">
          <UserCheck className="w-3.5 h-3.5 text-[#00873E]" />
          Corretor Responsável
        </span>
        <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
          {activeBroker.creci}
        </span>
      </div>

      {/* Broker Profile Header */}
      <div className="flex items-center gap-3.5">
        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 shadow-xs">
          {activeBroker.avatarUrl && !hasAvatarError ? (
            <Image
              src={activeBroker.avatarUrl}
              alt={activeBroker.nome}
              fill
              className="object-cover"
              onError={() => setHasAvatarError(true)}
            />
          ) : (
            <div className="w-full h-full bg-[#00873E] text-white font-bold text-lg flex items-center justify-center font-urbanist">
              {activeBroker.nome.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm sm:text-base font-bold text-stone-900 font-urbanist truncate">
            {activeBroker.nome}
          </h4>
          <p className="text-xs text-stone-500 truncate flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Atendimento Miyashiro Imóveis</span>
          </p>
          {activeBroker.bio && (
            <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
              {activeBroker.bio}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <a
          href={`https://wa.me/${cleanPhone}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-[#00873E] hover:bg-[#15803d] text-white py-3 px-4 rounded-2xl font-semibold text-xs transition shadow-md shadow-red-950/20 active:scale-98 cursor-pointer"
          title={`Falar diretamente no WhatsApp com ${activeBroker.nome}`}
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>Falar no WhatsApp com o Corretor</span>
        </a>

        {activeBroker.telefoneComercial && (
          <a
            href={`tel:${activeBroker.telefoneComercial.replace(/\D/g, '')}`}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium text-xs transition"
          >
            <Phone className="w-3.5 h-3.5 text-stone-500" />
            <span>Ligar {activeBroker.telefoneComercial}</span>
          </a>
        )}
      </div>
    </div>
  );
}
