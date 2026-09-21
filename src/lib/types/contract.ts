export type ContractModalidade = 
  | 'locacao_seguro_fianca' // Regra padrão: locação exclusiva com Seguro Fiança
  | 'permuta_imobiliaria'   // Permuta entre partes com ou sem torna
  | 'venda_compra'           // Compra e venda tradicional
  // Mantém retrocompatibilidade caso existam registros antigos
  | 'locacao_residencial' 
  | 'locacao_comercial' 
  | 'venda' 
  | 'promessa_venda' 
  | 'temporada';

export type ContractType = ContractModalidade;

export type ContractStatus = 
  | 'rascunho' 
  | 'em_revisao' 
  | 'ativo' 
  | 'finalizado'
  // Retrocompatibilidade
  | 'em_elaboracao' 
  | 'aguardando_assinatura' 
  | 'vigente' 
  | 'vencendo' 
  | 'renovado' 
  | 'rescindido';

export type GuaranteeType = 
  | 'seguro_fianca'
  | 'caucao' 
  | 'fiador' 
  | 'titulo_capitalizacao' 
  | 'sem_garantia';

export interface ContractParty {
  role: 'locador' | 'locatario' | 'comprador' | 'vendedor' | 'permutante_1' | 'permutante_2' | 'corretor' | 'fiador' | 'seguradora';
  name: string;
  email?: string;
  phone?: string;
  documentNumber?: string; // CPF ou CNPJ
  rg?: string; // RG
  address?: string;
  avatarUrl?: string;
}

export interface ContractFile {
  id: string;
  name: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'zip' | 'png' | 'jpg';
  fileSize: string;
  category: 'contrato' | 'minuta' | 'vistoria' | 'comprovante' | 'aditivo' | 'rescisao' | 'garantia_fiador' | 'apolice_seguro';
  uploadedAt: string;
  url?: string;
  dataUrl?: string;
}

export interface PermutaDetails {
  imovelSegundoDescricao: string;
  valorImovel1: number;
  valorImovel2: number;
  possuiTorna: boolean;
  valorTorna?: number;
  pagadorTorna?: 'permutante_1' | 'permutante_2';
  condicoesTorna?: string;
}

export interface SeguroFiancaDetails {
  seguradoraNome: string;
  numeroApolice?: string;
  statusApolice?: string;
  valorPremioMensal?: number;
  coberturaDanosImovel?: boolean;
  contatoSinistro?: string;
}

export interface ContractFinancial {
  // Locação
  monthlyRent?: number;
  paymentDay?: number;
  readjustmentIndex?: 'IGPM' | 'IPCA' | 'INPC';
  taxaAdministracaoPercentual?: number;

  // Venda & Compra
  totalSaleValue?: number;
  sinalEntrada?: number;
  saldoFinanciamento?: number;
  bancoFinanciamento?: string;

  // Permuta
  permutaDetails?: PermutaDetails;

  // Seguro Fiança
  seguroFiancaDetails?: SeguroFiancaDetails;

  // Depósito / Garantia geral
  depositAmount?: number;
  condoFeeIncluded?: boolean;
  iptuIncluded?: boolean;
  guaranteeType?: GuaranteeType;
  fiadorDetails?: any;
}

export interface Contract {
  id: string;
  code: string; // Ex: "CTR-2026-001"
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyCoverImage?: string;
  modalidade?: ContractModalidade;
  type: ContractModalidade; // Tipo/modalidade do contrato
  status: ContractStatus;
  
  startDate: string;
  endDate: string;
  closedAt?: string;
  closeReason?: string;
  renewalAuto?: boolean;

  financial: ContractFinancial;
  parties: ContractParty[];
  corretorId?: string;
  corretorNome?: string;
  files: ContractFile[];
  minutaTexto?: string;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}
