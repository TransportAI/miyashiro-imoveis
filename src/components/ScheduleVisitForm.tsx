'use client';

import React, { useState } from 'react';
import { CheckCircle2, Calendar } from 'lucide-react';
import { Property } from '@/lib/types';
import { formatPhone } from '@/lib/masks';
import { logAuditEvent } from '@/lib/audit';
import TurnstileWidget from '@/components/TurnstileWidget';

interface ScheduleVisitFormProps {
  property: Property;
}

export default function ScheduleVisitForm({ property }: ScheduleVisitFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newLead = {
      id: `lead-${Date.now()}`,
      name,
      phone,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyPrice: property.price,
      message: `[Agendamento de Visita] Solicitou visita presencial para o imóvel ${property.title} (REF: ${property.id.toUpperCase()})`,
      channel: 'formulario',
      status: 'novo',
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('gallo_leads') || '[]');
      existing.unshift(newLead);
      localStorage.setItem('gallo_leads', JSON.stringify(existing));

      logAuditEvent(
        'LEAD_RECEBIDO',
        `Visita Agendada por ${name}`,
        `Interesse no imóvel ${property.id.toUpperCase()} - Contato: ${phone}`,
        'lead',
        'Visitante Portal'
      );
    } catch (err) {
      console.error(err);
    }

    setSubmitted(true);
  };

  return (
    <div className="pt-4 border-t border-stone-100 space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-[#00873E]" />
        <h4 className="text-xs font-medium text-stone-800 font-urbanist">Agendar Visita Presencial</h4>
      </div>

      {submitted ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
          <p className="text-xs font-medium text-emerald-900 font-urbanist">Visita Solicitada com Sucesso!</p>
          <p className="text-[11px] text-emerald-700">Nosso corretor entrará em contato via WhatsApp no número {phone}.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            required
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-xs border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#00873E] bg-stone-50"
          />
          <input
            type="tel"
            required
            placeholder="Seu WhatsApp (com DDD)"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            className="w-full text-xs border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#00873E] bg-stone-50"
          />

          <TurnstileWidget onVerify={() => {}} />

          <button
            type="submit"
            className="w-full bg-stone-900 hover:bg-black text-white text-xs py-2.5 rounded-xl transition font-medium"
          >
            Solicitar Agendamento
          </button>
        </form>
      )}
    </div>
  );
}
