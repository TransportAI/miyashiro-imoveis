'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Calendar, FileText, Upload } from 'lucide-react';
import { Contract } from '@/lib/types/contract';

interface FinalizeContractModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    contractId: string, 
    closedAt: string, 
    reason: string, 
    finalStatus: 'finalizado' | 'rescindido',
    closingFile?: import('@/lib/types/contract').ContractFile
  ) => void;
}

export default function FinalizeContractModal({
  contract,
  isOpen,
  onClose,
  onConfirm
}: FinalizeContractModalProps) {
  const [closedAt, setClosedAt] = useState<string>(new Date().toISOString().split('T')[0]);
  const [finalStatus, setFinalStatus] = useState<'finalizado' | 'rescindido'>('finalizado');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [closingFile, setClosingFile] = useState<import('@/lib/types/contract').ContractFile | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  if (!isOpen || !contract) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadingDoc(true);

    try {
      const { compressImageFile, formatBytes, getFileExtension } = await import('@/lib/media/fileCompressor');
      const result = await compressImageFile(file);
      const ext = getFileExtension(file.name);

      setClosingFile({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        fileType: ext,
        fileSize: formatBytes(result.compressedSize),
        category: 'rescisao',
        uploadedAt: new Date().toISOString(),
        dataUrl: result.dataUrl
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar documento.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closedAt || !reason.trim()) {
      alert('Por favor, informe a data de encerramento e o motivo detalhado.');
      return;
    }

    setIsSubmitting(true);
    try {
      onConfirm(contract.id, closedAt, reason.trim(), finalStatus, closingFile || undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#131926] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              finalStatus === 'finalizado' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#00873E]' 
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
            }`}>
              {finalStatus === 'finalizado' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white font-urbanist">
                Encerrar / Concluir Contrato
              </h3>
              <p className="text-xs text-stone-500">
                Código: <span className="font-mono font-semibold">{contract.code}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Imóvel */}
        <div className="my-4 p-3.5 rounded-2xl bg-stone-50 dark:bg-[#1A2234] border border-stone-200 dark:border-stone-700/80 text-xs">
          <p className="font-semibold text-stone-900 dark:text-white line-clamp-1">{contract.propertyTitle}</p>
          <p className="text-stone-500 mt-0.5">{contract.propertyAddress}</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Tipo de Encerramento */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-2">
              Tipo de Encerramento *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setFinalStatus('finalizado')}
                className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition cursor-pointer ${
                  finalStatus === 'finalizado'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                    : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 bg-stone-50/40 text-stone-700 dark:text-stone-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block text-xs">Conclusão Natural</span>
                  <span className="text-[10px] text-stone-500">Término de prazo ou venda concluída</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFinalStatus('rescindido')}
                className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition cursor-pointer ${
                  finalStatus === 'rescindido'
                    ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20'
                    : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 bg-stone-50/40 text-stone-700 dark:text-stone-300'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold block text-xs">Rescisão Antecipada</span>
                  <span className="text-[10px] text-stone-500">Distrato, quebra ou desistência</span>
                </div>
              </button>
            </div>
          </div>

          {/* Data de Encerramento */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Data Efetiva de Encerramento *
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={closedAt}
                onChange={(e) => setClosedAt(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#1A2234] text-stone-900 dark:text-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <Calendar className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Motivo detalhado */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Justificativa / Motivo do Encerramento *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Entrega das chaves realizada sem pendências após vistoria final. Caução devolvida integralmente."
              className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#1A2234] text-stone-900 dark:text-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Anexo de Termo de Rescisão / Quitação (Opcional) */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Termo de Encerramento / Vistoria de Saída (Opcional)
            </label>
            <label className="border-2 border-dashed border-stone-300 dark:border-stone-600 hover:border-emerald-500 rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer bg-stone-50 dark:bg-[#1A2234] transition text-center">
              {uploadingDoc ? (
                <span className="text-stone-400">Processando arquivo...</span>
              ) : closingFile ? (
                <div className="flex items-center gap-2 text-[#00873E] font-semibold">
                  <FileText className="w-4 h-4" />
                  <span>{closingFile.name} ({closingFile.fileSize})</span>
                </div>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-stone-400" />
                  <span className="font-semibold text-stone-600 dark:text-stone-300">
                    Anexar Termo de Quitação ou Distrato
                  </span>
                  <span className="text-[10px] text-stone-400">PDF, PNG ou JPG até 10MB</span>
                </>
              )}
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-xl text-white font-bold transition shadow-xs cursor-pointer ${
                finalStatus === 'finalizado'
                  ? 'bg-[#00873E] hover:bg-[#15803d]'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isSubmitting ? 'Processando...' : finalStatus === 'finalizado' ? 'Confirmar Conclusão' : 'Confirmar Rescisão'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
