export type SystemPermission =
  // 🏢 Módulo de Imóveis
  | 'imoveis.view'
  | 'imoveis.create'
  | 'imoveis.edit'
  | 'imoveis.status'
  | 'imoveis.featured'
  | 'imoveis.view_internal_price'
  | 'imoveis.delete'

  // 👥 Módulo de Leads & CRM
  | 'leads.view_all'
  | 'leads.view_assigned'
  | 'leads.create'
  | 'leads.edit_stage'
  | 'leads.reassign'
  | 'leads.whatsapp'
  | 'leads.export'
  | 'leads.delete'

  // 💰 Módulo de Financiamento
  | 'financiamento.view'
  | 'financiamento.edit_rates'

  // 🛡️ Módulo de Seguradoras
  | 'seguradoras.view'
  | 'seguradoras.manage'

  // 📑 Módulo de Usuários & Corretores
  | 'corretores.view'
  | 'corretores.manage'

  // 📜 Módulo de Auditoria
  | 'auditoria.view'

  // 📊 Módulo de Dashboard & Métricas
  | 'dashboard.view_general';

export interface PermissionDefinition {
  key: SystemPermission;
  name: string;
  description: string;
  critical?: boolean;
}

export interface PermissionGroup {
  id: string;
  moduleName: string;
  iconName: string;
  description: string;
  permissions: PermissionDefinition[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'imoveis',
    moduleName: 'Gestão de Imóveis',
    iconName: 'Building2',
    description: 'Acesso ao catálogo de propriedades, fotos, cômodos 360 e alterações de valores.',
    permissions: [
      {
        key: 'imoveis.view',
        name: 'Visualizar Imóveis',
        description: 'Consultar a lista completa de imóveis e fichas cadastrais.'
      },
      {
        key: 'imoveis.create',
        name: 'Cadastrar Novo Imóvel',
        description: 'Inserir novos imóveis com fotos, especificações e endereço.'
      },
      {
        key: 'imoveis.edit',
        name: 'Editar Imóveis',
        description: 'Modificar descrições, comodidades, imagens e tour virtual.'
      },
      {
        key: 'imoveis.status',
        name: 'Alterar Status (Vendido/Alugado)',
        description: 'Modificar a disponibilidade entre Disponível, Reservado, Vendido e Alugado.'
      },
      {
        key: 'imoveis.featured',
        name: 'Gerenciar Destaques da Home',
        description: 'Fixar ou remover imóveis no carrossel de destaque do portal.'
      },
      {
        key: 'imoveis.view_internal_price',
        name: 'Visualizar Valor Interno de Captação',
        description: 'Ver o preço real interno de avaliação e negociação para auditoria.'
      },
      {
        key: 'imoveis.delete',
        name: 'Excluir Imóvel',
        description: 'Remover permanentemente registros de imóveis do banco de dados.',
        critical: true
      }
    ]
  },
  {
    id: 'leads',
    moduleName: 'Leads & CRM (Kanban)',
    iconName: 'Users',
    description: 'Gestão de clientes interessados, funil de negociação e atendimento via WhatsApp.',
    permissions: [
      {
        key: 'leads.view_all',
        name: 'Ver Todos os Leads da Empresa',
        description: 'Acesso irrestrito a todos os contatos e negociações da imobiliária.'
      },
      {
        key: 'leads.view_assigned',
        name: 'Ver Apenas Seus Leads Atribuídos',
        description: 'Visualização restrita apenas aos clientes sob responsabilidade direta do corretor.'
      },
      {
        key: 'leads.create',
        name: 'Cadastrar Lead Manualmente',
        description: 'Inserir novos clientes que entraram em contato por telefone ou balcão.'
      },
      {
        key: 'leads.edit_stage',
        name: 'Mover Etapas do Kanban',
        description: 'Avançar ou retroceder leads entre Contato, Visita, Proposta e Fechamento.'
      },
      {
        key: 'leads.reassign',
        name: 'Reatribuir Leads entre Corretores',
        description: 'Transferir a responsabilidade de atendimento de um cliente para outro corretor.'
      },
      {
        key: 'leads.whatsapp',
        name: 'Contatar via WhatsApp Integrado',
        description: 'Disparar mensagens e abrir conversas diretas no WhatsApp pelo painel.'
      },
      {
        key: 'leads.export',
        name: 'Exportar Lista de Leads',
        description: 'Fazer download de planilhas com os dados de contato.'
      },
      {
        key: 'leads.delete',
        name: 'Descartar / Excluir Lead',
        description: 'Marcar lead como perdido ou remover definitivamente do CRM.',
        critical: true
      }
    ]
  },
  {
    id: 'financiamento',
    moduleName: 'Simulador & Juros',
    iconName: 'Calculator',
    description: 'Simulações de crédito imobiliário, tabelas SAC/PRICE e configurações de indexadores.',
    permissions: [
      {
        key: 'financiamento.view',
        name: 'Utilizar Simulador de Financiamento',
        description: 'Executar simulações de parcelas com clientes no balcão ou WhatsApp.'
      },
      {
        key: 'financiamento.edit_rates',
        name: 'Configurar Taxas e Parâmetros',
        description: 'Alterar taxas de juros nominais, condições de tabelas e indexadores oficiais.',
        critical: true
      }
    ]
  },
  {
    id: 'seguradoras',
    moduleName: 'Portais de Seguradoras',
    iconName: 'ShieldCheck',
    description: 'Portais parceiros para seguro fiança locatícia e credenciamento.',
    permissions: [
      {
        key: 'seguradoras.view',
        name: 'Acessar Portais de Seguradoras',
        description: 'Visualizar links rápidos para cotações de garantia de aluguel.'
      },
      {
        key: 'seguradoras.manage',
        name: 'Gerenciar Parcerias e Links',
        description: 'Cadastrar, editar ou remover convênios com seguradoras.',
        critical: true
      }
    ]
  },
  {
    id: 'corretores',
    moduleName: 'Equipe de Corretores & Usuários',
    iconName: 'UserCheck',
    description: 'Controle de contas, credenciais de acesso e permissões da equipe.',
    permissions: [
      {
        key: 'corretores.view',
        name: 'Visualizar Lista de Corretores',
        description: 'Ver dados de contato e imóveis vinculados aos colegas de equipe.'
      },
      {
        key: 'corretores.manage',
        name: 'Gerenciar Usuários e Permissões',
        description: 'Cadastrar novos usuários, redefinir senhas e alterar níveis de acesso.',
        critical: true
      }
    ]
  },
  {
    id: 'auditoria',
    moduleName: 'Auditoria & Logs de Segurança',
    iconName: 'History',
    description: 'Rastreabilidade de ações, histórico de alterações de preços e segurança.',
    permissions: [
      {
        key: 'auditoria.view',
        name: 'Visualizar Trilha de Auditoria',
        description: 'Ver logs de auditoria detalhados de quem alterou cada registro no sistema.',
        critical: true
      }
    ]
  },
  {
    id: 'dashboard',
    moduleName: 'Visão Geral & Métricas',
    iconName: 'LayoutDashboard',
    description: 'Métricas gerais da empresa, VGV total e indicadores executivos.',
    permissions: [
      {
        key: 'dashboard.view_general',
        name: 'Visualizar Métricas Globais da Empresa',
        description: 'Ver faturamento global, VGV acumulado e gráficos consolidados.'
      }
    ]
  }
];

