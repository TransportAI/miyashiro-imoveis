import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import LeadPipelineView from '@/components/admin/LeadPipelineView';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'CRM & Pipeline de Leads | Miyashiro Imóveis',
  description: 'Gestão de leads, funil de atendimento e oportunidades da Miyashiro Imóveis.',
};

export default function AdminLeadsPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-16">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between max-w-[1920px]">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-medium text-stone-500 hover:text-stone-900 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao site
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold font-urbanist text-stone-900 tracking-tight">
                CRM & Pipeline Imobiliário
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-[#00873E] bg-[#00873E]/10 border border-[#00873E]/20 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00873E] animate-pulse"></span>
                Tempo Real
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-6 max-w-[1920px]">
        <LeadPipelineView />
      </main>
    </div>
  );
}
