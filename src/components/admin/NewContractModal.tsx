'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Building2, Calendar, DollarSign, User, ShieldCheck, 
  ArrowLeftRight, FileText, CheckCircle2, Upload, Briefcase, Home
} from 'lucide-react';
import { Contract, ContractModalidade, ContractStatus, ContractParty, ContractFile } from '@/lib/types/contract';
import { compressImageFile, formatBytes, getFileExtension } from '@/lib/media/fileCompressor';
import propertiesData from '@/data/properties.json';
import { Property, Corretor } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newContract: Contract) => void;
  initialPropertyId?: string;
}

export default function NewContractModal({
  isOpen,
  onClose,
  onSuccess,
  initialPropertyId
}: NewContractModalProps) {
  const [properties, setProperties] = useState<Property[]>(propertiesData as Property[]);
  const [selectedPropId, setSelectedPropId] = useState<string>(initialPropertyId || '');
  const [modalidade, setModalidade] = useState<ContractModalidade>('locacao_seguro_fianca');
  const [status, setStatus] = useState<ContractStatus>('rascunho');

  // Prazos
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>('');
  const [renewalAuto, setRenewalAuto] = useState<boolean>(true);

  // 1. Locação com Seguro Fiança (Regra exclusiva)
  const [monthlyRent, setMonthlyRent] = useState<string>('');
  const [paymentDay, setPaymentDay] = useState<number>(10);
  const [readjustmentIndex, setReadjustmentIndex] = useState<'IPCA' | 'IGPM' | 'INPC'>('IPCA');
  const [seguradoraNome, setSeguradoraNome] = useState<string>('Porto Seguro Fiança Locatícia');
  const [numeroApolice, setNumeroApolice] = useState<string>('');
  const [taxaAdmin, setTaxaAdmin] = useState<number>(10);

  // 2. Permuta Imobiliária
  const [imovelSegundoDescricao, setImovelSegundoDescricao] = useState<string>('');
  const [valorImovel1, setValorImovel1] = useState<string>('');
  const [valorImovel2, setValorImovel2] = useState<string>('');
  const [possuiTorna, setPossuiTorna] = useState<boolean>(false);
  const [valorTorna, setValorTorna] = useState<string>('');
  const [pagadorTorna, setPagadorTorna] = useState<'permutante_1' | 'permutante_2'>('permutante_2');
  const [condicoesTorna, setCondicoesTorna] = useState<string>('');

  // 3. Venda e Compra Tradicional
  const [totalSaleValue, setTotalSaleValue] = useState<string>('');
  const [sinalEntrada, setSinalEntrada] = useState<string>('');
  const [saldoFinanciamento, setSaldoFinanciamento] = useState<string>('');
  const [bancoFinanciamento, setBancoFinanciamento] = useState<string>('Caixa Econômica Federal');

  // Partes
  const [ownerName, setOwnerName] = useState<string>('');
  const [ownerDoc, setOwnerDoc] = useState<string>('');
  const [ownerRg, setOwnerRg] = useState<string>('');
  const [ownerPhone, setOwnerPhone] = useState<string>('');

  const [clientName, setClientName] = useState<string>('');
  const [clientDoc, setClientDoc] = useState<string>('');
  const [clientRg, setClientRg] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');

  // Corretor
  const [corretorId, setCorretorId] = useState<string>('');
  const [brokerName, setBrokerName] = useState<string>('S. Miyashiro (CRECI 155957F)');
  const [corretoresList, setCorretoresList] = useState<Corretor[]>([]);

  // Arquivos
  const [uploadedFiles, setUploadedFiles] = useState<ContractFile[]>([]);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setProperties(data);
      })
      .catch(() => {});

    fetch('/api/corretores')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCorretoresList(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialPropertyId) {
      setSelectedPropId(initialPropertyId);
    } else if (properties.length > 0 && !selectedPropId) {
      setSelectedPropId(properties[0].id);
    }
  }, [initialPropertyId, properties]);

  // Preenchimento de valores padrão de acordo com o imóvel e modalidade
  useEffect(() => {
    const prop = properties.find(p => p.id === selectedPropId);
    if (!prop) return;

    if (prop.purpose === 'aluguel') {
      setModalidade('locacao_seguro_fianca');
      setMonthlyRent(String(prop.price || ''));
      const d = new Date();
      d.setMonth(d.getMonth() + 30); // 30 meses padrão
      setEndDate(d.toISOString().split('T')[0]);
    } else {
      setModalidade('venda_compra');
      setTotalSaleValue(String(prop.price || ''));
      setValorImovel1(String(prop.price || ''));
      setSinalEntrada(String(Math.round((prop.price || 0) * 0.2)));
      const d = new Date();
      d.setDate(d.getDate() + 60); // 60 dias para escritura
      setEndDate(d.toISOString().split('T')[0]);
    }
  }, [selectedPropId, properties]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    const newFiles: ContractFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await compressImageFile(file);
        const ext = getFileExtension(file.name);
        newFiles.push({
          id: `f-${Date.now()}-${i}`,
          name: result.name,
          fileType: ext,
          fileSize: formatBytes(result.compressedSize),
          category: 'contrato',
          uploadedAt: new Date().toISOString(),
          dataUrl: result.dataUrl,
          url: '#'
        });
      } catch (err) {
        console.error(err);
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsCompressing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prop = properties.find(p => p.id === selectedPropId);
    if (!prop) {
      alert('Selecione um imóvel válido.');
      return;
    }

    if (!startDate || !endDate) {
      alert('Informe as datas de início e término.');
      return;
    }

    setIsSubmitting(true);

    const parties: ContractParty[] = [
      {
        role: modalidade === 'locacao_seguro_fianca' ? 'locador' : modalidade === 'permuta_imobiliaria' ? 'permutante_1' : 'vendedor',
        name: ownerName || 'Proprietário Não Informado',
        email: 'proprietario@email.com',
        phone: ownerPhone || '(19) 99876-0000',
        documentNumber: ownerDoc || '000.000.000-00',
        rg: ownerRg || undefined
      },
      {
        role: modalidade === 'locacao_seguro_fianca' ? 'locatario' : modalidade === 'permuta_imobiliaria' ? 'permutante_2' : 'comprador',
        name: clientName || 'Cliente Adquirente',
        email: 'cliente@email.com',
        phone: clientPhone || '(19) 98765-1111',
        documentNumber: clientDoc || '000.000.000-00',
        rg: clientRg || undefined
      },
      {
        role: 'corretor',
        name: brokerName || 'Equipe Miyashiro Imóveis',
        email: 'contato@miyashiroimoveis.com.br',
        phone: '(19) 3807-6744',
        documentNumber: 'CRECI 155957F'
      }
    ];

    if (modalidade === 'locacao_seguro_fianca') {
      parties.push({
        role: 'seguradora',
        name: seguradoraNome,
        documentNumber: numeroApolice || 'Apólice a Emitir'
      });
    }

    const newContract: Contract = {
      id: `ctr-${Date.now()}`,
      code: `CTR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      propertyId: prop.id,
      propertyTitle: prop.title,
      propertyAddress: `${prop.address.street}, ${prop.address.neighborhood} - ${prop.address.city}/${prop.address.state}`,
      propertyCoverImage: prop.images && prop.images.length > 0 ? prop.images[0] : undefined,
      modalidade,
      type: modalidade,
      status,
      startDate,
      endDate,
      renewalAuto,
      financial: {
        monthlyRent: modalidade === 'locacao_seguro_fianca' ? Number(monthlyRent) || 0 : undefined,
        paymentDay: modalidade === 'locacao_seguro_fianca' ? Number(paymentDay) : undefined,
        readjustmentIndex: modalidade === 'locacao_seguro_fianca' ? readjustmentIndex : undefined,
        taxaAdministracaoPercentual: modalidade === 'locacao_seguro_fianca' ? taxaAdmin : undefined,
        guaranteeType: 'seguro_fianca',
        seguroFiancaDetails: modalidade === 'locacao_seguro_fianca' ? {
          seguradoraNome,
          numeroApolice: numeroApolice || undefined
        } : undefined,

        permutaDetails: modalidade === 'permuta_imobiliaria' ? {
          imovelSegundoDescricao,
          valorImovel1: Number(valorImovel1) || 0,
          valorImovel2: Number(valorImovel2) || 0,
          possuiTorna,
          valorTorna: possuiTorna ? Number(valorTorna) || 0 : undefined,
          pagadorTorna: possuiTorna ? pagadorTorna : undefined,
          condicoesTorna: possuiTorna ? condicoesTorna : undefined
        } : undefined,

        totalSaleValue: modalidade === 'venda_compra' ? Number(totalSaleValue) || 0 : undefined,
        sinalEntrada: modalidade === 'venda_compra' ? Number(sinalEntrada) || 0 : undefined,
        saldoFinanciamento: modalidade === 'venda_compra' ? Number(saldoFinanciamento) || 0 : undefined,
        bancoFinanciamento: modalidade === 'venda_compra' ? bancoFinanciamento : undefined
      },
      parties,
      corretorId: corretorId || undefined,
      corretorNome: brokerName,
      files: uploadedFiles,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContract)
      });
      if (res.ok) {
        onSuccess(newContract);
        onClose();
      } else {
        alert('Falha ao salvar o contrato na API.');
      }
    } catch (err) {
      console.error(err);
      onSuccess(newContract);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl lg:max-w-6xl w-full p-6 sm:p-10 shadow-2xl border border-stone-200 animate-in fade-in duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00873E] flex items-center justify-center border border-emerald-100 shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900 font-urbanist">
                Novo Contrato Imobiliário
              </h3>
              <p className="text-xs text-stone-500">
                Elaboração de minutas executivas com Seguro Fiança Exclusivo, Permuta com/sem Torna ou Compra e Venda
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-5 text-xs">
          
          {/* Modalidade, Imóvel & Status em 3 Colunas Ampliadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                Modalidade Contratual *
              </label>
              <select
                value={modalidade}
                onChange={(e) => setModalidade(e.target.value as ContractModalidade)}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-200 bg-stone-50 font-semibold text-stone-900 focus:bg-white transition"
              >
                <option value="locacao_seguro_fianca">Locação c/ Seguro Fiança (Padrão Miyashiro)</option>
                <option value="permuta_imobiliaria">Permuta de Imóveis (c/ ou s/ torna)</option>
                <option value="venda_compra">Venda e Compra Tradicional</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                Vincular ao Imóvel do Catálogo *
              </label>
              <select
                value={selectedPropId}
                onChange={(e) => setSelectedPropId(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:bg-white transition"
                required
              >
                {properties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.purpose.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                Status Inicial da Minuta *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContractStatus)}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-200 bg-stone-50 font-semibold text-stone-900 focus:bg-white transition"
              >
                <option value="rascunho">Rascunho</option>
                <option value="em_revisao">Em Revisão</option>
                <option value="ativo">Ativo / Vigente</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
          </div>

          {/* Prazos & Vigência */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <h4 className="font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5 font-urbanist">
              <Calendar className="w-4 h-4 text-[#00873E]" />
              Prazos & Vigência
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block font-medium text-stone-600 mb-1">Data de Início *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-600 mb-1">Data de Término / Vencimento *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white text-stone-900"
                />
              </div>

              <div className="py-2.5 px-3 rounded-xl border border-stone-200 bg-white flex items-center gap-2">
                <input
                  type="checkbox"
                  id="renewalAuto"
                  checked={renewalAuto}
                  onChange={(e) => setRenewalAuto(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00873E] border-stone-300 cursor-pointer"
                />
                <label htmlFor="renewalAuto" className="text-stone-700 font-medium cursor-pointer select-none">
                  Renovação Automática
                </label>
              </div>
            </div>
          </div>

          {/* CAMPOS CONDICIONAIS DE ACORDO COM A MODALIDADE */}
          
          {/* 1. SEGURO FIANÇA EXCLUSIVO */}
          {modalidade === 'locacao_seguro_fianca' && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 font-urbanist">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Regra Exclusiva: Locação com Seguro Fiança
                </h4>
                <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                  Sem Fiador / Sem Caução
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Aluguel Mensal (R$) *</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white font-semibold text-[#00873E]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Dia do Vencimento *</label>
                  <select
                    value={paymentDay}
                    onChange={(e) => setPaymentDay(Number(e.target.value))}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white"
                  >
                    {[1, 5, 10, 15, 20, 25, 28].map(d => (
                      <option key={d} value={d}>Todo dia {String(d).padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Índice Reajuste *</label>
                  <select
                    value={readjustmentIndex}
                    onChange={(e) => setReadjustmentIndex(e.target.value as any)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="IPCA">IPCA (Recomendado)</option>
                    <option value="IGPM">IGP-M (FGV)</option>
                    <option value="INPC">INPC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Seguradora Parceira Credenciada *</label>
                  <select
                    value={seguradoraNome}
                    onChange={(e) => setSeguradoraNome(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white font-medium"
                  >
                    <option value="Porto Seguro Fiança Locatícia">Porto Seguro Fiança Locatícia</option>
                    <option value="Too Seguros">Too Seguros</option>
                    <option value="Tokio Marine Seguradora">Tokio Marine Seguradora</option>
                    <option value="Pottencial Seguradora">Pottencial Seguradora</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Nº Apólice / Proposta Aprovada</label>
                  <input
                    type="text"
                    placeholder="Ex: 01.071.823.0001"
                    value={numeroApolice}
                    onChange={(e) => setNumeroApolice(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. PERMUTA IMOBILIÁRIA */}
          {modalidade === 'permuta_imobiliaria' && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5 font-urbanist">
                  <ArrowLeftRight className="w-4 h-4 text-amber-600" />
                  Contrato de Permuta de Imóveis
                </h4>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  Com ou Sem Torna
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Valor Atribuído ao Imóvel 1 (R$) *</label>
                  <input
                    type="number"
                    required
                    placeholder="500000"
                    value={valorImovel1}
                    onChange={(e) => setValorImovel1(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Valor Atribuído ao Imóvel 2 (R$) *</label>
                  <input
                    type="number"
                    required
                    placeholder="450000"
                    value={valorImovel2}
                    onChange={(e) => setValorImovel2(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Descrição do Segundo Imóvel Entregue na Permuta *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Apartamento nº 42 do Edifício Central, situado na Av. Independência, Centro, Amparo/SP..."
                  value={imovelSegundoDescricao}
                  onChange={(e) => setImovelSegundoDescricao(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              {/* Cláusula de Torna */}
              <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={possuiTorna}
                    onChange={(e) => setPossuiTorna(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                  <span className="font-semibold text-stone-800">Esta permuta possui Torna (diferença em dinheiro)?</span>
                </label>

                {possuiTorna && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-medium text-stone-600 mb-1">Valor da Torna (R$) *</label>
                      <input
                        type="number"
                        placeholder="50000"
                        value={valorTorna}
                        onChange={(e) => setValorTorna(e.target.value)}
                        className="w-full py-1.5 px-3 rounded-lg border border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-stone-600 mb-1">Quem pagará a Torna?</label>
                      <select
                        value={pagadorTorna}
                        onChange={(e) => setPagadorTorna(e.target.value as any)}
                        className="w-full py-1.5 px-3 rounded-lg border border-stone-200"
                      >
                        <option value="permutante_2">Segundo Permutante (Comprador/Permutante)</option>
                        <option value="permutante_1">Primeiro Permutante (Proprietário Inicial)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. VENDA E COMPRA TRADICIONAL */}
          {modalidade === 'venda_compra' && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
              <h4 className="font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5 font-urbanist">
                <DollarSign className="w-4 h-4 text-[#00873E]" />
                Condições de Compra e Venda
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Valor Total da Venda (R$) *</label>
                  <input
                    type="number"
                    required
                    placeholder="650000"
                    value={totalSaleValue}
                    onChange={(e) => setTotalSaleValue(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white font-semibold text-[#00873E]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Sinal / Entrada (R$)</label>
                  <input
                    type="number"
                    placeholder="130000"
                    value={sinalEntrada}
                    onChange={(e) => setSinalEntrada(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Saldo Financiado (R$)</label>
                  <input
                    type="number"
                    placeholder="520000"
                    value={saldoFinanciamento}
                    onChange={(e) => setSaldoFinanciamento(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Instituição Financeira</label>
                  <input
                    type="text"
                    placeholder="Ex: Caixa Econômica Federal"
                    value={bancoFinanciamento}
                    onChange={(e) => setBancoFinanciamento(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Partes Envolvidas */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5 font-urbanist">
              <User className="w-4 h-4 text-sky-600" />
              Partes Contratantes
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Locador / Vendedor / Permutante 1 */}
              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/80 space-y-2.5 shadow-2xs">
                <span className="font-bold text-stone-800 uppercase text-[11px] block">
                  {modalidade === 'locacao_seguro_fianca' ? 'Locador (Proprietário)' : modalidade === 'permuta_imobiliaria' ? 'Primeiro Permutante' : 'Vendedor'}
                </span>
                <input
                  type="text"
                  required
                  placeholder="Nome completo *"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white text-stone-900"
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="CPF / CNPJ"
                    value={ownerDoc}
                    onChange={(e) => setOwnerDoc(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white text-stone-900"
                  />
                  <input
                    type="text"
                    placeholder="RG"
                    value={ownerRg}
                    onChange={(e) => setOwnerRg(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white text-stone-900"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Telefone / WhatsApp"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white text-stone-900"
                />
              </div>

              {/* Locatário / Comprador / Permutante 2 */}
              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/80 space-y-2.5 shadow-2xs">
                <span className="font-bold text-stone-800 uppercase text-[11px] block">
                  {modalidade === 'locacao_seguro_fianca' ? 'Locatário (Inquilino)' : modalidade === 'permuta_imobiliaria' ? 'Segundo Permutante' : 'Comprador'}
                </span>
                <input
                  type="text"
                  required
                  placeholder="Nome completo *"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white text-stone-900"
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="CPF"
                    value={clientDoc}
                    onChange={(e) => setClientDoc(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white text-stone-900"
                  />
                  <input
                    type="text"
                    placeholder="RG"
                    value={clientRg}
                    onChange={(e) => setClientRg(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white text-stone-900"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Telefone / WhatsApp"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white text-stone-900"
                />
              </div>

              {/* Corretor Responsável */}
              <div className="sm:col-span-2 p-3.5 rounded-2xl border border-stone-200 bg-stone-50 space-y-2">
                <span className="font-bold text-stone-800 uppercase text-[11px] block">
                  Corretor Responsável
                </span>
                <select
                  value={corretorId}
                  onChange={(e) => {
                    setCorretorId(e.target.value);
                    const found = corretoresList.find(c => c.id === e.target.value);
                    if (found) setBrokerName(found.nome);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white"
                >
                  <option value="">Equipe Central Miyashiro Imóveis (CRECI 155957F)</option>
                  {corretoresList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.creci}) - {c.whatsapp}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Anexos com compressão compulsória */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-800">Documentos e Vistorias (Opcional)</span>
              <label className="inline-flex items-center gap-1 text-[11px] text-[#00873E] font-semibold cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{isCompressing ? 'Compactando...' : 'Anexar Documento'}</span>
                <input type="file" multiple onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map(f => (
                  <span key={f.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 text-[11px] text-stone-700">
                    <FileText className="w-3.5 h-3.5 text-stone-500" />
                    <span className="truncate max-w-[150px]">{f.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#00873E] hover:bg-[#15803d] text-white font-semibold shadow-md shadow-[#00873E]/20 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Gerando Minuta...' : 'Criar Contrato'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
