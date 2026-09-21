export interface BankRate {
  id: string;
  bankName: string;
  bankCode: string;
  annualRate: number; // Ex: 9.79 (% a.a.)
  minDownPayment: number; // Ex: 20 (%)
  maxTermYears: number; // Ex: 35
  isActive: boolean;
  logoUrl?: string;
  orderIndex: number;
}

export interface FinancingSettings {
  id: string;
  annualInterestRate: number; // Taxa de juros anual base (% a.a., ex: 9.99)
  minDownPaymentPercent: number; // Entrada mínima padrão (%, ex: 20)
  maxIncomeCommitmentPercent: number; // Margem máxima de renda (%, ex: 30)
  maxAgePlusTerm: number; // Limite de idade + prazo (anos, ex: 80.5)
  monthlyInsuranceRate: number; // Seguros DFI/MIP (% a.m., ex: 0.04)
  monthlyAdminFee: number; // Tarifa adm mensal bancária (R$, ex: 25.00)
  allowedTermsYears: number[]; // Prazos permitidos, ex: [15, 20, 25, 30, 35]
  defaultSystem: 'SAC' | 'PRICE';
  minPropertyValue: number; // Mínimo do slider (ex: 150000)
  maxPropertyValue: number; // Máximo do slider (ex: 3000000)
  disclaimerText: string;
  bankRates: BankRate[];
  updatedAt?: string;
}

export const defaultFinancingSettings: FinancingSettings = {
  id: 'default',
  annualInterestRate: 9.99,
  minDownPaymentPercent: 20,
  maxIncomeCommitmentPercent: 30,
  maxAgePlusTerm: 80.5,
  monthlyInsuranceRate: 0.04,
  monthlyAdminFee: 25.0,
  allowedTermsYears: [15, 20, 25, 30, 35],
  defaultSystem: 'SAC',
  minPropertyValue: 150000,
  maxPropertyValue: 3000000,
  disclaimerText:
    'Os valores e parcelas apresentados são uma simulação estimada e podem variar de banco para banco conforme taxas vigentes, idade do proponente, Custo Efetivo Total (CET) e aprovação de crédito de cada instituição financeira.',
  bankRates: [
    {
      id: 'caixa',
      bankName: 'Caixa Econômica Federal',
      bankCode: '104',
      annualRate: 9.79,
      minDownPayment: 20,
      maxTermYears: 35,
      isActive: true,
      orderIndex: 1,
    },
    {
      id: 'bb',
      bankName: 'Banco do Brasil',
      bankCode: '001',
      annualRate: 9.95,
      minDownPayment: 20,
      maxTermYears: 35,
      isActive: true,
      orderIndex: 2,
    },
    {
      id: 'bradesco',
      bankName: 'Bradesco',
      bankCode: '237',
      annualRate: 10.1,
      minDownPayment: 20,
      maxTermYears: 30,
      isActive: true,
      orderIndex: 3,
    },
    {
      id: 'itau',
      bankName: 'Itaú',
      bankCode: '341',
      annualRate: 10.2,
      minDownPayment: 20,
      maxTermYears: 30,
      isActive: true,
      orderIndex: 4,
    },
    {
      id: 'santander',
      bankName: 'Santander',
      bankCode: '033',
      annualRate: 10.35,
      minDownPayment: 20,
      maxTermYears: 35,
      isActive: true,
      orderIndex: 5,
    },
  ],
};
