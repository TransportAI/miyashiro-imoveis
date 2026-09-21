// Tipos e Interfaces do CRM Imobiliário, Auditoria e Usuários (Miyashiro Imóveis)

export type UserRole = 'ADMIN' | 'GERENTE' | 'CORRETOR';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  creci?: string | null;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  failedAttempts: number;
  lockoutUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadStatus =
  | 'NOVO_LEAD'
  | 'CONTATO_REALIZADO'
  | 'VISITA_MARCADA'
  | 'PROPOSTA'
  | 'FECHADO'
  | 'PERDIDO';

export type LeadInterestType = 'LOCACAO' | 'COMPRA' | 'AMBOS';

export type PropertyType = 'APARTAMENTO' | 'CASA' | 'CHACARA' | 'FAZENDA' | 'TERRENO' | 'COMERCIAL';

export type LeadTemperature = 'FRIO' | 'MORNO' | 'QUENTE';

export interface Lead {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  interestType: LeadInterestType;
  propertyType?: PropertyType | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  preferredHoods: string[];
  bedroomsCount?: number | null;
  bathroomsCount?: number | null;
  parkingSpaces?: number | null;
  status: LeadStatus;
  temperature: LeadTemperature;
  score: number; // 0 a 100
  origin: string; // Ex: 'WIDGET_TRIAGEM', 'PORTAL', 'WHATSAPP', 'IMOVEL_SALVO'
  assignedToId?: string | null;

  // Imóvel Associado (retrocompatibilidade e suporte a múltiplos)
  propertyId?: string | null;
  propertyTitle?: string | null;
  propertyCoverImage?: string | null;
  propertyPrice?: number | null;
  associatedProperties?: LeadPropertyAssociation[];

  createdAt: Date;
  updatedAt: Date;
}

export interface LeadPropertyAssociation {
  id: string;
  title: string;
  price?: number | null;
  slug?: string | null;
}

export interface LeadInteraction {
  id: string;
  leadId: string;
  userId: string;
  type: 'LIGACAO' | 'WHATSAPP' | 'REUNIAO' | 'VISITA' | 'PROPOSTA';
  notes: string;
  interactionAt: Date;
}

export type AuditActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'STATUS_CHANGE'
  | 'ROLE_CHANGE';

export interface AuditLog {
  id: string;
  userId?: string | null;
  actionType: AuditActionType;
  resourceType: 'LEADS' | 'PROPERTIES' | 'USERS' | 'AUTH';
  resourceId?: string | null;
  ipAddress: string;
  userAgent: string;
  payloadDiff: {
    before?: Record<string, any> | null;
    after?: Record<string, any> | null;
  };
  timestampUtc: Date;
}
