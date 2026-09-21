'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  Building2, ShieldCheck, CheckCircle2, ArrowRight, 
  UploadCloud, Trash2, Image as ImageIcon, Plus, Mail
} from 'lucide-react';
import { formatPhone, formatPriceMask } from '@/lib/masks';
import { logAuditEvent } from '@/lib/audit';
import TurnstileWidget from '@/components/TurnstileWidget';

export default function AnunciarPage() {
  const [submitted, setSubmitted] = useState(false);
  const [nome, setNome] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState('Venda');
  const [type, setType] = useState('Casa em Condomínio');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remainingSlots = 10 - uploadedImages.length;
    if (remainingSlots <= 0) {
      alert('Você atingiu o limite de 10 fotos.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedImages(prev => {
            if (prev.length >= 10) return prev;
            return [...prev, e.target!.result as string];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (idxToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newLead = {
      id: `lead-${Date.now()}`,
      name: nome,
      phone: phone,
      email: email.trim() || undefined,
      propertyTitle: `Proprietário Anunciando: ${type} em ${neighborhood}`,
      message: `Finalidade: ${purpose} | Valor estimado: ${estimatedPrice || 'A avaliar'} | Endereço: ${address}, ${neighborhood}, Amparo/SP${email ? ` | E-mail: ${email}` : ''}${uploadedImages.length > 0 ? ` | Fotos anexadas: ${uploadedImages.length}` : ''}`,
      channel: 'formulario',
      status: 'novo',
      images: uploadedImages,
      createdAt: new Date().toISOString()
    };

    try {
      const stored = JSON.parse(localStorage.getItem('gallo_leads') || '[]');
      stored.unshift(newLead);
      localStorage.setItem('gallo_leads', JSON.stringify(stored));

      logAuditEvent(
        'LEAD_RECEBIDO',
        `Captação de Imóvel (${nome})`,
        `Proprietário cadastrou ${type} para ${purpose} no bairro ${neighborhood} - Valor: ${estimatedPrice || 'Sob consulta'} (${uploadedImages.length} fotos anexadas)`,
        'lead',
        'Proprietário Anunciante'
      );
    } catch (err) {
      console.error(err);
    }

    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-medium uppercase tracking-wider text-gallo-700">Para Proprietários</span>
        <h1 className="text-3xl font-medium text-stone-900 font-urbanist">
          Anuncie seu Imóvel na Miyashiro Imóveis
        </h1>
        <p className="text-stone-600 text-sm font-light">
          Cadastre seu imóvel e aproveite nossa carteira de clientes ativos e assessoria completa em Amparo e no Circuito das Águas.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-xl font-medium text-stone-900 font-urbanist">Cadastro de Imóvel Recebido!</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Nossa equipe de captação entrará em contato pelo WhatsApp <strong className="text-stone-800">{phone}</strong> {email ? `ou e-mail ${email} ` : ''}para agendar uma visita técnica e formalizar a autorização de venda/locação.
            </p>
            {uploadedImages.length > 0 && (
              <p className="text-[11px] text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-full inline-block">
                ✓ {uploadedImages.length} fotos foram anexadas com sucesso ao cadastro!
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Proprietário */}
            <div className="space-y-4">
              <h2 className="text-base font-medium text-stone-900 font-urbanist border-b border-stone-100 pb-2">
                1. Dados do Proprietário
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Nome Completo</label>
                  <input
                    required
                    type="text"
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">WhatsApp com DDD</label>
                  <input
                    required
                    type="tel"
                    placeholder="(19) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-stone-600 block">E-mail</label>
                    <span className="text-[10px] text-stone-400 font-light">Opcional</span>
                  </div>
                  <input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Informações do Imóvel */}
            <div className="space-y-4">
              <h2 className="text-base font-medium text-stone-900 font-urbanist border-b border-stone-100 pb-2">
                2. Informações do Imóvel
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Finalidade</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800"
                  >
                    <option value="Venda">Venda</option>
                    <option value="Locação">Locação</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Tipo de Imóvel</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800"
                  >
                    <option value="Casa em Condomínio">Casa em Condomínio</option>
                    <option value="Casa de Bairro">Casa de Bairro</option>
                    <option value="Apartamento">Apartamento</option>
                    <option value="Chácara / Sítio">Chácara / Sítio</option>
                    <option value="Terreno / Lote">Terreno / Lote</option>
                    <option value="Comercial">Comercial</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Valor Estimado (R$)</label>
                  <input
                    type="text"
                    placeholder="R$ 650.000"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(formatPriceMask(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Bairro em Amparo</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Jardim São Dimas, Centro..."
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 mb-1 block">Endereço (Rua e Número)</label>
                  <input
                    required
                    type="text"
                    placeholder="Rua, número e complemento"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 3. Fotos do Imóvel (Upload / Dropzone) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h2 className="text-base font-medium text-stone-900 font-urbanist">
                  3. Fotos do Imóvel
                </h2>
                <span className="text-xs text-stone-400">
                  {uploadedImages.length}/10 fotos anexadas
                </span>
              </div>

              {/* Dropzone Box */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                  isDragging 
                    ? 'border-[#00873E] bg-emerald-50/50' 
                    : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/60 bg-stone-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 shadow-xs">
                  <UploadCloud className="w-5 h-5 text-[#00873E]" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-stone-800">
                    Arraste as fotos do imóvel aqui ou <span className="text-[#00873E] underline">escolha arquivos</span>
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Formatos JPG, PNG ou WEBP (até 10 imagens)
                  </p>
                </div>
              </div>

              {/* Uploaded Images Thumbnails */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                  {uploadedImages.map((imgUrl, index) => (
                    <div 
                      key={index} 
                      className="relative aspect-[4/3] rounded-xl overflow-hidden border border-stone-200 group bg-stone-100 shadow-2xs"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Foto ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-[#00873E] text-white text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
                          Capa
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-black/90 text-white transition opacity-0 group-hover:opacity-100"
                        title="Remover foto"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <TurnstileWidget onVerify={() => {}} />

            <button
              type="submit"
              className="w-full bg-[#00873E] hover:bg-[#15803d] text-white py-3.5 rounded-xl font-medium text-xs transition shadow flex items-center justify-center gap-2"
            >
              <span>Enviar Imóvel para Avaliação</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
