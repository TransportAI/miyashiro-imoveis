'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lead, LeadStatus, LeadTemperature, LeadInterestType, PropertyType } from '@/lib/types/crm';
import { Property } from '@/lib/types';
import propertiesData from '@/data/properties.json';
import {
  Flame,
  Phone,
  DollarSign,
  Bed,
  Bath,
  Search,
  Plus,
  ArrowRight,
  MessageCircle,
  TrendingUp,
  Users,
  Target,
  CheckCircle2,
  XCircle,
  Calendar,
  X,
  Trash2,
  Clock,
  Sparkles,
  MapPin,
  ChevronRight,
  ChevronDown,
  Building2,
  Home,
  ExternalLink,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react';

interface ColumnConfig {
  status: LeadStatus;
  label: string;
  dotColor: string;
  headerBg: string;
  badgeBg: string;
  mobileBorder: string;
  mobileBg: string;
}

const PIPELINE_COLUMNS: ColumnConfig[] = [
  {
    status: 'NOVO_LEAD',
    label: 'Novo Lead',
    dotColor: 'bg-blue-500',
    headerBg: 'border-t-4 border-t-blue-500',
    badgeBg: 'bg-blue-100 text-blue-700',
    mobileBorder: 'border-blue-500/50',
    mobileBg: 'bg-blue-50/40',
  },
  {
    status: 'CONTATO_REALIZADO',
    label: 'Contato Realizado',
    dotColor: 'bg-amber-500',
    headerBg: 'border-t-4 border-t-amber-500',
    badgeBg: 'bg-amber-100 text-amber-700',
    mobileBorder: 'border-amber-500/50',
    mobileBg: 'bg-amber-50/40',
  },
  {
    status: 'VISITA_MARCADA',
    label: 'Visita Marcada',
    dotColor: 'bg-purple-500',
    headerBg: 'border-t-4 border-t-purple-500',
    badgeBg: 'bg-purple-100 text-purple-700',
    mobileBorder: 'border-purple-500/50',
    mobileBg: 'bg-purple-50/40',
  },
  {
    status: 'PROPOSTA',
    label: 'Proposta',
    dotColor: 'bg-indigo-500',
    headerBg: 'border-t-4 border-t-indigo-500',
    badgeBg: 'bg-indigo-100 text-indigo-700',
    mobileBorder: 'border-[#00873E]/50',
    mobileBg: 'bg-emerald-50/40',
  },
  {
    status: 'FECHADO',
    label: 'Fechado',
    dotColor: 'bg-[#00873E]',
    headerBg: 'border-t-4 border-t-emerald-600',
    badgeBg: 'bg-red-100 text-[#00873E]',
    mobileBorder: 'border-[#00873E]',
    mobileBg: 'bg-red-100/40',
  },
  {
    status: 'PERDIDO',
    label: 'Perdido',
    dotColor: 'bg-rose-500',
    headerBg: 'border-t-4 border-t-rose-500',
    badgeBg: 'bg-rose-100 text-rose-700',
    mobileBorder: 'border-rose-500/50',
    mobileBg: 'bg-rose-50/40',
  },
];

const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Carlos Alberto Ferreira',
    email: 'carlos.ferreira@email.com',
    phone: '(19) 99876-1234',
    interestType: 'COMPRA',
    propertyType: 'CASA',
    budgetMin: 550000,
    budgetMax: 780000,
    preferredHoods: ['Ribeirão', 'Centro'],
    bedroomsCount: 3,
    bathroomsCount: 2,
    parkingSpaces: 2,
    status: 'NOVO_LEAD',
    temperature: 'QUENTE',
    score: 88,
    origin: 'IMOVEL_SALVO',
    associatedProperties: [
      {
        id: 'pri-104',
        title: 'Casa Térrea Moderna com Jardim e Área Gourmet',
        price: 520000,
        slug: 'casa-ampla-terrea-jardim-figueira',
      },
      {
        id: 'pri-101',
        title: 'Casa de Alto Padrão em Condomínio Fechado',
        price: 1350000,
        slug: 'casa-em-condominio-fechado-jardim-sao-dimas',
      },
    ],
    propertyId: 'pri-104',
    propertyTitle: 'Casa Térrea Moderna com Jardim e Área Gourmet',
    propertyPrice: 520000,
    createdAt: new Date(Date.now() - 3600000 * 3),
    updatedAt: new Date(),
  },
  {
    id: 'lead-2',
    name: 'Mariana Lima Santos',
    email: 'mariana.lima@gmail.com',
    phone: '(19) 99123-8899',
    interestType: 'LOCACAO',
    propertyType: 'APARTAMENTO',
    budgetMin: 1800,
    budgetMax: 2600,
    preferredHoods: ['Centro'],
    bedroomsCount: 2,
    bathroomsCount: 1,
    status: 'CONTATO_REALIZADO',
    temperature: 'MORNO',
    score: 65,
    origin: 'WIDGET_TRIAGEM',
    associatedProperties: [
      {
        id: 'pri-105',
        title: 'Apartamento Reformado e Mobiliado para Locação',
        price: 2200,
        slug: 'apartamento-para-locacao-centro-amparo',
      },
    ],
    propertyId: 'pri-105',
    propertyTitle: 'Apartamento Reformado e Mobiliado para Locação',
    propertyPrice: 2200,
    createdAt: new Date(Date.now() - 3600000 * 24),
    updatedAt: new Date(),
  },
  {
    id: 'lead-3',
    name: 'Roberto Camargo',
    email: 'roberto@construtoracamargo.com.br',
    phone: '(19) 98844-3322',
    interestType: 'COMPRA',
    propertyType: 'TERRENO',
    budgetMin: 250000,
    budgetMax: 400000,
    preferredHoods: ['Chácaras Pedreira'],
    status: 'VISITA_MARCADA',
    temperature: 'QUENTE',
    score: 95,
    origin: 'WHATSAPP',
    createdAt: new Date(Date.now() - 3600000 * 48),
    updatedAt: new Date(),
  },
  {
    id: 'lead-4',
    name: 'Fernanda Oliveira Souza',
    email: 'fernanda.souza@adv.com',
    phone: '(19) 99345-6712',
    interestType: 'COMPRA',
    propertyType: 'CASA',
    budgetMin: 600000,
    budgetMax: 920000,
    preferredHoods: ['Vila Santo Antonio'],
    bedroomsCount: 4,
    bathroomsCount: 3,
    status: 'PROPOSTA',
    temperature: 'QUENTE',
    score: 92,
    origin: 'PORTAL',
    associatedProperties: [
      {
        id: 'pri-101',
        title: 'Casa de Alto Padrão em Condomínio Fechado',
        price: 1350000,
        slug: 'casa-em-condominio-fechado-jardim-sao-dimas',
      },
    ],
    propertyId: 'pri-101',
    propertyTitle: 'Casa de Alto Padrão em Condomínio Fechado',
    propertyPrice: 1350000,
    createdAt: new Date(Date.now() - 3600000 * 72),
    updatedAt: new Date(),
  },
  {
    id: 'lead-5',
    name: 'Lucas Mendes Ramos',
    email: 'lucas.ramos@tech.com',
    phone: '(19) 98711-2244',
    interestType: 'LOCACAO',
    propertyType: 'COMERCIAL',
    budgetMin: 3000,
    budgetMax: 4500,
    preferredHoods: ['Centro Comercial'],
    status: 'FECHADO',
    temperature: 'QUENTE',
    score: 100,
    origin: 'WIDGET_TRIAGEM',
    createdAt: new Date(Date.now() - 3600000 * 120),
    updatedAt: new Date(),
  },
];

