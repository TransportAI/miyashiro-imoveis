'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Folder, FolderOpen, ChevronRight, ChevronDown, ChevronLeft,
  Search, Plus, Filter, MoreVertical, Download, 
  Calendar, CheckCircle2, Clock, AlertTriangle, 
  User, FileText, Sparkles, RefreshCw,
  ExternalLink, Eye, Trash2, Edit3
} from 'lucide-react';
import { Contract, ContractStatus, ContractType, ContractFile } from '@/lib/types/contract';
import { formatCurrency } from '@/lib/utils';
import NewContractModal from './NewContractModal';
import ContractDetailModal from './ContractDetailModal';
import FinalizeContractModal from './FinalizeContractModal';
import ContractDocumentEditorModal from './ContractDocumentEditorModal';
import FilePreviewModal from './FilePreviewModal';
import EditFileModal from './EditFileModal';
import initialContracts from '@/data/contracts.json';
import { logAuditEvent } from '@/lib/audit';

export default function ContractInsporaDashboard() {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts as Contract[]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'ctr-001': true,
    'ctr-002': true
  });
  const [search, setSearch] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'locacao' | 'permuta' | 'venda' | 'vigente' | 'vencendo' | 'finalizado'>('todos');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Modais
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [detailModalContract, setDetailModalContract] = useState<Contract | null>(null);
  const [finalizeModalContract, setFinalizeModalContract] = useState<Contract | null>(null);
  const [editorModalContract, setEditorModalContract] = useState<Contract | null>(null);
  const [previewFileModalData, setPreviewFileModalData] = useState<{ file: ContractFile; contract: Contract } | null>(null);
  const [editingFileData, setEditingFileData] = useState<{ file: ContractFile; contract: Contract } | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const sanitizeContracts = (list: Contract[]): Contract[] => {
    return list.map(c => ({
      ...c,
      files: (c.files || []).map(f => {
        let url = f.url;
        if (!url || url === '#') {
          if (f.fileType === 'pdf') url = '/documents/contrato_locacao_assinado.pdf';
          else if (f.fileType === 'png' || f.fileType === 'jpg' || f.category === 'comprovante') url = '/images/comprovante_caucao.png';
          else url = '';
        }
        return { ...f, url };
      })
    }));
  };

  // Carrega contratos da API / localStorage
  const loadContracts = async () => {
    try {
      const res = await fetch('/api/contracts');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const sanitized = sanitizeContracts(data);
          setContracts(sanitized);
          localStorage.setItem('miyashiro_contracts', JSON.stringify(sanitized));
          return;
        }
      }
    } catch (e) {}

    try {
      const cached = localStorage.getItem('miyashiro_contracts') || localStorage.getItem('gallo_contracts');
      if (cached) {
        const sanitized = sanitizeContracts(JSON.parse(cached));
        setContracts(sanitized);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // KPIs
  const kpis = useMemo(() => {
    const total = contracts.length;
    const vigentes = contracts.filter(c => c.status === 'vigente').length;
    const vencendo = contracts.filter(c => c.status === 'vencendo').length;
    const finalizados = contracts.filter(c => c.status === 'finalizado' || c.status === 'rescindido').length;
    
    const rentMonthlyVolume = contracts
      .filter(c => c.status === 'vigente' && c.financial.monthlyRent)
      .reduce((acc, curr) => acc + (curr.financial.monthlyRent || 0), 0);

    const salesVolume = contracts
      .filter(c => (c.status === 'finalizado' || c.status === 'vigente') && c.financial.totalSaleValue)
      .reduce((acc, curr) => acc + (curr.financial.totalSaleValue || 0), 0);

    return { total, vigentes, vencendo, finalizados, rentMonthlyVolume, salesVolume };
  }, [contracts]);

  // Filtragem
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchesSearch = 
        c.propertyTitle.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.parties.some(p => p.name.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeFilter === 'locacao') {
        return c.modalidade === 'locacao_seguro_fianca' || c.type.startsWith('locacao');
      }
      if (activeFilter === 'permuta') {
        return c.modalidade === 'permuta_imobiliaria' || (c.type as string)?.includes('permuta');
      }
      if (activeFilter === 'venda') {
        return c.modalidade === 'venda_compra' || c.type.includes('venda');
      }
      if (activeFilter === 'vigente') return c.status === 'vigente';
      if (activeFilter === 'vencendo') return c.status === 'vencendo';
      if (activeFilter === 'finalizado') return c.status === 'finalizado' || c.status === 'rescindido';

      return true;
    });
  }, [contracts, search, activeFilter]);

  // Reset page on filter or search
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeFilter]);

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage) || 1;
  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredContracts.slice(start, start + itemsPerPage);
  }, [filteredContracts, currentPage, itemsPerPage]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusPill = (status: ContractStatus) => {
    switch (status) {
      case 'vigente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#00873E] dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Vigente
          </span>
        );
      case 'vencendo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            Vencendo
          </span>
        );
      case 'aguardando_assinatura':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Pendente
          </span>
        );
      case 'finalizado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            <CheckCircle2 className="w-3 h-3 text-stone-500" />
            Finalizado
          </span>
        );
      case 'rescindido':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <AlertTriangle className="w-3 h-3 text-purple-500" />
            Rescindido
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  const getFileBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <span className="bg-[#EF4444] text-white font-black text-[9px] px-1.5 py-0.5 rounded tracking-wider shadow-2xs">PDF</span>;
      case 'doc':
      case 'docx':
        return <span className="bg-[#0284C7] text-white font-black text-[9px] px-1.5 py-0.5 rounded tracking-wider shadow-2xs">DOC</span>;
      case 'zip':
      case 'rar':
        return <span className="bg-[#F97316] text-white font-black text-[9px] px-1.5 py-0.5 rounded tracking-wider shadow-2xs">ZIP</span>;
      case 'png':
      case 'jpg':
      case 'webp':
        return <span className="bg-[#00873E] text-white font-black text-[9px] px-1.5 py-0.5 rounded tracking-wider shadow-2xs">PNG</span>;
      default:
        return <span className="bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded tracking-wider">FILE</span>;
    }
  };

  const handleFinalizeConfirm = async (
    contractId: string, 
    closedAt: string, 
    reason: string, 
    finalStatus: 'finalizado' | 'rescindido',
    closingFile?: ContractFile
  ) => {
    const updated = contracts.map(c => {
      if (c.id === contractId) {
        const nextFiles = closingFile ? [...c.files, closingFile] : c.files;
        return {
          ...c,
          status: finalStatus,
          closedAt,
          closeReason: reason,
          files: nextFiles,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });

    setContracts(updated);
    localStorage.setItem('miyashiro_contracts', JSON.stringify(updated));

    const target = updated.find(c => c.id === contractId);
    if (target) {
      if (detailModalContract && detailModalContract.id === contractId) {
        setDetailModalContract(target);
      }

      logAuditEvent(
        'CONTRATO_FINALIZADO',
        `Contrato ${target.code || target.propertyTitle || 'CTR'} Finalizado`,
        `Contrato marcado como "${finalStatus === 'finalizado' ? 'Finalizado' : 'Rescindido'}". Motivo: ${reason || 'Encerramento de vigência'}.`,
        'contrato'
      );

      try {
        await fetch('/api/contracts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target)
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddFileToContract = async (contractId: string, newFile: ContractFile) => {
    const updated = contracts.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          files: [...c.files, newFile],
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });

    setContracts(updated);
    localStorage.setItem('miyashiro_contracts', JSON.stringify(updated));

    const target = updated.find(c => c.id === contractId);
    if (target) {
      if (detailModalContract && detailModalContract.id === contractId) {
        setDetailModalContract(target);
      }

      logAuditEvent(
        'CONTRATO_DOCUMENTO',
        `Arquivo Anexado ao Contrato ${target.code || target.propertyTitle || 'CTR'}`,
        `Documento "${newFile.name}" (categoria: ${newFile.category}) anexado com sucesso.`,
        'contrato'
      );

      try {
        await fetch('/api/contracts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target)
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveContractUpdate = async (updatedContract: Contract) => {
    const updated = contracts.map(c => c.id === updatedContract.id ? updatedContract : c);
    setContracts(updated);
    localStorage.setItem('miyashiro_contracts', JSON.stringify(updated));

    if (detailModalContract && detailModalContract.id === updatedContract.id) {
      setDetailModalContract(updatedContract);
    }
    if (editorModalContract && editorModalContract.id === updatedContract.id) {
      setEditorModalContract(updatedContract);
    }

    logAuditEvent(
      'CONTRATO_EDITADO',
      `Contrato ${updatedContract.code || updatedContract.propertyTitle || 'CTR'} Atualizado`,
      `Dados ou minuta do contrato de ${updatedContract.type} foram atualizados.`,
      'contrato'
    );

    try {
      await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedContract)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteContract = async (id: string) => {
    const target = contracts.find(c => c.id === id);
    if (!confirm(`Deseja realmente remover o contrato ${target?.code || target?.propertyTitle || id}?`)) return;
    const filtered = contracts.filter(c => c.id !== id);
    setContracts(filtered);
    localStorage.setItem('miyashiro_contracts', JSON.stringify(filtered));

    const clientName = target?.parties?.find(p => p.role === 'locatario' || p.role === 'comprador')?.name || 'cliente';

    logAuditEvent(
      'CONTRATO_EXCLUIDO',
      `Contrato ${target?.code || target?.propertyTitle || id} Excluído`,
      `Contrato de ${target?.type || 'imóvel'} vinculado a ${clientName} foi excluído.`,
      'contrato'
    );

    try {
      await fetch(`/api/contracts?id=${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const handleSaveFileInDashboard = async (updatedFile: ContractFile) => {
    if (!editingFileData) return;
    const { contract } = editingFileData;
    const updatedFiles = contract.files.map(f => f.id === updatedFile.id ? updatedFile : f);
    const updatedContract: Contract = {
      ...contract,
      files: updatedFiles,
      updatedAt: new Date().toISOString()
    };

    logAuditEvent(
      'CONTRATO_DOCUMENTO',
      `Documento Alterado no Contrato ${contract.code || contract.propertyTitle || 'CTR'}`,
      `Arquivo "${updatedFile.name}" foi renomeado ou teve seu arquivo substituído.`,
      'contrato'
    );

    await handleSaveContractUpdate(updatedContract);
  };

  const handleDeleteFileInDashboard = async (contract: Contract, fileId: string) => {
    const targetFile = contract.files.find(f => f.id === fileId);
    if (!confirm(`Deseja realmente remover o arquivo "${targetFile?.name || 'anexo'}" do contrato?`)) return;
    const updatedFiles = contract.files.filter(f => f.id !== fileId);
    const updatedContract: Contract = {
      ...contract,
      files: updatedFiles,
      updatedAt: new Date().toISOString()
    };

    logAuditEvent(
      'CONTRATO_DOCUMENTO',
      `Documento Removido do Contrato ${contract.code || contract.propertyTitle || 'CTR'}`,
      `Arquivo "${targetFile?.name || fileId}" foi excluído dos anexos.`,
      'contrato'
    );

    await handleSaveContractUpdate(updatedContract);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar: Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white font-urbanist tracking-tight">
            Gestão de Contratos & Documentos
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Árvore de arquivos, prazos e minutas vinculadas por imóvel
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#00873E] hover:bg-[#15803d] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#00873E]/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Contrato</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131926] border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="text-xs font-medium">Contratos Vigentes</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#00873E] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white font-urbanist">
            {kpis.vigentes}
          </p>
          <span className="text-[11px] text-[#00873E] font-medium mt-0.5 block">
            {kpis.total} contratos registrados no total
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#131926] border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="text-xs font-medium">Vencendo nos Próximos 30d</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 font-urbanist">
            {kpis.vencendo}
          </p>
          <span className="text-[11px] text-red-600/80 font-medium mt-0.5 block">
            Exigem notificação de renovação
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#131926] border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
            <span className="text-xs font-medium">Finalizados / Concluídos</span>
            <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white font-urbanist">
            {kpis.finalizados}
          </p>
          <span className="text-[11px] text-stone-400 font-medium mt-0.5 block">
            Vendas e rescisões concluídas
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'todos', label: 'Todos os Contratos' },
            { id: 'locacao', label: 'Locação (Seguro Fiança)' },
            { id: 'permuta', label: 'Permuta Imobiliária' },
            { id: 'venda', label: 'Venda e Compra' },
            { id: 'vigente', label: 'Vigentes' },
            { id: 'vencendo', label: 'Vencendo em Breve' },
            { id: 'finalizado', label: 'Finalizados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-xs'
                  : 'bg-white dark:bg-[#131926] text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por imóvel, código ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#131926] text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#00873E]"
          />
        </div>
      </div>

      {/* Main Inspora-Style File Management Tree Table */}
      <div className="bg-white dark:bg-[#0B0F17] rounded-3xl border border-stone-200 dark:border-stone-800/80 overflow-hidden shadow-sm">
        
        {/* Table Header (Desktop Only) */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 bg-stone-50/70 dark:bg-[#101623] border-b border-stone-200/80 dark:border-stone-800/80 text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
          <div className="col-span-4 flex items-center gap-2">
            <span>Imóvel / Documentos</span>
          </div>
          <div className="col-span-2">Início</div>
          <div className="col-span-2">Vencimento / Término</div>
          <div className="col-span-1">Partes</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1 text-right">Ações</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-stone-100 dark:divide-stone-900/60">
          {paginatedContracts.length === 0 ? (
            <div className="p-12 text-center text-stone-400 text-xs">
              Nenhum contrato encontrado para o filtro selecionado.
            </div>
          ) : (
            paginatedContracts.map((contract) => {
              const isExpanded = !!expandedFolders[contract.id];

              return (
                <div key={contract.id} className="group">
                  
                  {/* Parent Folder Row */}
                  <div 
                    className="flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 px-4 sm:px-6 py-4 items-start lg:items-center transition cursor-pointer hover:bg-stone-50/80 dark:hover:bg-[#121927]"
                    onClick={() => toggleFolder(contract.id)}
                  >
                    
                    {/* Column 1: Folder Icon + Title */}
                    <div className="col-span-4 flex items-center gap-2.5 min-w-0 w-full">
                      <div className="text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>

                      {/* Golden/Amber Folder Icon */}
                      <div className="text-amber-500 flex-shrink-0">
                        {isExpanded ? (
                          <FolderOpen className="w-5 h-5 fill-amber-400/30 text-amber-500" />
                        ) : (
                          <Folder className="w-5 h-5 fill-amber-400/30 text-amber-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate font-urbanist">
                            {contract.propertyTitle}
                          </p>
                          <span className="text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.2 rounded">
                            {contract.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 truncate">
                          {contract.propertyAddress} • {contract.financial.monthlyRent ? `${formatCurrency(contract.financial.monthlyRent)}/mês` : formatCurrency(contract.financial.totalSaleValue || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Details Container */}
                    <div className="w-full flex lg:hidden items-center justify-between text-xs py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800">
                      <div>
                        <span className="text-[10px] text-stone-400 block">Vigência</span>
                        <span className="font-semibold text-stone-700 dark:text-stone-200">
                          {formatDate(contract.startDate)} até {formatDate(contract.endDate)}
                        </span>
                      </div>
                      <div>
                        {getStatusPill(contract.status)}
                      </div>
                    </div>

                    {/* Column 2: Data Início (Desktop) */}
                    <div className="hidden lg:block col-span-2 text-xs text-stone-700 dark:text-stone-300 font-medium">
                      {formatDate(contract.startDate)}
                    </div>

                    {/* Column 3: Data Término (Desktop) */}
                    <div className="hidden lg:block col-span-2 text-xs text-stone-700 dark:text-stone-300 font-medium">
                      {formatDate(contract.endDate)}
                      {contract.closedAt && (
                        <span className="block text-[10px] text-stone-400">
                          Encerrado em {formatDate(contract.closedAt)}
                        </span>
                      )}
                    </div>

                    {/* Column 4: Avatares Sobrepostos */}
                    <div className="hidden lg:flex col-span-1 items-center -space-x-2 overflow-hidden">
                      {contract.parties.slice(0, 3).map((p, idx) => (
                        <div
                          key={idx}
                          title={`${p.name} (${p.role})`}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#0B0F17] bg-gradient-to-tr from-stone-600 to-stone-800 text-[10px] font-bold text-white flex items-center justify-center cursor-default shadow-xs"
                        >
                          {p.name.charAt(0)}
                        </div>
                      ))}
                      {contract.parties.length > 3 && (
                        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#0B0F17] bg-stone-300 dark:bg-stone-700 text-[9px] font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-center">
                          +{contract.parties.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Column 5: Status Pill (Desktop) */}
                    <div className="hidden lg:flex col-span-2 items-center justify-center">
                      {getStatusPill(contract.status)}
                    </div>

                    {/* Column 6: Ações (Desktop & Mobile) */}
                    <div className="w-full lg:w-auto col-span-1 flex items-center justify-between lg:justify-end gap-1.5 pt-1 lg:pt-0 border-t lg:border-t-0 border-stone-100 dark:border-stone-800" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[11px] text-stone-400 lg:hidden flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {contract.files.length} anexo{contract.files.length !== 1 ? 's' : ''}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailModalContract(contract)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                          title="Ver Detalhes do Contrato"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <div className="relative">
                          <button
                            onClick={() => setActiveDropdownId(activeDropdownId === contract.id ? null : contract.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeDropdownId === contract.id && (
                            <div className="absolute right-0 top-8 z-30 w-44 rounded-xl bg-white dark:bg-[#1A2234] border border-stone-200 dark:border-stone-700 shadow-xl py-1 text-xs">
                              <button
                                onClick={() => {
                                  setDetailModalContract(contract);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center gap-2 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Visualizar Ficha
                              </button>

                              <button
                                onClick={() => {
                                  setEditorModalContract(contract);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left text-[#00873E] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-[#00873E]" />
                                Visualizar & Editar Minuta
                              </button>

                              <button
                                onClick={() => {
                                  setDetailModalContract(contract);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center gap-2 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Anexar Documento / Vistoria
                              </button>
                              
                              {contract.status !== 'finalizado' && contract.status !== 'rescindido' && (
                                <button
                                  onClick={() => {
                                    setFinalizeModalContract(contract);
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Finalizar Contrato
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  handleDeleteContract(contract.id);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 border-t border-stone-100 dark:border-stone-700 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Child Items: Tree Lines + Extension Badges */}
                  {isExpanded && (
                    <div className="bg-stone-50/40 dark:bg-[#0E131E] border-t border-stone-100 dark:border-stone-900/80">
                      {contract.files.length === 0 ? (
                        <div className="py-2.5 pl-8 sm:pl-14 text-[11px] text-stone-400 italic">
                          Nenhum documento anexado a este imóvel.
                        </div>
                      ) : (
                        contract.files.map((file, fileIdx) => {
                          const isLast = fileIdx === contract.files.length - 1;

                          return (
                            <div 
                              key={file.id} 
                              className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 py-2.5 items-start sm:items-center hover:bg-stone-100/60 dark:hover:bg-[#141B2A] transition"
                            >
                              {/* Connector Tree Line + Badge */}
                              <div className="sm:col-span-5 flex items-center gap-2.5 pl-4 sm:pl-8 min-w-0 w-full sm:w-auto">
                                <span className="font-mono text-stone-300 dark:text-stone-700 select-none text-xs">
                                  {isLast ? '└──' : '├──'}
                                </span>

                                <div className="flex-shrink-0">
                                  {getFileBadge(file.fileType)}
                                </div>

                                <p className="text-xs text-stone-700 dark:text-stone-200 font-medium truncate">
                                  {file.name}
                                </p>
                              </div>

                              <div className="hidden sm:block sm:col-span-2 text-[11px] text-stone-400">
                                {formatDate(file.uploadedAt)}
                              </div>

                              <div className="hidden sm:block sm:col-span-2 text-[11px] text-stone-400">
                                {formatDate(contract.endDate)}
                              </div>

                              <div className="hidden sm:block sm:col-span-1 text-[11px] text-stone-400">
                                {file.fileSize}
                              </div>

                              <div className="sm:col-span-1 flex items-center gap-2 pl-8 sm:pl-0">
                                <span className="text-[10px] text-stone-500 dark:text-stone-400 capitalize bg-white dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                                  {file.category}
                                </span>
                                <span className="sm:hidden text-[10px] text-stone-400">
                                  • {file.fileSize}
                                </span>
                              </div>

                              <div className="w-full sm:w-auto sm:col-span-1 flex items-center justify-end gap-1 pl-8 sm:pl-0">
                                {/* Visualizar / Preview */}
                                <button
                                  type="button"
                                  onClick={() => setPreviewFileModalData({ file, contract })}
                                  className="p-1 rounded-lg text-stone-400 hover:text-[#00873E] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                                  title="Visualizar Arquivo"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Editar */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (file.fileType === 'doc' || file.fileType === 'docx' || file.category === 'minuta') {
                                      setEditorModalContract(contract);
                                    } else {
                                      setEditingFileData({ file, contract });
                                    }
                                  }}
                                  className={`p-1 rounded-lg transition cursor-pointer ${
                                    file.fileType === 'doc' || file.fileType === 'docx' || file.category === 'minuta'
                                      ? 'text-stone-400 hover:text-[#00873E] hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                      : 'text-stone-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40'
                                  }`}
                                  title={file.category === 'minuta' || file.fileType === 'docx' ? 'Editar Minuta no Word' : 'Renomear / Substituir Arquivo'}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                {/* Baixar */}
                                <a
                                  href={file.dataUrl || file.url || '#'}
                                  download={file.name}
                                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700 transition"
                                  title="Baixar Arquivo"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>

                                {/* Excluir */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFileInDashboard(contract, file.id)}
                                  className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                                  title="Remover Arquivo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Paginação */}
        {filteredContracts.length > itemsPerPage && (
          <div className="px-6 py-3.5 bg-stone-50/50 dark:bg-[#101623] border-t border-stone-200/80 dark:border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
            <div>
              Mostrando <span className="font-semibold text-stone-800 dark:text-stone-200">{((currentPage - 1) * itemsPerPage) + 1}</span> até{' '}
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {Math.min(currentPage * itemsPerPage, filteredContracts.length)}
              </span>{' '}
              de <span className="font-semibold text-stone-800 dark:text-stone-200">{filteredContracts.length}</span> contratos
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#00873E] text-white'
                        : 'border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modais */}
      <NewContractModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={(newContract) => {
          setContracts(prev => [newContract, ...prev]);
          setExpandedFolders(prev => ({ ...prev, [newContract.id]: true }));
          const clientName = newContract.parties?.find(p => p.role === 'locatario' || p.role === 'comprador')?.name || 'cliente';
          logAuditEvent(
            'CONTRATO_CRIADO',
            `Novo Contrato Gerado: ${newContract.code || newContract.propertyTitle || 'CTR'}`,
            `Contrato de ${newContract.type} para ${clientName} registrado com sucesso.`,
            'contrato'
          );
        }}
      />

      <ContractDetailModal
        isOpen={!!detailModalContract}
        contract={detailModalContract}
        onClose={() => setDetailModalContract(null)}
        onOpenFinalize={(contract) => setFinalizeModalContract(contract)}
        onAddFile={handleAddFileToContract}
        onUpdateContract={handleSaveContractUpdate}
      />

      <ContractDocumentEditorModal
        isOpen={!!editorModalContract}
        contract={editorModalContract}
        onClose={() => setEditorModalContract(null)}
        onSaveContract={handleSaveContractUpdate}
      />

      <FinalizeContractModal
        isOpen={!!finalizeModalContract}
        contract={finalizeModalContract}
        onClose={() => setFinalizeModalContract(null)}
        onConfirm={handleFinalizeConfirm}
      />

      {/* Modal de Pré-visualização Universal de Arquivos (PDF, DOCX, Imagens, ZIP) */}
      <FilePreviewModal
        file={previewFileModalData?.file || null}
        contract={previewFileModalData?.contract || null}
        isOpen={!!previewFileModalData}
        onClose={() => setPreviewFileModalData(null)}
        onOpenEditor={(contract) => {
          setPreviewFileModalData(null);
          setEditorModalContract(contract);
        }}
        onReplaceFile={(file) => {
          if (previewFileModalData) {
            const currentContract = previewFileModalData.contract;
            setPreviewFileModalData(null);
            setEditingFileData({ file, contract: currentContract });
          }
        }}
      />

      {/* Modal de Edição & Substituição de Arquivo */}
      <EditFileModal
        file={editingFileData?.file || null}
        isOpen={!!editingFileData}
        onClose={() => setEditingFileData(null)}
        onSave={handleSaveFileInDashboard}
      />

    </div>
  );
}
