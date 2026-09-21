export type AuditCategory = 'imovel' | 'lead' | 'contrato' | 'sistema';

export type AuditAction = 
  | 'IMOVEL_CRIADO' 
  | 'IMOVEL_EDITADO' 
  | 'IMOVEL_STATUS' 
  | 'IMOVEL_ARQUIVADO' 
  | 'IMOVEL_EXCLUIDO'
  | 'LEAD_RECEBIDO' 
  | 'LEAD_CRIADO' 
  | 'LEAD_EDITADO' 
  | 'LEAD_STATUS' 
  | 'LEAD_IMOVEL' 
  | 'LEAD_ARQUIVADO' 
  | 'LEAD_EXCLUIDO'
  | 'CONTRATO_CRIADO' 
  | 'CONTRATO_EDITADO' 
  | 'CONTRATO_STATUS' 
  | 'CONTRATO_FINALIZADO' 
  | 'CONTRATO_EXCLUIDO' 
  | 'CONTRATO_DOCUMENTO'
  | 'SISTEMA';

export interface AuditLog {
  id: string;
  action: AuditAction;
  title: string;
  details: string;
  category: AuditCategory;
  user: string;
  timestamp: string; // ISO
}

const PRIMARY_STORAGE_KEY = 'miyashiro_audit_logs';
const LEGACY_STORAGE_KEY = 'gallo_audit_logs';

export const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'audit-init-1',
    action: 'SISTEMA',
    title: 'Portal Imobiliário Inicializado',
    details: 'Instância da Miyashiro Imóveis (CRECI 155957F) conectada com sucesso ao Mini-CMS.',
    category: 'sistema',
    user: 'Sistema Miyashiro',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'audit-init-2',
    action: 'IMOVEL_CRIADO',
    title: 'Imóvel MIY-101 Registrado',
    details: 'Casa de Alto Padrão no Jardim Silvestre adicionada ao catálogo ativo.',
    category: 'imovel',
    user: 'Corretor Miyashiro',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'audit-init-3',
    action: 'LEAD_STATUS',
    title: 'Lead Carlos Alberto Movido de Etapa',
    details: 'Etapa alterada de "Novo Lead" para "Visita Marcada" após confirmação de agenda.',
    category: 'lead',
    user: 'Gerente Miyashiro',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'audit-init-4',
    action: 'CONTRATO_CRIADO',
    title: 'Novo Contrato Gerado: CTR-2026-001',
    details: 'Contrato de Locação Residencial vinculado ao inquilino Carlos Eduardo Silveira.',
    category: 'contrato',
    user: 'Admin Miyashiro',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'audit-init-5',
    action: 'CONTRATO_DOCUMENTO',
    title: 'Arquivo Anexado ao Contrato CTR-2026-001',
    details: 'Arquivo "Comprovante_Caucao_Assinado.pdf" adicionado aos documentos do contrato.',
    category: 'contrato',
    user: 'Equipe Miyashiro',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
  }
];

export function getCurrentUserName(): string {
  if (typeof window === 'undefined') return 'Administrador Miyashiro';
  try {
    const raw = localStorage.getItem('miyashiro_user') || localStorage.getItem('gallo_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.name) {
        const role = parsed.role;
        const roleLabel = role === 'ADMIN' ? 'Admin' : role === 'GERENTE' ? 'Gerente' : role === 'CORRETOR' ? 'Corretor' : 'Gestor';
        return `${parsed.name} (${roleLabel})`;
      }
    }
  } catch (e) {
    // ignore
  }
  return 'Administrador Miyashiro';
}

export function getAuditLogs(): AuditLog[] {
  if (typeof window === 'undefined') return INITIAL_LOGS;
  try {
    const primary = localStorage.getItem(PRIMARY_STORAGE_KEY);
    if (primary) {
      const parsed = JSON.parse(primary);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(parsed));
        return parsed;
      }
    }

    localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
    return INITIAL_LOGS;
  } catch (e) {
    return INITIAL_LOGS;
  }
}

export function logAuditEvent(
  action: AuditAction,
  title: string,
  details: string,
  category: AuditCategory,
  user?: string
): AuditLog {
  const actor = user && user !== 'Administrador' ? user : getCurrentUserName();

  const newLog: AuditLog = {
    id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    action,
    title,
    details,
    category,
    user: actor,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const currentLogs = getAuditLogs();
      const updated = [newLog, ...currentLogs];
      localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));

      window.dispatchEvent(new CustomEvent('audit_logs_updated', { detail: newLog }));
    } catch (e) {
      console.error('Falha ao registrar auditoria:', e);
    }
  }

  return newLog;
}

export function clearAuditLogs(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(PRIMARY_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      window.dispatchEvent(new Event('audit_logs_updated'));
    } catch (e) {
      console.error('Falha ao limpar logs de auditoria:', e);
    }
  }
}
