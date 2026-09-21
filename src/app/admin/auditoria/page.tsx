'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, Search, ShieldCheck, CheckCircle2, 
  Building2, Users, Archive, RefreshCw, Filter, Trash2, Clock 
} from 'lucide-react';
import { AuditLog, getAuditLogs } from '@/lib/audit';
import { formatDateTime } from '@/lib/masks';

export default function AdminAuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  const loadLogs = () => {
    setLogs(getAuditLogs());
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleClear = () => {
    if (confirm('Deseja realmente limpar os registros de auditoria anteriores?')) {
      localStorage.removeItem('gallo_audit_logs');
      loadLogs();
    }
  };

  const filteredLogs = logs.filter(log => {
    if (categoryFilter !== 'todos' && log.category !== categoryFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.title.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q)
    );
  });

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'IMOVEL_CRIADO':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-medium">Imóvel Criado</span>;
      case 'IMOVEL_EDITADO':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-medium">Imóvel Editado</span>;
      case 'IMOVEL_STATUS':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-medium">Status Alterado</span>;
      case 'IMOVEL_ARQUIVADO':
        return <span className="bg-stone-100 text-stone-700 border border-stone-300 px-2 py-0.5 rounded-full text-[10px] font-medium">Imóvel Arquivado</span>;
      case 'LEAD_RECEBIDO':
        return <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full text-[10px] font-medium">Lead Recebido</span>;
      case 'LEAD_STATUS':
        return <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full text-[10px] font-medium">Status do Lead</span>;
      case 'LEAD_ARQUIVADO':
        return <span className="bg-stone-100 text-stone-700 border border-stone-300 px-2 py-0.5 rounded-full text-[10px] font-medium">Lead Arquivado</span>;
      default:
        return <span className="bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5 rounded-full text-[10px] font-medium">Sistema</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium text-stone-900 font-urbanist">
              Trilha de Auditoria & Conformidade
            </h1>
            <span className="bg-stone-200 text-stone-700 text-[10px] font-medium px-2 py-0.5 rounded-full">
              LGPD & CRECI
            </span>
          </div>
          <p className="text-stone-500 text-xs mt-0.5">
            Registro cronológico e imutável de todas as ações administrativas, alterações de cadastro e leads captados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLogs}
            className="p-2 bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl text-xs flex items-center gap-1.5 transition"
            title="Recarregar eventos"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <button
            onClick={handleClear}
            className="p-2 bg-white border border-stone-200 text-stone-400 hover:text-red-600 hover:bg-emerald-50 rounded-xl text-xs flex items-center gap-1.5 transition"
            title="Limpar histórico"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar Logs</span>
          </button>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por ação, corretor ou imóvel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-[#00873E]"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#00873E]"
          >
            <option value="todos">Todas as Categorias</option>
            <option value="imovel">Ações em Imóveis</option>
            <option value="lead">Leads & Clientes</option>
            <option value="sistema">Sistema & Segurança</option>
          </select>

          <span className="text-xs text-stone-500 whitespace-nowrap">
            Registros: <strong>{filteredLogs.length}</strong>
          </span>
        </div>
      </div>

      {/* Timeline Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-100 font-medium font-urbanist">
              <tr>
                <th className="py-3 px-4">Data e Horário</th>
                <th className="py-3 px-4">Ação / Categoria</th>
                <th className="py-3 px-4">Evento</th>
                <th className="py-3 px-4">Detalhes</th>
                <th className="py-3 px-4 text-right">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400">
                    Nenhum registro de auditoria corresponde aos filtros.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/60 transition">
                    
                    {/* Timestamp with Date and Time */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{formatDateTime(item.timestamp)}</span>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="py-3.5 px-4">
                      {getActionBadge(item.action)}
                    </td>

                    {/* Event Title */}
                    <td className="py-3.5 px-4 font-medium text-stone-900 font-urbanist">
                      {item.title}
                    </td>

                    {/* Event Details */}
                    <td className="py-3.5 px-4 text-stone-600 max-w-md">
                      <p className="line-clamp-2 text-[11px] leading-relaxed">
                        {item.details}
                      </p>
                    </td>

                    {/* Actor User */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-medium text-stone-800 bg-stone-100 px-2 py-0.5 rounded text-[10px]">
                        {item.user}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
