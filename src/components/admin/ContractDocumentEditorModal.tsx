'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, Save, FileText, Download, Printer, Copy, Check, 
  RotateCcw, Eye, Edit3, Loader2, Bold, Italic, Underline, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Columns, Type, Scissors, PlusCircle
} from 'lucide-react';
import { Contract } from '@/lib/types/contract';
import { 
  generateContractText, 
  exportContractToDocx, 
  exportContractToPdfPrint, 
  exportContractToTxt 
} from '@/lib/documents/contractExporter';

interface ContractDocumentEditorModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveContract: (updatedContract: Contract) => Promise<void> | void;
}

type ViewMode = 'preview' | 'split' | 'editor';
type FontFamily = 'serif' | 'sans' | 'mono';
type TextAlign = 'justify' | 'left' | 'center' | 'right';

/**
 * Algoritmo de Paginação A4 Inteligente:
 * Divide o texto contratual em folhas A4 discretas com limites de altura calculados
 * para que o conteúdo quebre perfeitamente entre páginas, eliminando qualquer overflow.
 */
function paginateContractText(text: string, fontSizePt: number, lineSpacing: number): string[] {
  if (!text || text.trim().length === 0) return [''];

  // Quebras manuais prioritárias
  const manualSections = text.split(/---+\s*(?:QUEBRA DE P[AÁ]GINA|quebra-de-pagina|quebra)\s*---+/i);

  // Capacidade aproximada em linhas visuais por folha A4 (~1123px total)
  const scale = 12 / Math.max(9, fontSizePt);
  const maxLinesPage1 = Math.max(14, Math.floor(32 * scale * (1.5 / lineSpacing)));
  const maxLinesOther = Math.max(20, Math.floor(46 * scale * (1.5 / lineSpacing)));

  const finalPages: string[] = [];

  for (let s = 0; s < manualSections.length; s++) {
    const rawSection = manualSections[s].trim();
    if (!rawSection && s > 0) continue;

    const lines = rawSection.split('\n');
    let currentSheetLines: string[] = [];
    let currentWeight = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const visualWeight = Math.max(1, Math.ceil((line.length || 1) / 80));
      const targetMax = (finalPages.length === 0 && currentSheetLines.length === 0) ? maxLinesPage1 : maxLinesOther;

      if (currentWeight + visualWeight > targetMax && currentSheetLines.length > 0) {
        finalPages.push(currentSheetLines.join('\n'));
        currentSheetLines = [line];
        currentWeight = visualWeight;
      } else {
        currentSheetLines.push(line);
        currentWeight += visualWeight;
      }
    }

    if (currentSheetLines.length > 0) {
      finalPages.push(currentSheetLines.join('\n'));
    }
  }

  return finalPages.length > 0 ? finalPages : [''];
}