export const ALL_PERMISSIONS: SystemPermission[] = PERMISSION_GROUPS.flatMap(g =>
  g.permissions.map(p => p.key)
);

export type UserRolePreset = 'ADMIN' | 'GERENTE' | 'CORRETOR_SENIOR' | 'CORRETOR' | 'ASSISTENTE' | 'CUSTOM';

export interface RolePreset {
  id: UserRolePreset;
  label: string;
  badgeClass: string;
  description: string;
  defaultPermissions: SystemPermission[];
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'ADMIN',
    label: 'Administrador Master',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Acesso total irrestrito a todas as funcionalidades e configurações do sistema.',
    defaultPermissions: [...ALL_PERMISSIONS]
  },
  {
    id: 'GERENTE',
    label: 'Gerente Comercial',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Gestão completa de imóveis, leads globais e equipe comercial.',
    defaultPermissions: [
      'imoveis.view',
      'imoveis.create',
      'imoveis.edit',
      'imoveis.status',
      'imoveis.featured',
      'imoveis.view_internal_price',
      'leads.view_all',
      'leads.create',
      'leads.edit_stage',
      'leads.reassign',
      'leads.whatsapp',
      'leads.export',
      'financiamento.view',
      'financiamento.edit_rates',
      'seguradoras.view',
      'seguradoras.manage',
      'corretores.view',
      'auditoria.view',
      'dashboard.view_general'
    ]
  },
  {
    id: 'CORRETOR_SENIOR',
    label: 'Corretor Sênior',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Cadastra e edita imóveis, atende leads da empresa e realiza simulações.',
    defaultPermissions: [
      'imoveis.view',
      'imoveis.create',
      'imoveis.edit',
      'imoveis.status',
      'imoveis.featured',
      'imoveis.view_internal_price',
      'leads.view_all',
      'leads.create',
      'leads.edit_stage',
      'leads.whatsapp',
      'financiamento.view',
      'seguradoras.view',
      'corretores.view',
      'dashboard.view_general'
    ]
  },
  {
    id: 'CORRETOR',
    label: 'Corretor Padrão',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Focado em atendimento dos seus próprios leads, catálogo de imóveis e simulações.',
    defaultPermissions: [
      'imoveis.view',
      'imoveis.create',
      'imoveis.status',
      'leads.view_assigned',
      'leads.create',
      'leads.edit_stage',
      'leads.whatsapp',
      'financiamento.view',
      'seguradoras.view',
      'corretores.view'
    ]
  },
  {
    id: 'ASSISTENTE',
    label: 'Assistente / Recepção',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Triagem de novos leads, cadastro inicial e consulta ao catálogo de imóveis.',
    defaultPermissions: [
      'imoveis.view',
      'leads.view_all',
      'leads.create',
      'leads.reassign',
      'leads.whatsapp',
      'seguradoras.view'
    ]
  },
  {
    id: 'CUSTOM',
    label: 'Acesso Personalizado',
    badgeClass: 'bg-stone-100 text-stone-700 border-stone-300',
    description: 'Permissões customizadas manualmente pelo administrador.',
    defaultPermissions: [
      'imoveis.view',
      'leads.view_assigned',
      'financiamento.view'
    ]
  }
];

