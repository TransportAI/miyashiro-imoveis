import React from 'react';
import Link from 'next/link';
import { 
  Building2, Users, MessageCircle, Eye, 
  ArrowUpRight, PlusCircle, CheckCircle2, Clock, TrendingUp, Sparkles 
} from 'lucide-react';
import propertiesData from '@/data/properties.json';
import leadsData from '@/data/leads.json';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboardPage() {
  const properties = propertiesData;
  const leads = leadsData;

  const activeProperties = properties.filter(p => p.status === 'disponivel').length;
  const totalValue = properties.reduce((acc, p) => acc + p.price, 0);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-stone-900 font-urbanist">
            Visão Geral da Imobiliária
          </h1>
          <p className="text-stone-500 text-xs mt-0.5">
            Monitoramento em tempo real do portal, catálogo ativo e captação de leads
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 px-4 py-2.5 rounded-xl text-xs font-medium transition shadow-xs"
          >
            <Users className="w-4 h-4 text-[#00873E]" />
            <span>Gerenciar Leads</span>
          </Link>
          <Link
            href="/admin/imoveis/novo"
            className="inline-flex items-center gap-2 bg-[#00873E] hover:bg-[#15803d] text-white px-4 py-2.5 rounded-xl text-xs font-medium transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Imóvel</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Imóveis Ativos</span>
            <Building2 className="w-4 h-4 text-[#00873E]" />
          </div>
          <p className="text-2xl sm:text-3xl font-medium text-stone-900 font-urbanist">{activeProperties} imóveis</p>
          <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% disponíveis no catálogo
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Valor em Carteira</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-medium text-stone-900 font-urbanist">{formatCurrency(totalValue)}</p>
          <p className="text-[11px] text-stone-500">
            Patrimônio sob gestão em Amparo & Região
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Leads & Clientes</span>
            <Users className="w-4 h-4 text-[#00873E]" />
          </div>
          <p className="text-2xl sm:text-3xl font-medium text-stone-900 font-urbanist">{leads.length} contatos</p>
          <p className="text-[11px] text-stone-500">
            Capturados via formulários e WhatsApp
          </p>
        </div>
      </div>

      {/* Two columns: Recent Leads & Featured Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Leads */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-stone-900 font-urbanist">Últimos Leads Recebidos</h2>
            <Link href="/admin/leads" className="text-xs text-[#00873E] hover:text-[#15803d] font-medium">
              Ver todos →
            </Link>
          </div>

          <div className="divide-y divide-stone-100">
            {leads.slice(0, 4).map((lead) => (
              <div key={lead.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-stone-800 truncate">{lead.name}</p>
                  <p className="text-stone-500 text-[11px] truncate">{lead.phone} • {lead.propertyId ? `Interesse: ${lead.propertyId.toUpperCase()}` : 'Geral'}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    lead.status === 'novo' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {lead.status === 'novo' ? 'Novo' : 'Em contato'}
                  </span>
                  <p className="text-[10px] text-stone-400 mt-0.5" suppressHydrationWarning>{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Snapshot */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-stone-900 font-urbanist">Imóveis em Destaque</h2>
            <Link href="/admin/imoveis" className="text-xs text-[#00873E] hover:text-[#15803d] font-medium">
              Gerenciar estoque →
            </Link>
          </div>

          <div className="divide-y divide-stone-100">
            {properties.slice(0, 4).map((prop) => (
              <div key={prop.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-stone-800 truncate">{prop.title}</p>
                  <p className="text-stone-500 text-[11px] truncate">{prop.address?.neighborhood} • REF: {prop.id.toUpperCase()}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium text-[#00873E] font-urbanist whitespace-nowrap">{formatCurrency(prop.price)}</p>
                  <span className="text-[10px] text-emerald-600 block">Disponível</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
