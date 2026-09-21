'use client';

import React, { useState } from 'react';
import { AuditLog } from '@/lib/types/crm';
import {
  ShieldAlert,
  Search,
  Download,
  Filter,
  Eye,
  Clock,
} from 'lucide-react';

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    userId: 'corretor-marcos',
    actionType: 'STATUS_CHANGE',
    resourceType: 'LEADS',
    resourceId: 'lead-gallo-1',
    ipAddress: '187.55.12.89',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    payloadDiff: {
      before: { status: 'NOVO_LEAD', score: 50 },
      after: { status: 'CONTATO_REALIZADO', score: 75 },
    },
    timestampUtc: new Date(1773660000000 - 1000 * 60 * 15),
  },
  {
    id: 'log-102',
    userId: 'admin-lucas',
    actionType: 'UPDATE',
    resourceType: 'PROPERTIES',
    resourceId: 'imovel-amparo-ribeirao',
    ipAddress: '177.104.22.14',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    payloadDiff: {
      before: { price: 650000, isFeatured: false },
      after: { price: 620000, isFeatured: true },
    },
    timestampUtc: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'log-103',
    userId: 'corretor-ana',
    actionType: 'LOGIN_SUCCESS',
    resourceType: 'AUTH',
    resourceId: null,
    ipAddress: '201.86.190.5',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    payloadDiff: {
      after: { method: 'PASSWORD_HASH', sessionDuration: '8h' },
    },
    timestampUtc: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
];

export default function AuditLogsView() {
  const [logs, setLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [activeDiff, setActiveDiff] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.resourceId && log.resourceId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.ipAddress.includes(searchTerm);

    const matchesAction = selectedAction === 'ALL' || log.actionType === selectedAction;

    return matchesSearch && matchesAction;
  });

  const exportCsv = () => {
    const headers = ['ID', 'Data UTC', 'Ação', 'Recurso', 'ID Recurso', 'Operador', 'IP'];
    const rows = filteredLogs.map((l) => [
      l.id,
      new Date(l.timestampUtc).toISOString(),
      l.actionType,
      l.resourceType,
      l.resourceId || 'N/A',
      l.userId || 'Sistema',
      l.ipAddress,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_gallo_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por IP, Usuário ou Recurso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-4 text-sm text-stone-800 focus:border-[#00873E] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-semibold text-stone-800 focus:outline-none"
          >
            <option value="ALL">Todas as Ações</option>
            <option value="STATUS_CHANGE">Alteração de Status</option>
            <option value="UPDATE">Edição</option>
            <option value="DELETE">Exclusão</option>
            <option value="LOGIN_SUCCESS">Login</option>
          </select>

          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-xl bg-[#00873E] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#15803d] transition cursor-pointer active:scale-95"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Ação</th>
                <th className="px-4 py-3.5">Recurso</th>
                <th className="px-4 py-3.5">Operador / IP</th>
                <th className="px-4 py-3.5">Diff (Antes x Depois)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/60 transition">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-stone-500">
                    <div className="flex items-center gap-1.5" suppressHydrationWarning>
                      <Clock className="h-3 w-3 text-[#00873E]" />
                      {new Date(log.timestampUtc).toLocaleString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-stone-800">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-[#00873E]">
                      {log.actionType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-stone-900">{log.resourceType}</div>
                    <div className="font-mono text-[10px] text-stone-400">
                      {log.resourceId || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-800">{log.userId || 'Sistema'}</div>
                    <div className="font-mono text-[10px] text-stone-400">{log.ipAddress}</div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setActiveDiff(log)}
                      className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-700 hover:border-[#00873E] hover:text-[#00873E] cursor-pointer transition"
                    >
                      <Eye className="h-3 w-3" />
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeDiff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-base font-bold text-stone-900">
              Comparativo de Alterações ({activeDiff.id})
            </h3>
            <p className="mb-4 text-xs text-stone-500">
              Ação por <strong>{activeDiff.userId}</strong> • IP{' '}
              <code className="font-mono text-stone-800">{activeDiff.ipAddress}</code>
            </p>

            <div className="space-y-3">
              {activeDiff.payloadDiff.before && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                    Estado Anterior:
                  </span>
                  <pre className="mt-1 overflow-x-auto rounded-xl bg-stone-50 p-3 font-mono text-xs text-stone-800 border border-stone-200">
                    {JSON.stringify(activeDiff.payloadDiff.before, null, 2)}
                  </pre>
                </div>
              )}

              {activeDiff.payloadDiff.after && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#00873E]">
                    Novo Estado:
                  </span>
                  <pre className="mt-1 overflow-x-auto rounded-xl bg-emerald-50/40 p-3 font-mono text-xs text-stone-900 border border-emerald-200">
                    {JSON.stringify(activeDiff.payloadDiff.after, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveDiff(null)}
              className="mt-6 w-full rounded-xl bg-stone-100 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-200 transition cursor-pointer"
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
