'use client';

import React, { useState } from 'react';
import { 
  X, Calendar, Building2, User, DollarSign, Shield, 
  FileText, Download, CheckCircle2, Clock, AlertTriangle, 
  Phone, Mail, Check, Sparkles, ExternalLink, Upload, Plus, Loader2,
  Eye, Edit3, Trash2
} from 'lucide-react';
import { Contract, ContractFile } from '@/lib/types/contract';
import { formatCurrency } from '@/lib/utils';
import { compressImageFile, formatBytes, getFileExtension } from '@/lib/media/fileCompressor';
import { exportContractToDocx, exportContractToPdfPrint, exportContractToTxt } from '@/lib/documents/contractExporter';
import ContractDocumentEditorModal from './ContractDocumentEditorModal';
import FilePreviewModal from './FilePreviewModal';
import EditFileModal from './EditFileModal';

interface ContractDetailModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFinalize: (contract: Contract) => void;
  onAddFile?: (contractId: string, newFile: ContractFile) => Promise<void> | void;
  onUpdateContract?: (updated: Contract) => Promise<void> | void;
}

export default function ContractDetailModal({
  contract,
  isOpen,
  onClose,
  onOpenFinalize,
  onAddFile,
  onUpdateContract
}: ContractDetailModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<ContractFile['category']>('vistoria');
  const [previewFile, setPreviewFile] = useState<ContractFile | null>(null);
  const [editingFile, setEditingFile] = useState<ContractFile | null>(null);

  if (!isOpen || !contract) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Não informado';
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'vigente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Vigente / Ativo
          </span>
        );
      case 'vencendo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300/40">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            Vencendo (&lt; 30 dias)
          </span>
        );
      case 'aguardando_assinatura':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Aguardando Assinatura
          </span>
        );
      case 'finalizado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-300/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-stone-500" />
            Finalizado
          </span>
        );
      case 'rescindido':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300/40">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-500" />
            Rescindido
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800">
            {status}
          </span>
        );
    }
  };

  const getFileBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <span className="bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded">PDF</span>;
      case 'doc':
      case 'docx':
        return <span className="bg-sky-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded">DOC</span>;
      case 'zip':
      case 'rar':
        return <span className="bg-orange-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded">ZIP</span>;
      case 'png':
      case 'jpg':
      case 'webp':
        return <span className="bg-emerald-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded">PNG</span>;
      default:
        return <span className="bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded">FILE</span>;
    }
  };

  const isClosed = contract.status === 'finalizado' || contract.status === 'rescindido';

  const handleNewFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !contract) return;
    const file = files[0];
    setIsUploading(true);

    try {
      const result = await compressImageFile(file);
      const ext = getFileExtension(file.name);

      const newFile: ContractFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        fileType: ext,
        fileSize: formatBytes(result.compressedSize),
        category: uploadCategory,
        uploadedAt: new Date().toISOString(),
        dataUrl: result.dataUrl
      };

      if (onAddFile) {
        await onAddFile(contract.id, newFile);
      }
      setShowUploadForm(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao processar e salvar arquivo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEditedFile = async (updatedFile: ContractFile) => {
    if (!contract || !onUpdateContract) return;
    const updatedFiles = contract.files.map(f => f.id === updatedFile.id ? updatedFile : f);
    const updatedContract: Contract = {
      ...contract,
      files: updatedFiles,
      updatedAt: new Date().toISOString()
    };
    await onUpdateContract(updatedContract);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!contract || !onUpdateContract) return;
    if (!confirm('Deseja realmente remover este arquivo anexo do contrato?')) return;
    const updatedFiles = contract.files.filter(f => f.id !== fileId);
    const updatedContract: Contract = {
      ...contract,
      files: updatedFiles,
      updatedAt: new Date().toISOString()
    };
    await onUpdateContract(updatedContract);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#131926] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md">
                {contract.code}
              </span>
              {getStatusBadge(contract.status)}
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white font-urbanist">
              {contract.propertyTitle}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {contract.propertyAddress}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {!isClosed && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFinalize(contract);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/40 transition cursor-pointer border border-red-200 dark:border-red-900/50"
              >
                Finalizar Contrato
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informações Principais Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6">
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#1E293B]/60 border border-stone-100 dark:border-stone-800">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1 font-urbanist">
              Vigência / Período
            </span>
            <p className="text-sm font-bold text-stone-800 dark:text-stone-100">
              {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
            </p>
            {contract.financial.paymentDay && (
              <p className="text-[11px] text-[#00873E] dark:text-emerald-400 font-semibold mt-1">
                Vencimento do aluguel: todo dia {String(contract.financial.paymentDay).padStart(2, '0')}
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#1E293B]/60 border border-stone-100 dark:border-stone-800">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1 font-urbanist">
              {contract.type.startsWith('locacao') ? 'Valor do Aluguel' : 'Valor Total do Negócio'}
            </span>
            <p className="text-base font-extrabold text-stone-900 dark:text-white">
              {contract.type.startsWith('locacao')
                ? formatCurrency(contract.financial.monthlyRent || 0) + '/mês'
                : formatCurrency(contract.financial.totalSaleValue || 0)}
            </p>
            <p className="text-[10px] text-stone-500 mt-0.5">
              {contract.financial.iptuIncluded ? 'IPTU incluso • ' : ''}
              {contract.financial.condoFeeIncluded ? 'Condomínio incluso' : ''}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#1E293B]/60 border border-stone-100 dark:border-stone-800">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1 font-urbanist">
              Garantia Locatícia
            </span>
            <p className="text-sm font-bold text-stone-800 dark:text-stone-100 capitalize">
              {contract.financial.guaranteeType === 'caucao' ? 'Caução em Dinheiro' :
               contract.financial.guaranteeType === 'fiador' ? 'Fiador com Garantia' :
               contract.financial.guaranteeType === 'seguro_fianca' ? 'Seguro Fiança' :
               contract.financial.guaranteeType === 'titulo_capitalizacao' ? 'Título Capitalização' : 'Sem Garantia'}
            </p>
            {contract.financial.depositAmount ? (
              <p className="text-[11px] text-stone-500 mt-0.5">
                Valor: {formatCurrency(contract.financial.depositAmount)}
              </p>
            ) : null}
          </div>
        </div>

        {/* Partes Envolvidas */}
        <div className="mt-6">
          <h4 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5 font-urbanist">
            <User className="w-4 h-4 text-stone-500" />
            Partes do Contrato ({contract.parties.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contract.parties.map((p, idx) => (
              <div 
                key={idx} 
                className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#1E293B]/40 border border-stone-100 dark:border-stone-800 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-[#00873E]/10 text-xs font-bold text-[#00873E] flex items-center justify-center flex-shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-semibold text-xs text-stone-800 dark:text-stone-200 truncate">{p.name}</p>
                    <span className="text-[10px] font-medium text-[#00873E] capitalize bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/50">
                      {p.role}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-stone-500 mt-1">
                    {p.documentNumber && <span>CPF: {p.documentNumber}</span>}
                    {p.rg && <span>• RG: {p.rg}</span>}
                  </div>
                  {p.phone && <p className="text-[11px] text-stone-500 mt-0.5">{p.phone}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalhes de Seguro Fiança se modalidade for locação */}
        {contract.financial.seguroFiancaDetails && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-1.5">
            <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 font-urbanist">
              <Shield className="w-4 h-4 text-emerald-600" />
              Garantia Exclusiva: Seguro Fiança Locatícia
            </h4>
            <div className="text-xs text-emerald-900 dark:text-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <p><strong>Seguradora:</strong> {contract.financial.seguroFiancaDetails.seguradoraNome || 'Porto Seguro / Too Seguros'}</p>
              <p><strong>Status da Apólice:</strong> <span className="capitalize">{contract.financial.seguroFiancaDetails.statusApolice || 'Emitida / Vigente'}</span></p>
              {contract.financial.seguroFiancaDetails.numeroApolice && (
                <p><strong>Nº Apólice:</strong> {contract.financial.seguroFiancaDetails.numeroApolice}</p>
              )}
              {contract.financial.seguroFiancaDetails.valorPremioMensal && (
                <p><strong>Prêmio Mensal:</strong> {formatCurrency(contract.financial.seguroFiancaDetails.valorPremioMensal)}</p>
              )}
            </div>
          </div>
        )}

        {/* Detalhes de Permuta se modalidade for permuta */}
        {contract.financial.permutaDetails && (
          <div className="mt-6 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2">
            <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5 font-urbanist">
              <Building2 className="w-4 h-4 text-blue-600" />
              Condições da Permuta Imobiliária
            </h4>
            <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
              <p><strong>Segundo Imóvel Envolvido:</strong> {contract.financial.permutaDetails.imovelSegundoDescricao || 'Descrição do imóvel de contrapartida'}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <p><strong>Imóvel 1:</strong> {formatCurrency(contract.financial.permutaDetails.valorImovel1 || 0)}</p>
                <p><strong>Imóvel 2:</strong> {formatCurrency(contract.financial.permutaDetails.valorImovel2 || 0)}</p>
                <p><strong>Torna em Dinheiro:</strong> {contract.financial.permutaDetails.possuiTorna ? formatCurrency(contract.financial.permutaDetails.valorTorna || 0) : 'Sem Torna'}</p>
              </div>
              {contract.financial.permutaDetails.possuiTorna && contract.financial.permutaDetails.condicoesTorna && (
                <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-1">
                  <strong>Condições da Torna:</strong> {contract.financial.permutaDetails.condicoesTorna}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Exportação e Geração de Documentos Client-Side */}
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-stone-50 via-emerald-50/20 to-stone-50 dark:from-[#1E293B]/60 dark:to-[#1E293B]/40 border border-emerald-500/20 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-urbanist">
                <Sparkles className="w-4 h-4 text-[#00873E]" />
                Minuta, Edição In-App & Exportações
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                Visualize a folha A4 timbrada, edite cláusulas em tempo real ou exporte diretamente
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowEditorModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00873E] hover:bg-[#15803d] text-white shadow-sm transition cursor-pointer self-start sm:self-auto"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Visualizar & Editar Minuta</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              disabled={isExportingDocx}
              onClick={async () => {
                setIsExportingDocx(true);
                try {
                  await exportContractToDocx(contract);
                } catch (err) {
                  console.error(err);
                  alert('Erro ao gerar documento DOCX.');
                } finally {
                  setIsExportingDocx(false);
                }
              }}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isExportingDocx ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Exportar Word (.docx)</span>
            </button>

            <button
              type="button"
              onClick={() => exportContractToPdfPrint(contract)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Gerar PDF Oficial</span>
            </button>

            <button
              type="button"
              onClick={() => exportContractToTxt(contract)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Baixar Minuta (.txt)</span>
            </button>
          </div>
        </div>

        {/* Motivo do Encerramento se finalizado */}
        {contract.closeReason && (
          <div className="mt-6 p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
            <h4 className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wider mb-1">
              Registro de Encerramento
            </h4>
            <p className="text-xs text-red-900/90 dark:text-red-200/90 leading-relaxed">
              {contract.closeReason}
            </p>
          </div>
        )}

        {/* Seção de Arquivos */}
        <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-urbanist">
              <FileText className="w-4 h-4 text-stone-500" />
              Arquivos & Documentos Anexos ({contract.files.length})
            </h4>
            
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#00873E] hover:text-[#15803d] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Anexar Novo Arquivo</span>
            </button>
          </div>

          {/* Form de Upload de Novo Documento */}
          {showUploadForm && (
            <div className="mb-4 p-4 rounded-2xl bg-stone-50 dark:bg-[#1E293B]/80 border border-stone-200 dark:border-stone-700 animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-800 dark:text-white">
                  Fazer Upload de Novo Documento
                </span>
                <button 
                  onClick={() => setShowUploadForm(false)} 
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                    Categoria do Documento
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full text-xs py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#0E131E] text-stone-800 dark:text-stone-200"
                  >
                    <option value="contrato">Contrato Assinado</option>
                    <option value="minuta">Minuta / Rascunho</option>
                    <option value="vistoria">Laudo de Vistoria</option>
                    <option value="comprovante">Comprovante de Depósito / Pagamento</option>
                    <option value="aditivo">Termo Aditivo</option>
                    <option value="rescisao">Termo de Rescisão / Distrato</option>
                    <option value="apolice_seguro">Apólice de Seguro Fiança</option>
                  </select>
                </div>

                <div>
                  <label className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-500 rounded-xl p-2 flex items-center justify-center gap-2 cursor-pointer bg-white dark:bg-[#0E131E] transition">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-stone-600 dark:text-stone-300">
                      {isUploading ? 'Processando...' : 'Selecionar Arquivo'}
                    </span>
                    <input
                      type="file"
                      disabled={isUploading}
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.zip"
                      className="hidden"
                      onChange={handleNewFileUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden">
            {contract.files.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400">
                Nenhum arquivo anexado a este contrato.
              </div>
            ) : (
              contract.files.map((file) => {
                const isDoc = file.fileType === 'doc' || file.fileType === 'docx' || file.category === 'minuta';

                return (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between p-3.5 hover:bg-stone-50 dark:hover:bg-[#1E293B] transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0">
                        {getFileBadge(file.fileType)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-stone-400">
                          <span>{file.fileSize}</span>
                          <span>•</span>
                          <span className="capitalize">{file.category}</span>
                          <span>•</span>
                          <span>{formatDate(file.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Visualizar / Preview */}
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-[#00873E] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                        title="Visualizar Arquivo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Editar */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isDoc) {
                            setShowEditorModal(true);
                          } else {
                            setEditingFile(file);
                          }
                        }}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isDoc
                            ? 'text-stone-400 hover:text-[#00873E] hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            : 'text-stone-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40'
                        }`}
                        title={isDoc ? 'Editar Minuta no Editor Word' : 'Renomear / Substituir Arquivo'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Baixar */}
                      <a
                        href={file.dataUrl || file.url || '#'}
                        download={file.name}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition"
                        title="Baixar Arquivo"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      {/* Excluir */}
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                        title="Remover Arquivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Modal de Pré-visualização Universal de Arquivos (PDF, DOCX, Imagens, ZIP) */}
      <FilePreviewModal
        file={previewFile}
        contract={contract}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onOpenEditor={() => {
          setPreviewFile(null);
          setShowEditorModal(true);
        }}
        onReplaceFile={(f) => {
          setPreviewFile(null);
          setEditingFile(f);
        }}
      />

      {/* Modal de Edição & Substituição de Arquivo */}
      <EditFileModal
        file={editingFile}
        isOpen={!!editingFile}
        onClose={() => setEditingFile(null)}
        onSave={handleSaveEditedFile}
      />

      {/* Modal de Pré-visualização A4 e Edição In-App da Minuta */}
      <ContractDocumentEditorModal
        contract={contract}
        isOpen={showEditorModal}
        onClose={() => setShowEditorModal(false)}
        onSaveContract={async (updated) => {
          if (onUpdateContract) {
            await onUpdateContract(updated);
          }
        }}
      />
    </div>
  );
}
