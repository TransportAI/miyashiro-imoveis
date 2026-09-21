export interface AuditLog {
  id: string;
  action: 'IMOVEL_CRIADO' | 'IMOVEL_EDITADO' | 'IMOVEL_STATUS' | 'IMOVEL_ARQUIVADO' | 'LEAD_RECEBIDO' | 'LEAD_STATUS' | 'LEAD_ARQUIVADO' | 'SISTEMA';
  title: string;
  details: string;
  category: 'imovel' | 'lead' | 'sistema';
  user: string;
  timestamp: string; // ISO
}

const STORAGE_KEY = 'gallo_audit_logs';

const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'audit-init-1',
    action: 'SISTEMA',
    title: 'Portal Imobiliário Inicializado',
    details: 'Instância da Miyashiro Imóveis (CRECI 155957F) conectada com sucesso ao Mini-CMS.',
    category: 'sistema',
    user: 'Sistema Miyashiro',
    timestamp: new Date(1773660000000 - 3600000 * 24).toISOString(),
  },
  {
    id: 'audit-init-2',
    action: 'IMOVEL_CRIADO',
    title: 'Imóvel GAL-101 Registrado',
    details: 'Casa de Alto Padrão no Jardim Silvestre adicionada ao catálogo ativo.',
    category: 'imovel',
    user: 'Corretor Miyashiro',
    timestamp: new Date(1773660000000 - 3600000 * 18).toISOString(),
  },
  {
    id: 'audit-init-3',
    action: 'LEAD_RECEBIDO',
    title: 'Novo Lead Recebido via Portal',
    details: 'Carlos Eduardo demonstrou interesse no imóvel GAL-101 via WhatsApp.',
    category: 'lead',
    user: 'Visitante Web',
    timestamp: new Date(1773660000000 - 3600000 * 6).toISOString(),
  }
];

export function getAuditLogs(): AuditLog[] {
  if (typeof window === 'undefined') return INITIAL_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    const parsed: AuditLog[] = JSON.parse(raw);
    const sanitized = parsed.map(log => ({
      ...log,
      user: log.user.replace(/Primavera|Celeste|Gallo/gi, 'Miyashiro'),
      title: log.title.replace(/PRI-|CEL-|GAL-/gi, 'MIY-').replace(/Primavera|Celeste|Gallo/gi, 'Miyashiro'),
      details: log.details.replace(/Primavera|Celeste|Gallo/gi, 'Miyashiro').replace(/PRI-|CEL-|GAL-/gi, 'MIY-')
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    return sanitized;
  } catch {
    return INITIAL_LOGS;
  }
}

export function logAuditEvent(
  action: AuditLog['action'],
  title: string,
  details: string,
  category: AuditLog['category'],
  user: string = 'Administrador Miyashiro'
): AuditLog {
  const newLog: AuditLog = {
    id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    action,
    title,
    details,
    category,
    user,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const logs = getAuditLogs();
      const updated = [newLog, ...logs];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Falha ao registrar auditoria:', e);
    }
  }

  return newLog;
}
