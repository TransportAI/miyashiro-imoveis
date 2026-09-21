"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Calculator, MessageCircle, AlertCircle, Calendar, 
  DollarSign, CheckCircle2, Landmark, Info 
} from "lucide-react";
import { FinancingSettings, defaultFinancingSettings, BankRate } from "@/lib/types/financing";

export default function MortgageCalculator({ defaultPrice = 500000 }: { defaultPrice?: number }) {
  const [settings, setSettings] = useState<FinancingSettings>(defaultFinancingSettings);
  const [propertyValue, setPropertyValue] = useState<number>(defaultPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [termYears, setTermYears] = useState<number>(30);
  const [system, setSystem] = useState<"SAC" | "PRICE">("SAC");
  
  // Critérios bancários: Data de Nascimento e Renda Familiar Bruta
  const [birthDate, setBirthDate] = useState<string>("1992-05-15");
  const [rawIncome, setRawIncome] = useState<string>("14000");
  const [selectedBankId, setSelectedBankId] = useState<string>("base");

  // Carregar parâmetros administrativos atualizados
  useEffect(() => {
    fetch("/api/financing/settings")
      .then((res) => res.json())
      .then((data: FinancingSettings) => {
        if (data && data.annualInterestRate) {
          setSettings(data);
          if (data.defaultSystem) setSystem(data.defaultSystem);
          if (data.minDownPaymentPercent) setDownPaymentPercent(data.minDownPaymentPercent);
        }
      })
      .catch((err) => {
        console.warn("Usando configurações padrão do simulador:", err);
      });
  }, []);

  // Sincronizar quando o defaultPrice mudar (ex: navegando entre imóveis)
  useEffect(() => {
    if (defaultPrice && defaultPrice > 0) {
      setPropertyValue(defaultPrice);
    }
  }, [defaultPrice]);

  // Cálculo da idade do proponente
  const userAge = useMemo(() => {
    if (!birthDate) return 30;
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return 30;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(18, age);
  }, [birthDate]);

  // Regra SUSEP / BACEN do seguro MIP: Idade + Prazo <= maxAgePlusTerm (padrão 80.5 anos)
  const maxAllowedTermYears = useMemo(() => {
    const limit = Math.floor(settings.maxAgePlusTerm - userAge);
    return Math.max(5, Math.min(35, limit));
  }, [userAge, settings.maxAgePlusTerm]);

  // Se o prazo selecionado ultrapassar o limite da idade, ajusta automaticamente
  const effectiveTermYears = Math.min(termYears, maxAllowedTermYears);

  // Determinar a taxa anual ativa (geral ou do banco selecionado)
  const activeAnnualRate = useMemo(() => {
    if (selectedBankId === "base") return settings.annualInterestRate;
    const bank = settings.bankRates?.find((b) => b.id === selectedBankId);
    return bank ? bank.annualRate : settings.annualInterestRate;
  }, [selectedBankId, settings]);

  const downPayment = (propertyValue * downPaymentPercent) / 100;
  const loanAmount = Math.max(0, propertyValue - downPayment);
  const totalMonths = effectiveTermYears * 12;

  // Taxa mensal proporcional
  const monthlyInterest = (activeAnnualRate / 100) / 12;
  const monthlyInsurance = loanAmount * (settings.monthlyInsuranceRate / 100);
  const monthlyAdminFee = settings.monthlyAdminFee;

  // Cálculo SAC (Amortização Constante - Parcelas Decrescentes)
  const sacAmortization = totalMonths > 0 ? loanAmount / totalMonths : 0;
  const firstInstallmentSAC = sacAmortization + (loanAmount * monthlyInterest) + monthlyInsurance + monthlyAdminFee;
  const lastInstallmentSAC = sacAmortization + (sacAmortization * monthlyInterest) + monthlyInsurance + monthlyAdminFee;

  // Cálculo PRICE (Sistema Francês - Parcelas Fixas)
  const installmentPRICE =
    totalMonths > 0
      ? (loanAmount * (monthlyInterest * Math.pow(1 + monthlyInterest, totalMonths))) /
          (Math.pow(1 + monthlyInterest, totalMonths) - 1) +
        monthlyInsurance +
        monthlyAdminFee
      : 0;

  // Renda informada e validação de comprometimento de 30% (BACEN)
  const numericIncome = parseFloat(rawIncome) || 0;
  const currentFirstInstallment = system === "SAC" ? firstInstallmentSAC : installmentPRICE;
  const maxAllowedInstallment = (numericIncome * settings.maxIncomeCommitmentPercent) / 100;
  const commitmentPercent = numericIncome > 0 ? (currentFirstInstallment / numericIncome) * 100 : 0;
  const minRequiredIncome = currentFirstInstallment / (settings.maxIncomeCommitmentPercent / 100);
  const isIncomeSufficient = numericIncome > 0 && commitmentPercent <= settings.maxIncomeCommitmentPercent;

  const formatBRL = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  // Mensagem qualificada para o WhatsApp do corretor Gallo
  const handleWhatsAppSimulation = () => {
    const selectedBankName = selectedBankId !== "base"
      ? settings.bankRates?.find((b) => b.id === selectedBankId)?.bankName || "Geral"
      : "Média de Mercado";

    const text = encodeURIComponent(
      `Olá! Fiz uma simulação de financiamento no site da Miyashiro Imóveis:\n\n` +
      `🏠 *Imóvel:* ${formatBRL(propertyValue)}\n` +
      `💰 *Entrada (${downPaymentPercent}%):* ${formatBRL(downPayment)}\n` +
      `📊 *Financiamento:* ${formatBRL(loanAmount)} em ${effectiveTermYears} anos (${totalMonths} meses)\n` +
      `📉 *Tabela:* ${system === "SAC" ? "SAC (Decrescente)" : "PRICE (Fixa)"}\n` +
      `💳 *1ª Parcela Estimada:* ${formatBRL(currentFirstInstallment)}/mês\n` +
      `🏦 *Instituição Bancária:* ${selectedBankName} (${activeAnnualRate}% a.a.)\n` +
      `👤 *Idade do Proponente:* ${userAge} anos\n` +
      `💵 *Renda Familiar Bruta:* ${formatBRL(numericIncome)}/mês\n` +
      `📌 *Comprometimento da Renda:* ${commitmentPercent.toFixed(1)}% (${
        isIncomeSufficient ? "Dentro da margem de 30%" : "Excede margem de 30%"
      })\n\n` +
      `Gostaria de agendar uma análise de crédito imobiliário formal com um corretor da Gallo em Amparo!`
    );
    window.open(`https://wa.me/5519993673949?text=${text}`, "_blank");
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#00873E]/10 text-[#00873E] flex items-center justify-center border border-[#00873E]/20 shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-urbanist">
                Simulador de Financiamento Habitacional
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-[#00873E] border border-[#00873E]/20 px-2 py-0.5 rounded-full">
                Taxa {activeAnnualRate}% a.a.
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Simule entrada, parcelas e viabilidade de crédito conforme sua idade e renda
            </p>
          </div>
        </div>

        {/* Sistema SAC vs PRICE */}
        <div className="inline-flex rounded-xl bg-stone-100 p-1 text-xs self-start sm:self-auto border border-stone-200/60">
          <button
            type="button"
            onClick={() => setSystem("SAC")}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              system === "SAC" ? "bg-[#00873E] text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Tabela SAC (Decrescente)
          </button>
          <button
            type="button"
            onClick={() => setSystem("PRICE")}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              system === "PRICE" ? "bg-[#00873E] text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Tabela Price (Fixa)
          </button>
        </div>
      </div>

      {/* Alerta Institucional de Critérios BACEN & SUSEP */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 p-3.5 sm:p-4 shadow-xs"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-[#00873E]" />
        <div className="flex items-start gap-3 pl-1">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider font-urbanist">
                Critérios Oficiais de Concessão de Crédito
              </span>
              <span className="text-[10px] font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.2 rounded-full">
                BACEN & SUSEP
              </span>
            </div>
            <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
              A aprovação do financiamento imobiliário exige o <strong>comprometimento máximo de 30% da renda familiar bruta</strong> e a regra do seguro MIP onde a <strong>soma da idade do proponente com o prazo não pode ultrapassar {settings.maxAgePlusTerm} anos</strong>.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Grid Principal de Entradas e Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Coluna de Controles e Entradas */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Dados do Proponente: Idade / Nascimento & Renda Bruta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200/80">
            {/* Data de Nascimento */}
            <div>
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#00873E]" />
                <span>Data de Nascimento</span>
              </label>
              <input
                type="date"
                value={birthDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 font-bold focus:outline-none focus:ring-1 focus:ring-[#00873E]"
              />
              <div className="flex justify-between items-center text-[10px] text-stone-500 mt-1 font-mono">
                <span>Idade: <strong>{userAge} anos</strong></span>
                <span>Prazo máx: <strong>{maxAllowedTermYears} anos</strong></span>
              </div>
            </div>

            {/* Renda Familiar Bruta Mensal */}
            <div>
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-[#00873E]" />
                <span>Renda Familiar Bruta</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-400">R$</span>
                <input
                  type="number"
                  step="500"
                  min="1500"
                  value={rawIncome}
                  onChange={(e) => setRawIncome(e.target.value)}
                  placeholder="Ex: 14000"
                  className="w-full bg-white border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-stone-900 font-bold focus:outline-none focus:ring-1 focus:ring-[#00873E]"
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-stone-500 mt-1 font-mono">
                <span>Margem 30%: <strong>{formatBRL(maxAllowedInstallment)}</strong></span>
                <span className="text-[#00873E] font-semibold">Teto parcela</span>
              </div>
            </div>
          </div>

          {/* Aviso se a idade restringir o prazo máximo */}
          {userAge > 45 && maxAllowedTermYears < 35 && (
            <div className="bg-amber-50/90 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Pela sua idade (<strong>{userAge} anos</strong>), a regra do seguro obrigatório MIP limita o financiamento em até <strong>{maxAllowedTermYears} anos</strong> ({maxAllowedTermYears * 12} meses).
              </span>
            </div>
          )}

          {/* Seletor de Banco Parceiro */}
          {settings.bankRates && settings.bankRates.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-[#00873E]" />
                  Instituição Bancária de Referência:
                </span>
                <span className="text-[#00873E] font-semibold font-mono">{activeAnnualRate}% a.a.</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedBankId("base")}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    selectedBankId === "base"
                      ? "bg-[#00873E] text-white border-[#00873E] shadow-xs"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  Média ({settings.annualInterestRate}%)
                </button>
                {settings.bankRates
                  .filter((b) => b.isActive)
                  .map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBankId(bank.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        selectedBankId === bank.id
                          ? "bg-[#00873E] text-white border-[#00873E] shadow-xs"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {bank.bankName.split(" ")[0]} ({bank.annualRate}%)
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Valor do Imóvel Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-stone-700 mb-2">
              <span>Valor do Imóvel:</span>
              <span className="text-base font-bold text-[#00873E] font-urbanist">{formatBRL(propertyValue)}</span>
            </div>
            <input
              type="range"
              min={settings.minPropertyValue || 150000}
              max={settings.maxPropertyValue || 3000000}
              step={25000}
              value={propertyValue}
              onChange={(e) => setPropertyValue(Number(e.target.value))}
              className="w-full h-2.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#00873E]"
            />
            <div className="flex justify-between text-[10px] font-mono text-stone-400 mt-1">
              <span>{formatBRL(settings.minPropertyValue || 150000)}</span>
              <span>{formatBRL(settings.maxPropertyValue || 3000000)}</span>
            </div>
          </div>

          {/* Entrada */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-stone-700 mb-2">
              <span>Valor de Entrada ({downPaymentPercent}%):</span>
              <span className="text-sm font-bold text-[#00873E] font-urbanist">{formatBRL(downPayment)}</span>
            </div>
            <div className="flex gap-2">
              {[20, 30, 40, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDownPaymentPercent(pct)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                    downPaymentPercent === pct
                      ? "bg-[#00873E] text-white border-[#00873E] shadow-xs"
                      : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Prazo */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-stone-700 mb-2">
              <span>Prazo do Financiamento:</span>
              <span className="text-sm font-bold text-stone-900 font-urbanist">
                {effectiveTermYears} anos ({totalMonths} meses)
              </span>
            </div>
            <div className="flex gap-2">
              {(settings.allowedTermsYears || [15, 20, 25, 30, 35]).map((yr) => {
                const isBlocked = yr > maxAllowedTermYears;
                return (
                  <button
                    key={yr}
                    type="button"
                    disabled={isBlocked}
                    onClick={() => setTermYears(yr)}
                    title={isBlocked ? `Bloqueado: excede a idade máxima de ${settings.maxAgePlusTerm} anos no seguro MIP.` : undefined}
                    className={`flex-1 py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                      isBlocked
                        ? "bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed line-through"
                        : effectiveTermYears === yr
                        ? "bg-[#00873E] text-white border-[#00873E] shadow-xs cursor-pointer"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 cursor-pointer"
                    }`}
                  >
                    {yr}a
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card de Resultado com Viabilidade e WhatsApp */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1E1210] via-[#160B09] to-[#1E1210] text-white p-6 sm:p-7 rounded-3xl space-y-5 flex flex-col justify-between shadow-xl border border-white/10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-300 block">
                Simulação • {activeAnnualRate}% a.a.
              </span>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-full text-stone-300">
                {system === "SAC" ? "SAC" : "PRICE"}
              </span>
            </div>

            {/* Parcela Estimada */}
            <div>
              <span className="text-xs text-stone-400 block font-mono">
                {system === "SAC" ? "Primeira Parcela Estimada" : "Parcela Fixa Mensal"}
              </span>
              <p className="text-3xl sm:text-4xl font-bold font-urbanist text-white mt-1">
                {formatBRL(currentFirstInstallment)}
                <span className="text-xs font-normal text-stone-400 font-mono ml-1">/mês</span>
              </p>
              {system === "SAC" && (
                <span className="text-xs text-stone-400 block mt-1 font-mono">
                  Última parcela: {formatBRL(lastInstallmentSAC)}
                </span>
              )}
            </div>

            {/* Resumo Técnico de Valores */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2 font-mono text-stone-300">
              <div className="flex justify-between">
                <span>Valor Financiado:</span>
                <span className="text-white font-bold">{formatBRL(loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Renda Mínima Recomendada:</span>
                <span className="text-white font-bold">{formatBRL(minRequiredIncome)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-1.5">
                <span>Comprometimento Calculado:</span>
                <span className={`font-bold ${isIncomeSufficient ? "text-emerald-400" : "text-amber-400"}`}>
                  {commitmentPercent.toFixed(1)}% da renda
                </span>
              </div>
            </div>

            {/* Status Visual da Margem de 30% */}
            <div className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
              isIncomeSufficient
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-amber-950/40 border-amber-500/40 text-amber-300"
            }`}>
              {isIncomeSufficient ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block">
                  {isIncomeSufficient ? "Perfil de Renda Aprovável" : "Atenção: Margem Ultrapassada"}
                </span>
                <span className="text-[11px] opacity-90 leading-tight block mt-0.5">
                  {isIncomeSufficient
                    ? `Sua renda suporta com folga a parcela dentro do limite BACEN de 30%.`
                    : `A parcela consome ${commitmentPercent.toFixed(0)}% da renda. Recomendado compor renda com mais pessoas ou elevar a entrada.`}
                </span>
              </div>
            </div>
          </div>

          {/* Botão de Envio para WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsAppSimulation}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#00873E] hover:bg-[#15803d] text-white font-mono font-semibold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95 hover:scale-[1.02] mt-4"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Consultar Aprovação no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
