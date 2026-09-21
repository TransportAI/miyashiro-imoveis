'use client';

import React, { useState } from 'react';
import { 
  X, Save, Upload, FileText, CheckCircle2, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
import { ContractFile } from '@/lib/types/contract';
import { compressImageFile, formatBytes, getFileExtension } from '@/lib/media/fileCompressor';

interface EditFileModalProps {
  file: ContractFile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedFile: ContractFile) => Promise<void> | void;
}

export default function EditFileModal({
  file,
  isOpen,
  onClose,
  onSave
}: EditFileModalProps) {
  const [fileName, setFileName] = useState<string>('');
  const [category, setCategory] = useState<ContractFile['category']>('contrato');
  const [newUploadedFile, setNewUploadedFile] = useState<{
    dataUrl?: string;
    fileSize: string;
    fileType: ContractFile['fileType'];
    rawName: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  React.useEffect(() => {
    if (file) {
      setFileName(file.name);
      setCategory(file.category);
      setNewUploadedFile(null);
    }
  }, [file, isOpen]);

  if (!isOpen || !file) return null;

  const handleFileReplacement = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const selected = files[0];
    setIsProcessing(true);

    try {
      const result = await compressImageFile(selected);
      const ext = getFileExtension(selected.name);

      setNewUploadedFile({
        dataUrl: result.dataUrl,
        fileSize: formatBytes(result.compressedSize),
        fileType: ext,
        rawName: selected.name
      });
      // Sugere atualizar o nome com o novo arquivo se o usuário desejar
      setFileName(selected.name);
    } catch (err) {
      console.error(err);
      alert('Erro ao processar o novo arquivo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    setIsSaving(true);
    try {
      const updated: ContractFile = {
        ...file,
        name: fileName.trim(),
        category,
        uploadedAt: newUploadedFile ? new Date().toISOString() : file.uploadedAt,
        fileSize: newUploadedFile ? newUploadedFile.fileSize : file.fileSize,
        fileType: newUploadedFile ? newUploadedFile.fileType : file.fileType,
        dataUrl: newUploadedFile ? newUploadedFile.dataUrl : file.dataUrl
      };

      await onSave(updated);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar as alterações do arquivo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#131926] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 dark:border-stone-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#00873E] flex items-center justify-center border border-emerald-100 dark:border-emerald-800/40">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white font-urbanist">
                Gerenciar & Editar Arquivo
              </h3>
              <p className="text-xs text-stone-500">
                Renomeie, altere categoria ou envie uma nova versão do documento
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

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          
          {/* Nome do Arquivo */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Nome do Documento *
            </label>
            <input
              type="text"
              required
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#1A2234] text-stone-900 dark:text-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              placeholder="Ex: Contrato_Locacao_Assinado_Atualizado.pdf"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Categoria do Arquivo *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#1A2234] text-stone-900 dark:text-white focus:bg-white focus:outline-none cursor-pointer font-medium"
            >
              <option value="contrato">Contrato (Via Oficial Assinada)</option>
              <option value="minuta">Minuta / Rascunho de Contrato</option>
              <option value="vistoria">Vistoria (Entrada ou Saída)</option>
              <option value="aditivo">Termo Aditivo de Contrato</option>
              <option value="comprovante">Comprovante de Pagamento / Depósito</option>
              <option value="rescisao">Termo de Rescisão / Distrato</option>
              <option value="apolice_seguro">Apólice de Seguro Fiança</option>
              <option value="garantia_fiador">Documento de Garantia</option>
            </select>
          </div>

          {/* Substituir Arquivo / Nova Versão */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#1A2234]/70 border border-stone-200 dark:border-stone-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                Substituir por Nova Versão
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {file.fileSize} original
              </span>
            </div>

            <label className="border-2 border-dashed border-stone-300 dark:border-stone-600 hover:border-emerald-500 rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer bg-white dark:bg-[#131926] transition text-center">
              {isProcessing ? (
                <div className="flex items-center gap-2 text-stone-500 py-1">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Comprimindo e processando nova versão...</span>
                </div>
              ) : newUploadedFile ? (
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 py-1 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Novo arquivo anexado ({newUploadedFile.fileSize})</span>
                </div>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-emerald-600 mb-0.5" />
                  <span className="font-semibold text-stone-700 dark:text-stone-200">
                    Clique para selecionar um novo arquivo
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Substitui o arquivo atual mantendo o histórico de controle
                  </span>
                </>
              )}
              <input
                type="file"
                disabled={isProcessing}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.zip"
                className="hidden"
                onChange={handleFileReplacement}
              />
            </label>
          </div>

          {/* Botões de Ação */}
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
              disabled={isSaving || isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00873E] hover:bg-[#15803d] text-white font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
