'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Send, CheckCircle2, Bookmark, MessageCircle, MapPin, Sparkles } from 'lucide-react';
import { Property } from '@/lib/types';
import { formatCurrency, formatArea } from '@/lib/utils';
import { formatPhone } from '@/lib/masks';
import { logAuditEvent } from '@/lib/audit';
import TurnstileWidget from '@/components/TurnstileWidget';

interface InterestModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (propertyId: string) => void;
}

export default function InterestModal({ property, isOpen, onClose, onSaved }: InterestModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [interestType, setInterestType] = useState('Agendar Visita');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !property) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const newLead = {
      id: `lead-${Date.now()}`,
      name,
      phone,
      email: email || undefined,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyPrice: property.price,
      message: `[${interestType}] ${message || 'Cliente demonstrou interesse e salvou o imóvel no portal.'}`,
      channel: 'formulario',
      status: 'novo',
      createdAt: new Date().toISOString()
    };

    // Save to localStorage leads
    try {
      const existingLeads = JSON.parse(localStorage.getItem('gallo_leads') || '[]');
      existingLeads.unshift(newLead);
      localStorage.setItem('gallo_leads', JSON.stringify(existingLeads));

      // Save to localStorage saved properties
      const existingSaved = JSON.parse(localStorage.getItem('gallo_saved_properties') || '[]');
      if (!existingSaved.includes(property.id)) {
        existingSaved.push(property.id);
        localStorage.setItem('gallo_saved_properties', JSON.stringify(existingSaved));
      }
      if (onSaved) onSaved(property.id);

      // Post to API
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      }).catch(err => console.error('Error posting lead:', err));

      // Audit Log
      logAuditEvent(
        'LEAD_RECEBIDO',
        `Novo Lead Registrado (${name})`,
        `Interesse no imóvel ${property.id.toUpperCase()} via Modal - WhatsApp: ${phone}`,
        'lead',
        'Visitante Portal'
      );
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 500);
  };

  const whatsappDirectMsg = encodeURIComponent(
    `Olá Miyashiro Imóveis! Me chamo ${name || 'Cliente'} e tenho interesse no imóvel REF: ${property.id.toUpperCase()} (${property.title}) no valor de ${formatCurrency(property.price)} em ${property.address.neighborhood}, Amparo. Gostaria de ${interestType.toLowerCase()}.`
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col border border-stone-200 shadow-2xl overflow-hidden relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header - Sticky with prominent close button */}
        <div className="bg-[#00873E] text-white p-4 sm:p-5 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-white/10 shrink-0">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-medium font-urbanist truncate">Salvar & Tenho Interesse</h3>
              <p className="text-[10px] sm:text-[11px] text-stone-200 font-light truncate">
                Receba atendimento prioritário para este imóvel em Amparo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition text-white shrink-0 ml-2"
            aria-label="Fechar Modal"
            title="Fechar Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-xl font-medium text-stone-900 font-urbanist">Interesse Registrado com Sucesso!</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Este imóvel foi adicionado aos seus <strong>Imóveis Salvos</strong> e nossa equipe em Amparo já recebeu seu contato.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`https://wa.me/5519993673949?text=${whatsappDirectMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-medium transition shadow"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar agora no WhatsApp com o Corretor</span>
              </a>
              <button
                onClick={() => { setSuccess(false); onClose(); }}
                className="w-full py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium transition"
              >
                Fechar e continuar navegando
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Property preview card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                <Image
                  src={property.images[0] || '/images/properties/gallo_prop_1.jpg'}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-gallo-800">
                  <span className="bg-gallo-100/70 px-1.5 py-0.5 rounded">REF: {property.id.toUpperCase()}</span>
                  <span className="text-stone-400">•</span>
                  <span className="capitalize text-stone-500">{property.purpose}</span>
                </div>
                <h4 className="text-xs font-medium text-stone-900 truncate mt-0.5 font-urbanist">{property.title}</h4>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-[11px] text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gallo-600" />
                    {property.address.neighborhood}
                  </span>
                  <span className="font-medium text-gallo-800 font-urbanist">{formatCurrency(property.price)}</span>
                </div>
              </div>
            </div>

            {/* Interest Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-stone-600 font-medium mb-1 block">Seu Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-gallo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 font-medium mb-1 block">WhatsApp com DDD *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(19) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-gallo-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-stone-600 font-medium mb-1 block">E-mail (opcional)</label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-gallo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-600 font-medium mb-1.5 block">Como podemos te ajudar?</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Agendar Visita', 'Simular Financiamento', 'Mais Fotos e Detalhes', 'Fazer uma Proposta'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInterestType(type)}
                      className={`p-2 rounded-xl border text-[11px] text-left transition ${
                        interestType === type
                          ? 'border-gallo-600 bg-gallo-50 text-gallo-800 font-medium'
                          : 'border-stone-200 bg-stone-50/70 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-stone-600 font-medium mb-1 block">Mensagem ou preferência de horário</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Gostaria de visitar no sábado à tarde..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-gallo-600 focus:bg-white"
                />
              </div>

              <TurnstileWidget onVerify={() => {}} />

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#00873E] hover:bg-[#15803d] text-white py-3 rounded-xl font-medium text-xs transition shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span>Salvando seu interesse...</span>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Salvar Imóvel & Enviar Interesse</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 text-xs font-medium transition text-center cursor-pointer"
              >
                Fechar / Continuar Navegando
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
