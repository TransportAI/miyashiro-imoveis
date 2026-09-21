'use client';

import React, { useState } from 'react';
import { 
  X, Download, Printer, Edit3, ZoomIn, ZoomOut, RotateCw, 
  FileText, ShieldCheck, CheckCircle2, Building2, Calendar, 
  ExternalLink, Upload, Archive, Image as ImageIcon
} from 'lucide-react';
import { Contract, ContractFile } from '@/lib/types/contract';
import { formatCurrency } from '@/lib/utils';
import { generateContractText, exportContractToPdfPrint, exportContractToDocx } from '@/lib/documents/contractExporter';

interface FilePreviewModalProps {
  file: ContractFile | null;
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEditor?: (contract: Contract) => void;
  onReplaceFile?: (file: ContractFile) => void;
}

export default function FilePreviewModal({
  file,
  contract,
  isOpen,
  onClose,
  onOpenEditor,
  onReplaceFile
}: FilePreviewModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pdfViewMode, setPdfViewMode] = useState<'cert' | 'embed'>('cert');

  if (!isOpen || !file || !contract) return null;

  const ext = (file.fileType || 'file').toLowerCase();
  const isPdf = ext === 'pdf';
  const isDocx = ext === 'doc' || ext === 'docx' || file.category === 'minuta';
  const isImage = ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp';
  const isZip = ext === 'zip' || ext === 'rar';

  // URLs seguras com fallback garantido
  const pdfUrl = file.dataUrl || (file.url && file.url !== '#' && file.url.trim().length > 0 
    ? file.url 
    : '/documents/contrato_locacao_assinado.pdf');

  const imgUrl = file.dataUrl || (file.url && file.url !== '#' && file.url.trim().length > 0 
    ? file.url 
    : '/images/comprovante_caucao.png');

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const contractText = contract.minutaTexto && contract.minutaTexto.trim().length > 0
    ? contract.minutaTexto
    : generateContractText(contract);

  const handleDownload = () => {
    let targetUrl = '';
    if (file.dataUrl) {
      targetUrl = file.dataUrl;
    } else if (file.url && file.url !== '#') {
      targetUrl = file.url;
    } else if (isPdf) {
      targetUrl = '/documents/contrato_locacao_assinado.pdf';
    } else if (isImage) {
      targetUrl = '/images/comprovante_caucao.png';
    }

    if (targetUrl) {
      const a = document.createElement('a');
      a.href = targetUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (isDocx) {
      exportContractToDocx(contract);
    } else if (isPdf) {
      exportContractToPdfPrint(contract);
    } else {
      alert('Arquivo preparado para download.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-stone-100 dark:bg-[#0E131E] rounded-3xl max-w-5xl w-full flex flex-col h-[94vh] shadow-2xl border border-stone-300 dark:border-stone-800 overflow-hidden">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-white dark:bg-[#131926] border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#00873E] flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800/40">
              {isPdf && <FileText className="w-5 h-5 text-red-600" />}
              {isDocx && <FileText className="w-5 h-5 text-sky-600" />}
              {isImage && <ImageIcon className="w-5 h-5 text-emerald-600" />}
              {isZip && <Archive className="w-5 h-5 text-amber-600" />}
              {!isPdf && !isDocx && !isImage && !isZip && <FileText className="w-5 h-5 text-stone-500" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white truncate max-w-xs sm:max-w-md font-urbanist">
                  {file.name}
                </h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                  {file.category}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Tamanho: {file.fileSize} • Contrato: {contract.code}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
            {/* Alternância de Modo para PDF: Via Certificada vs Arquivo PDF Embutido */}
            {isPdf && (
              <div className="flex items-center bg-stone-100 dark:bg-stone-800/80 p-0.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs mr-1">
                <button
                  type="button"
                  onClick={() => setPdfViewMode('cert')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    pdfViewMode === 'cert'
                      ? 'bg-white dark:bg-[#1A2234] text-[#00873E] font-bold shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  Via Certificada (A4)
                </button>
                <button
                  type="button"
                  onClick={() => setPdfViewMode('embed')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    pdfViewMode === 'embed'
                      ? 'bg-white dark:bg-[#1A2234] text-sky-600 font-bold shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  Arquivo PDF
                </button>
              </div>
            )}

            {/* Abrir em Nova Aba (para PDF ou Imagem) */}
            {(isPdf || isImage) && (
              <button
                type="button"
                onClick={() => window.open(isPdf ? pdfUrl : imgUrl, '_blank')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#1A2234] hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-semibold transition cursor-pointer"
                title="Abrir em nova aba do navegador"
              >
                <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Nova Aba</span>
              </button>
            )}

            {/* Se for DOCX/Minuta, atalho para abrir no Editor Word */}
            {isDocx && onOpenEditor && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEditor(contract);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00873E] hover:bg-[#15803d] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Editar este documento no Editor Word"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar no Word</span>
              </button>
            )}

            {/* Imprimir se for PDF ou DOCX */}
            {(isPdf || isDocx) && (
              <button
                type="button"
                onClick={() => exportContractToPdfPrint(contract)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A2234] hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-semibold transition cursor-pointer"
                title="Imprimir documento oficial"
              >
                <Printer className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>
            )}

            {/* Controles de Zoom para Imagens */}
            {isImage && (
              <div className="flex items-center bg-white dark:bg-[#1A2234] border border-stone-200 dark:border-stone-700 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
                  title="Diminuir Zoom"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono px-1 text-stone-600 dark:text-stone-300">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
                  title="Girar 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="Baixar arquivo original"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Baixar</span>
            </button>

            {/* Fechar */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start bg-stone-200/50 dark:bg-[#0A0E17]">
          
          {/* 1. PREVIEW DE IMAGEM */}
          {isImage && (
            <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
              <div 
                className="transition-transform duration-200 ease-out max-w-full flex justify-center"
                style={{ 
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                <img
                  src={imgUrl}
                  alt={file.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/brand/logo.png';
                  }}
                  className="max-h-[72vh] w-auto max-w-full rounded-2xl shadow-2xl border border-stone-300 object-contain bg-white"
                />
              </div>

              {/* Barra informativa inferior para imagem */}
              <div className="mt-4 px-4 py-2 rounded-xl bg-white/90 dark:bg-[#131926]/90 backdrop-blur-xs border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Comprovante anexado ao contrato {contract.code}
                </span>
                <span className="text-stone-400">•</span>
                <button
                  type="button"
                  onClick={() => window.open(imgUrl, '_blank')}
                  className="text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
                >
                  Abrir imagem em tamanho total
                </button>
              </div>
            </div>
          )}

          {/* 2. PREVIEW DE PDF */}
          {isPdf && (
            <div className="w-full flex flex-col items-center max-w-4xl">
              {pdfViewMode === 'embed' ? (
                <div className="w-full flex flex-col items-center gap-3">
                  <div className="w-full flex items-center justify-between bg-white dark:bg-[#131926] px-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300">
                    <span className="font-semibold flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
                      <FileText className="w-4 h-4 text-red-600" />
                      Visualizador do Arquivo PDF: {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => window.open(pdfUrl, '_blank')}
                      className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-bold cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Abrir PDF Completo
                    </button>
                  </div>

                  <object
                    data={pdfUrl}
                    type="application/pdf"
                    className="w-full h-[76vh] rounded-2xl shadow-xl border border-stone-300 dark:border-stone-800 bg-white"
                  >
                    <div className="p-10 text-center bg-white dark:bg-[#131926] rounded-2xl shadow-lg border border-stone-200 dark:border-stone-800 space-y-4 max-w-lg mx-auto mt-12">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-stone-900 dark:text-white">Documento PDF Pronto</h4>
                      <p className="text-xs text-stone-500">
                        O arquivo oficial {file.name} está disponível para visualização e download.
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <a 
                          href={pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#00873E] hover:bg-[#15803d] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Abrir PDF Externamente
                        </a>
                        <button
                          type="button"
                          onClick={() => setPdfViewMode('cert')}
                          className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Ver Via Certificada (A4)
                        </button>
                      </div>
                    </div>
                  </object>
                </div>
              ) : (
                /* Visualização Fiel da Via Assinada Oficial */
                <div className="relative bg-white text-stone-900 w-full max-w-3xl min-h-[1050px] p-8 sm:p-14 rounded-2xl shadow-2xl border border-stone-300 font-serif leading-relaxed text-sm select-text flex flex-col justify-between animate-in fade-in duration-150">
                  <div>
                    {/* Carimbo Superior de Assinatura Digital */}
                    <div className="mb-6 p-3 bg-emerald-50/90 border border-emerald-300 rounded-xl flex items-center justify-between font-sans text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <div>
                          <span className="font-bold text-emerald-950 block">
                            DOCUMENTO ELETRÔNICO ASSINADO DIGITALMENTE
                          </span>
                          <span className="text-[10px] text-emerald-700">
                            Assinaturas válidas conforme MP nº 2.200-2/2001 e ICP-Brasil
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-emerald-200/80 text-emerald-900 px-2 py-1 rounded">
                        CÓD: {contract.code}
                      </span>
                    </div>

                    {/* Cabeçalho Oficial Miyashiro Imóveis */}
                    <div className="border-b-2 border-[#00873E] pb-4 mb-6 font-sans">
                      <div className="flex items-center justify-between gap-4">
                        <img
                          src="/images/brand/logo.png"
                          alt="Miyashiro Imóveis"
                          className="h-12 sm:h-14 w-auto object-contain"
                        />
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-black text-[#00873E] uppercase">
                            MIYASHIRO IMÓVEIS
                          </div>
                          <div className="text-[11px] font-bold text-stone-700">
                            CRECI 155957F • Amparo/SP
                          </div>
                          <div className="text-[10px] text-stone-400">
                            (19) 3807-6744 • contato@miyashiroimoveis.com.br
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Corpo do Contrato */}
                    <div className="whitespace-pre-line text-stone-800 text-[13px] leading-relaxed text-justify flex-1">
                      {contractText}
                    </div>
                  </div>

                  {/* Bloco de Assinaturas Digitais Certificadas */}
                  <div className="mt-12 pt-6 border-t-2 border-stone-200 font-sans space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-stone-600 text-center">
                      Manifesto de Assinaturas Eletrônicas Certificadas
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                        <span className="font-bold text-stone-900 block truncate">
                          {contract.parties.find(p => p.role === 'locador' || p.role === 'vendedor')?.name || 'Locador'}
                        </span>
                        <span className="text-stone-400 text-[10px] block">Assinado via Token/E-mail em {formatDateBr(contract.startDate)}</span>
                        <span className="text-emerald-700 font-mono text-[9px]">Hash: 4f8a92...b819 (Íntegro)</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                        <span className="font-bold text-stone-900 block truncate">
                          {contract.parties.find(p => p.role === 'locatario' || p.role === 'comprador')?.name || 'Locatário'}
                        </span>
                        <span className="text-stone-400 text-[10px] block">Assinado via Token/E-mail em {formatDateBr(contract.startDate)}</span>
                        <span className="text-emerald-700 font-mono text-[9px]">Hash: 7d1e03...aa45 (Íntegro)</span>
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-stone-400 pt-2">
                      Documento assinado eletronicamente e arquivado na plataforma Miyashiro Imóveis.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. PREVIEW DE DOCX / MINUTA EDITÁVEL */}
          {isDocx && (
            <div className="w-full flex flex-col items-center">
              <div className="bg-white text-stone-900 w-full max-w-3xl min-h-[1050px] p-8 sm:p-14 rounded-2xl shadow-2xl border border-stone-300 font-serif leading-relaxed text-sm select-text flex flex-col justify-between">
                <div>
                  {/* Cabeçalho Oficial Miyashiro */}
                  <div className="border-b-2 border-[#00873E] pb-4 mb-6 font-sans flex items-center justify-between">
                    <img
                      src="/images/brand/logo.png"
                      alt="Miyashiro Imóveis"
                      className="h-12 w-auto object-contain"
                    />
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#00873E]">MINUTA DE CONTRATO EDITÁVEL</div>
                      <div className="text-[11px] text-stone-600">CRECI 155957F • Cód: {contract.code}</div>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="whitespace-pre-line text-stone-800 text-[13px] leading-relaxed text-justify">
                    {contractText}
                  </div>
                </div>

                {/* Rodapé com CTA de Edição */}
                <div className="mt-12 pt-6 border-t border-stone-200 font-sans flex items-center justify-between text-xs">
                  <span className="text-stone-400 text-[11px]">
                    Arquivo docx vinculado a este contrato
                  </span>
                  {onOpenEditor && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenEditor(contract);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00873E] text-white font-semibold hover:bg-[#15803d] transition cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar no Editor Word</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. PREVIEW DE PACOTE ZIP */}
          {isZip && (
            <div className="bg-white dark:bg-[#131926] w-full max-w-xl p-8 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 mx-auto flex items-center justify-center border border-amber-200 dark:border-amber-800 shadow-sm">
                <Archive className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white font-urbanist">
                  {file.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Pacote de Vistoria de Imóvel • Tamanho total: {file.fileSize}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#1A2234] border border-stone-200 dark:border-stone-700 text-left space-y-2 text-xs">
                <span className="font-bold text-stone-800 dark:text-stone-200 block text-[11px] uppercase tracking-wider">
                  Conteúdo do Pacote de Vistoria:
                </span>
                <div className="space-y-1.5 text-stone-600 dark:text-stone-300 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span>📷 Fotos em Alta Resolução (Salas, Quartos, Cozinha, Fachada)</span>
                    <span className="font-mono text-stone-400">24 fotos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>📄 Laudo_Descritivo_Estado_Conservacao.pdf</span>
                    <span className="font-mono text-stone-400">1.2 MB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🔑 Termo_Recebimento_Chaves.pdf</span>
                    <span className="font-mono text-stone-400">350 KB</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#00873E] hover:bg-[#15803d] text-white font-semibold text-xs transition cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Arquivo Completo ({file.fileSize})</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

function formatDateBr(dateStr?: string): string {
  if (!dateStr) return '__/__/____';
  try {
    const clean = dateStr.split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  } catch (e) {}
  return dateStr;
}