export function hasPermission(
  userPermissions: string[] | undefined | null,
  permission: SystemPermission
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  if (userPermissions.includes('*') || userPermissions.includes('admin.all')) {
    return true;
  }
  if (permission === 'leads.view_assigned' && userPermissions.includes('leads.view_all')) {
    return true;
  }
  return userPermissions.includes(permission);
}

export const ROUTE_PERMISSIONS_MAP: Record<string, SystemPermission> = {
  '/admin/dashboard': 'dashboard.view_general',
  '/admin/imoveis': 'imoveis.view',
  '/admin/imoveis/novo': 'imoveis.create',
  '/admin/leads': 'leads.view_assigned',
  '/admin/corretores': 'corretores.view',
  '/admin/financiamento': 'financiamento.view',
  '/admin/seguradoras': 'seguradoras.view',
  '/admin/auditoria': 'auditoria.view',
};

export function canAccessRoute(
  pathname: string,
  userPermissions: string[] | undefined | null
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  if (userPermissions.includes('*') || userPermissions.includes('admin.all')) {
    return true;
  }

  for (const [route, perm] of Object.entries(ROUTE_PERMISSIONS_MAP)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      if (pathname.includes('/novo') && perm === 'imoveis.view') {
        return hasPermission(userPermissions, 'imoveis.create');
      }
      return hasPermission(userPermissions, perm);
    }
  }

  return true;
}
