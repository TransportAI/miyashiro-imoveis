'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, CheckCircle2 } from 'lucide-react';
import { formatPhone } from '@/lib/masks';
import { logAuditEvent } from '@/lib/audit';
import TurnstileWidget from '@/components/TurnstileWidget';

export default function ContatoPage() {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: 'comprar',
    mensagem: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newLead = {
      id: `lead-${Date.now()}`,
      name: formData.nome,
      phone: formData.telefone,
      email: formData.email || undefined,
      propertyTitle: `Mensagem Geral: ${formData.assunto.toUpperCase()}`,
      message: formData.mensagem || 'Contato via formulário Fale Conosco',
      channel: 'formulario',
      status: 'novo',
      createdAt: new Date().toISOString()
    };

    try {
      const stored = JSON.parse(localStorage.getItem('gallo_leads') || '[]');
      stored.unshift(newLead);
      localStorage.setItem('gallo_leads', JSON.stringify(stored));

      logAuditEvent(
        'LEAD_RECEBIDO',
        `Mensagem de Contato (${formData.nome})`,
        `Assunto: ${formData.assunto} - WhatsApp: ${formData.telefone}`,
        'lead',
        'Visitante Web'
      );
    } catch (err) {
      console.error(err);
    }

    setSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-gallo-700">Fale Conosco</span>
        <h1 className="text-3xl font-medium text-stone-900 font-urbanist">
          Entre em Contato com a Miyashiro Imóveis
        </h1>
        <p className="text-stone-500 text-sm">
          Estamos à disposição para esclarecer dúvidas, agendar visitas ou apresentar os melhores imóveis de Amparo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Contact info cards */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
            <Phone className="w-5 h-5 text-gallo-700" />
            <h3 className="text-sm font-medium text-stone-900 font-urbanist">Telefones de Atendimento</h3>
            <p className="text-xs text-stone-600">(19) 99609-5119</p>
            <p className="text-xs text-stone-600">(19) 99609-4312</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
            <MessageCircle className="w-5 h-5 text-gallo-700" />
            <h3 className="text-sm font-medium text-stone-900 font-urbanist">WhatsApp Plantão</h3>
            <p className="text-xs text-stone-600">(19) 99367-3949</p>
            <a
              href="https://wa.me/5519993673949"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gallo-700 hover:text-gallo-800 font-medium inline-block mt-1"
            >
              Iniciar conversa direta →
            </a>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
            <MapPin className="w-5 h-5 text-gallo-700" />
            <h3 className="text-sm font-medium text-stone-900 font-urbanist">Localização</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Rua Ana Cintra, 246 - Centro<br />
              Amparo - SP, CEP 13900-011
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
            <Clock className="w-5 h-5 text-gallo-700" />
            <h3 className="text-sm font-medium text-stone-900 font-urbanist">Horário de Funcionamento</h3>
            <p className="text-xs text-stone-600">Segunda a Sexta: 08:30 às 18:00</p>
            <p className="text-xs text-stone-600">Sábado: 08:30 às 12:00</p>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs">
            {sent ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-xl font-medium text-stone-900 font-urbanist">Mensagem enviada com sucesso!</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Agradecemos seu contato. Um de nossos corretores entrará em contato com você em breve.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-medium transition"
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-medium text-stone-900 font-urbanist mb-2">Envie uma Mensagem</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-stone-600 mb-1 block">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Seu nome"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-gallo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-600 mb-1 block">Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                      placeholder="(19) 99999-9999"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-gallo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-stone-600 mb-1 block">E-mail</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seuemail@exemplo.com"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-gallo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-600 mb-1 block">Interesse</label>
                    <select
                      value={formData.assunto}
                      onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-gallo-600"
                    >
                      <option value="comprar">Quero Comprar um Imóvel</option>
                      <option value="alugar">Quero Alugar um Imóvel</option>
                      <option value="anunciar">Quero Anunciar meu Imóvel</option>
                      <option value="duvidas">Dúvidas Gerais / Outros</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Mensagem</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    placeholder="Descreva o que procura ou como podemos ajudar..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-gallo-600"
                  />
                </div>

                <TurnstileWidget onVerify={() => {}} />

                <button
                  type="submit"
                  className="bg-[#00873E] hover:bg-[#15803d] text-white px-6 py-3 rounded-xl text-xs font-medium transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Mensagem</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