export default function ContractDocumentEditorModal({
  contract,
  isOpen,
  onClose,
  onSaveContract
}: ContractDocumentEditorModalProps) {
  const [content, setContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [copied, setCopied] = useState(false);

  // Controles de formatação visual do documento
  const [fontSizePt, setFontSizePt] = useState<number>(11);
  const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
  const [lineSpacing, setLineSpacing] = useState<number>(1.6);
  const [textAlign, setTextAlign] = useState<TextAlign>('justify');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inicializa com minuta salva ou gerada dinamicamente
  useEffect(() => {
    if (contract) {
      const initial = contract.minutaTexto && contract.minutaTexto.trim().length > 0
        ? contract.minutaTexto
        : generateContractText(contract);
      setContent(initial);
      setOriginalContent(initial);
    }
  }, [contract, isOpen]);

  // Se fechar ou não tiver contrato
  if (!isOpen || !contract) return null;

  const isLocacao = contract.modalidade === 'locacao_seguro_fianca' || (contract.type as string)?.includes('locacao');
  const isPermuta = contract.modalidade === 'permuta_imobiliaria';

  // Páginas A4 calculadas reativamente
  const sheets = useMemo(() => {
    return paginateContractText(content, fontSizePt, lineSpacing);
  }, [content, fontSizePt, lineSpacing]);

  // Salvar no estado global / backend
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedContract: Contract = {
        ...contract,
        minutaTexto: content,
        updatedAt: new Date().toISOString()
      };
      await onSaveContract(updatedContract);
    } finally {
      setIsSaving(false);
    }
  };

  // Copiar texto para o clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Restaurar texto padrão do sistema
  const handleResetToDefault = () => {
    if (confirm('Deseja realmente restaurar o texto gerado automaticamente com os dados do contrato? Quaisquer alterações manuais serão substituídas.')) {
      const defaultText = generateContractText({ ...contract, minutaTexto: undefined });
      setContent(defaultText);
    }
  };

  // Inserção de tags markdown / formatação rápida
  const wrapSelection = (before: string, after: string = before) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);
    const replacement = before + selected + after;
    const newContent = content.slice(0, start) + replacement + content.slice(end);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, end + before.length);
    }, 10);
  };

  // Inserir Quebra de Página Manual
  const insertPageBreak = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const breakTag = '\n\n--- QUEBRA DE PÁGINA ---\n\n';
    const newContent = content.slice(0, start) + breakTag + content.slice(start);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + breakTag.length, start + breakTag.length);
    }, 10);
  };

  // Inserir Nova Cláusula Padrão
  const insertNewClause = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const clauseText = `\n\nCLÁUSULA ADICIONAL - [TÍTULO DA CLÁUSULA]:\nAs partes acordam expressamente que [descrever as obrigações e condições convencionadas].\n`;
    const newContent = content.slice(0, start) + clauseText + content.slice(start);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + clauseText.length, start + clauseText.length);
    }, 10);
  };

  // Exportar DOCX
  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      await exportContractToDocx({ ...contract, minutaTexto: content });
    } catch (err) {
      console.error(err);
      alert('Erro ao exportar arquivo DOCX');
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Renderizar o preview formatado da página A4
  const renderFormattedSheetText = (rawSheetText: string) => {
    return rawSheetText.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-3" />;
      }

      const isHeading = trimmed.startsWith('CLÁUSULA') || 
                        trimmed.startsWith('CONTRATO') || 
                        trimmed.startsWith('INSTRUMENTO') || 
                        /^\d+\.\s+[A-Z\s]+/.test(trimmed) ||
                        trimmed.startsWith('================');

      if (trimmed.startsWith('================')) {
        return <div key={idx} className="border-b-2 border-stone-800 my-2" />;
      }

      // Processar **negrito** simples se presente
      const parts = line.split(/(\*\*[^*]+\*\*)/g);

      return (
        <p
          key={idx}
          className={`leading-relaxed ${
            isHeading ? 'font-bold uppercase tracking-wider text-stone-900 mt-3 mb-1 text-center font-sans' : 'text-stone-800'
          }`}
          style={{ 
            fontSize: `${isHeading ? fontSizePt + 1 : fontSizePt}pt`,
            lineHeight: lineSpacing,
            textAlign: isHeading ? 'center' : textAlign
          }}
        >
          {parts.map((p, i) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={i} className="font-bold text-stone-950">{p.slice(2, -2)}</strong>;
            }
            return p;
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-stone-100 dark:bg-[#0E131E] rounded-3xl max-w-7xl w-full flex flex-col h-[96vh] shadow-2xl border border-stone-300 dark:border-stone-800 overflow-hidden">
        
        {/* Top App Bar (Header Institucional & Ações Principais) */}
        <div className="px-5 py-3 bg-white dark:bg-[#131926] border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#00873E] flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800/40">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900 dark:text-white font-urbanist">
                  Editor de Minuta Contratual
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#00873E] border border-emerald-200 dark:border-emerald-800">
                  {contract.code}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                  {sheets.length} {sheets.length === 1 ? 'folha A4' : 'folhas A4'}
                </span>
              </div>
              <p className="text-xs text-stone-500 line-clamp-1">
                {contract.propertyTitle} • {contract.propertyAddress}
              </p>
            </div>
          </div>

          {/* Botões de Ação Direta */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Seletor de Modo de Exibição */}
            <div className="hidden lg:flex items-center bg-stone-100 dark:bg-stone-800/80 p-0.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  viewMode === 'editor' 
                    ? 'bg-white dark:bg-[#1A2234] text-stone-900 dark:text-white shadow-xs font-semibold' 
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Apenas Editor
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  viewMode === 'split' 
                    ? 'bg-white dark:bg-[#1A2234] text-stone-900 dark:text-white shadow-xs font-semibold' 
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Dividido (Lado a Lado)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  viewMode === 'preview' 
                    ? 'bg-white dark:bg-[#1A2234] text-stone-900 dark:text-white shadow-xs font-semibold' 
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Pré-visualização A4
              </button>
            </div>

            {/* Baixar TXT */}
            <button
              type="button"
              onClick={() => exportContractToTxt({ ...contract, minutaTexto: content })}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-medium transition cursor-pointer"
              title="Baixar arquivo de texto (.txt)"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">TXT</span>
            </button>

            {/* Imprimir / PDF Vetorial Nativo */}
            <button
              type="button"
              onClick={() => exportContractToPdfPrint({ ...contract, minutaTexto: content })}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-medium transition cursor-pointer"
              title="Gerar PDF Vetorial ou Imprimir direto"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>

            {/* Exportar DOCX Estruturado */}
            <button
              type="button"
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
              title="Exportar para Microsoft Word (.docx)"
            >
              {isExportingDocx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Exportar Word</span>
            </button>

            {/* Salvar Alterações */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#00873E] hover:bg-[#15803d] text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaving ? 'Salvando...' : 'Salvar Minuta'}</span>
            </button>

            {/* Fechar */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar de Formatação & Variáveis Dinâmicas */}
        <div className="px-5 py-2 bg-stone-50 dark:bg-[#101622] border-b border-stone-200 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          
          {/* Formatação de Texto */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => wrapSelection('**', '**')}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer font-bold"
              title="Negrito (**texto**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('*', '*')}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer italic"
              title="Itálico (*texto*)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('__', '__')}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer underline"
              title="Sublinhado (__texto__)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />

            {/* Inserir Quebra de Página A4 */}
            <button
              type="button"
              onClick={insertPageBreak}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1A2234] border border-stone-200 dark:border-stone-700 hover:border-emerald-500 text-stone-700 dark:text-stone-200 font-medium transition cursor-pointer text-[11px]"
              title="Forçar término da página atual e iniciar uma nova folha A4"
            >
              <Scissors className="w-3 h-3 text-[#00873E]" />
              <span>Quebra de Página</span>
            </button>

            {/* Inserir Cláusula Adicional */}
            <button
              type="button"
              onClick={insertNewClause}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1A2234] border border-stone-200 dark:border-stone-700 hover:border-emerald-500 text-stone-700 dark:text-stone-200 font-medium transition cursor-pointer text-[11px]"
              title="Inserir modelo de cláusula adicional preenchível"
            >
              <PlusCircle className="w-3 h-3 text-[#00873E]" />
              <span>+ Cláusula</span>
            </button>

            <span className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />

            {/* Tipografia da Folha */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-stone-400">Fonte:</span>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                className="bg-white dark:bg-[#1A2234] border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-0.5 text-stone-800 dark:text-stone-200 cursor-pointer focus:outline-none"
              >
                <option value="serif">Times / Serif (Clássico)</option>
                <option value="sans">Urbanist / Sans (Moderno)</option>
                <option value="mono">Courier / Mono (Auditoria)</option>
              </select>

              <span className="text-stone-400 ml-1">Tamanho:</span>
              <select
                value={fontSizePt}
                onChange={(e) => setFontSizePt(Number(e.target.value))}
                className="bg-white dark:bg-[#1A2234] border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-0.5 text-stone-800 dark:text-stone-200 cursor-pointer focus:outline-none"
              >
                <option value="9">9 pt</option>
                <option value="10">10 pt</option>
                <option value="11">11 pt (Padrão)</option>
                <option value="12">12 pt</option>
                <option value="13">13 pt</option>
              </select>

              <span className="text-stone-400 ml-1">Entrelinha:</span>
              <select
                value={lineSpacing}
                onChange={(e) => setLineSpacing(Number(e.target.value))}
                className="bg-white dark:bg-[#1A2234] border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-0.5 text-stone-800 dark:text-stone-200 cursor-pointer focus:outline-none"
              >
                <option value="1.3">1.3 (Compacto)</option>
                <option value="1.5">1.5</option>
                <option value="1.6">1.6 (Jurídico Padrão)</option>
                <option value="1.8">1.8 (Arejado)</option>
              </select>
            </div>
          </div>

          {/* Atalhos Rápidos & Utilitários */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition cursor-pointer text-[11px]"
              title="Copiar todo o texto"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1 text-stone-600 dark:text-stone-400 hover:text-amber-600 transition cursor-pointer text-[11px]"
              title="Resetar texto para a versão padrão gerada pelo sistema"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>
          </div>

        </div>

        {/* Workspace Central: Editor e Preview A4 */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* LADO ESQUERDO: TEXTAREA / EDITOR DE TEXTO BRUTO */}
          {(viewMode === 'editor' || viewMode === 'split') && (
            <div className={`flex flex-col bg-white dark:bg-[#131926] border-r border-stone-200 dark:border-stone-800 overflow-hidden ${
              viewMode === 'split' ? 'w-full lg:w-1/2' : 'w-full'
            }`}>
              <div className="px-4 py-2 bg-stone-50/70 dark:bg-[#182030] border-b border-stone-200 dark:border-stone-800 text-[11px] font-mono text-stone-500 flex items-center justify-between">
                <span>EDITOR DE TEXTO JURÍDICO (RAW)</span>
                <span>{content.length} caracteres • {content.split('\n').length} linhas</span>
              </div>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Insira ou edite os termos contratuais..."
                className="w-full flex-1 p-5 font-mono text-xs sm:text-[13px] leading-relaxed resize-none focus:outline-none text-stone-900 dark:text-stone-100 bg-transparent overflow-y-auto selection:bg-emerald-500/20"
                spellCheck={false}
              />
            </div>
          )}

          {/* LADO DIREITO: PREVIEW EM FOLHAS A4 COM ALGORITMO ANTI-OVERFLOW */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={`flex-1 bg-stone-300/60 dark:bg-[#0A0E17] overflow-y-auto p-4 sm:p-8 flex flex-col items-center gap-8 ${
              viewMode === 'preview' ? 'w-full' : 'w-full lg:w-1/2'
            }`}>
              
              {sheets.map((sheetText, idx) => {
                const isFirst = idx === 0;
                const pageNum = idx + 1;
                const totalPages = sheets.length;

                return (
                  <div
                    key={idx}
                    className="relative bg-white text-stone-900 w-full max-w-[780px] min-h-[1100px] p-10 sm:p-14 shadow-2xl rounded-sm border border-stone-300 font-serif leading-relaxed text-sm select-text flex flex-col justify-between"
                    style={{
                      fontFamily: fontFamily === 'serif' ? 'Times New Roman, Times, serif' : fontFamily === 'sans' ? 'Urbanist, -apple-system, sans-serif' : 'monospace',
                    }}
                  >
                    <div>
                      {/* Cabeçalho da Folha 1: Marca Miyashiro Imóveis Completa com Logo */}
                      {isFirst ? (
                        <div className="border-b-2 border-[#00873E] pb-4 mb-6 font-sans">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img
                                src="/images/brand/logo.png"
                                alt="Miyashiro Imóveis"
                                className="h-12 w-auto object-contain"
                              />
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black text-[#00873E] tracking-tight uppercase">
                                MIYASHIRO IMÓVEIS
                              </div>
                              <div className="text-[11px] font-bold text-stone-700">
                                CRECI 155957F • Excelência Imobiliária
                              </div>
                              <div className="text-[10px] text-stone-500">
                                Amparo - SP • Tel: (19) 3807-6744 • WhatsApp: (19) 99824-3434
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Cabeçalho Continuado das Folhas 2..N */
                        <div className="border-b border-stone-200 pb-2 mb-6 font-sans flex items-center justify-between text-[10px] text-stone-500">
                          <div className="flex items-center gap-2 font-semibold text-stone-700">
                            <img
                              src="/images/brand/logo.png"
                              alt="Miyashiro"
                              className="h-4 w-auto object-contain opacity-80"
                            />
                            <span>Miyashiro Imóveis • CRECI 155957F</span>
                          </div>
                          <div>
                            Contrato {contract.code} • Folha {pageNum} de {totalPages}
                          </div>
                        </div>
                      )}

                      {/* Conteúdo formatado da folha */}
                      <div className="space-y-1">
                        {renderFormattedSheetText(sheetText)}
                      </div>
                    </div>

                    {/* Rodapé Padronizado da Folha A4 */}
                    <div className="mt-8 pt-4 border-t border-stone-200 font-sans flex items-center justify-between text-[10px] text-stone-400">
                      <span>Documento gerado pelo Sistema Miyashiro Imóveis</span>
                      <span className="font-semibold text-stone-600">
                        Folha {pageNum} de {totalPages} • Cód: {contract.code}
                      </span>
                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
