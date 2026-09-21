'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, X, RotateCcw, MessageCircle, Home, Sparkles, User, Phone, Mail } from 'lucide-react';

const Lottie = dynamic(() => import('lottie-react').then((mod) => mod.Lottie), { ssr: false });

import lottieQuestionsData from '../../public/animations/red-ask.json';

interface TriagemState {
  finalidade: 'venda' | 'aluguel' | null;
  tipoImovel: 'apartamento' | 'casa' | 'chacara' | 'fazenda' | 'terreno' | 'comercial' | null;
  quartos: string | null;
  banheiros: string | null;
  name?: string;
  phone?: string;
  email?: string;
}

export default function TriagemWidget() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<TriagemState>({
    finalidade: null,
    tipoImovel: null,
    quartos: null,
    banheiros: null,
  });

  // Dados de contato do lead
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Máscara brasileira de telefone: (XX) XXXXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = '';
    if (raw.length > 0) {
      formatted = `(${raw.slice(0, 2)}`;
      if (raw.length > 2) {
        if (raw.length <= 6) {
          formatted += `) ${raw.slice(2)}`;
        } else if (raw.length <= 10) {
          formatted += `) ${raw.slice(2, 6)}-${raw.slice(6)}`;
        } else {
          formatted += `) ${raw.slice(2, 7)}-${raw.slice(7)}`;
        }
      }
    }
    setLeadPhone(formatted);
    if (formError) setFormError('');
  };

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [hasComparison, setHasComparison] = useState(false);

  useEffect(() => {
    // 1. Não exibir o widget em nenhuma área administrativa
    if (pathname?.startsWith('/admin')) {
      return;
    }

    // Ouvir se há imóveis sendo comparados
    const checkComparison = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('gallo_comparison_ids') || '[]');
        setHasComparison(Array.isArray(stored) && stored.length > 0 && pathname !== '/comparador');
      } catch (e) {
        setHasComparison(false);
      }
    };
    checkComparison();
    window.addEventListener('gallo_comparison_change', checkComparison);
    window.addEventListener('storage', checkComparison);

    // Ouvir se a janela do WhatsApp foi aberta
    const handleWhatsAppToggle = (e: any) => {
      setIsWhatsAppModalOpen(!!e?.detail?.isOpen);
    };
    window.addEventListener('gallo_whatsapp_toggle', handleWhatsAppToggle);

    // 2. Verificar se o usuário já minimizou anteriormente na sessão
    const wasMinimized = sessionStorage.getItem('gallo_triagem_minimized') === 'true';

    if (wasMinimized) {
      setIsCollapsed(true);
      setIsOpen(false);
      return () => {
        window.removeEventListener('gallo_whatsapp_toggle', handleWhatsAppToggle);
        window.removeEventListener('gallo_comparison_change', checkComparison);
        window.removeEventListener('storage', checkComparison);
      };
    }

    // 3. Regra de negócio: O assistente SÓ deve abrir automaticamente na página inicial (/)
    if (pathname === '/') {
      const timer = setTimeout(() => {
        if (sessionStorage.getItem('gallo_triagem_minimized') !== 'true') {
          setIsOpen(true);
        }
      }, 2000);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('gallo_whatsapp_toggle', handleWhatsAppToggle);
        window.removeEventListener('gallo_comparison_change', checkComparison);
        window.removeEventListener('storage', checkComparison);
      };
    } else {
      setIsCollapsed(true);
      setIsOpen(false);
    }

    return () => {
      window.removeEventListener('gallo_whatsapp_toggle', handleWhatsAppToggle);
      window.removeEventListener('gallo_comparison_change', checkComparison);
      window.removeEventListener('storage', checkComparison);
    };
  }, [pathname]);

  // Grava o lead completo com nome, telefone e email no CRM (Admin)
  const saveLeadToAdmin = async (currentData: TriagemState, nameVal?: string, phoneVal?: string, emailVal?: string) => {
    try {
      const finalName = nameVal || leadName.trim() || `Lead Triagem #${Math.floor(1000 + Math.random() * 9000)}`;
      const finalPhone = phoneVal || leadPhone.trim() || '(Triagem Web)';
      const finalEmail = emailVal || leadEmail.trim() || undefined;

      const newLead = {
        id: `lead-triagem-${Date.now()}`,
        name: finalName,
        phone: finalPhone,
        email: finalEmail,
        interestType: currentData.finalidade === 'venda' ? 'COMPRA' : 'LOCACAO',
        propertyType: currentData.tipoImovel ? currentData.tipoImovel.toUpperCase() : 'CASA',
        bedroomsCount: currentData.quartos ? parseInt(currentData.quartos) : 1,
        bathroomsCount: currentData.banheiros ? parseInt(currentData.banheiros) : 1,
        preferredHoods: ['Amparo e Região'],
        status: 'novo',
        channel: 'triagem',
        origin: 'WIDGET_TRIAGEM',
        createdAt: new Date().toISOString(),
      };

      const existing = JSON.parse(localStorage.getItem('gallo_leads') || '[]');
      localStorage.setItem('gallo_leads', JSON.stringify([newLead, ...existing]));

      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
    } catch (e) {
      console.warn('Registro de lead:', e);
    }
  };

  const handleClose = () => {
    sessionStorage.setItem('gallo_triagem_minimized', 'true');
    setIsOpen(false);
    setIsCollapsed(true);
  };

  const handleSelectFinalidade = (finalidade: 'venda' | 'aluguel') => {
    setData((prev) => ({ ...prev, finalidade }));
    setStep(2);
  };

  const handleSelectTipo = (tipoImovel: 'apartamento' | 'casa' | 'chacara' | 'fazenda' | 'terreno' | 'comercial') => {
    setData((prev) => ({ ...prev, tipoImovel }));

    if (tipoImovel === 'chacara' || tipoImovel === 'fazenda') {
      const params = new URLSearchParams();
      if (data.finalidade) params.set('finalidade', data.finalidade);
      params.set('tipo', tipoImovel);
      handleClose();
      router.push(`/imoveis?${params.toString()}`);
      return;
    }

    setStep(3);
  };

  const handleSelectQuartos = (quartos: string) => {
    setData((prev) => ({ ...prev, quartos }));
    setStep(4);
  };

  const handleSelectBanheiros = (banheiros: string) => {
    setData((prev) => ({ ...prev, banheiros }));
    setStep(5);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim()) {
      setFormError('Por favor, informe seu nome completo.');
      return;
    }
    const digits = leadPhone.replace(/\D/g, '');
    if (digits.length < 10) {
      setFormError('Por favor, informe um telefone/WhatsApp válido com DDD.');
      return;
    }

    setFormError('');
    setIsSubmittingContact(true);

    await saveLeadToAdmin(data, leadName.trim(), leadPhone.trim(), leadEmail.trim());

    setIsSubmittingContact(false);
    setStep(6);
  };

  const handleApplyFilter = () => {
    const params = new URLSearchParams();
    if (data.finalidade) params.set('finalidade', data.finalidade);
    if (data.tipoImovel) params.set('tipo', data.tipoImovel);
    if (data.quartos) params.set('quartos', data.quartos);
    if (data.banheiros) params.set('banheiros', data.banheiros);

    handleClose();
    router.push(`/imoveis?${params.toString()}`);
  };

  const handleWhatsAppRedirect = () => {
    const finalidadeLabel = data.finalidade === 'venda' ? 'Comprar' : 'Alugar';
    const tipoLabel =
      data.tipoImovel === 'apartamento'
        ? 'Apartamento'
        : data.tipoImovel === 'casa'
        ? 'Casa'
        : data.tipoImovel === 'chacara'
        ? 'Chácara & Sítio'
        : data.tipoImovel === 'fazenda'
        ? 'Fazenda'
        : data.tipoImovel === 'terreno'
        ? 'Terreno'
        : 'Comercial';

    const text = `Olá, Miyashiro Imóveis! Meu nome é *${leadName.trim() || 'Cliente'}*.\nFiz a triagem no site e busco:\n\n• Finalidade: *${finalidadeLabel}*\n• Tipo de Imóvel: *${tipoLabel}*\n• Dormitórios: *${data.quartos}*\n• Banheiros: *${data.banheiros}*\n${leadPhone ? `• Telefone/WhatsApp: *${leadPhone}*\n` : ''}${leadEmail ? `• E-mail: *${leadEmail}*\n` : ''}\nPoderiam me apresentar as opções disponíveis com esse perfil em Amparo?`;
    const encoded = encodeURIComponent(text);

    window.open(`https://wa.me/5519993673949?text=${encoded}`, '_blank');
    handleClose();
  };

  const [selectedOutrosAssunto, setSelectedOutrosAssunto] = useState<string>('Avaliação do meu imóvel');

  const handleGoToAnunciar = () => {
    handleClose();
    router.push('/anunciar');
  };

  const handleSelectOutros = () => {
    setStep(7);
  };

  const handleWhatsAppOutros = () => {
    const clientName = leadName.trim() ? `Meu nome é *${leadName.trim()}*. ` : '';
    const text = `Olá, equipe da Miyashiro Imóveis! ${clientName}Estava navegando no site e selecionei atendimento personalizado sobre: *${selectedOutrosAssunto}*.\nPoderiam me orientar?`;
    const encoded = encodeURIComponent(text);

    try {
      const newLead = {
        id: `lead-triagem-${Date.now()}`,
        name: leadName.trim() || `Lead Triagem (${selectedOutrosAssunto})`,
        phone: leadPhone.trim() || '(Triagem Web)',
        email: leadEmail.trim() || undefined,
        interestType: 'AMBOS',
        propertyType: 'CASA',
        preferredHoods: ['Amparo e Região'],
        status: 'novo',
        channel: 'triagem',
        origin: 'WIDGET_TRIAGEM_OUTROS',
        createdAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('gallo_leads') || '[]');
      localStorage.setItem('gallo_leads', JSON.stringify([newLead, ...existing]));
    } catch (e) {}

    window.open(`https://wa.me/5519993673949?text=${encoded}`, '_blank');
    handleClose();
  };

  const handleReset = () => {
    setStep(1);
    setData({ finalidade: null, tipoImovel: null, quartos: null, banheiros: null });
    setLeadName('');
    setLeadPhone('');
    setLeadEmail('');
    setFormError('');
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* 1. Botão Flutuante Recolhido */}
      <AnimatePresence>
        {!isOpen && isCollapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`fixed ${hasComparison ? 'bottom-[164px]' : 'bottom-[88px]'} sm:bottom-[88px] right-3 sm:right-6 ${
              isWhatsAppModalOpen ? 'z-20 pointer-events-none' : 'z-40 pointer-events-auto'
            } flex items-center transition-all duration-300`}
          >
            <button
              onClick={() => setIsOpen(true)}
              type="button"
              aria-label="Abrir assistente: Como podemos ajudar?"
              className="group relative flex items-center gap-2.5 rounded-full border border-[#00873E]/30 bg-white/95 px-3.5 py-2.5 sm:px-4 sm:py-2.5 shadow-xl shadow-[#00873E]/15 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-[#00873E] hover:shadow-[#00873E]/25 active:scale-95 cursor-pointer"
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00873E]/10 text-[#00873E]">
                <Lottie
                  src={lottieQuestionsData as any}
                  loop={false}
                  autoplay={true}
                  className="h-7 w-7"
                />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </span>
              </div>

              <div className="text-left pr-1">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#00873E]">
                  <Sparkles className="h-3 w-3" />
                  <span>Assistente</span>
                </div>
                <div className="text-xs font-bold leading-tight text-stone-900 whitespace-nowrap">
                  Como podemos ajudar?
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Modal Completo de Triagem */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div
              className="absolute inset-0"
              onClick={handleClose}
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-stone-200 bg-white p-5 sm:p-6 shadow-2xl"
            >
              {/* Botão de Fechar */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-full p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                aria-label="Recolher assistente"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Cabeçalho com Animação Lottie red-ask */}
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#00873E]/10 text-[#00873E]">
                  <Lottie
                    src={lottieQuestionsData as any}
                    loop={false}
                    autoplay={true}
                    className="h-14 w-14"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#00873E]">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Assistente Gallo</span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-stone-900">
                    Como podemos ajudar?
                  </h2>
                  <p className="text-xs text-stone-500">
                    {step <= 5 ? `Etapa ${step} de 5: ${step === 5 ? 'Dados para contato' : 'Selecione suas preferências'}` : 'Triagem concluída'}
                  </p>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full bg-[#00873E] transition-all duration-300 ease-out"
                  style={{ width: `${(Math.min(step, 5) / 5) * 100}%` }}
                />
              </div>

              {/* Etapas Interativas */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-sm font-semibold text-stone-800">
                      Como podemos ajudar você hoje?
                    </h3>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => handleSelectFinalidade('venda')}
                        className="group flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-stone-200 p-3 sm:p-4 text-center transition hover:border-[#00873E] hover:bg-stone-50 active:scale-95 cursor-pointer"
                      >
                        <span className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-[#00873E]">
                          Quero Comprar
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-stone-500">
                          Casas, terrenos e aptos
                        </span>
                      </button>
                      <button
                        onClick={() => handleSelectFinalidade('aluguel')}
                        className="group flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-stone-200 p-3 sm:p-4 text-center transition hover:border-[#00873E] hover:bg-stone-50 active:scale-95 cursor-pointer"
                      >
                        <span className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-[#00873E]">
                          Quero Alugar
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-stone-500">
                          Locação em Amparo
                        </span>
                      </button>
                      <button
                        onClick={handleGoToAnunciar}
                        className="group flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-stone-200 p-3 sm:p-4 text-center transition hover:border-[#00873E] hover:bg-stone-50 active:scale-95 cursor-pointer"
                      >
                        <span className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-[#00873E]">
                          Quero Anunciar
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-stone-500">
                          Cadastrar meu imóvel
                        </span>
                      </button>
                      <button
                        onClick={handleSelectOutros}
                        className="group flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-stone-200 p-3 sm:p-4 text-center transition hover:border-[#00873E] hover:bg-stone-50 active:scale-95 cursor-pointer"
                      >
                        <span className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-[#00873E]">
                          Outros Assuntos
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-stone-500">
                          Falar com o corretor
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-sm font-semibold text-stone-800">
                      Qual tipo de imóvel você procura?
                    </h3>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: 'casa', label: 'Casa' },
                        { id: 'apartamento', label: 'Apartamento' },
                        { id: 'chacara', label: 'Chácara & Sítio' },
                        { id: 'fazenda', label: 'Fazenda' },
                        { id: 'terreno', label: 'Terreno' },
                        { id: 'comercial', label: 'Comercial' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTipo(item.id as any)}
                          className="flex min-h-[48px] items-center justify-center rounded-2xl border-2 border-stone-200 p-3 text-center font-medium text-stone-800 transition hover:border-[#00873E] hover:bg-stone-50 active:scale-95 cursor-pointer text-xs sm:text-sm"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-sm font-semibold text-stone-800">
                      Quantos quartos?
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {['1', '2', '3', '4'].map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSelectQuartos(q)}
                          className="min-h-[48px] rounded-full border-2 border-stone-200 py-2.5 sm:py-3 text-center text-sm font-bold text-stone-800 transition hover:border-[#00873E] hover:bg-stone-50 active:scale-95 cursor-pointer"
                        >
                          {q === '4' ? '4+' : q} {q === '1' ? 'quarto' : 'quartos'}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-sm font-semibold text-stone-800">
                      Quantos banheiros?
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {['1', '2', '3'].map((b) => (
                        <button
                          key={b}
                          onClick={() => handleSelectBanheiros(b)}
                          className="min-h-[48px] rounded-full border-2 border-stone-200 py-2.5 sm:py-3 text-center text-sm font-bold text-stone-800 transition hover:border-[#00873E] hover:bg-stone-50 active:scale-95 cursor-pointer"
                        >
                          {b === '3' ? '3+' : b} {b === '1' ? 'banheiro' : 'banheiros'}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ETAPA 5: Captura dos Dados de Contato do Lead */}
                {step === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-stone-900 font-urbanist">
                        Onde podemos enviar as melhores opções?
                      </h3>
                      <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
                        Informe seus dados para receber imóveis selecionados no seu WhatsApp e e-mail:
                      </p>
                    </div>

                    <form onSubmit={handleContactSubmit} className="space-y-3 pt-1">
                      <div>
                        <label className="text-[11px] font-medium text-stone-700 block mb-1">
                          Seu Nome Completo *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="Ex: Ana Silva"
                            value={leadName}
                            onChange={(e) => {
                              setLeadName(e.target.value);
                              if (formError) setFormError('');
                            }}
                            className="w-full rounded-xl border border-stone-200 bg-stone-50/60 py-2.5 pl-9 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#00873E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                          />
                          <User className="absolute left-3 top-3 h-3.5 w-3.5 text-stone-400" />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-stone-700 block mb-1">
                          Telefone / WhatsApp *
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            required
                            placeholder="(19) 99999-9999"
                            value={leadPhone}
                            onChange={handlePhoneChange}
                            className="w-full rounded-xl border border-stone-200 bg-stone-50/60 py-2.5 pl-9 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#00873E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                          />
                          <Phone className="absolute left-3 top-3 h-3.5 w-3.5 text-stone-400" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-medium text-stone-700">
                            E-mail
                          </label>
                          <span className="text-[10px] text-stone-400">Opcional</span>
                        </div>
                        <div className="relative">
                          <input
                            type="email"
                            placeholder="seuemail@exemplo.com"
                            value={leadEmail}
                            onChange={(e) => setLeadEmail(e.target.value)}
                            className="w-full rounded-xl border border-stone-200 bg-stone-50/60 py-2.5 pl-9 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#00873E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                          />
                          <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-stone-400" />
                        </div>
                      </div>

                      {formError && (
                        <p className="text-[11px] text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-lg p-2">
                          {formError}
                        </p>
                      )}

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmittingContact}
                          className="w-full flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#00873E] px-5 py-3 font-semibold text-white shadow-lg shadow-[#00873E]/20 transition hover:bg-[#15803d] active:scale-95 cursor-pointer disabled:opacity-70 text-xs sm:text-sm"
                        >
                          <span>{isSubmittingContact ? 'Gravando perfil...' : 'Salvar e Ver Imóveis'}</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* ETAPA 6: Conclusão com Ações */}
                {step === 6 && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5 text-center"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                      <Check className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 font-urbanist">
                        Perfil mapeado e salvo com sucesso!
                      </h3>
                      <p className="mt-1 text-xs text-stone-500">
                        {leadName ? `Obrigado, ${leadName}! ` : ''}Como prefere visualizar as opções selecionadas?
                      </p>
                      <div className="mt-2.5 inline-flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-stone-600 bg-stone-100/80 px-3 py-1.5 rounded-full">
                        <span className="font-semibold text-[#00873E] capitalize">{data.finalidade === 'venda' ? 'Compra' : 'Aluguel'}</span>
                        <span>•</span>
                        <span className="capitalize">{data.tipoImovel || 'Imóvel'}</span>
                        <span>•</span>
                        <span>{data.quartos} {data.quartos === '1' ? 'quarto' : 'quartos'}</span>
                        <span>•</span>
                        <span>{data.banheiros} {data.banheiros === '1' ? 'banheiro' : 'banheiros'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 pt-1">
                      <button
                        onClick={handleApplyFilter}
                        className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#00873E] px-5 py-3 font-semibold text-white shadow-lg shadow-[#00873E]/20 transition hover:bg-[#15803d] active:scale-95 cursor-pointer"
                      >
                        <Home className="h-4 w-4" />
                        Ver Imóveis no Catálogo
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleWhatsAppRedirect}
                        className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#00873E]/30 bg-stone-50 px-5 py-3 font-semibold text-[#00873E] transition hover:bg-stone-100 active:scale-95 cursor-pointer"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Atendimento com Corretor via WhatsApp
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ETAPA 7: Outros Assuntos */}
                {step === 7 && (
                  <motion.div
                    key="step7"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-stone-900 font-urbanist">
                        Plantão de Atendimento Personalizado
                      </h3>
                      <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
                        Selecione o assunto para agilizarmos seu atendimento com nossos corretores em Amparo:
                      </p>
                    </div>

                    <div className="space-y-2">
                      {[
                        { id: 'Avaliação de Imóvel', label: 'Avaliação do meu imóvel para venda ou locação' },
                        { id: 'Financiamento Imobiliário', label: 'Simulação de financiamento bancário ou consórcio' },
                        { id: 'Documentação & Escritura', label: 'Dúvidas jurídicas, regularização ou escritura' },
                        { id: 'Permuta ou Parceria', label: 'Proposta de permuta ou parceria comercial' },
                        { id: 'Consultoria Personalizada', label: 'Outras dúvidas e atendimento geral' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedOutrosAssunto(item.id)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                            selectedOutrosAssunto === item.id
                              ? 'border-[#00873E] bg-stone-100/70 font-semibold text-stone-950 ring-1 ring-[#00873E]/30'
                              : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                          }`}
                        >
                          <span>{item.label}</span>
                          {selectedOutrosAssunto === item.id && (
                            <Check className="h-4 w-4 text-[#00873E] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleWhatsAppOutros}
                        className="w-full flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#00873E] px-4 py-3 font-semibold text-white shadow-lg shadow-[#00873E]/20 transition hover:bg-[#15803d] active:scale-95 cursor-pointer text-xs sm:text-sm"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Conversar no WhatsApp com Corretor
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rodapé com Voltar / Reiniciar */}
              {((step > 1 && step <= 5) || step === 7) && (
                <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
                  <button
                    onClick={() => setStep((s) => (s === 7 ? 1 : s - 1))}
                    className="font-medium text-stone-500 hover:text-stone-800 transition cursor-pointer"
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 font-medium text-stone-500 hover:text-stone-800 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reiniciar
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