export default function LeadPipelineView() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [searchFilter, setSearchFilter] = useState('');
  const [mobileActiveTab, setMobileActiveTab] = useState<LeadStatus>('NOVO_LEAD');
  const [selectedTemperature, setSelectedTemperature] = useState<string>('TODOS');
  const [selectedInterest, setSelectedInterest] = useState<string>('TODOS');
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  // Form State for New Lead
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadInterest, setNewLeadInterest] = useState<LeadInterestType>('COMPRA');
  const [newLeadType, setNewLeadType] = useState<PropertyType>('CASA');
  const [newLeadBudget, setNewLeadBudget] = useState('');
  const [newLeadBedrooms, setNewLeadBedrooms] = useState('3');
  const [newLeadTemp, setNewLeadTemp] = useState<LeadTemperature>('QUENTE');
  const [newLeadPropertyIds, setNewLeadPropertyIds] = useState<string[]>([]);

  // Imóveis disponíveis no catálogo (para associar aos leads)
  const [availableProperties, setAvailableProperties] = useState<Property[]>(
    propertiesData as Property[]
  );
  const [linkingLeadId, setLinkingLeadId] = useState<string | null>(null);

  // Helper para resgatar todos os imóveis associados a um lead (com retrocompatibilidade)
  const getLeadProperties = (lead: Lead) => {
    if (lead.associatedProperties && lead.associatedProperties.length > 0) {
      return lead.associatedProperties;
    }
    if (lead.propertyId || lead.propertyTitle) {
      return [
        {
          id: lead.propertyId || '',
          title: lead.propertyTitle || `Ref: ${lead.propertyId}`,
          price: lead.propertyPrice,
          slug: lead.propertyId,
        },
      ];
    }
    return [];
  };

  // Carregar imóveis customizados do localStorage se existirem
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem('gallo_custom_properties') ||
        localStorage.getItem('gallo_custom_properties');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, Property>();
          (propertiesData as Property[]).forEach((p) => map.set(p.id, p));
          parsed.forEach((p: Property) => map.set(p.id, p));
          setAvailableProperties(Array.from(map.values()));
        }
      }
    } catch (e) {}
  }, []);

  // Carregar leads salvos do localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('gallo_leads') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        const formatted = stored.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt || item.createdAt),
        }));

        // Combinar sem duplicar por ID: se o item já foi salvo no localStorage, usar o do localStorage
        const map = new Map<string, Lead>();
        INITIAL_LEADS.forEach((l) => map.set(l.id, l));
        formatted.forEach((l: Lead) => map.set(l.id, l));

        setLeads(Array.from(map.values()));
      }
    } catch (e) {
      console.warn('Erro ao carregar leads:', e);
    }
  }, []);

  const saveToStorage = (updatedList: Lead[]) => {
    try {
      localStorage.setItem('gallo_leads', JSON.stringify(updatedList));
    } catch (e) {}
  };

  const updateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) => {
      const updated = prev.map((l) =>
        l.id === leadId ? { ...l, status: newStatus, updatedAt: new Date() } : l
      );
      saveToStorage(updated);
      return updated;
    });
  };

  const updateLeadTemperature = (leadId: string, newTemp: LeadTemperature) => {
    setLeads((prev) => {
      const updated = prev.map((l) => {
        if (l.id === leadId) {
          const newScore = newTemp === 'QUENTE' ? 90 : newTemp === 'MORNO' ? 65 : 40;
          return { ...l, temperature: newTemp, score: newScore, updatedAt: new Date() };
        }
        return l;
      });
      saveToStorage(updated);
      return updated;
    });
  };

  const addLeadProperty = (leadId: string, propId: string) => {
    setLeads((prev) => {
      const prop = availableProperties.find((p) => p.id === propId);
      if (!prop) return prev;

      const updated = prev.map((l) => {
        if (l.id === leadId) {
          const currentProps = getLeadProperties(l);
          if (currentProps.some((p) => p.id === propId)) {
            return l;
          }
          const nextProps = [
            ...currentProps,
            {
              id: prop.id,
              title: prop.title,
              price: prop.price,
              slug: prop.slug || prop.id,
            },
          ];
          return {
            ...l,
            associatedProperties: nextProps,
            propertyId: nextProps[0].id,
            propertyTitle: nextProps[0].title,
            propertyPrice: nextProps[0].price,
            updatedAt: new Date(),
          };
        }
        return l;
      });
      saveToStorage(updated);
      return updated;
    });
  };

  const removeLeadProperty = (leadId: string, propId: string) => {
    setLeads((prev) => {
      const updated = prev.map((l) => {
        if (l.id === leadId) {
          const currentProps = getLeadProperties(l);
          const nextProps = currentProps.filter((p) => p.id !== propId);
          return {
            ...l,
            associatedProperties: nextProps,
            propertyId: nextProps.length > 0 ? nextProps[0].id : null,
            propertyTitle: nextProps.length > 0 ? nextProps[0].title : null,
            propertyPrice: nextProps.length > 0 ? nextProps[0].price : null,
            updatedAt: new Date(),
          };
        }
        return l;
      });
      saveToStorage(updated);
      return updated;
    });
  };

  const advanceLeadStatus = (leadId: string, currentStatus: LeadStatus) => {
    const sequence: LeadStatus[] = [
      'NOVO_LEAD',
      'CONTATO_REALIZADO',
      'VISITA_MARCADA',
      'PROPOSTA',
      'FECHADO',
    ];
    const currentIndex = sequence.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
      updateLeadStatus(leadId, sequence[currentIndex + 1]);
    }
  };

  const deleteLead = (leadId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta oportunidade?')) {
      setLeads((prev) => {
        const updated = prev.filter((l) => l.id !== leadId);
        saveToStorage(updated);
        return updated;
      });
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadPhone.trim()) return;

    const selectedProps = newLeadPropertyIds
      .map((id) => availableProperties.find((p) => p.id === id))
      .filter(Boolean) as Property[];

    const associatedProperties = selectedProps.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      slug: p.slug || p.id,
    }));

    const firstProp = selectedProps[0];

    const newLead: Lead = {
      id: `lead-manual-${Date.now()}`,
      name: newLeadName.trim(),
      phone: newLeadPhone.trim(),
      email: newLeadEmail.trim() || null,
      interestType: newLeadInterest,
      propertyType: newLeadType,
      budgetMax: newLeadBudget
        ? parseFloat(newLeadBudget)
        : firstProp
        ? firstProp.price
        : null,
      bedroomsCount: parseInt(newLeadBedrooms) || 1,
      bathroomsCount: 1,
      preferredHoods: [firstProp?.address?.neighborhood || 'Pedreira / Região'],
      status: 'NOVO_LEAD',
      temperature: newLeadTemp,
      score: newLeadTemp === 'QUENTE' ? 90 : newLeadTemp === 'MORNO' ? 65 : 40,
      origin: selectedProps.length > 0 ? 'IMOVEL_SALVO' : 'MANUAL_CRM',
      associatedProperties,
      propertyId: firstProp ? firstProp.id : null,
      propertyTitle: firstProp ? firstProp.title : null,
      propertyPrice: firstProp ? firstProp.price : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setLeads((prev) => {
      const updated = [newLead, ...prev];
      saveToStorage(updated);
      return updated;
    });

    // Reset Form & Close
    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadEmail('');
    setNewLeadBudget('');
    setNewLeadPropertyIds([]);
    setIsNewLeadModalOpen(false);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const query = searchFilter.toLowerCase();
      const leadProps = getLeadProperties(lead);

      const matchesSearch =
        !searchFilter ||
        lead.name.toLowerCase().includes(query) ||
        lead.phone.includes(query) ||
        (lead.email && lead.email.toLowerCase().includes(query)) ||
        (lead.propertyType && lead.propertyType.toLowerCase().includes(query)) ||
        leadProps.some(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.id.toLowerCase().includes(query)
        ) ||
        lead.preferredHoods.some((h) => h.toLowerCase().includes(query));

      const matchesTemp =
        selectedTemperature === 'TODOS' || lead.temperature === selectedTemperature;

      const matchesInterest =
        selectedInterest === 'TODOS' ||
        (selectedInterest === 'COMPRA' && lead.interestType === 'COMPRA') ||
        (selectedInterest === 'LOCACAO' && lead.interestType === 'LOCACAO');

      return matchesSearch && matchesTemp && matchesInterest;
    });
  }, [leads, searchFilter, selectedTemperature, selectedInterest]);

  // KPIs
  const totalLeads = leads.length;
  const hotLeadsCount = leads.filter((l) => l.temperature === 'QUENTE').length;
  const inNegotiationCount = leads.filter(
    (l) => l.status === 'VISITA_MARCADA' || l.status === 'PROPOSTA'
  ).length;
  const closedCount = leads.filter((l) => l.status === 'FECHADO').length;

  const totalPipelineValue = useMemo(() => {
    return leads
      .filter((l) => l.status !== 'PERDIDO')
      .reduce((acc, curr) => acc + (curr.budgetMax || 0), 0);
  }, [leads]);

  const getTemperatureBadge = (temp: LeadTemperature) => {
    switch (temp) {
      case 'QUENTE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200/60">
            <Flame className="h-3 w-3 fill-rose-500 text-rose-500" /> Quente
          </span>
        );
      case 'MORNO':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/60">
            Morno
          </span>
        );
      case 'FRIO':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200/60">
            Frio
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatCurrency = (val?: number | null) => {
    if (!val) return 'Sob Consulta';
    if (val >= 1_000_000) {
      return `R$ ${(val / 1_000_000).toFixed(2).replace('.', ',')}M`;
    }
    if (val >= 1_000) {
      return `R$ ${val.toLocaleString('pt-BR')}`;
    }
    return `R$ ${val}`;
  };

  const renderLeadCard = (lead: Lead) => {
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const hasValidPhone = cleanPhone.length >= 10;
    const waText = encodeURIComponent(
      `Olá, ${lead.name}! Sou da Miyashiro Imóveis referente ao seu interesse em imóveis em Pedreira. Como posso ajudá-lo hoje?`
    );

    return (
      <div
        key={`lead-${lead.id}`}
        className="group relative rounded-xl border border-stone-200 bg-white p-3.5 shadow-xs transition hover:shadow-md hover:border-stone-300"
      >
        <div className="mb-2 flex items-start justify-between gap-1.5">
          <h4 className="text-sm font-bold text-stone-900 line-clamp-1" title={lead.name}>
            {lead.name}
          </h4>
          <div className="flex items-center gap-1 shrink-0">
            {/* Seletor rápido de temperatura dentro do card */}
            <div className="relative inline-flex items-center" title="Editar temperatura da oportunidade">
              <select
                value={lead.temperature}
                onChange={(e) => updateLeadTemperature(lead.id, e.target.value as LeadTemperature)}
                className={`appearance-none cursor-pointer rounded-full pl-2 pr-5 py-0.5 text-[10px] font-bold border transition focus:outline-none focus:ring-1 ${
                  lead.temperature === 'QUENTE'
                    ? 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100/80 focus:ring-rose-400'
                    : lead.temperature === 'MORNO'
                    ? 'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100/80 focus:ring-amber-400'
                    : 'bg-blue-50 text-blue-700 border-blue-200/80 hover:bg-blue-100/80 focus:ring-blue-400'
                }`}
              >
                <option value="QUENTE">🔥 Quente</option>
                <option value="MORNO">🟡 Morno</option>
                <option value="FRIO">❄️ Frio</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 opacity-60" />
            </div>

            <button
              onClick={() => deleteLead(lead.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-stone-300 hover:text-rose-600 transition cursor-pointer rounded"
              title="Remover oportunidade"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="mb-3 space-y-1.5 text-xs text-stone-500">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <Phone className="h-3 w-3 text-[#00873E] shrink-0" />
              <span className="truncate">{lead.phone}</span>
            </div>
            {hasValidPhone && (
              <a
                href={`https://wa.me/55${cleanPhone}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-[#00873E] border border-emerald-200/60 hover:bg-red-100 transition shrink-0"
              >
                <MessageCircle className="h-3 w-3 text-[#00873E]" /> WhatsApp
              </a>
            )}
          </div>

          {lead.budgetMax && (
            <div className="flex items-center gap-1.5 font-medium text-stone-800">
              <DollarSign className="h-3 w-3 text-[#00873E] shrink-0" />
              <span className="truncate">
                Até R$ ${lead.budgetMax.toLocaleString('pt-BR')} (
                {lead.interestType === 'COMPRA' ? 'Compra' : 'Aluguel'})
              </span>
            </div>
          )}

          {(lead.propertyType || lead.bedroomsCount || lead.bathroomsCount) && (
            <div className="flex items-center gap-2 pt-1 text-[11px]">
              {lead.propertyType && (
                <span className="rounded bg-stone-100 px-1.5 py-0.5 font-medium text-stone-700 uppercase text-[10px]">
                  {lead.propertyType}
                </span>
              )}
              {lead.bedroomsCount && (
                <span className="flex items-center gap-0.5 text-stone-500">
                  <Bed className="h-3 w-3 text-stone-400" /> {lead.bedroomsCount}q
                </span>
              )}
              {lead.bathroomsCount && (
                <span className="flex items-center gap-0.5 text-stone-500">
                  <Bath className="h-3 w-3 text-stone-400" /> {lead.bathroomsCount}b
                </span>
              )}
            </div>
          )}

          {/* Imóveis Associados ao Lead (Suporte a múltiplos e redirect direto) */}
          {(() => {
            const leadProps = getLeadProperties(lead);
            const isLinking = linkingLeadId === lead.id;

            return (
              <div className="mt-2.5 space-y-2">
                {leadProps.length > 0 ? (
                  <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-2 text-xs transition">
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#00873E]">
                        <Home className="h-3 w-3 text-[#00873E] shrink-0" /> Imóveis Vinculados ({leadProps.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setLinkingLeadId(isLinking ? null : lead.id)}
                        className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#00873E] hover:text-stone-900 bg-white px-1.5 py-0.5 rounded border border-emerald-200/80 shadow-2xs transition cursor-pointer"
                        title="Vincular mais um imóvel a este lead"
                      >
                        <Plus className="h-2.5 w-2.5" /> Adicionar
                      </button>
                    </div>

                    {/* Lista de Imóveis: Cada linha é um redirecionamento direto para a página do imóvel */}
                    <div className="space-y-1.5">
                      {leadProps.map((p) => (
                        <div
                          key={p.id}
                          className="group/prop flex items-center justify-between gap-1.5 p-1.5 rounded-lg bg-white/90 hover:bg-white border border-emerald-200/60 hover:border-red-400 shadow-2xs transition"
                        >
                          <a
                            href={`/imovel/${p.slug || p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-0 flex items-center gap-1.5 text-stone-800 hover:text-[#00873E] transition"
                            title={`Abrir página do imóvel: ${p.title}`}
                          >
                            <Building2 className="h-3.5 w-3.5 text-[#00873E] shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-semibold truncate leading-tight group-hover/prop:underline">
                                {p.title}
                              </p>
                              {p.price ? (
                                <p className="text-[10px] font-bold text-[#00873E] mt-0.5">
                                  {formatCurrency(p.price)}
                                </p>
                              ) : (
                                <p className="text-[10px] text-stone-400 mt-0.5">Sob consulta</p>
                              )}
                            </div>
                            <ExternalLink className="h-3 w-3 text-stone-400 group-hover/prop:text-[#00873E] shrink-0" />
                          </a>

                          <button
                            type="button"
                            onClick={() => removeLeadProperty(lead.id, p.id)}
                            className="p-1 text-stone-300 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer shrink-0"
                            title="Desvincular este imóvel"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-1 border-t border-stone-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setLinkingLeadId(isLinking ? null : lead.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400 hover:text-[#00873E] transition cursor-pointer"
                      title="Associar imóveis do catálogo a este lead"
                    >
                      <Plus className="h-3 w-3" /> Vincular a um imóvel
                    </button>
                  </div>
                )}

                {/* Seletor dropdown inline para adicionar imóvel */}
                {isLinking && (
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-2 space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                        Vincular Imóvel:
                      </span>
                      <button
                        type="button"
                        onClick={() => setLinkingLeadId(null)}
                        className="text-stone-400 hover:text-stone-600 p-0.5 rounded cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addLeadProperty(lead.id, e.target.value);
                          setLinkingLeadId(null);
                        }
                      }}
                      defaultValue=""
                      className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#00873E] cursor-pointer"
                    >
                      <option value="">-- Selecione para adicionar --</option>
                      {availableProperties.map((p) => {
                        const isAlreadyLinked = leadProps.some((lp) => lp.id === p.id);
                        return (
                          <option key={p.id} value={p.id} disabled={isAlreadyLinked}>
                            {isAlreadyLinked ? '✓ ' : ''}{p.title} - {formatCurrency(p.price)} ({p.purpose === 'aluguel' ? 'Aluguel' : 'Venda'})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <div className="border-t border-stone-100 pt-2">
          <select
            value={lead.status}
            onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5 text-[11px] font-medium text-stone-800 focus:outline-none cursor-pointer hover:bg-stone-100/80 transition"
          >
            {PIPELINE_COLUMNS.map((col) => (
              <option key={col.status} value={col.status}>
                Mover p/ {col.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. KPIs Top Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-3.5 rounded-2xl border border-stone-200/90 bg-white p-3.5 sm:p-4 shadow-xs min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#00873E] border border-red-100">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-stone-500 truncate">
              Total de Oportunidades
            </p>
            <p className="text-xl sm:text-2xl font-bold font-urbanist text-stone-900 mt-0.5">
              {totalLeads} <span className="text-xs font-normal text-stone-400">leads</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-3.5 rounded-2xl border border-stone-200/90 bg-white p-3.5 sm:p-4 shadow-xs min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <Flame className="h-5 w-5 fill-rose-500 text-rose-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-stone-500 truncate">
              Leads Quentes
            </p>
            <p className="text-xl sm:text-2xl font-bold font-urbanist text-stone-900 mt-0.5">
              {hotLeadsCount}{' '}
              <span className="text-xs font-normal text-rose-500 font-semibold">Prioridade</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-3.5 rounded-2xl border border-stone-200/90 bg-white p-3.5 sm:p-4 shadow-xs min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Target className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-stone-500 truncate">
              Em Negociação
            </p>
            <p className="text-xl sm:text-2xl font-bold font-urbanist text-stone-900 mt-0.5">
              {inNegotiationCount}{' '}
              <span className="text-xs font-normal text-stone-400">visitas/propostas</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Controls & Search Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-3.5 sm:p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone, bairro ou tipo..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/60 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:border-[#00873E] focus:bg-white focus:outline-none transition"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Temperature Pills */}
          <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50/70 p-1 text-xs">
            <span className="px-2 text-[11px] font-medium text-stone-400">Temp:</span>
            {['TODOS', 'QUENTE', 'MORNO', 'FRIO'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTemperature(t)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  selectedTemperature === t
                    ? 'bg-[#00873E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                {t === 'QUENTE' ? '🔥 Quente' : t === 'MORNO' ? 'Morno' : t === 'FRIO' ? 'Frio' : 'Todos'}
              </button>
            ))}
          </div>

          {/* Finalidade Pills */}
          <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50/70 p-1 text-xs">
            <span className="px-2 text-[11px] font-medium text-stone-400">Tipo:</span>
            {[
              { id: 'TODOS', label: 'Todos' },
              { id: 'COMPRA', label: 'Compra' },
              { id: 'LOCACAO', label: 'Aluguel' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedInterest(item.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  selectedInterest === item.id
                    ? 'bg-stone-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsNewLeadModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00873E] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#15803d] active:scale-95 transition cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Novo Lead
        </button>
      </div>

      {/* 3. MOBILE VIEW: Dividido por Tabs (< lg) */}
      <div className="lg:hidden w-full space-y-3">
        {/* Horizontal Scrollable Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar -mx-1 px-1 touch-pan-x">
          {PIPELINE_COLUMNS.map((column) => {
            const count = filteredLeads.filter((l) => l.status === column.status).length;
            const isActive = mobileActiveTab === column.status;

            return (
              <button
                key={`mobile-tab-${column.status}`}
                onClick={() => setMobileActiveTab(column.status)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm ring-1 ring-stone-900'
                    : 'bg-white text-stone-600 border border-stone-200/90 hover:bg-stone-50'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${column.dotColor}`} />
                <span>{column.label}</span>
                <span
                  className={`flex h-4 min-w-[18px] px-1 items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Tab Column Content */}
        {(() => {
          const activeColumn =
            PIPELINE_COLUMNS.find((c) => c.status === mobileActiveTab) || PIPELINE_COLUMNS[0];
          const activeLeads = filteredLeads.filter((l) => l.status === mobileActiveTab);

          return (
            <div
              className={`flex flex-col rounded-2xl border ${activeColumn.mobileBorder} ${activeColumn.mobileBg} p-3.5 shadow-xs w-full`}
            >
              <div className="mb-3 flex items-center justify-between border-b border-stone-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${activeColumn.dotColor}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    {activeColumn.label}
                  </span>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-stone-600 border border-stone-200">
                  {activeLeads.length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {activeLeads.map((lead) => renderLeadCard(lead))}

                {activeLeads.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-28 rounded-xl border border-dashed border-stone-200 text-center text-xs text-stone-400 bg-white/40 p-4">
                    <span className="font-medium text-stone-500">Nenhum lead</span>
                    <span className="text-[11px] text-stone-400 mt-0.5">nesta etapa</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* 4. The Kanban Board - Clean Horizontal Scroll on PC (>= lg) */}
      <div className="hidden lg:block w-full overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100">
        <div className="flex gap-4 sm:gap-5 items-start min-w-max pb-2">
          {PIPELINE_COLUMNS.map((column) => {
            const columnLeads = filteredLeads.filter((l) => l.status === column.status);
            const columnTotal = columnLeads.reduce((acc, curr) => acc + (curr.budgetMax || 0), 0);

            return (
              <div
                key={column.status}
                className={`flex flex-col rounded-2xl bg-stone-100/70 border border-stone-200/80 w-[310px] min-w-[310px] max-w-[310px] shrink-0 p-3 shadow-xs ${column.headerBg}`}
              >
                {/* Column Header */}
                <div className="mb-3 flex items-center justify-between border-b border-stone-200 pb-2.5 pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${column.dotColor}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      {column.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full text-[11px] font-bold ${column.badgeBg}`}
                    >
                      {columnLeads.length}
                    </span>
                  </div>
                </div>

                {/* Sub-total da Coluna */}
                {columnTotal > 0 && (
                  <div className="mb-3 flex items-center justify-between text-[11px] text-stone-500 bg-white/70 px-2.5 py-1 rounded-lg border border-stone-200/50">
                    <span>Volume na etapa:</span>
                    <span className="font-semibold text-stone-800">
                      {formatCurrency(columnTotal)}
                    </span>
                  </div>
                )}

                {/* Cards List with Independent Scroll - EXACT SAME CARD DESIGN */}
                <div className="flex flex-col gap-3 min-h-[140px] max-h-[calc(100vh-280px)] overflow-y-auto pr-0.5 scrollbar-thin">
                  {columnLeads.map((lead) => renderLeadCard(lead))}

                  {columnLeads.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-28 rounded-xl border border-dashed border-stone-200/90 text-center text-xs text-stone-400 bg-white/40 p-4">
                      <span className="font-medium text-stone-500">Nenhum lead</span>
                      <span className="text-[11px] text-stone-400 mt-0.5">nesta etapa</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Modal para Novo Lead Manual */}
      <AnimatePresence>
        {isNewLeadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-stone-200"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold font-urbanist text-stone-900">
                    Cadastrar Nova Oportunidade
                  </h3>
                  <p className="text-xs text-stone-500">
                    Adicione um lead diretamente no funil de vendas da Gallo
                  </p>
                </div>
                <button
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm text-stone-800 focus:border-[#00873E] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Telefone / WhatsApp *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="(19) 99999-9999"
                      value={newLeadPhone}
                      onChange={(e) => setNewLeadPhone(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm text-stone-800 focus:border-[#00873E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      E-mail (opcional)
                    </label>
                    <input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={newLeadEmail}
                      onChange={(e) => setNewLeadEmail(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm text-stone-800 focus:border-[#00873E] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Interesse
                    </label>
                    <select
                      value={newLeadInterest}
                      onChange={(e) => setNewLeadInterest(e.target.value as LeadInterestType)}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 focus:border-[#00873E] focus:outline-none"
                    >
                      <option value="COMPRA">Compra</option>
                      <option value="LOCACAO">Aluguel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Tipo de Imóvel
                    </label>
                    <select
                      value={newLeadType}
                      onChange={(e) => setNewLeadType(e.target.value as PropertyType)}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 focus:border-[#00873E] focus:outline-none"
                    >
                      <option value="CASA">Casa</option>
                      <option value="APARTAMENTO">Apartamento</option>
                      <option value="CHACARA">Sítio & Chácara</option>
                      <option value="FAZENDA">Fazenda</option>
                      <option value="TERRENO">Terreno</option>
                      <option value="COMERCIAL">Comercial</option>
                    </select>

                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Temperatura
                    </label>
                    <select
                      value={newLeadTemp}
                      onChange={(e) => setNewLeadTemp(e.target.value as LeadTemperature)}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 focus:border-[#00873E] focus:outline-none"
                    >
                      <option value="QUENTE">🔥 Quente</option>
                      <option value="MORNO">Morno</option>
                      <option value="FRIO">Frio</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Orçamento Máximo (R$)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 500000"
                      value={newLeadBudget}
                      onChange={(e) => setNewLeadBudget(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm text-stone-800 focus:border-[#00873E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Dormitórios Mínimos
                    </label>
                    <select
                      value={newLeadBedrooms}
                      onChange={(e) => setNewLeadBedrooms(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus:border-[#00873E] focus:outline-none"
                    >
                      <option value="1">1 Quarto</option>
                      <option value="2">2 Quartos</option>
                      <option value="3">3 Quartos</option>
                      <option value="4">4+ Quartos</option>
                    </select>
                  </div>
                </div>

                {/* Associação de Imóveis de Interesse (Suporte a múltiplos) */}
                <div className="rounded-xl border border-stone-200/90 bg-stone-50/60 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-stone-700">
                      Vincular Imóveis de Interesse {newLeadPropertyIds.length > 0 && `(${newLeadPropertyIds.length})`}
                    </label>
                  </div>

                  <select
                    onChange={(e) => {
                      const pId = e.target.value;
                      if (pId && !newLeadPropertyIds.includes(pId)) {
                        setNewLeadPropertyIds([...newLeadPropertyIds, pId]);
                        const prop = availableProperties.find((p) => p.id === pId);
                        if (prop) {
                          if (!newLeadBudget) setNewLeadBudget(String(prop.price));
                          if (prop.purpose === 'aluguel') setNewLeadInterest('LOCACAO');
                          else setNewLeadInterest('COMPRA');
                          if (prop.type) {
                            const upperType = prop.type.toUpperCase() as PropertyType;
                            setNewLeadType(upperType);
                          }
                          if (prop.bedrooms) {
                            setNewLeadBedrooms(String(Math.min(4, prop.bedrooms)));
                          }
                        }
                      }
                      e.target.value = '';
                    }}
                    defaultValue=""
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 focus:border-[#00873E] focus:outline-none cursor-pointer"
                  >
                    <option value="">+ Selecione um imóvel para vincular...</option>
                    {availableProperties.map((p) => {
                      const isSelected = newLeadPropertyIds.includes(p.id);
                      return (
                        <option key={p.id} value={p.id} disabled={isSelected}>
                          {isSelected ? '✓ ' : ''}{p.title} - {formatCurrency(p.price)} ({p.purpose === 'aluguel' ? 'Aluguel' : 'Venda'})
                        </option>
                      );
                    })}
                  </select>

                  {/* Chips dos imóveis selecionados */}
                  {newLeadPropertyIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {newLeadPropertyIds.map((pId) => {
                        const prop = availableProperties.find((p) => p.id === pId);
                        if (!prop) return null;
                        return (
                          <span
                            key={pId}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-emerald-200 px-2 py-1 text-[11px] font-medium text-stone-800 shadow-2xs"
                          >
                            <Building2 className="h-3 w-3 text-[#00873E] shrink-0" />
                            <span className="max-w-[200px] truncate">{prop.title}</span>
                            <button
                              type="button"
                              onClick={() => setNewLeadPropertyIds(newLeadPropertyIds.filter((id) => id !== pId))}
                              className="text-stone-400 hover:text-rose-600 cursor-pointer p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-[10px] text-stone-400">
                    Você pode vincular mais de um imóvel a este lead. O card conterá link direto para o anúncio de cada um.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsNewLeadModalOpen(false)}
                    className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#00873E] px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#15803d] transition active:scale-95 cursor-pointer"
                  >
                    Cadastrar Oportunidade
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

