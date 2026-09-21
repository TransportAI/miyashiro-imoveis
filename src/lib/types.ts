export type Purpose = 'venda' | 'aluguel';
export type PropertyType = 'casa' | 'apartamento' | 'chacara' | 'terreno' | 'comercial';
export type PropertyStatus = 'disponivel' | 'reservado' | 'vendido' | 'alugado' | 'arquivado';
export type PriceType = 'fixo' | 'faixa' | 'sob_consulta';

export interface PropertyAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  showExactAddress?: boolean;
}

export interface TourRoom {
  id: string;
  name: string; // Ex: 'Sala de Estar Integrada', 'Cozinha Gourmet'
  image: string; // URL da foto 360 / panorâmica
  isInitial?: boolean; // Ponto de partida do tour
  description?: string; // Breve descrição do cômodo
}

export interface Corretor {
  id: string;
  userId?: string;
  nome: string;
  email: string;
  creci: string;
  whatsapp: string;
  telefoneComercial?: string;
  avatarUrl?: string;
  bio?: string;
  isActive: boolean;
  role?: 'ADMIN' | 'GERENTE' | 'CORRETOR_SENIOR' | 'CORRETOR' | 'ASSISTENTE' | 'CUSTOM';
  permissions?: string[];
  createdAt?: string;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string;
  purpose: Purpose;
  type: PropertyType;
  priceType?: PriceType;
  price: number;
  minPrice?: number;
  maxPrice?: number;
  isOnDemand?: boolean;
  realPriceInternal?: number;
  iptu?: number;
  condoFee?: number;
  areaTotal: number;
  areaBuilt: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpots: number;
  address: PropertyAddress;
  images: string[];
  amenities: string[];
  features?: string[];
  featured: boolean;
  videoUrl?: string;
  virtualTourUrl?: string;
  virtualTourRooms?: TourRoom[];
  status: PropertyStatus;
  corretorId?: string;
  corretor?: Corretor;
  createdAt: string;
  updatedAt?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyPrice?: number;
  message?: string;
  channel?: 'whatsapp' | 'formulario' | 'telefone';
  status: 'NOVO_LEAD' | 'CONTATO_REALIZADO' | 'VISITA_MARCADA' | 'PROPOSTA' | 'FECHADO' | 'PERDIDO' | 'novo' | 'em_atendimento' | 'visita_agendada' | 'concluido' | 'arquivado' | 'descartado';
  temperature?: 'QUENTE' | 'MORNO' | 'FRIO';
  score?: number;
  origin?: string;
  dataNascimento?: string;
  rendaMensal?: number;
  fgtsDisponivel?: number;
  possuiDependente?: boolean;
  possuiImovelNome?: boolean;
  assignedToId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SeguradoraLink {
  id: string;
  nome: string;
  portalUrl: string;
  iconeUrl?: string;
  tag?: string;
  contatoSuporte?: string;
  notas?: string;
  ordem?: number;
  isActive: boolean;
  createdAt?: string;
}

export * from './types/financing';
