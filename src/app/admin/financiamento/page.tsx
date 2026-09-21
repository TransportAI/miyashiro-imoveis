'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calculator, Percent, ShieldCheck, Landmark, Save, RotateCcw, 
  DollarSign, Calendar, Eye
} from 'lucide-react';
import { FinancingSettings, BankRate, defaultFinancingSettings } from '@/lib/types/financing';
import { showToast } from '@/components/Toast';

export default function AdminFinanciamentoPage() {
  const [settings, setSettings] = useState<FinancingSettings>(defaultFinancingSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'taxas' | 'regras' | 'bancos' | 'preview'>('taxas');

  // Preview state
  const [previewValue, setPreviewValue] = useState<number>(500000);
  const [previewDownPaymentPct, setPreviewDownPaymentPct] = useState<number>(20);
  const [previewTermYears, setPreviewTermYears] = useState<number>(30);
  const [previewSystem, setPreviewSystem] = useState<'SAC' | 'PRICE'>('SAC');
  const [previewBirthDate, setPreviewBirthDate] = useState<string>('1990-05-15');
  const [previewIncome, setPreviewIncome] = useState<number>(15000);

  // Load from API
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/financing/settings')
      .then((res) => res.json())
      .then((data: FinancingSettings) => {
        if (data && data.annualInterestRate) {
          setSettings(data);
          setPreviewDownPaymentPct(data.minDownPaymentPercent || 20);
          setPreviewSystem(data.defaultSystem || 'SAC');
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar configurações de financiamento:', err);
        showToast('Usando configurações locais de financiamento.', 'info');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/financing/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Configurações do simulador salvas com sucesso!', 'success');
      } else {
        throw new Error(data.error || 'Erro ao salvar');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erro ao salvar configurações.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Deseja restaurar as taxas e regras padrão de mercado imobiliário?')) {
      setSettings(defaultFinancingSettings);
      showToast('Configurações redefinidas para os padrões de mercado.', 'info');
    }
  };

  // Preview calculations
  const calculateAge = (dateStr: string): number => {
    if (!dateStr) return 30;
    const birth = new Date(dateStr);
    if (isNaN(birth.getTime())) return 30;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const userAge = calculateAge(previewBirthDate);
  const maxAllowedTerm = Math.max(5, Math.min(35, Math.floor(settings.maxAgePlusTerm - userAge)));
  const effectiveTerm = Math.min(previewTermYears, maxAllowedTerm);

  const previewDownPayment = (previewValue * previewDownPaymentPct) / 100;
  const previewLoan = previewValue - previewDownPayment;
  const previewMonths = effectiveTerm * 12;
  const monthlyRate = (settings.annualInterestRate / 100) / 12;
  const monthlyInsurance = (previewLoan * (settings.monthlyInsuranceRate / 100));
  const monthlyFee = settings.monthlyAdminFee;

  // SAC
  const sacAmortization = previewLoan / previewMonths;
  const sacFirst = sacAmortization + (previewLoan * monthlyRate) + monthlyInsurance + monthlyFee;
  const sacLast = sacAmortization + (sacAmortization * monthlyRate) + monthlyInsurance + monthlyFee;

  // Price
  const priceBase =
    (previewLoan * (monthlyRate * Math.pow(1 + monthlyRate, previewMonths))) /
    (Math.pow(1 + monthlyRate, previewMonths) - 1);
  const priceInstallment = priceBase + monthlyInsurance + monthlyFee;

  const currentFirstInstallment = previewSystem === 'SAC' ? sacFirst : priceInstallment;
  const maxAllowedInstallment = (previewIncome * settings.maxIncomeCommitmentPercent) / 100;

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-stone-500">
        <div className="w-8 h-8 border-2 border-[#00873E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Carregando parâmetros do simulador...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#00873E]/10 text-[#00873E] flex items-center justify-center border border-[#00873E]/20">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-900 font-urbanist">
                Gestão do Simulador de Financiamento
              </h1>
              <span className="bg-emerald-50 text-[#00873E] text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Módulo Ativo
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Defina taxas de juros, regras de crédito bancário e condições de bancos parceiros em Amparo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Restaurar parâmetros padrão"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Padrões de Mercado</span>
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#00873E] hover:bg-[#15803d] text-white text-xs font-bold flex items-center gap-2 transition shadow-sm hover:shadow active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Configurações</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-px">
        {[
          { id: 'taxas', label: '1. Condições de Juros & Taxas', icon: Percent },
          { id: 'regras', label: '2. Regras de Crédito & Limites', icon: ShieldCheck },
          { id: 'bancos', label: '3. Bancos Parceiros', icon: Landmark },
          { id: 'preview', label: '4. Teste em Tempo Real', icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold rounded-t-xl transition whitespace-nowrap cursor-pointer border-b-2 ${
                isActive
                  ? 'border-[#00873E] text-[#00873E] bg-emerald-50/50'
                  : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TAXAS & JUROS */}
      {activeTab === 'taxas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                  Taxa de Juros Base (% a.a.)
                </label>
                <Percent className="w-4 h-4 text-[#00873E]" />
              </div>
              <input
                type="number"
                step="0.01"
                min="5"
                max="25"
                value={settings.annualInterestRate}
                onChange={(e) =>
                  setSettings({ ...settings, annualInterestRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full text-2xl font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#00873E]"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Taxa anual média utilizada como referência do mercado imobiliário de Amparo.
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                  Seguros Habitacionais (MIP + DFI)
                </label>
                <ShieldCheck className="w-4 h-4 text-[#00873E]" />
              </div>
              <input
                type="number"
                step="0.005"
                min="0"
                max="1"
                value={settings.monthlyInsuranceRate}
                onChange={(e) =>
                  setSettings({ ...settings, monthlyInsuranceRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full text-2xl font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#00873E]"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Percentual mensal sobre o saldo devedor (% a.m.).
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                  Tarifa de Administração (R$/mês)
                </label>
                <DollarSign className="w-4 h-4 text-[#00873E]" />
              </div>
              <input
                type="number"
                step="1"
                min="0"
                max="150"
                value={settings.monthlyAdminFee}
                onChange={(e) =>
                  setSettings({ ...settings, monthlyAdminFee: parseFloat(e.target.value) || 0 })
                }
                className="w-full text-2xl font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#00873E]"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Custo fixo mensal de gestão cobrado pelos bancos (ex: Caixa cobra R$ 25,00).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REGRAS DE CRÉDITO */}
      {activeTab === 'regras' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                Comprometimento Máximo de Renda (BACEN)
              </label>
              <input
                type="number"
                step="1"
                min="20"
                max="40"
                value={settings.maxIncomeCommitmentPercent}
                onChange={(e) =>
                  setSettings({ ...settings, maxIncomeCommitmentPercent: parseFloat(e.target.value) || 30 })
                }
                className="w-full text-2xl font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#00873E]"
              />
              <p className="text-xs text-stone-500">
                Limite regulatório: máximo de 30% da renda bruta familiar.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                Idade + Prazo Limite (Seguro MIP / SUSEP)
              </label>
              <input
                type="number"
                step="0.5"
                min="70"
                max="85"
                value={settings.maxAgePlusTerm}
                onChange={(e) =>
                  setSettings({ ...settings, maxAgePlusTerm: parseFloat(e.target.value) || 80.5 })
                }
                className="w-full text-2xl font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#00873E]"
              />
              <p className="text-xs text-stone-500">
                Regra dos 80 anos e 6 meses para amortização do SFH.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BANCOS PARCEIROS */}
      {activeTab === 'bancos' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-6">
          <div className="space-y-3">
            {settings.bankRates.map((bank, index) => (
              <div
                key={bank.id}
                className="p-4 rounded-2xl border border-stone-200 hover:border-[#00873E] transition bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center font-urbanist font-bold text-xs text-stone-700 shrink-0">
                    {bank.bankCode}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={bank.bankName}
                      onChange={(e) => {
                        const updated = [...settings.bankRates];
                        updated[index].bankName = e.target.value;
                        setSettings({ ...settings, bankRates: updated });
                      }}
                      className="text-sm font-bold text-stone-900 bg-transparent border-b border-dashed border-stone-300 focus:border-[#00873E] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-[10px] text-stone-500 uppercase font-bold block">Taxa Anual (% a.a.)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={bank.annualRate}
                      onChange={(e) => {
                        const updated = [...settings.bankRates];
                        updated[index].annualRate = parseFloat(e.target.value) || 0;
                        setSettings({ ...settings, bankRates: updated });
                      }}
                      className="w-24 text-xs font-bold text-stone-800 bg-white border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-500 uppercase font-bold block">Prazo Máx.</label>
                    <input
                      type="number"
                      step="5"
                      value={bank.maxTermYears}
                      onChange={(e) => {
                        const updated = [...settings.bankRates];
                        updated[index].maxTermYears = parseInt(e.target.value) || 35;
                        setSettings({ ...settings, bankRates: updated });
                      }}
                      className="w-20 text-xs font-bold text-stone-800 bg-white border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PREVIEW */}
      {activeTab === 'preview' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Valor do Imóvel: {formatBRL(previewValue)}</label>
                <input
                  type="range"
                  min={150000}
                  max={3000000}
                  step={25000}
                  value={previewValue}
                  onChange={(e) => setPreviewValue(Number(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#00873E]"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-stone-700 block mb-1">Entrada ({previewDownPaymentPct}% = {formatBRL(previewDownPayment)})</span>
                <div className="flex gap-2">
                  {[20, 30, 40, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPreviewDownPaymentPct(pct)}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                        previewDownPaymentPct === pct
                          ? 'border-[#00873E] bg-emerald-50 text-[#00873E]'
                          : 'border-stone-200 bg-white text-stone-600'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-stone-900 text-white p-6 rounded-3xl space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs text-stone-400 block">Primeira Parcela Estimada ({previewSystem})</span>
                <p className="text-3xl font-bold font-urbanist text-white mt-1">
                  {formatBRL(currentFirstInstallment)}
                  <span className="text-xs font-normal text-stone-400">/mês</span>
                </p>
                {previewSystem === 'SAC' && (
                  <span className="text-xs text-stone-400 block mt-1">
                    Última parcela estimada: {formatBRL(sacLast)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
