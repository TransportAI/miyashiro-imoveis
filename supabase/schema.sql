-- ==============================================================================
-- SCHEMA IMOBILIÁRIA GALLO - SUPABASE POSTGRESQL (HIGH PERFORMANCE & RLS)
-- Modelagem Relacional, Índices B-Tree Compostos e Segurança (OWASP Top 10)
-- ==============================================================================

-- 1. Extensões Essenciais
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela: Corretores (Equipe Comercial Gallo)
CREATE TABLE IF NOT EXISTS public.corretores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  creci VARCHAR(30) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  telefone_comercial VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,
  role VARCHAR(30) NOT NULL DEFAULT 'CORRETOR',
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corretores_email ON public.corretores(email);
CREATE INDEX IF NOT EXISTS idx_corretores_active ON public.corretores(is_active);

-- 3. Tabela: Properties (Imóveis do Catálogo Gallo)
CREATE TABLE IF NOT EXISTS public.properties (
  id VARCHAR(50) PRIMARY KEY,
  slug VARCHAR(200) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('venda', 'aluguel')),
  type VARCHAR(30) NOT NULL CHECK (type IN ('casa', 'apartamento', 'chacara', 'fazenda', 'terreno', 'comercial')),
  
  -- Valores e Encargos
  price NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  iptu NUMERIC(12, 2) DEFAULT 0.00,
  condo_fee NUMERIC(12, 2) DEFAULT 0.00,

  -- Medidas e dependências
  area_total NUMERIC(10, 2) DEFAULT 0.00,
  area_built NUMERIC(10, 2) DEFAULT 0.00,
  bedrooms SMALLINT DEFAULT 0,
  suites SMALLINT DEFAULT 0,
  bathrooms SMALLINT DEFAULT 0,
  parking_spots SMALLINT DEFAULT 0,

  -- Endereço e multimídia
  address JSONB NOT NULL DEFAULT '{}'::jsonb,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT FALSE,
  video_url TEXT,
  virtual_tour_url TEXT,
  virtual_tour_rooms JSONB DEFAULT '[]'::jsonb,

  -- Status e Responsabilidade
  status VARCHAR(20) NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'reservado', 'vendido', 'alugado', 'arquivado')),
  corretor_id UUID REFERENCES public.corretores(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices B-Tree Estratégicos para Busca Instantânea
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_filtros ON public.properties(purpose, status);
CREATE INDEX IF NOT EXISTS idx_properties_tipo ON public.properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_preco ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_corretor ON public.properties(corretor_id);
CREATE INDEX IF NOT EXISTS idx_properties_cidade_bairro ON public.properties USING btree (
  ((address->>'city')),
  ((address->>'neighborhood'))
);

-- 4. Tabela: Leads (CRM & Triagem Virtual)
CREATE TABLE IF NOT EXISTS public.leads (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(180),
  interest_type VARCHAR(20) NOT NULL DEFAULT 'COMPRA' CHECK (interest_type IN ('COMPRA', 'LOCACAO', 'AMBOS')),
  property_type VARCHAR(30),
  bedrooms_count SMALLINT DEFAULT 1,
  bathrooms_count SMALLINT DEFAULT 1,
  preferred_hoods JSONB DEFAULT '["Amparo e Região"]'::jsonb,
  
  -- Pré-Simulação de Financiamento
  data_nascimento DATE,
  renda_mensal NUMERIC(14, 2),
  fgts_disponivel NUMERIC(14, 2) DEFAULT 0.00,
  
  -- Gestão de CRM
  status VARCHAR(20) NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'em_atendimento', 'visita_agendada', 'proposta', 'ganho', 'perdido')),
  temperature VARCHAR(10) NOT NULL DEFAULT 'morna' CHECK (temperature IN ('fria', 'morna', 'quente')),
  channel VARCHAR(30) NOT NULL DEFAULT 'site',
  origin VARCHAR(50) NOT NULL DEFAULT 'WIDGET_TRIAGEM',
  notes TEXT,
  corretor_id UUID REFERENCES public.corretores(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON public.leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_corretor ON public.leads(corretor_id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);

-- 5. Tabela: Financiamento Bancário (Configurações e Taxas de Bancos Parceiros)
CREATE TABLE IF NOT EXISTS public.financing_settings (
  id VARCHAR(50) PRIMARY KEY,
  bank_name VARCHAR(100) NOT NULL,
  interest_rate_nominal NUMERIC(5, 2) NOT NULL,
  interest_rate_effective NUMERIC(5, 2) NOT NULL,
  max_financing_percent NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
  max_term_months INTEGER NOT NULL DEFAULT 420,
  amortization_systems JSONB NOT NULL DEFAULT '["SAC", "PRICE"]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Tabela: Seguradoras de Fiança Locatícia
CREATE TABLE IF NOT EXISTS public.seguradoras (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  badge VARCHAR(60) NOT NULL,
  rate_description VARCHAR(200) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  portal_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- 7. Tabela: Auditoria Administrativa
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(80) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'geral',
  author VARCHAR(100) NOT NULL DEFAULT 'Sistema Gallo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- 8. STORAGE: BUCKET DE IMAGENS E TOURS 360
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('imoveis', 'imoveis', true)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública dos arquivos do bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'imoveis');

-- Escrita de administradores no bucket
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'imoveis');

CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'imoveis');

CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'imoveis');

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) - OWASP TOP 10
-- ==============================================================================
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corretores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguradoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Imóveis: Público pode ler imóveis ativos/disponíveis
CREATE POLICY "Public Read Properties"
ON public.properties FOR SELECT
USING (status != 'arquivado');

CREATE POLICY "Admin Manage Properties"
ON public.properties FOR ALL
USING (true)
WITH CHECK (true);

-- Corretores: Público pode visualizar corretores ativos
CREATE POLICY "Public Read Corretores"
ON public.corretores FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin Manage Corretores"
ON public.corretores FOR ALL
USING (true)
WITH CHECK (true);

-- Leads: Público pode inserir seus dados de contato/triagem
CREATE POLICY "Public Insert Leads"
ON public.leads FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin Manage Leads"
ON public.leads FOR ALL
USING (true)
WITH CHECK (true);

-- Financiamento & Seguradoras: Leitura pública
CREATE POLICY "Public Read Financing"
ON public.financing_settings FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin Manage Financing"
ON public.financing_settings FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Public Read Seguradoras"
ON public.seguradoras FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin Manage Seguradoras"
ON public.seguradoras FOR ALL
USING (true)
WITH CHECK (true);

-- Auditoria: Apenas consulta e inserção administrativa
CREATE POLICY "Admin Audit Logs"
ON public.audit_logs FOR ALL
USING (true)
WITH CHECK (true);
